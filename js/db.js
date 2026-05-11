'use strict';
// ═══════════════════════════════════════════
// DB — edge function wrapper + data helpers
// ═══════════════════════════════════════════

async function callEdge(fn, body, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${token || ANON_KEY}`,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await fetch(`${EDGE}/${fn}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    const msg = e.name === 'AbortError'
      ? `Timeout calling ${fn} — check Edge Function logs`
      : `Network error calling ${fn}: ${e.message}`;
    console.error(msg, e);
    throw new Error(msg);
  }
  clearTimeout(timer);

  const data = await res.json().catch(() => ({ error: 'Bad JSON response' }));
  console.log(`[${fn}] ${res.status}`, data);
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status} from ${fn}`);
  return data;
}

async function dbGetByPhone(phone) {
  try {
    const d = await callEdge('nook-read', { action: 'getByPhone', phone });
    return d.customer || null;
  } catch (e) { console.error('dbGetByPhone:', e); return null; }
}

async function dbGetById(id) {
  try {
    const d = await callEdge('nook-read', { action: 'getById', id });
    return d.customer || null;
  } catch (e) { console.error('dbGetById:', e); return null; }
}

async function dbGetAll(token = null) {
  try {
    const d = await callEdge('nook-read', { action: 'getAll' }, token);
    return d.customers || [];
  } catch (e) { console.error('dbGetAll:', e); return []; }
}

async function refreshCustomer(id) {
  const fresh = await dbGetById(id);
  if (!fresh) return null;
  if (currentCustomer?.id === id)  currentCustomer  = fresh;
  if (selectedCustomer?.id === id) selectedCustomer = fresh;
  if (adminCustomer?.id === id)    adminCustomer    = fresh;
  const li = staffList.findIndex(x => x.id === id);
  if (li >= 0) staffList[li] = fresh;
  return fresh;
}
async function dbCheckPhone(phone) {
  try {
    const d = await callEdge('nook-read', { action: 'checkPhone', phone });
    return d; // { exists, hasPin }
  } catch (e) { console.error('dbCheckPhone:', e); return { exists: false }; }
}
async function dbVerifyPin(phone, pin) {
  try {
    const d = await callEdge('nook-read', { action: 'verifyPin', phone, pin });
    return d.customer || null;
  } catch (e) { throw e; }
}
async function dbGetLeaderboard() {
  try {
    const d = await callEdge('nook-read', { action: 'getLeaderboard' });
    return d.leaderboard || [];
  } catch (e) { console.error('dbGetLeaderboard:', e); return []; }
}
