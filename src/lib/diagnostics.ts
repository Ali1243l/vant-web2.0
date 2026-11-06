export type ErrorKind = 'runtime' | 'promise' | 'resource' | 'react' | 'save' | 'diagnostic';
export interface ErrorContext { kind?: ErrorKind; operation?: string; source?: string; line?: number; column?: number; componentStack?: string }

export function diagnosticPath(value: string): string {
  try {
    const url = new URL(value, 'https://local.invalid');
    const path = url.pathname.slice(0, 1024).replace(/\/[A-Za-z0-9_-]{32,}(?=\/|$)/g, '/[redacted]').replace(/[A-Z0-9._%+-]{1,64}(?:@|%40)[A-Z0-9.-]{1,190}\.[A-Z]{2,20}/gi, '[email]');
    return (url.origin === 'https://local.invalid' ? path : url.origin + path).slice(0, 300);
  } catch { return '[invalid URL]'; }
}
export function diagnosticText(value: unknown, limit = 1000): string {
  return String(typeof value === 'string' || typeof value === 'number' ? value : '')
    .slice(0, Math.min(limit * 2, 8192))
    .replace(/https?:\/\/[^\s<>"')]+/gi, url => diagnosticPath(url))
    .replace(/\b(?:Bearer\s+)?eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gi, '[token]')
    .replace(/\b(?:sb_(?:secret|publishable)_[A-Za-z0-9_-]+|re_[A-Za-z0-9]{16,})\b/g, '[key]')
    .replace(/["']?\b(?:password|passwd|pin|token|access_token|refresh_token|authorization|apikey|api_key|secret|cookie)["']?\s*[=:]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '[credential]')
    .replace(/[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,190}\.[A-Z]{2,20}/gi, '[email]')
    .replace(/(?:\+?\d[\d ()-]{8,}\d)/g, '[number]')
    .slice(0, limit);
}
const privateKey = /password|passwd|token|authorization|cookie|secret|email|phone|address|latitude|longitude|^ip$|api.?key/i;
export function sanitizeTelemetry(value: unknown, depth = 0): any {
  if (depth > 4) return '[limited]';
  if (value == null || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') return diagnosticText(value, 500);
  if (Array.isArray(value)) return value.slice(0, 12).map(item => sanitizeTelemetry(item, depth + 1));
  if (typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0, 30).map(([key, item]) => [key.slice(0, 60), privateKey.test(key) ? '[redacted]' : key === 'errorStack' || key === 'componentStack' ? diagnosticText(item, 3000) : sanitizeTelemetry(item, depth + 1)]));
  return undefined;
}
export function diagnosticDevice(ua: string) {
  const tablet = /ipad|tablet|playbook|silk|android(?!.*mobi)/i.test(ua) || (/macintosh/i.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
  return {
    device: tablet ? 'tablet' as const : /mobile|iphone|ipod|android|iemobile|opera mini/i.test(ua) ? 'mobile' as const : 'desktop' as const,
    browser: /edg\//i.test(ua) ? 'Edge' : /firefox|fxios/i.test(ua) ? 'Firefox' : /chrome|crios/i.test(ua) ? 'Chrome' : /safari/i.test(ua) ? 'Safari' : 'Other',
    os: /iphone|ipad|ipod/i.test(ua) || tablet && /macintosh/i.test(ua) ? 'iOS' : /android/i.test(ua) ? 'Android' : /windows/i.test(ua) ? 'Windows' : /macintosh|mac os/i.test(ua) ? 'macOS' : /linux/i.test(ua) ? 'Linux' : 'Other',
  };
}
export function errorFingerprint(message: string, stack: string, kind: string) {
  let hash = 2166136261;
  for (const letter of `${kind}:${message}:${stack.split('\n').find(line => /\bat\b|@/.test(line)) || ''}`) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619) >>> 0;
  return hash.toString(16).padStart(8, '0');
}
export function diagnosticHint(kind: string, online: boolean, message: string) {
  if (!online) return 'offline';
  if (/chunk|dynamically imported|loading css/i.test(message)) return 'asset-version';
  if (kind === 'resource') return 'resource-load';
  if (/permission|unauthorized|row.level|jwt|42501/i.test(message)) return 'permission';
  if (/fetch|network|timeout/i.test(message)) return 'connection';
  return 'needs-investigation';
}
