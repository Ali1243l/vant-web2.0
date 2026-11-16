let epoch = 0;
export const shopperSessionEpoch = () => epoch;
export async function shopperSessionRequest(action?: string, data: Record<string, unknown> = {}) {
  if (action === 'exchange' || action === 'logout') epoch++;
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('/api/shopper-session', { method: action ? 'POST' : 'GET', signal: controller.signal, credentials: 'same-origin', headers: action ? { 'Content-Type': 'application/json' } : {}, body: action ? JSON.stringify({ action, ...data }) : undefined });
    if (!response.ok) throw Error(`Customer session request failed (${response.status})`);
    return await response.json();
  } finally { clearTimeout(timer); }
}
export function broadcastShopperSession() {
  try { localStorage.setItem('vant_customer_session_event', String(Date.now())); }
  catch (error) { reportCaughtError(error, 'shopper-session-broadcast'); }
  window.dispatchEvent(new Event('shopper-session-change'));
}
import { reportCaughtError } from './caughtErrors';
