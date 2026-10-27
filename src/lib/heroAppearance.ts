export const HERO_APPEARANCE_CONTROL = 'banner_hero_appearance';
export type FadeDirection = 'caption' | 'left' | 'right' | 'top' | 'bottom' | 'custom';

export interface HeroAppearance {
  fadeEnabled: boolean;
  direction: FadeDirection;
  mobileDirection: FadeDirection;
  angle: number;
  mobileAngle: number;
  start: number;
  middle: number;
  end: number;
  startOpacity: number;
  middleOpacity: number;
  endOpacity: number;
  mobileStartOpacity: number;
  mobileMiddleOpacity: number;
  mobileEndOpacity: number;
  lightColor: string;
  darkColor: string;
  imageOpacity: number;
  brightness: number;
  contrast: number;
  blur: number;
  zoom: number;
  positionX: number;
  positionY: number;
  mobilePositionX: number;
  mobilePositionY: number;
  height: number;
  mobileHeight: number;
}

export const DEFAULT_HERO_APPEARANCE: HeroAppearance = {
  fadeEnabled: true, direction: 'caption', mobileDirection: 'bottom',
  angle: 90, mobileAngle: 0, start: 0, middle: 42, end: 100,
  startOpacity: 96, middleOpacity: 78, endOpacity: 6,
  mobileStartOpacity: 98, mobileMiddleOpacity: 90, mobileEndOpacity: 65,
  lightColor: '#ffffff', darkColor: '#0d0f14',
  imageOpacity: 100, brightness: 100, contrast: 100, blur: 0, zoom: 100,
  positionX: 35, positionY: 50, mobilePositionX: 40, mobilePositionY: 50,
  height: 280, mobileHeight: 320,
};

const bounds: Partial<Record<keyof HeroAppearance, [number, number]>> = {
  angle: [0, 360], mobileAngle: [0, 360], start: [0, 100], middle: [0, 100], end: [0, 100],
  startOpacity: [0, 100], middleOpacity: [0, 100], endOpacity: [0, 100],
  mobileStartOpacity: [0, 100], mobileMiddleOpacity: [0, 100], mobileEndOpacity: [0, 100],
  imageOpacity: [0, 100], brightness: [30, 150], contrast: [50, 150], blur: [0, 20], zoom: [100, 160],
  positionX: [0, 100], positionY: [0, 100], mobilePositionX: [0, 100], mobilePositionY: [0, 100],
  height: [200, 600], mobileHeight: [240, 640],
};

export function parseHeroAppearance(raw?: string): HeroAppearance {
  let input: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(raw || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) input = parsed;
  } catch { /* Old or malformed settings use safe defaults. */ }
  const result = { ...DEFAULT_HERO_APPEARANCE };
  for (const [key, [min, max]] of Object.entries(bounds)) {
    const value = input[key];
    if (typeof value === 'number' && Number.isFinite(value)) (result as any)[key] = Math.min(max, Math.max(min, value));
  }
  for (const key of ['direction', 'mobileDirection'] as const) {
    if (['caption', 'left', 'right', 'top', 'bottom', 'custom'].includes(input[key] as string)) result[key] = input[key] as FadeDirection;
  }
  for (const key of ['lightColor', 'darkColor'] as const) {
    if (typeof input[key] === 'string' && /^#[0-9a-f]{6}$/i.test(input[key])) result[key] = input[key];
  }
  if (typeof input.fadeEnabled === 'boolean') result.fadeEnabled = input.fadeEnabled;
  result.middle = Math.max(result.start, result.middle);
  result.end = Math.max(result.middle, result.end);
  return result;
}

export function heroFadeAngle(direction: FadeDirection, angle: number, isAr: boolean): number {
  return ({ caption: isAr ? 270 : 90, left: 90, right: 270, top: 180, bottom: 0, custom: angle })[direction];
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');

export function heroBackgroundVariables(settings: HeroAppearance, isAr: boolean): Record<string, string> {
  const stops = [
    `rgb(var(--hero-rgb) / ${settings.startOpacity / 100}) ${settings.start}%`,
    `rgb(var(--hero-rgb) / ${settings.middleOpacity / 100}) ${settings.middle}%`,
    `rgb(var(--hero-rgb) / ${settings.endOpacity / 100}) ${settings.end}%`,
  ].join(', ');
  const mobileStops = [
    `rgb(var(--hero-rgb) / ${settings.mobileStartOpacity / 100}) ${settings.start}%`,
    `rgb(var(--hero-rgb) / ${settings.mobileMiddleOpacity / 100}) ${settings.middle}%`,
    `rgb(var(--hero-rgb) / ${settings.mobileEndOpacity / 100}) ${settings.end}%`,
  ].join(', ');
  return {
    '--hero-light-rgb': rgb(settings.lightColor), '--hero-dark-rgb': rgb(settings.darkColor),
    '--hero-desktop-angle': `${heroFadeAngle(settings.direction, settings.angle, isAr)}deg`,
    '--hero-mobile-angle': `${heroFadeAngle(settings.mobileDirection, settings.mobileAngle, isAr)}deg`,
    '--hero-desktop-gradient': settings.fadeEnabled ? `linear-gradient(var(--hero-angle), ${stops})` : 'none',
    '--hero-mobile-gradient': settings.fadeEnabled ? `linear-gradient(var(--hero-angle), ${mobileStops})` : 'none',
    '--hero-image-position': `${settings.positionX}% ${settings.positionY}%`,
    '--hero-mobile-image-position': `${settings.mobilePositionX}% ${settings.mobilePositionY}%`,
    '--hero-height': `${settings.height}px`, '--hero-mobile-height': `${settings.mobileHeight}px`,
  };
}
