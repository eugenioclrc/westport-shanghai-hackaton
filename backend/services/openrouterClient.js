// FILE: backend/services/openrouterClient.js
// Generic OpenAI-compatible /chat/completions client with function-calling.
// Powers four providers that all speak the same wire format:
//   - openrouter  → openrouter.ai/api/v1   (Fusion auto-router across 300+ models)
//   - deepseek    → api.deepseek.com/v1    (DeepSeek-Chat / DeepSeek-R1)
//   - qwen        → DashScope compatible-mode (Alibaba Qwen2.5 / Qwen-Max)
//   - openai-compatible (override via CONFIG.llm.baseUrl)
// All providers accept Anthropic-style tool schemas and we adapt them to the
// OpenAI `tools` array + `tool_choice` shape.
import { CONFIG } from '../../config.js';

const PROVIDER_DEFAULTS = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    headers: {
      'HTTP-Referer': 'https://westport.ai',
      'X-Title': 'WestPort.ai',
    },
    label: 'OpenRouter',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    headers: {},
    label: 'DeepSeek',
  },
  qwen: {
    // Alibaba DashScope OpenAI-compatible endpoint
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    headers: {},
    label: 'Qwen (DashScope)',
  },
};

function anthropicToolToOpenAI(tool) {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  };
}

export async function runToolAgentOpenRouter({ model, systemPrompt, userPrompt, tool }) {
  const provider = CONFIG.llm.provider;
  const cfg = PROVIDER_DEFAULTS[provider];
  if (!cfg) throw new Error(`Unknown OAI-compatible provider: ${provider}`);

  const apiKey = CONFIG.llm.providerKey;
  if (!apiKey) throw new Error(`API key not set for provider ${provider}`);

  const fnTool = anthropicToolToOpenAI(tool);

  const body = {
    model,
    max_tokens: CONFIG.llm.maxTokens,
    temperature: CONFIG.llm.temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    tools: [fnTool],
    tool_choice: { type: 'function', function: { name: tool.name } },
  };

  const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...cfg.headers,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`${cfg.label} ${resp.status}: ${txt.slice(0, 400)}`);
  }

  const data = await resp.json();
  const choice = data.choices?.[0];
  const toolCall = choice?.message?.tool_calls?.[0];

  if (!toolCall) {
    const fallback = choice?.message?.content;
    throw new Error(
      `${cfg.label} response did not include a tool_call for ${tool.name}. content=${String(fallback || '').slice(0, 200)}`
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(toolCall.function.arguments);
  } catch (err) {
    throw new Error(`Failed to parse tool_call arguments as JSON: ${err.message}`);
  }

  const usage = {
    input_tokens: data.usage?.prompt_tokens ?? 0,
    output_tokens: data.usage?.completion_tokens ?? 0,
  };

  return { parsed, raw: data, usage };
}

export default { runToolAgentOpenRouter };
