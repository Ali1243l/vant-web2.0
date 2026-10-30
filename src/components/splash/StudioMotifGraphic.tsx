import type { ReactNode } from 'react';
import type { SplashMotifType } from '../../context/siteControlsTypes';
import './StudioMotifGraphic.css';

type StudioMotif = Exclude<SplashMotifType, 'tshirt_print'>;
const artwork: Record<StudioMotif, ReactNode> = {
  print_press: <>
    <rect x="21" y="67" width="78" height="20" rx="5" className="studio-motif-muted" />
    <path d="M27 88H93M33 88V98M87 88V98M28 27V65M92 27V65" />
    <path d="M43 57L33 62L38 72L45 69V80H75V69L82 72L87 62L77 57Q60 63 43 57Z" className="studio-motif-muted" />
    <g className="studio-press-head"><path d="M48 24V17H72V24" /><rect x="22" y="28" width="76" height="14" rx="4" /><path d="M33 47H87" className="studio-motif-accent" /></g>
    <path d="M47 67H73" className="studio-print-pass studio-motif-accent" />
  </>,
  embroidery: <>
    <circle cx="60" cy="63" r="35" /><circle cx="60" cy="63" r="29" className="studio-motif-muted" />
    <path d="M49 27V18H71V27M54 18V12M66 18V12" />
    <path d="M43 49L60 78L77 49" className="studio-stitch studio-motif-accent" strokeDasharray="3 5" />
    <path d="M41 46L46 51M45 52L50 57M50 59L55 64M55 67L60 72M63 68L68 63M68 59L73 54" className="studio-motif-muted" />
    <g className="studio-sewing-needle"><path d="M78 31L64 50M77 34L80 30" /><path d="M78 31Q99 31 93 53Q88 66 101 74" className="studio-motif-accent" /></g>
  </>,
  hanger: <>
    <path d="M23 97H97" className="studio-motif-muted" />
    <g className="studio-hanger"><path d="M53 29C53 17 69 17 69 28C69 36 60 36 60 45V50" className="studio-motif-accent" /><path d="M60 49L20 75Q15 81 24 83H96Q105 81 100 75L60 49Z" /><path d="M35 73H85" className="studio-motif-muted" /><path d="M32 82V94M88 82V94" className="studio-motif-accent" /></g>
  </>,
  needle_thread: <>
    <path d="M25 92Q42 106 62 91T101 91" className="studio-motif-muted" />
    <g className="studio-thread-needle"><path d="M32 86L78 22Q85 15 88 20Q91 23 85 31L32 86Z" /><path d="M80 27L85 21" className="studio-motif-accent" /></g>
    <path d="M83 22C110 29 93 55 71 54S36 48 29 62S42 87 60 74S91 74 94 88" className="studio-thread-line studio-motif-accent" strokeDasharray="6 5" />
  </>,
  mannequin: <>
    <path d="M53 22V13H67V22L79 28L72 48L77 77Q60 87 43 77L48 48L41 28L53 22Z" />
    <path d="M53 22Q60 26 67 22M48 48Q60 54 72 48M60 25V77" className="studio-motif-muted" strokeDasharray="3 4" />
    <path d="M60 82V100M44 102H76" />
    <g className="studio-measuring-tape"><path d="M40 48Q60 58 80 48L79 57Q60 67 41 57Z" className="studio-motif-accent" /><path d="M48 55V58M56 57V61M64 57V61M72 55V58" className="studio-motif-accent" /></g>
  </>,
  scissors: <>
    <path d="M21 29H99M22 38H98M22 47H98" className="studio-motif-muted" strokeDasharray="2 5" />
    <g className="studio-scissors-upper"><circle cx="33" cy="86" r="11" /><path d="M41 78L88 22L67 62L49 78" /></g>
    <g className="studio-scissors-lower"><circle cx="87" cy="86" r="11" /><path d="M79 78L32 22L53 62L71 78" className="studio-motif-accent" /></g>
    <circle cx="60" cy="62" r="4" className="studio-motif-accent" />
  </>,
  monogram: <>
    <g className="studio-monogram-orbit"><circle cx="60" cy="60" r="43" className="studio-motif-muted" strokeDasharray="3 9" /><circle cx="60" cy="17" r="3" className="studio-motif-accent" fill="currentColor" /></g>
    <path d="M60 22L98 60L60 98L22 60Z" /><path d="M60 30L90 60L60 90L30 60Z" className="studio-motif-muted" />
    <path d="M43 45L60 78L77 45M47 45L60 70L73 45" className="studio-motif-accent" />
  </>,
};
export default function StudioMotifGraphic({ motif, isDark, paused = false }: { motif: StudioMotif; isDark: boolean; paused?: boolean }) {
  const resolved = Object.hasOwn(artwork, motif) ? motif : 'monogram';
  return <svg data-studio-motif={resolved} aria-hidden="true" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`studio-motif ${isDark ? 'studio-motif--dark' : 'studio-motif--light'} ${paused ? 'studio-motif--paused' : ''}`}>{artwork[resolved]}</svg>;
}
