export const STORE_THEME_CONTROL = 'store_theme';
export const CUSTOM_THEMES_CONTROL = 'store_custom_themes';
export interface StorePalette { background: string; surface: string; text: string; muted: string; accent: string; border: string }
export interface StoreTheme { enabled: boolean; light: StorePalette; dark: StorePalette; radius: number; spacing: number; pillButtons: boolean }
export const DEFAULT_STORE_THEME: StoreTheme = {
  enabled: false, radius: 20, spacing: 16, pillButtons: true,
  light: { background: '#f8f9fa', surface: '#ffffff', text: '#15171c', muted: '#525b68', accent: '#004ad7', border: '#d4d8df' },
  dark: { background: '#0d0f12', surface: '#171c24', text: '#f3f4f6', muted: '#b4becd', accent: '#60a5fa', border: '#384252' },
};
export function parseStoreTheme(raw?: string): StoreTheme {
  let value: any;
  try { value = JSON.parse(raw || '{}'); } catch { value = {}; }
  const result = structuredClone(DEFAULT_STORE_THEME);
  if (!value || typeof value !== 'object') return result;
  if (typeof value.enabled === 'boolean') result.enabled = value.enabled;
  if (typeof value.pillButtons === 'boolean') result.pillButtons = value.pillButtons;
  for (const mode of ['light', 'dark'] as const) for (const key of Object.keys(result[mode]) as (keyof StorePalette)[]) {
    if (typeof value[mode]?.[key] === 'string' && /^#[0-9a-f]{6}$/i.test(value[mode][key])) result[mode][key] = value[mode][key];
  }
  for (const [key, min, max] of [['radius', 0, 28], ['spacing', 8, 32]] as const) if (typeof value[key] === 'number' && Number.isFinite(value[key])) result[key] = Math.min(max, Math.max(min, value[key]));
  return result;
}
const channels = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const luminance = (hex: string) => channels(hex).map(v => { const n = v / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
export function contrastRatio(a: string, b: string) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export function paletteIssue(theme: StoreTheme): 'light' | 'dark' | null {
  for (const mode of ['light', 'dark'] as const) for (const text of ['text', 'muted'] as const) for (const bg of ['background', 'surface'] as const) if (contrastRatio(theme[mode][text], theme[mode][bg]) < 4.5) return mode;
  return null;
}
export const onAccent = (color: string) => contrastRatio(color, '#ffffff') >= contrastRatio(color, '#000000') ? '#ffffff' : '#000000';
function readableAccent(palette: StorePalette) {
  if (contrastRatio(palette.accent, palette.surface) >= 4.5 && contrastRatio(palette.accent, palette.background) >= 4.5) return palette.accent;
  return palette.text;
}
export function storeThemeVariables(theme: StoreTheme, mode: 'light' | 'dark'): Record<string, string> {
  const palette = theme[mode];
  return { ...Object.fromEntries(Object.entries(palette).map(([key, value]) => [`--store-${key}`, value])), '--store-on-accent': onAccent(palette.accent), '--store-link': readableAccent(palette), '--store-radius': `${theme.radius}px`, '--store-spacing': `${theme.spacing}px`, '--store-button-radius': theme.pillButtons ? '999px' : `${Math.min(theme.radius, 12)}px` };
}
