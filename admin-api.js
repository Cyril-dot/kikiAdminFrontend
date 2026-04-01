/* ═══════════════════════════════════════════════════════
   GStake Admin — API Integration Layer
   All real API calls go through this module.
   ═══════════════════════════════════════════════════════ */

const API_BASE = 'https://kikiwebbackend.onrender.com/api/v1';
const ADMIN_API = 'https://kikiwebbackend.onrender.com/api/v1/admin';
const CORRECT_SCORE_API = 'https://kikiwebbackend.onrender.com/api/admin/correct-score';

/* ── Auth helpers ── */
function getToken() {
  return localStorage.getItem('gstake_admin_token');
}

function getAdminData() {
  try {
    return JSON.parse(localStorage.getItem('gstake_admin') || '{}');
  } catch {
    return {};
  }
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}

/* ── Core fetch wrapper ── */
async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  // Handle 401 — token expired / invalid
  if (res.status === 401) {
    localStorage.removeItem('gstake_admin_token');
    localStorage.removeItem('gstake_admin');
    window.location.href = 'admin-login.html';
    throw new Error('Session expired. Please sign in again.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  // Unwrap standard ApiResponse wrapper: { status, message, data }
  return data.data !== undefined ? data.data : data;
}

/* ══════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════ */

/** POST /api/v1/admin/login */
async function apiAdminLogin(email, password) {
  const data = await apiFetch(`${ADMIN_API}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  // data is already unwrapped — contains token + admin info
  localStorage.setItem('gstake_admin_token', data.token);
  localStorage.setItem('gstake_admin', JSON.stringify(data));
  return data;
}

/** POST /api/v1/admin/register */
async function apiAdminRegister(fullName, email, password) {
  // FIX: explicitly set method to POST and use absolute URL
  return apiFetch(`${ADMIN_API}/register`, {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  });
}

/** GET /api/v1/admin/me */
async function apiGetMyProfile() {
  return apiFetch(`${ADMIN_API}/me`);
}

/* ══════════════════════════════════════════════════════
   USERS
══════════════════════════════════════════════════════ */

/** GET /api/v1/admin/users */
async function apiGetAllUsers() {
  return apiFetch(`${ADMIN_API}/users`);
}

/** GET /api/v1/admin/users/{userId} */
async function apiGetUserById(userId) {
  return apiFetch(`${ADMIN_API}/users/${userId}`);
}

/* ══════════════════════════════════════════════════════
   GAMES
══════════════════════════════════════════════════════ */

/** GET /api/v1/admin/games */
async function apiGetAllGames() {
  return apiFetch(`${ADMIN_API}/games`);
}

/** GET /api/v1/games/public/{gameId} */
async function apiGetGameById(gameId) {
  return apiFetch(`${API_BASE}/games/public/${gameId}`);
}

/** POST /api/v1/admin/games */
async function apiAddGame(payload) {
  return apiFetch(`${ADMIN_API}/games`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** PATCH /api/v1/admin/games/{gameId} */
async function apiUpdateGame(gameId, payload) {
  return apiFetch(`${ADMIN_API}/games/${gameId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/v1/admin/games/{gameId} */
async function apiDeleteGame(gameId) {
  return apiFetch(`${ADMIN_API}/games/${gameId}`, { method: 'DELETE' });
}

/** POST /api/v1/admin/games/{gameId}/result */
async function apiEnterResult(gameId, homeScore, awayScore) {
  return apiFetch(`${ADMIN_API}/games/${gameId}/result`, {
    method: 'POST',
    body: JSON.stringify({ homeScore, awayScore }),
  });
}

/** POST /api/v1/admin/games/{gameId}/cancel */
async function apiCancelGame(gameId) {
  return apiFetch(`${ADMIN_API}/games/${gameId}/cancel`, { method: 'POST' });
}

/* ══════════════════════════════════════════════════════
   CORRECT SCORE MARKET
══════════════════════════════════════════════════════ */

/** POST /api/admin/correct-score/{gameId}/generate */
async function apiGenerateCSOptions(gameId) {
  return apiFetch(`${CORRECT_SCORE_API}/${gameId}/generate`, { method: 'POST' });
}

/** POST /api/admin/correct-score/{gameId}/lock */
async function apiLockCSMarket(gameId) {
  return apiFetch(`${CORRECT_SCORE_API}/${gameId}/lock`, { method: 'POST' });
}

/** POST /api/admin/correct-score/{gameId}/reveal */
async function apiRevealCSMarket(gameId, homeScore, awayScore) {
  return apiFetch(`${CORRECT_SCORE_API}/${gameId}/reveal`, {
    method: 'POST',
    body: JSON.stringify({ homeScore, awayScore }),
  });
}

/* ══════════════════════════════════════════════════════
   BET SLIPS (admin view)
══════════════════════════════════════════════════════ */

/** GET /api/v1/bets/slip/{reference} */
async function apiGetSlipByReference(reference) {
  return apiFetch(`${API_BASE}/bets/slip/${reference}`);
}

/* ══════════════════════════════════════════════════════
   WALLET / TRANSACTIONS (admin view)
══════════════════════════════════════════════════════ */

/** GET /api/v1/wallet/transactions */
async function apiGetTransactions() {
  return apiFetch(`${API_BASE}/wallet/transactions`);
}

/* ══════════════════════════════════════════════════════
   STATUS HELPERS
══════════════════════════════════════════════════════ */

function adminLogout() {
  localStorage.removeItem('gstake_admin_token');
  localStorage.removeItem('gstake_admin');
  window.location.href = 'admin-login.html';
}