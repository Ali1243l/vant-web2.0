import { supabase } from '../supabase';
import { mergeCloudEvents } from './mergeCloudEvents';
import {
  AnalyticsEvent,
  STORAGE_KEY,
  SESSION_ID_KEY,
  PERSISTENT_VISITOR_ID_KEY,
  VISIT_COUNT_KEY,
  LAST_ACTIVITY_KEY,
  SESSION_TIMEOUT_MS,
  TELEMETRY_FILE,
} from './types';

// Detect real client device type
export function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
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

// Get all recorded telemetry events from local ring buffer
export function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const events = JSON.parse(raw);
    return Array.isArray(events) ? events : [];
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
      ...data,
      eventId,
      visitorId,
      visitCount,
      url: typeof window !== 'undefined' ? window.location.href : '',
      path: typeof window !== 'undefined' ? window.location.pathname : '',
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

    // 2. Periodically sync stream to Supabase Storage (debounced)
    scheduleSupabaseSync(updated);
  } catch (e) {
    console.warn('Telemetry recording failed', e);
  }
}

// Track system runtime errors & unhandled promise rejections directly to Supabase logs
export function trackSystemError(errorMessage: string, errorStack?: string) {
  try {
    const eventId = 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const deviceType = detectDevice();
    const { visitorId, sessionId, visitCount } = manageVisitorSession();
    const nowTimestamp = Date.now();

    const cleanMsg = String(errorMessage || 'Unknown Error').trim();
    const stackLines = (errorStack || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const firstStackLine = stackLines[0] || '';
    const errorSignature = firstStackLine ? `${cleanMsg}::${firstStackLine}` : cleanMsg;

    const errorData = {
      errorMessage: cleanMsg,
      errorStack: errorStack || '',
      errorSignature,
      status: 'open' as const,
      visitorId,
      visitCount,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date(nowTimestamp).toISOString(),
    };

    const newEvent: AnalyticsEvent = {
      id: eventId,
      type: 'system_error',
      timestamp: nowTimestamp,
      device: deviceType,
      sessionId,
      data: errorData,
    };

    const events = getStoredEvents();
    const updated = [newEvent, ...events].slice(0, 2000);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vant_analytics_updated', { detail: newEvent }));
      }, 0);
    }

    if (supabase) {
      (async () => {
        try {
          await supabase.from('logs').insert({
            event_type: 'system_error',
            device: deviceType,
            session_id: sessionId,
            visitor_id: visitorId,
            visit_count: visitCount,
            data: errorData,
            created_at: new Date(nowTimestamp).toISOString(),
          });
        } catch {
          // Silent catch
        }
      })();
    }
  } catch (e) {
    console.warn('System error telemetry recording failed', e);
  }
}

// Update Supabase logs JSONB status for specific system error log
export async function updateSystemErrorStatus(
  logId: string,
  newStatus: 'open' | 'investigating' | 'resolved'
): Promise<boolean> {
  try {
    // 1. Update local storage ring buffer for optimistic UI state
    const rawEvents = getStoredEvents();
    let found = false;
    const updatedEvents = rawEvents.map((ev) => {
      if (String(ev.id) === String(logId) || ev.data?.id === logId) {
        found = true;
        return {
          ...ev,
          data: {
            ...ev.data,
            status: newStatus,
          },
        };
      }
      return ev;
    });

    if (found) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    }

    // Always dispatch reactive update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vant_analytics_updated', { detail: { id: logId, status: newStatus } }));
    }

    // 2. Update Supabase `logs` table data JSONB column
    if (supabase) {
      const { data: row } = await supabase.from('logs').select('*').eq('id', logId).maybeSingle();
      if (row) {
        const currentData = typeof row.data === 'object' && row.data !== null ? row.data : {};
        const newData = { ...currentData, status: newStatus };
        await supabase.from('logs').update({ data: newData }).eq('id', logId);
      } else {        const { data: allLogs } = await supabase.from('logs').select('*').eq('event_type', 'system_error');
        if (allLogs) {
          const matchedRow = allLogs.find((r: any) => String(r.id) === String(logId) || r.data?.id === logId);
          if (matchedRow) {
            const currentData = typeof matchedRow.data === 'object' && matchedRow.data !== null ? matchedRow.data : {};
            const newData = { ...currentData, status: newStatus };
            await supabase.from('logs').update({ data: newData }).eq('id', matchedRow.id);
          }
        }
      }
    }
    return true;
  } catch (err) {
    console.warn('Failed to update system error status', err);
    return false;
  }
}

// Debounced background sync to Supabase Storage
let syncTimer: any = null;
function scheduleSupabaseSync(events: AnalyticsEvent[]) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    if (!supabase) return;
    try {
      const payload = JSON.stringify(
        {
          synced_at: new Date().toISOString(),
          total_events: events.length,
          events: events.slice(0, 500),
        },
        null,
        2
      );
      const blob = new Blob([payload], { type: 'application/json' });
      await supabase.storage.from('product-images').upload(TELEMETRY_FILE, blob, {
        contentType: 'application/json',
        upsert: true,
      });
    } catch {
      // Background sync silent catch
    }
  }, 4000);
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

// Auto-register global error listeners for error telemetry
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    trackSystemError(event.message || 'Window Runtime Error', event.error?.stack);
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || 'Unhandled Promise Rejection';
    const stack = reason?.stack || '';
    trackSystemError(msg, stack);
  });
}
