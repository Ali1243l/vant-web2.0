import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Snowflake, Flower2, Sun, Leaf, Sparkles, Moon, Gift, Waves, BookOpen, Ticket, Percent, Tag } from 'lucide-react';
import type { HeroAppearance } from '../lib/heroAppearance';
import SeasonalIllustration from './SeasonalIllustration';
import '../seasonal-art.css';

const icons = { winter: Snowflake, spring: Flower2, summer: Sun, autumn: Leaf, 'new-year': Sparkles, ramadan: Moon, eid: Gift, holiday: Waves, school: BookOpen, weekend: Ticket, 'black-friday': Percent, 'season-end': Tag };

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
  }, [settings.motionEnabled, settings.scene, settings.motif]);
  if (settings.scene === 'none' || settings.motif === 'none') return null;
  const Icon = icons[settings.scene];
  return <div ref={root} aria-hidden="true" data-seasonal-scene={settings.scene} data-motion={settings.motionEnabled ? (visible ? 'running' : 'paused') : 'off'} className="seasonal-art" style={{ [isAr ? 'left' : 'right']: 0, '--season-accent': settings.accentColor, '--season-opacity': settings.motifOpacity / 100 } as CSSProperties}>
    <div className="seasonal-composition"><SeasonalIllustration scene={settings.scene} /></div>
    {[0, 1, 2, 3, 4, 5].map(i => <span key={i} className="seasonal-particle" style={{ '--particle': i, left: `${12 + (i * 37) % 76}%`, top: `${8 + (i * 29) % 70}%` } as CSSProperties}><Icon strokeWidth={1.2} /></span>)}
  </div>;
}
