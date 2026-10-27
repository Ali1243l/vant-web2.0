import type { CSSProperties } from 'react';
import { heroBackgroundVariables, type HeroAppearance } from '../lib/heroAppearance';

export default function HeroBannerBackground({ image, settings, isAr }: { image: string; settings: HeroAppearance; isAr: boolean }) {
  return (
    <div aria-hidden="true" data-hero-background className="hero-background pointer-events-none absolute inset-0 overflow-hidden" style={heroBackgroundVariables(settings, isAr) as CSSProperties}>
      <img src={image} alt="" decoding="async" fetchPriority="high" className="hero-background-image h-full w-full object-cover" style={{ opacity: settings.imageOpacity / 100, filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) blur(${settings.blur}px)`, transform: `scale(${settings.zoom / 100})` }} />
      <div className="hero-background-fade absolute inset-0" />
    </div>
  );
}
