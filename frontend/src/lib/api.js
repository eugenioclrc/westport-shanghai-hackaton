// API client. Auto-logs in as guest, stores token in localStorage, exposes
// helpers for products / analyses.
const KEYS = { token: 'wp_token', user: 'wp_user' };

async function jfetch(method, path, body) {
  const token = localStorage.getItem(KEYS.token);
  const headers = {
    'content-type': 'application/json',
    'ngrok-skip-browser-warning': '1',
  };
  if (token) headers.authorization = 'Bearer ' + token;
  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  try { return await res.json(); } catch (_e) { return null; }
}

export async function ensureLogin() {
  if (localStorage.getItem(KEYS.token)) return;
  const r = await jfetch('POST', '/auth/login', {});
  if (r && r.ok) {
    localStorage.setItem(KEYS.token, r.data.token);
    localStorage.setItem(KEYS.user, JSON.stringify(r.data));
  }
}

export function getToken() {
  return localStorage.getItem(KEYS.token) || '';
}

export async function getMe() {
  return jfetch('GET', '/auth/me');
}

export async function getHealth() {
  return jfetch('GET', '/health');
}

export async function listProducts() {
  return jfetch('GET', '/products');
}

export async function listSamples() {
  return jfetch('GET', '/products/samples');
}

export async function createAnalysis(product, productId) {
  return jfetch('POST', '/analyses', { product, productId });
}

export default { ensureLogin, getMe, getHealth, listProducts, listSamples, createAnalysis, getToken };
