import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpRight } from 'lucide-react';
import { useSiteControls } from '../context/SiteControlsContext';
import { policyIds, policyFromSearch, readPolicies, type PolicyPage } from '../data/storePolicies';
import { useModalFocus } from '../hooks/useModalFocus';
import { useScrollLock } from '../hooks/useScrollLock';
import type { Language } from '../types';

export function PolicyArticle({ page, lang }: { page: PolicyPage; lang: Language }) {
  const copy = page[lang];
  return <article dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-w-0 select-text break-words text-start">
    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{lang === 'ar' ? 'آخر تحديث: ' : 'Updated: '}<time dateTime={page.updated} dir="ltr">{page.updated}</time></p>
    <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white mb-8">{copy.title}</h1>
    <div className="space-y-7 text-[15px] leading-8 text-slate-700 dark:text-slate-300">{copy.body.split(/\n\s*\n/).map((paragraph, i) => {
      const split = paragraph.indexOf('\n');
      return <section key={i}>{split > 0 && split < 90 ? <><h2 className="font-bold text-base text-slate-950 dark:text-white mb-2">{paragraph.slice(0, split)}</h2><p className="whitespace-pre-line">{paragraph.slice(split + 1)}</p></> : <p className="whitespace-pre-line">{paragraph}</p>}</section>;
    })}</div>
  </article>;
}

export default function StorePolicies({ lang }: { lang: Language }) {
  const { siteSettings } = useSiteControls();
  const pages = readPolicies(siteSettings.legal_pages);
  const [id, setId] = useState(() => policyFromSearch(window.location.search));
  const panel = useRef<HTMLDivElement>(null);
  const close = () => { const url = new URL(window.location.href); url.searchParams.delete('policy'); window.history.replaceState(window.history.state, '', url); setId(null); };
  useScrollLock(Boolean(id));
  useModalFocus(Boolean(id), panel, close);
  useEffect(() => { const pop = () => setId(policyFromSearch(window.location.search)); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop); }, []);
  useEffect(() => { if (!id) return; const previous = document.title; document.title = `${pages[id][lang].title} | فانت | VANT`; return () => { document.title = previous; }; }, [id, lang, pages[id || 'about'][lang].title]);
  return <>
    <nav aria-label={lang === 'ar' ? 'معلومات المتجر والسياسات' : 'Store information and policies'} className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-x-4 gap-y-1 border-b border-black/5 dark:border-white/10 pb-5 mb-5">
      {policyIds.map(key => <a key={key} href={`?policy=${key}`} onClick={event => { if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); window.history.pushState({}, '', `?policy=${key}`); setId(key); }} className="inline-flex min-h-11 items-center justify-center gap-1 px-2 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">{pages[key][lang].title}<ArrowUpRight size={13} className="shrink-0 opacity-50" aria-hidden="true" /></a>)}
    </nav>
    {id && createPortal(<div className="fixed inset-0 z-[10010] bg-white dark:bg-[#0c0e12]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label={pages[id][lang].title} tabIndex={-1} className="h-[100dvh] flex flex-col outline-none">
        <header className="shrink-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0c0e12] px-4 sm:px-8 pt-[env(safe-area-inset-top)]">
          <div className="mx-auto max-w-3xl flex items-center justify-between gap-3 min-h-16"><span className="font-bold tracking-[0.2em] text-slate-900 dark:text-white">VANT</span><button type="button" onClick={close} aria-label={lang === 'ar' ? 'إغلاق والعودة للمتجر' : 'Close and return to store'} className="min-w-11 min-h-11 grid place-items-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 focus-visible:outline focus-visible:outline-blue-500"><X size={22} /></button></div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-8 py-8 sm:py-12 pb-[max(3rem,env(safe-area-inset-bottom))]"><div className="mx-auto max-w-3xl"><PolicyArticle page={pages[id]} lang={lang} /></div></div>
      </div>
    </div>, document.body)}
  </>;
}
