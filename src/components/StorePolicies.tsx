import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSiteControls } from '../context/SiteControlsContext';
import { policyIds, policyFooterLabel, policyFromSearch, readPolicies, type PolicyPage } from '../data/storePolicies';
import { useModalFocus } from '../hooks/useModalFocus';
import { useScrollLock } from '../hooks/useScrollLock';
import type { Language } from '../types';

export function PolicyArticle({ page, lang }: { page: PolicyPage; lang: Language }) {
  const copy = page[lang];
  return <article dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-w-0 select-text break-words text-start">
    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{lang === 'ar' ? 'آخر تحديث: ' : 'Updated: '}<time dateTime={page.updated} dir="ltr">{page.updated}</time></p>
    <h1 className="text-xl leading-relaxed sm:text-3xl font-bold text-slate-950 dark:text-white mb-6 sm:mb-8">{copy.title}</h1>
    <div className="space-y-6 text-sm leading-7 sm:text-[15px] sm:leading-8 text-slate-700 dark:text-slate-300">{copy.body.split(/\n\s*\n/).map((paragraph, i) => {
      const split = paragraph.indexOf('\n');
      return <section key={i}>{split > 0 && split < 90 ? <><h2 className="font-bold text-[15px] sm:text-base text-slate-950 dark:text-white mb-2">{paragraph.slice(0, split)}</h2><p className="whitespace-pre-line">{paragraph.slice(split + 1)}</p></> : <p className="whitespace-pre-line">{paragraph}</p>}</section>;
    })}</div>
  </article>;
}

function PolicyReader({ page, lang, close }: { page: PolicyPage; lang: Language; close: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useScrollLock(true);
  useModalFocus(true, panel, close);
  useEffect(() => { const previous = document.title; document.title = `${page[lang].title} | فانت | VANT`; return () => { document.title = previous; }; }, [lang, page[lang].title]);
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.16 }} className="fixed inset-0 z-[10010] bg-black/20 px-0 sm:px-5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <div ref={panel} role="dialog" aria-modal="true" aria-label={page[lang].title} tabIndex={-1} className="mx-auto mt-[calc(72px+env(safe-area-inset-top))] h-[calc(100dvh-72px-env(safe-area-inset-top))] sm:mt-20 sm:h-[calc(100dvh-100px)] max-w-3xl flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0c0e12] shadow-2xl outline-none">
      <header className="shrink-0 border-b border-black/10 dark:border-white/10 px-4 sm:px-8 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-3 min-h-14 sm:min-h-16"><span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{lang === 'ar' ? 'معلومات المتجر' : 'Store information'}</span><button type="button" onClick={close} aria-label={lang === 'ar' ? 'إغلاق والعودة للمتجر' : 'Close and return to store'} className="min-w-11 min-h-11 grid place-items-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 focus-visible:outline focus-visible:outline-blue-500"><X size={20} /></button></div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8 py-6 sm:py-10 pb-[max(3rem,env(safe-area-inset-bottom))]"><div className="mx-auto max-w-3xl"><PolicyArticle page={page} lang={lang} /></div></div>
    </div>
  </motion.div>;
}

export default function StorePolicies({ lang }: { lang: Language }) {
  const { siteSettings } = useSiteControls();
  const pages = readPolicies(siteSettings.legal_pages);
  const [id, setId] = useState(() => policyFromSearch(window.location.search));
  const close = () => { const url = new URL(window.location.href); url.searchParams.delete('policy'); window.history.replaceState(window.history.state, '', url); setId(null); };
  useEffect(() => { const pop = () => setId(policyFromSearch(window.location.search)); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop); }, []);
  return <>
    <nav dir={lang === 'ar' ? 'rtl' : 'ltr'} aria-label={lang === 'ar' ? 'معلومات المتجر والسياسات' : 'Store information and policies'} className="mx-auto grid max-w-3xl grid-cols-12 gap-x-1 border-b border-black/5 dark:border-white/10 pb-2 mb-3 sm:flex sm:flex-wrap sm:justify-center">
      {policyIds.map(key => <a key={key} href={`?policy=${key}`} title={pages[key][lang].title} aria-label={pages[key][lang].title} onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); window.history.pushState({}, '', `?policy=${key}`); setId(key); }} className={`col-span-3 flex min-w-0 min-h-9 items-center justify-center rounded px-1 sm:px-3 text-[11px] leading-4 sm:text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500`}><span className="truncate">{policyFooterLabel(key, pages[key], lang)}</span></a>)}
    </nav>
    {createPortal(<AnimatePresence mode="wait">{id && <PolicyReader key={id} page={pages[id]} lang={lang} close={close} />}</AnimatePresence>, document.body)}
  </>;
}
