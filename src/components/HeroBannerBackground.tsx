import type { CSSProperties } from 'react';
import { Snowflake, Sun, Flower2, Leaf, Sparkles, Moon, Gift, Tag, GraduationCap } from 'lucide-react';
import { heroBackgroundVariables, type HeroAppearance } from '../lib/heroAppearance';

export default function HeroBannerBackground({ image, settings, isAr }: { image: string; settings: HeroAppearance; isAr: boolean }) {
  const Motif = { none: null, snow: Snowflake, sun: Sun, bloom: Flower2, leaf: Leaf, celebration: Sparkles, crescent: Moon, gift: Gift, sale: Tag, school: GraduationCap }[settings.motif];
  return (
    <div aria-hidden="true" data-hero-background className="hero-background pointer-events-none absolute inset-0 overflow-hidden" style={heroBackgroundVariables(settings, isAr) as CSSProperties}>
      <img src={image} alt="" decoding="async" fetchPriority="high" className="hero-background-image h-full w-full object-cover" style={{ opacity: settings.imageOpacity / 100, filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) blur(${settings.blur}px)`, transform: `scale(${settings.zoom / 100})` }} />
      <div className="hero-background-fade absolute inset-0" />
      {Motif && <div data-hero-motif={settings.motif} className="hero-season-art absolute inset-y-0 w-[38%]" style={{ [isAr ? 'left' : 'right']: 0, color: settings.accentColor, opacity: settings.motifOpacity / 100 }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${settings.accentColor}30, transparent 70%)` }} />
        <div className="absolute left-1/2 top-1/2 aspect-square w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-current opacity-20" />
        <Motif strokeWidth={0.75} className="absolute left-1/2 top-1/2 h-auto w-[55%] -translate-x-1/2 -translate-y-1/2 -rotate-12" />
        <Motif strokeWidth={1} className="absolute left-[12%] top-[14%] h-auto w-[12%] rotate-12 opacity-60" />
        <Motif strokeWidth={1} className="absolute bottom-[12%] right-[12%] h-auto w-[16%] -rotate-12 opacity-50" />
      </div>}
    </div>
  );
}
