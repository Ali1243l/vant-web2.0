import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Snowflake, Flower2, Sun, Leaf, Sparkles, Moon, Gift, Waves, BookOpen, Ticket, ScanLine, Tag } from 'lucide-react';
import type { HeroAppearance, HeroScene } from '../lib/heroAppearance';
import '../seasonal-art.css';

const icons = { winter: Snowflake, spring: Flower2, summer: Sun, autumn: Leaf, 'new-year': Sparkles, ramadan: Moon, eid: Gift, holiday: Waves, school: BookOpen, weekend: Ticket, 'black-friday': ScanLine, 'season-end': Tag };
// Each scene has its own geometry; the photograph and caption remain untouched.
const paths: Record<Exclude<HeroScene, 'none'>, [string, string]> = {
  winter: ['M15 220L80 135L120 180L180 75L275 220 M55 168L80 180L94 163 M159 105L181 125L199 107', 'M30 248Q140 205 260 242 M30 258Q140 225 260 253'],
  spring: ['M70 250Q155 185 180 55 M118 205Q58 170 75 130Q140 140 135 180 M151 145Q210 135 227 85Q170 80 165 120', 'M35 260Q150 225 260 245'],
  summer: ['M35 220A110 110 0 0 1 255 220 M55 220A90 90 0 0 1 235 220 M25 235H265', 'M145 75V40 M65 110L43 85 M225 110L247 85 M35 180H10 M255 180H280'],
  autumn: ['M45 260Q130 180 215 35 M105 200Q55 170 60 125Q120 145 130 175 M155 135Q218 125 240 80Q175 85 165 115', 'M70 270L250 75 M215 35L240 80'],
  'new-year': ['M145 38L158 74L195 78L166 102L174 139L145 118L113 139L122 102L94 78L132 74Z', 'M40 220Q55 100 85 48 M250 220Q237 130 215 55 M70 250Q140 200 225 250'],
  ramadan: ['M45 260V145Q45 88 145 35Q245 88 245 145V260 M65 260V145Q65 105 145 58Q225 105 225 145V260', 'M40 10V85L22 105V150L40 165L58 150V105L40 85 M235 0V45L221 60V96L235 109L249 96V60L235 45'],
  eid: ['M55 150H235V250H55Z M40 125H250V155H40Z M135 125V250 M155 125V250', 'M145 122Q45 112 72 75Q110 42 145 122Q180 42 217 75Q244 112 145 122'],
  holiday: ['M5 207Q45 177 85 207T165 207T245 207T325 207 M5 232Q45 202 85 232T165 232T245 232T325 232', 'M25 174H265 M76 170A69 69 0 0 1 214 170 M145 85V50 M88 109L65 87 M202 109L225 87'],
  school: ['M60 45H210L243 78V250H60Z M210 45V78H243 M85 115H213 M85 143H213 M85 171H185 M85 199H200', 'M88 45V85L108 70L128 85V45 M46 60V264H225'],
  weekend: ['M30 90H260V122Q230 140 260 158V200H30V158Q60 140 30 122Z', 'M195 99V116 M195 126V144 M195 154V172 M195 182V192 M50 70H238 M70 220H245'],
  'black-friday': ['M45 100V65H82 M208 65H245V100 M45 205V240H82 M208 240H245V205', 'M72 100V205 M82 100V205 M100 100V205 M105 100V205 M122 100V205 M143 100V205 M151 100V205 M171 100V205 M177 100V205 M197 100V205 M217 100V205'],
  'season-end': ['M50 210L154 75H233V154L129 260Z M154 75Q108 40 95 74Q84 108 154 75 M205 100A9 9 0 1 0 205 118A9 9 0 1 0 205 100', 'M40 242Q80 205 65 155 M55 213Q30 180 39 163 M58 203Q90 190 86 167'],
};

export default function SeasonalArtwork({ settings, isAr }: { settings: HeroAppearance; isAr: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!root.current || !settings.motionEnabled) return;
    let intersecting = false;
    const update = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; update(); }, { threshold: 0.05 });
    observer.observe(root.current);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [settings.motionEnabled, settings.scene]);
  if (settings.scene === 'none' || settings.motif === 'none') return null;
  const Icon = icons[settings.scene];
  return <div ref={root} aria-hidden="true" data-seasonal-scene={settings.scene} data-motion={settings.motionEnabled ? (visible ? 'running' : 'paused') : 'off'} className="seasonal-art" style={{ [isAr ? 'left' : 'right']: 0, color: settings.accentColor, '--season-opacity': settings.motifOpacity / 100 } as CSSProperties}>
    <div className="seasonal-halo" />
    <svg className="seasonal-lines" viewBox="0 0 290 290" fill="none" stroke="currentColor" strokeWidth="1.4" focusable="false"><path d={paths[settings.scene][0]} /><path className="seasonal-secondary" d={paths[settings.scene][1]} /></svg>
    <div className="seasonal-emblem"><Icon strokeWidth={0.9} /></div>
    <div className="seasonal-scan" />
    {[0, 1, 2, 3, 4, 5].map(i => <span key={i} className="seasonal-particle" style={{ '--particle': i, left: `${12 + (i * 37) % 76}%`, top: `${8 + (i * 29) % 70}%` } as CSSProperties}><Icon strokeWidth={1.2} /></span>)}
  </div>;
}
