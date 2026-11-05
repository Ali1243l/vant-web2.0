import { useEffect, useState, type CSSProperties } from 'react';
import type { HeroAppearance } from '../lib/heroAppearance';
import { seasonalVariants, snowCaps } from '../lib/seasonalDistribution';
import './StoreSeasonAtmosphere.css';

function SeasonalGlyph({ scene, variant: v }: { scene: HeroAppearance['scene']; variant: number }) {
  const rays = (count: number, inner: number, outer: number) => Array.from({ length: count }, (_, i) => {
    const a = (i * 2 * Math.PI / count) + v * .13;
    return <path key={i} d={`M${12 + Math.cos(a) * inner} ${12 + Math.sin(a) * inner}L${12 + Math.cos(a) * outer} ${12 + Math.sin(a) * outer}`} />;
  });
  let art;
  switch (scene) {
    case 'winter': art = <>{rays(v % 2 ? 8 : 6, 0, 10)}{Array.from({ length: v % 2 ? 8 : 6 }, (_, i) => <path key={i} transform={`rotate(${i * (v % 2 ? 45 : 60)} 12 12)`} d={`M${8 - v % 3} 5L12 ${8 + v % 4}L${16 + v % 3} 5`} />)}{v % 3 === 0 && <circle cx="12" cy="12" r="2.5" />}</>; break;
    case 'spring': art = <><path d={`M5 23Q${20 - v} 13 12 5M10 15Q${2 + v % 4} 1 12 4Q${23 - v % 5} 5 10 15M10 15Q24 ${8 + v} 20 17Q16 23 10 15`} /><circle cx="12" cy="5" r={2 + v % 3} /></>; break;
    case 'summer': art = <><circle cx="12" cy="12" r={3 + v % 3 * .5} />{rays(7 + v % 5, 7, 10 + v % 2)}</>; break;
    case 'autumn': art = <><path d={`M4 22Q${15 + v % 3} 14 20 2Q${3 + v % 5} 1 4 12Q2 ${20 - v % 4} 20 2M8 17L6 ${7 + v % 4}M12 13L${19 + v % 3} 14`} /></>; break;
    case 'new-year': art = <><path d={`M12 2L${14 + v % 3} 9L22 12L15 ${14 + v % 3}L12 22L9 15L2 12L9 9Z`} /><path d={`M${v % 5} 2L4 5M20 ${v % 5}L22 5M2 20L${3 + v % 4} 22`} /></>; break;
    case 'ramadan': art = v % 2 ? <><path d={`M12 ${1 + v * .2}V5M8 6H16L${18 + v * .25} 17L12 22L${6 - v % 2} 17Z M9 9H15M9 17H15M12 9V17`} /></> : <><path d={`M${17 + v * .3} 3A9 9 0 1 0 21 17A${7 + v * .2} ${7 + v * .2} 0 0 1 ${17 + v * .3} 3Z`} /><path d="M18 7L19 10L22 11L19 12L18 15L17 12L14 11L17 10Z" /></>; break;
    case 'eid': art = <><path d={`M4 10H20V22H4ZM2 7H22V11H2ZM12 7V22M12 7Q${1 + v % 4} ${1 + v % 3} 6 2Q10 0 12 7Q${15 + v % 4} 0 19 3Q22 7 12 7`} /></>; break;
    case 'holiday': art = <><path d={`M1 ${13 + v % 3}Q5 8 9 13T17 13T25 13M1 19Q5 ${14 + v % 3} 9 19T17 19T25 19`} /><path d={`M5 7A${7 + v % 4} 7 0 0 1 19 7`} /></>; break;
    case 'school': art = <><path d={`M4 3H${15 + v % 3}L21 8V22H4ZM8 3V22M11 10H${16 + v % 3}M11 14H18M11 18H${14 + v % 4}`} /></>; break;
    case 'weekend': art = <><path d={`M2 ${5 + v % 3}H22V10Q${17 - v * .2} 12 22 14V20H2V14Q7 12 2 10Z M${15 + v % 3} 7V9M${15 + v % 3} 11V13M${15 + v % 3} 15V18`} /></>; break;
    case 'black-friday': art = <>{Array.from({ length: 5 + v % 4 }, (_, i) => <path key={i} strokeWidth={1 + (i + v) % 2} d={`M${3 + i * (2 + v * .03)} ${4 + (i + v) % 3}V${20 - v * .15}`} />)}<path d="M1 7V2H6M18 2H23V7M23 17V22H18M6 22H1V17" /></>; break;
    case 'season-end': art = <><path d={`M3 ${13 + v % 3}L${13 + v % 3} 3H21V11L11 22Z M${16 - v * .15} 7H${17 + v * .15}M7 14L${12 + v % 3} 9M9 17L16 10`} /></>; break;
    default: return null;
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" focusable="false">{art}</svg>;
}

export function StoreSeasonCard({ settings, variant }: { settings: HeroAppearance; variant: number }) {
  if (settings.scene === 'none' || settings.motif === 'none') return null;
  return <div aria-hidden="true" className={`store-season-card store-season-card--${settings.scene}`} data-design={variant} style={{ '--season-accent': settings.accentColor, '--cap-left': `${variant % 3 * 10}%`, '--cap-width': `${52 + variant % 4 * 16}%`, '--glyph-size': `${20 + variant % 3 * 4}px`, '--glyph-turn': `${variant * 9 - 28}deg` } as CSSProperties}>
    {settings.scene === 'winter' ? <svg className="store-snow-cap" viewBox="0 0 200 30" preserveAspectRatio="none" focusable="false"><path d={snowCaps[variant]} /></svg> : <span className="store-season-edge" />}
    <span className="store-season-card-glyph"><SeasonalGlyph scene={settings.scene} variant={variant} /></span>
  </div>;
}

export default function StoreSeasonAtmosphere({ settings, paused = false }: { settings: HeroAppearance; paused?: boolean }) {
  const [awake, setAwake] = useState(() => !document.hidden);
  useEffect(() => { const update = () => setAwake(!document.hidden); document.addEventListener('visibilitychange', update); return () => document.removeEventListener('visibilitychange', update); }, []);
  if (settings.scene === 'none' || settings.motif === 'none') return null;
  const designs = seasonalVariants(settings.scene, 16);
  return <div aria-hidden="true" data-store-atmosphere={settings.scene} data-motion={settings.motionEnabled && awake && !paused ? 'running' : 'paused'} className="store-atmosphere" style={{ color: settings.scene === 'winter' ? '#dff5ff' : settings.accentColor, '--atmosphere-opacity': Math.max(.12, Math.min(.36, settings.motifOpacity / 100)) } as CSSProperties}>
    <div className="store-atmosphere-glow" />
    {designs.map((variant, i) => <span key={i} className="store-atmosphere-particle" style={{ left: `${(i * 61 + 7) % 97}%`, top: `${(i * 43) % 93}%`, '--drift': `${(i % 2 ? 1 : -1) * (12 + variant * 4)}px`, '--turn': `${(i % 2 ? -1 : 1) * (25 + variant * 13)}deg`, '--duration': `${15 + (i * 7) % 16}s`, '--delay': `${-((i * 11) % 29)}s`, '--size': `${12 + (i * 7) % 17}px` } as CSSProperties}><SeasonalGlyph scene={settings.scene} variant={variant} /></span>)}
  </div>;
}
