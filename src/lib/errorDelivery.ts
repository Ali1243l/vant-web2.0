import { supabase } from './supabase';
import type { AnalyticsEvent } from './analytics/types';
import { sanitizeTelemetry } from './diagnostics';

const key = 'vant_error_queue_v1';
let memory: AnalyticsEvent[] | undefined;
let running: Promise<boolean> | null = null;
let retry: ReturnType<typeof setTimeout> | undefined;
let failures = 0;
let lastSuccess = '';
let lastFailure = '';
let dropped = 0;
function queue() {
  if (!memory) {
    try { const parsed = JSON.parse(localStorage.getItem(key) || '[]'); memory = Array.isArray(parsed) ? parsed.filter(row => row?.type === 'system_error' && typeof row.id === 'string' && Number.isFinite(row.timestamp) && typeof row.sessionId === 'string' && row.data && typeof row.data === 'object').slice(-50).map(row => ({ ...row, data: sanitizeTelemetry(row.data) })) : []; }
    catch { memory = []; }
  }
  return memory;
}
function publish() {
  try { localStorage.setItem(key, JSON.stringify(queue())); } catch { /* Keep the in-memory queue when browser storage is unavailable. */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('vant_error_delivery'));
}
export const errorDeliveryStatus = () => ({ pending: queue().length, lastSuccess, lastFailure, dropped });
export function queueDiagnostic(event: AnalyticsEvent) {
  if (queue().some(row => row.id === event.id)) return;
  queue().push(event);
  if (queue().length > 50) { queue().shift(); dropped++; }
  publish();
  void flushDiagnosticQueue();
}
export function flushDiagnosticQueue(): Promise<boolean> {
  if (!queue().length) return Promise.resolve(true);
  if (running) return running;
  if (!supabase || typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(false);
  running = (async () => {
    while (queue().length) {
      const event = queue()[0];
      try {
        const { error } = await supabase!.from('logs').insert({ event_type: 'system_error', device: event.device, session_id: event.sessionId, visitor_id: event.data.visitorId, visit_count: event.data.visitCount, data: event.data, created_at: new Date(event.timestamp).toISOString() });
        if (error) throw error;
        queue().shift(); failures = 0; lastFailure = ''; lastSuccess = new Date().toISOString(); publish();
      } catch {
        failures++; lastFailure = new Date().toISOString(); publish();
        if (!retry) {
          retry = setTimeout(() => { retry = undefined; void flushDiagnosticQueue(); }, Math.min(300000, 15000 * 2 ** Math.min(failures - 1, 4)));
          (retry as any)?.unref?.();
        }
        return false;
      }
    }
    if (retry) { clearTimeout(retry); retry = undefined; }
    return true;
  })().finally(() => { running = null; });
  return running;
}
