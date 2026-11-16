import { createClient } from '@supabase/supabase-js';

const names = ['vant_customer_access', 'vant_customer_refresh'];
function cookies(req: any): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of String(req.headers?.cookie || '').split(';')) {
    const split = part.indexOf('=');
    if (split < 0) continue;
    try { result[part.slice(0, split).trim()] = decodeURIComponent(part.slice(split + 1)); } catch { return {}; }
  }
  return result;
}
function setSessionCookies(res: any, session: any | null) {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', names.map((name, i) => `${name}=${encodeURIComponent(session ? i ? session.refresh_token : session.access_token : '')}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=${session ? i ? 2592000 : session.expires_in || 3600 : 0}${secure}`));
}
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Vary', 'Cookie');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'method' });
  const host = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '');
  const origin = req.headers?.origin;
  if (req.method === 'POST') {
    let validOrigin = false;
    try { const parsed = new URL(String(origin)); validOrigin = ['https:', 'http:'].includes(parsed.protocol) && parsed.host === host; } catch { validOrigin = false; }
    if (!validOrigin) return res.status(403).json({ error: 'origin' });
  }
  try {
    const body = req.method === 'GET' ? {} : typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || JSON.stringify(body).length > 1048576) return res.status(400).json({ error: 'input' });
    const stored = cookies(req), url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (req.method === 'GET' && !stored[names[0]] && !stored[names[1]]) return res.status(200).json({ owner: null });
    if (!url || !key) return res.status(503).json({ error: 'unavailable' });
    const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: (input: any, init: any) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } };
    const auth = createClient(url, key, options);
    let access = stored[names[0]], refresh = stored[names[1]], user: any;
    if (body.action === 'exchange') {
      if (typeof body.refreshToken !== 'string' || body.refreshToken.length > 2048) return res.status(400).json({ error: 'input' });
      refresh = body.refreshToken; access = '';
    }
    if (access) {
      const result = await auth.auth.getUser(access);
      if (result.error && (!result.error.status || result.error.status >= 500)) throw Error('Auth unavailable');
      user = result.data?.user;
    }
    if (!user && refresh) {
      const result = await auth.auth.refreshSession({ refresh_token: refresh });
      if (result.error && (!result.error.status || result.error.status >= 500)) throw Error('Auth unavailable');
      if (result.data.session) { access = result.data.session.access_token; user = result.data.user; setSessionCookies(res, result.data.session); }
    }
    if (!user?.email_confirmed_at) { setSessionCookies(res, null); return res.status(req.method === 'GET' ? 200 : 401).json({ owner: null, error: req.method === 'GET' ? undefined : 'sign_in_required' }); }
    if (req.method === 'GET' || body.action === 'exchange') return res.status(200).json({ owner: user.id });
    if (body.action === 'logout') {
      const result = await fetch(`${url}/auth/v1/logout?scope=local`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${access}` }, signal: AbortSignal.timeout(8000) });
      if (!result.ok && result.status !== 401 && result.status !== 403) throw Error('Sign-out unavailable');
      setSessionCookies(res, null); return res.status(200).json({ owner: null });
    }
    if (body.action !== 'sync' || body.owner !== user.id || !Array.isArray(body.operations) || body.operations.length > 200) return res.status(403).json({ error: 'scope' });
    const client = createClient(url, key, { ...options, global: { ...options.global, headers: { Authorization: `Bearer ${access}` } } });
    const { data, error } = await client.rpc('sync_shopper', { p_owner: user.id, p_operations: body.operations });
    if (error || !data) throw Error('Shopping sync unavailable');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Customer session failed', error instanceof Error ? error.name : 'unknown');
    return res.status(error instanceof SyntaxError ? 400 : 503).json({ error: 'session_unavailable' });
  }
}
export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };
