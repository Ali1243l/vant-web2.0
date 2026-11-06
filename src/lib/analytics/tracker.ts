import { supabase } from '../supabase';
import { diagnosticText, diagnosticPath, sanitizeTelemetry, diagnosticDevice, diagnosticHint, errorFingerprint, type ErrorContext } from '../diagnostics';
import { queueDiagnostic, flushDiagnosticQueue } from '../errorDelivery';
import { mergeCloudEvents } from './mergeCloudEvents';
import { getApproximateRegion } from '../approximateRegion';
import {
  AnalyticsEvent,
  STORAGE_KEY,
  SESSION_ID_KEY,
  PERSISTENT_VISITOR_ID_KEY,
  VISIT_COUNT_KEY,
  LAST_ACTIVITY_KEY,
  SESSION_TIMEOUT_MS,
} from './types';

export function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
  return diagnosticDevice(typeof navigator === 'undefined' ? '' : navigator.userAgent).device;
}

// Manage lifetime persistent visitor ID
export function getPersistentVisitorId(): string {
  if (typeof window === 'undefined') return 'v_ssr';
  let visitorId = localStorage.getItem(PERSISTENT_VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem(PERSISTENT_VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

// Manage active session and visit counter with automatic expiration timeout
export function manageVisitorSession(): { visitorId: string; sessionId: string; visitCount: number } {
  if (typeof window === 'undefined') {
    return { visitorId: 'v_ssr', sessionId: 'sess_ssr', visitCount: 1 };
  }
  const visitorId = getPersistentVisitorId();
  const now = Date.now();
  const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
  const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : 0;
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  let visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);

  if (!sessionId || !lastActivity || now - lastActivity > SESSION_TIMEOUT_MS) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    visitCount += 1;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    localStorage.setItem(VISIT_COUNT_KEY, visitCount.toString());
  }

  localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
  return { visitorId, sessionId, visitCount };
}

export function getVisitorSessionId(): string {
  return manageVisitorSession().sessionId;
}

export function getVisitCount(): number {
  return manageVisitorSession().visitCount;
}

let regionSession = '';
export async function trackVisitorRegion() {
  const sessionId = getVisitorSessionId();
  if (regionSession === sessionId) return;
  regionSession = sessionId;
  const geo = await getApproximateRegion();
  if (geo.country && getVisitorSessionId() === sessionId) trackEvent('visitor_region', { geo, locationSource: 'approximate_ip' });
}

// Get all recorded telemetry events from local ring buffer
export function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const events = JSON.parse(raw);
    return Array.isArray(events) ? events.filter(row => row && typeof row === 'object').map(row => ({ ...row, data: sanitizeTelemetry(row.data || {}) })) : [];
  } catch (e) {
    console.warn('Failed to parse analytics local storage', e);
    return [];
  }
}

// Track and persist any telemetry event
export function trackEvent(
  type: AnalyticsEvent['type'],
  data: Record<string, any> = {}
) {
  try {
    const eventId = 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const deviceType = detectDevice();
    const { visitorId, sessionId, visitCount } = manageVisitorSession();
    const nowTimestamp = Date.now();
    const events = getStoredEvents();

    const eventData = {
      ...sanitizeTelemetry(data),
      eventId,
      visitorId,
      visitCount,
      url: typeof window !== 'undefined' ? diagnosticPath(window.location.href) : '',
      path: typeof window !== 'undefined' ? diagnosticPath(window.location.pathname) : '',
      lang: typeof document !== 'undefined' ? document.documentElement.lang || 'ar' : 'ar',
    };

    const newEvent: AnalyticsEvent = {
      id: eventId,
      type,
      timestamp: nowTimestamp,
      device: deviceType,
      sessionId,
      data: eventData,
    };

    // Store up to 2,000 real events in ring buffer locally
    const updated = [newEvent, ...events].slice(0, 2000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch event for instant UI telemetry reaction safely outside React render loop
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vant_analytics_updated', { detail: newEvent }));
      }, 0);
    }

    // 1. Direct real-time write to Supabase `logs` table with persistent visitorId & lifetime visitCount
    if (supabase) {
      (async () => {
        try {
          await supabase.from('logs').insert({
            event_type: type,
            device: deviceType,
            session_id: sessionId,
            visitor_id: visitorId,
            visit_count: visitCount,
            data: eventData,
            created_at: new Date(nowTimestamp).toISOString(),
          });
        } catch {
          // Silent catch
        }
      })();
    }

    breadcrumbs.push({ type, at: nowTimestamp, path: eventData.path });
    if (breadcrumbs.length > 10) breadcrumbs.shift();
  } catch (e) {
    console.warn('Telemetry recording failed', e);
  }
}

const breadcrumbs: Array<{ type: string; at: number; path: string }> = [];
const recentErrors = new Map<string, { id: string; at: number }>();
export function trackSystemError(errorMessage: string, errorStack?: string, context: ErrorContext = {}): string | undefined {
  try {
    const nowTimestamp = Date.now();
    const message = diagnosticText(errorMessage || 'Unknown error');
    const stack = diagnosticText(errorStack || '', 3000);
    const kind = context.kind || 'runtime';
    const signature = errorFingerprint(message, stack, kind);
    const previous = recentErrors.get(signature);
    if (previous && nowTimestamp - previous.at < 1500) return previous.id;
    const eventId = 'err_' + nowTimestamp + '_' + Math.random().toString(36).slice(2, 8);
    recentErrors.set(signature, { id: eventId, at: nowTimestamp });
    if (recentErrors.size > 100) recentErrors.delete(recentErrors.keys().next().value!);
    let visitor = { visitorId: 'unavailable', sessionId: 'unavailable', visitCount: 1 };
    try { visitor = manageVisitorSession(); } catch { /* Error capture must survive unavailable storage. */ }
    const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    const device = diagnosticDevice(ua);
    const online = typeof navigator === 'undefined' || navigator.onLine !== false;
    const errorData = {
      eventId, errorMessage: message, errorStack: stack, errorSignature: signature,
      kind, operation: diagnosticText(context.operation || '', 80),
      source: context.source ? diagnosticPath(context.source) : '', line: context.line, column: context.column,
      componentStack: diagnosticText(context.componentStack || '', 1500),
      status: 'open', ...visitor, url: typeof window === 'undefined' ? '' : diagnosticPath(window.location.href),
      timestamp: new Date(nowTimestamp).toISOString(), browser: device.browser, os: device.os,
      viewport: typeof window === 'undefined' ? '' : `${window.innerWidth}×${window.innerHeight}`,
      online, visibility: typeof document === 'undefined' ? 'unknown' : document.visibilityState,
      language: typeof document === 'undefined' ? '' : document.documentElement.lang,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      release: import.meta.env?.VITE_APP_RELEASE || 'local',
      breadcrumbs: breadcrumbs.slice(), hint: diagnosticHint(kind, online, message),
    };
    const newEvent: AnalyticsEvent = { id: eventId, type: 'system_error', timestamp: nowTimestamp, device: device.device, sessionId: visitor.sessionId, data: errorData };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([newEvent, ...getStoredEvents()].slice(0, 2000))); } catch {}
    queueDiagnostic(newEvent);
    if (typeof window !== 'undefined') setTimeout(() => window.dispatchEvent(new CustomEvent('vant_analytics_updated', { detail: newEvent })), 0);
    return eventId;
  } catch { return undefined; }
}

// Publish status only after the protected database update is acknowledged.
export async function updateSystemErrorStatus(logId: string, newStatus: 'open' | 'investigating' | 'resolved'): Promise<boolean> {
  if (!['open', 'investigating', 'resolved'].includes(newStatus)) return false;
  try {
    if (supabase) {
      const column = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(logId) ? 'id' : 'data->>eventId';
      const { data: row, error } = await supabase.from('logs').select('id,data').eq(column, logId).maybeSingle();
      if (error || !row) return false;
      const result = await supabase.from('logs').update({ data: { ...row.data, status: newStatus } }).eq('id', row.id).select('id').maybeSingle();
      if (result.error || !result.data) return false;
    }
    const events = getStoredEvents().map(event => event.id === logId || event.data?.eventId === logId ? { ...event, data: { ...event.data, status: newStatus } } : event);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch {}
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('vant_analytics_updated'));
    return true;
  } catch { return false; }
}

// Fetch telemetry events directly from Supabase `logs` database table
export async function syncFromSupabaseCloud(): Promise<AnalyticsEvent[]> {
  if (!supabase) throw new Error('Analytics cloud is not configured');
    const { data: dbLogs, error: dbErr } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (dbErr) throw dbErr;
    if (!Array.isArray(dbLogs)) throw new Error('Invalid analytics cloud response');
    const events = mergeCloudEvents(getStoredEvents(), dbLogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent('vant_analytics_updated'));
    return events;
}

// Clear stored local analytics
export function clearStoredAnalytics() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vant_analytics_updated'));
      }, 0);
    }
  } catch {}
}

export async function resetAnalyticsData(): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      localStorage.removeItem(PERSISTENT_VISITOR_ID_KEY);
      localStorage.removeItem(VISIT_COUNT_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      try {
        sessionStorage.clear();
      } catch {}
    }
    if (supabase) {
      try {
        await supabase.from('logs').delete().gt('created_at', '1970-01-01T00:00:00Z');
        await supabase.from('logs').delete().neq('event_type', 'non_existent_type_xyz');
        await supabase.from('logs').delete().filter('id', 'not.is', null);
      } catch (e) {
        console.warn('Supabase logs purge failed', e);
      }
    }
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vant_analytics_updated', { detail: null }));
      }, 0);
    }
    return true;
  } catch (err) {
    console.warn('Reset analytics failed', err);
    return false;
  }
}

// One registration shared by storefront and admin, with no raw form/input capture.
let errorTrackingInstalled = false;
export function installErrorTracking() {
  if (errorTrackingInstalled || typeof window === 'undefined') return;
  errorTrackingInstalled = true;
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.tagName && ['IMG', 'SCRIPT', 'LINK'].includes(target.tagName)) {
      trackSystemError(`${target.tagName} resource failed`, '', { kind: 'resource', source: target.getAttribute('src') || target.getAttribute('href') || '' });
    } else trackSystemError(event.message || 'Window runtime error', event.error?.stack, { kind: 'runtime', source: event.filename, line: event.lineno, column: event.colno });
  }, true);
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    trackSystemError(reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : 'Unhandled promise rejection', reason instanceof Error ? reason.stack : '', { kind: 'promise' });
  });
  window.addEventListener('online', () => { void flushDiagnosticQueue(); });
  void flushDiagnosticQueue();
}
