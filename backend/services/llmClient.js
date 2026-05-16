// FILE: backend/services/llmClient.js
// Two execution modes:
//   - mock        (deterministic canned responses, no network)
//   - openrouter  (OpenRouter Fusion auto-routing via OpenAI-compatible API)
// Every backend caller uses runToolAgent() and gets the same shape back.
import { CONFIG } from '../../config.js';
import { runToolAgentOpenRouter } from './openrouterClient.js';

// Per-1M-token USD pricing. Informational only (drives the cost ticker).
const PRICING = {
  'deepseek/deepseek-chat-v3.1': { input: 0.20, output: 0.80 },
  'deepseek/deepseek-chat':      { input: 0.20, output: 0.80 },
  'openrouter/auto':             { input: 1.50, output: 6.00 },
};

function priceUsd(model, inputTokens, outputTokens) {
  const p = PRICING[model] || { input: 1, output: 5 };
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

// Run an agent that MUST emit a single tool-use response with a schema-validated
// payload. Returns { parsed, raw, usage, costUsd } regardless of provider.
export async function runToolAgent({ model, systemPrompt, userPrompt, tool }) {
  if (CONFIG.llm.mock) {
    const mock = mockToolResponse({ tool, userPrompt });
    return {
      parsed: mock,
      raw: { mock: true },
      usage: { input_tokens: 600, output_tokens: 800 },
      costUsd: priceUsd(model, 600, 800),
    };
  }

  const result = await runToolAgentOpenRouter({ model, systemPrompt, userPrompt, tool });
  return {
    parsed: result.parsed,
    raw: result.raw,
    usage: result.usage,
    costUsd: priceUsd(model, result.usage.input_tokens, result.usage.output_tokens),
  };
}

// Deterministic mocks so the frontend works without API credentials.
// Two product archetypes (battery / robot) get distinct findings + scores so
// the second sample doesn't look identical to the first on stage.
function mockToolResponse({ tool, userPrompt }) {
  const hint = String(userPrompt).slice(0, 600).toLowerCase();
  const isRobot = /robot|humanoid|machinery|skywalker|unitree|actuator/.test(hint);
  const isBattery = /battery|lithium|cell|nmc|cathode|lifepo|wh\/kg/.test(hint) && !isRobot;

  if (tool.name === 'report_findings_chemicals') {
    if (isRobot) {
      return {
        findings: [
          { severity: 'high', regulation: 'RoHS 2011/65/EU', citation: 'Annex II', requirement: 'Pb, Hg, Cd, Cr(VI), PBB, PBDE under 0.1% wt/wt', gap: 'Solder, PCB, and motor coatings not yet declared at substance level', recommendation: 'Collect Full Material Declarations from PCBA, harness, and gearbox suppliers; XRF spot-test', estimated_cost_eur: 3200, estimated_weeks: 4 },
          { severity: 'medium', regulation: 'REACH 1907/2006', citation: 'Annex XVII + SVHC list', requirement: 'No SVHC > 0.1% wt/wt and no Annex XVII restricted substance in any component', gap: 'Tier-2 motor magnet (NdFeB) supplier has not declared dysprosium content', recommendation: 'Request SCIP notifications and Annex XVII screening from rare-earth supplier', estimated_cost_eur: 2200, estimated_weeks: 5 },
          { severity: 'low', regulation: 'POPs 2019/1021', citation: 'Annex I', requirement: 'No PFOA/PFOS in fluoropolymer cable jackets', gap: 'Cable supplier has not confirmed PFAS-free jacketing', recommendation: 'Obtain supplier PFAS declaration', estimated_cost_eur: 600, estimated_weeks: 2 },
        ],
      };
    }
    return {
      findings: [
        { severity: 'high', regulation: 'RoHS 2011/65/EU', citation: 'Annex II', requirement: 'Pb, Hg, Cd, Cr(VI), PBB, PBDE under 0.1% wt/wt', gap: 'No third-party material declaration on file', recommendation: 'Commission XRF testing + obtain Full Material Declaration from cell supplier', estimated_cost_eur: 2400, estimated_weeks: 3 },
        { severity: 'medium', regulation: 'REACH 1907/2006', citation: 'Annex XIV / SVHC list (Jan 2026)', requirement: 'Notify ECHA if any SVHC > 0.1% wt/wt in article', gap: 'Bill of materials lacks supplier-level SVHC declarations', recommendation: 'Request SCIP-database notifications from each tier-1 supplier', estimated_cost_eur: 1800, estimated_weeks: 5 },
        ...(isBattery ? [
          { severity: 'high', regulation: 'EU Battery 2023/1542', citation: 'Art. 6 (Hazardous substances)', requirement: 'Restrict Cd ≤ 0.002% and Pb ≤ 0.01% wt/wt', gap: 'Cathode composition not documented at substance level', recommendation: 'Request CAS-level cathode breakdown from supplier; commission ICP-MS test', estimated_cost_eur: 3200, estimated_weeks: 4 },
        ] : []),
      ],
    };
  }
  if (tool.name === 'report_findings_electrical') {
    if (isRobot) {
      return {
        findings: [
          { severity: 'high', regulation: 'Machinery Regulation 2023/1230', citation: 'Annex I + Annex III Module B', requirement: 'EU-type examination by notified body for high-risk machinery with safety functions', gap: 'No EC-type examination certificate; no risk assessment per EN ISO 12100', recommendation: 'Engage TÜV NORD or DEKRA for Module B + functional safety review (EN ISO 13849 PL d)', estimated_cost_eur: 38000, estimated_weeks: 14 },
          { severity: 'high', regulation: 'Radio Equipment 2014/53/EU', citation: 'Art. 3.1(b) + 3.2', requirement: 'Wi-Fi 6 + BLE 5.3 modules must pass RED conformity assessment in an EU lab', gap: 'Wireless stack tested in Shenzhen; no EU notified-body RED file', recommendation: 'Re-test radio at Eurofins / BACL EU lab; obtain RED DoC', estimated_cost_eur: 11500, estimated_weeks: 7 },
          { severity: 'high', regulation: 'AI Act 2024/1689', citation: 'Annex III §5(d) + Art. 6', requirement: 'Embodied AI in environments with humans may be high-risk; logging + transparency obligations apply', gap: 'No risk classification document; no Annex IV technical documentation', recommendation: 'Author Annex IV file; classify use cases; implement logging per Art. 12', estimated_cost_eur: 22000, estimated_weeks: 10 },
          { severity: 'medium', regulation: 'EMC 2014/30/EU', citation: 'EN 55032 / EN 61000-6-2', requirement: 'Industrial EMC limits for actuator drives + power electronics', gap: 'No EMC chamber test for the integrated robot', recommendation: 'Book EMC chamber at TÜV SÜD Munich for system-level test', estimated_cost_eur: 9200, estimated_weeks: 4 },
          { severity: 'medium', regulation: 'LVD 2014/35/EU', citation: 'Annex III Module A', requirement: '50-1000 V AC / 75-1500 V DC charger + internal bus safety', gap: 'Onboard charger ENN 60335-1 test not on file', recommendation: 'Commission EN 60335-1 + EN 62368-1 evaluation', estimated_cost_eur: 8400, estimated_weeks: 6 },
        ],
      };
    }
    return {
      findings: [
        { severity: 'high', regulation: 'CE Marking (LVD 2014/35/EU)', citation: 'Annex III Module A', requirement: 'Self-declaration of conformity + technical file', gap: 'No EN 62133-2 cell-level safety test report', recommendation: 'Engage notified body for EN 62133-2 + EN IEC 63056 battery system tests', estimated_cost_eur: 14500, estimated_weeks: 8 },
        { severity: 'medium', regulation: 'EMC 2014/30/EU', citation: 'EN 55032 / EN 61000-6', requirement: 'Conducted + radiated emission limits', gap: 'EMC chamber test not done in EU-recognised lab', recommendation: 'Re-test at TÜV SÜD Munich or DEKRA Arnhem (results from China-lab not accepted by some Member States)', estimated_cost_eur: 6800, estimated_weeks: 4 },
        { severity: 'low', regulation: 'Radio Equipment 2014/53/EU', citation: 'Art. 3.1(b)', requirement: 'Applies if BLE/Wi-Fi present', gap: 'No RED conformity assessment file', recommendation: 'If wireless: commission notified-body RED assessment', estimated_cost_eur: 4200, estimated_weeks: 6 },
      ],
    };
  }
  if (tool.name === 'report_findings_carbon') {
    if (isRobot) {
      return {
        findings: [
          { severity: 'high', regulation: 'EU Battery 2023/1542', citation: 'Art. 77 (Digital Product Passport)', requirement: 'On-board industrial battery > 2 kWh requires QR-linked DPP', gap: 'No DPP data model for the robot battery pack', recommendation: 'Implement DPP fields (chemistry, capacity, recyclate %, second-life) - CIRPASS-aligned', estimated_cost_eur: 18000, estimated_weeks: 10 },
          { severity: 'medium', regulation: 'WEEE 2012/19/EU', citation: 'Annex I (Cat. 6) + Art. 11', requirement: 'Electrical/electronic equipment producer responsibility + WEEE registration per Member State', gap: 'No WEEE registration in DE/FR; no take-back partner', recommendation: 'Register with stiftung-ear (DE) and ADEME (FR); contract with WEEE compliance scheme', estimated_cost_eur: 4500, estimated_weeks: 4 },
          { severity: 'medium', regulation: 'EU Battery 2023/1542', citation: 'Art. 7 + Annex II', requirement: 'Carbon footprint declaration for the on-board pack', gap: 'No LCA performed at the pack level', recommendation: 'Cradle-to-gate LCA for the pack only (cells supplied by third party)', estimated_cost_eur: 9500, estimated_weeks: 6 },
        ],
      };
    }
    return {
      findings: [
        { severity: 'high', regulation: 'EU Battery 2023/1542', citation: 'Art. 7 + Annex II (Carbon footprint)', requirement: 'Declare carbon footprint per functional unit using PEF methodology', gap: 'No LCA performed; no declaration prepared', recommendation: 'Commission cradle-to-gate LCA with PEF-aligned consultancy', estimated_cost_eur: 18000, estimated_weeks: 10 },
        { severity: 'high', regulation: 'EU Battery 2023/1542', citation: 'Art. 77 (Digital Product Passport)', requirement: 'Each battery > 2 kWh must carry a QR-linked DPP with 32 mandatory fields', gap: 'DPP data model not implemented', recommendation: 'Build internal DPP service or contract a partner (CIRPASS-aligned)', estimated_cost_eur: 22000, estimated_weeks: 12 },
        { severity: 'medium', regulation: 'EU Battery 2023/1542', citation: 'Art. 8 (Recyclate content)', requirement: 'Min recycled Co/Ni/Li by 2031; documentation already required at placement on market', gap: 'No recyclate-content statement', recommendation: 'Document % recycled content per active material from supplier statements', estimated_cost_eur: 1200, estimated_weeks: 2 },
        { severity: 'medium', regulation: 'CBAM 2023/956', citation: 'Annex I + IV (default values)', requirement: 'Quarterly CBAM declarations for embedded emissions', gap: 'No CBAM declarant assigned; no embedded-emissions data', recommendation: 'Appoint EU-resident CBAM declarant; gather supplier emission factors', estimated_cost_eur: 9500, estimated_weeks: 6 },
      ],
    };
  }

  // Orchestrator - distinct numbers per archetype.
  if (isRobot) {
    return {
      compliance_score: 31,
      weeks_to_launch: 22,
      total_cost_eur: 127100,
      summary: 'Embodied-AI humanoid robot triggers Machinery Regulation, RED, and AI Act simultaneously. Notified-body Module B is the long-pole. Estimated path to first EU shipment: 22 weeks at ~€127k.',
      top_actions: [
        { priority: 1, title: 'Machinery Regulation Module B with notified body',                regulation: 'Machinery Regulation 2023/1230 Annex III', weeks: 14, cost_eur: 38000 },
        { priority: 2, title: 'AI Act Annex IV technical documentation + logging architecture',  regulation: 'AI Act 2024/1689 Art. 11 + 12',          weeks: 10, cost_eur: 22000 },
        { priority: 3, title: 'On-board battery Digital Product Passport implementation',        regulation: 'EU Battery 2023/1542 Art. 77',           weeks: 10, cost_eur: 18000 },
        { priority: 4, title: 'EU-lab RED conformity assessment for Wi-Fi 6 + BLE stack',        regulation: 'RED 2014/53/EU Art. 3',                  weeks: 7,  cost_eur: 11500 },
        { priority: 5, title: 'System-level EMC chamber test at EU-recognised lab',              regulation: 'EMC 2014/30/EU EN 55032',                weeks: 4,  cost_eur: 9200 },
        { priority: 6, title: 'Pack-level LCA + carbon footprint declaration',                   regulation: 'EU Battery 2023/1542 Art. 7',            weeks: 6,  cost_eur: 9500 },
        { priority: 7, title: 'LVD onboard charger + bus safety (EN 60335-1 / 62368-1)',         regulation: 'LVD 2014/35/EU',                          weeks: 6,  cost_eur: 8400 },
        { priority: 8, title: 'WEEE producer registration (DE + FR)',                            regulation: 'WEEE 2012/19/EU',                         weeks: 4,  cost_eur: 4500 },
        { priority: 9, title: 'Full Material Declarations from PCBA / harness / gearbox',        regulation: 'RoHS 2011/65/EU Annex II',                weeks: 4,  cost_eur: 3200 },
        { priority: 10, title: 'SVHC + Annex XVII screening on rare-earth magnet supply',        regulation: 'REACH 1907/2006',                         weeks: 5,  cost_eur: 2200 },
      ],
      notified_bodies: [
        { name: 'TÜV NORD CERT GmbH',                country: 'DE', number: 44,   scope: 'Machinery Module B, functional safety' },
        { name: 'DEKRA Certification GmbH',          country: 'DE', number: 158,  scope: 'Machinery, EMC, RED' },
        { name: 'Bureau Veritas Italia',             country: 'IT', number: 426,  scope: 'Machinery, AI Act conformity' },
        { name: 'Eurofins E&E Wireless EU GmbH',     country: 'DE', number: 2546, scope: 'RED radio assessments' },
      ],
    };
  }
  // Battery / default
  return {
    compliance_score: 42,
    weeks_to_launch: 14,
    total_cost_eur: 84600,
    summary: 'High-priority gaps in carbon footprint (Battery Reg 2023/1542) and CE/EMC test reports. Mid-priority for SVHC/REACH and CBAM declarant. Estimated path to first EU shipment: 14 weeks at ~€85k.',
    top_actions: [
      { priority: 1, title: 'Commission cradle-to-gate LCA with PEF methodology', regulation: 'EU Battery 2023/1542 Art. 7', weeks: 10, cost_eur: 18000 },
      { priority: 2, title: 'Build / contract DPP data model + QR linkage', regulation: 'EU Battery 2023/1542 Art. 77', weeks: 12, cost_eur: 22000 },
      { priority: 3, title: 'Engage notified body for EN 62133-2 + EN IEC 63056', regulation: 'CE / LVD 2014/35/EU', weeks: 8, cost_eur: 14500 },
      { priority: 4, title: 'Appoint EU-resident CBAM declarant + collect emission factors', regulation: 'CBAM 2023/956', weeks: 6, cost_eur: 9500 },
      { priority: 5, title: 'Re-run EMC test at EU-recognised lab', regulation: 'EMC 2014/30/EU', weeks: 4, cost_eur: 6800 },
      { priority: 6, title: 'Commission XRF + full material declaration', regulation: 'RoHS 2011/65/EU', weeks: 3, cost_eur: 2400 },
      { priority: 7, title: 'Collect supplier SVHC / SCIP declarations', regulation: 'REACH 1907/2006', weeks: 5, cost_eur: 1800 },
      { priority: 8, title: 'Document recyclate-content statement', regulation: 'EU Battery 2023/1542 Art. 8', weeks: 2, cost_eur: 1200 },
    ],
    notified_bodies: [
      { name: 'TÜV SÜD Product Service GmbH', country: 'DE', number: 123, scope: 'LVD, EMC, RED, battery safety' },
      { name: 'DEKRA Certification B.V.', country: 'NL', number: 344, scope: 'LVD, EMC, RED' },
      { name: 'Bureau Veritas Consumer Products Services', country: 'FR', number: 370, scope: 'RoHS, REACH, battery testing' },
      { name: 'SGS Fimko Oy', country: 'FI', number: 598, scope: 'Battery safety, EMC' },
    ],
  };
}

export default { runToolAgent };
