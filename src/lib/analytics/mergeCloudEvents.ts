import type { AnalyticsEvent } from './types';

// Keep unsynced local observations when the cloud returns an empty or partial page.
export function mergeCloudEvents(local: AnalyticsEvent[], rows: any[], now = Date.now()): AnalyticsEvent[] {
  const events = new Map<string, AnalyticsEvent>();
  for (const event of local) if (event?.id && Number.isFinite(event.timestamp) && event.timestamp <= now) events.set(event.id, event);
  for (const row of rows) {
    const timestamp = Date.parse(row?.created_at || '');
    const type = row?.event_type || row?.type;
    if (!row?.id || !type || !Number.isFinite(timestamp) || timestamp > now || (!row.session_id && type !== 'system_error')) continue;
    const data = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? row.data : {};
    const id = String(data.eventId || row.id);
    events.set(id, { id, type, timestamp, sessionId: String(row.session_id || ''), device: row.device || 'desktop', data, isCloudLog: true });
  }
  return [...events.values()].sort((a, b) => b.timestamp - a.timestamp).slice(0, 2000);
}
