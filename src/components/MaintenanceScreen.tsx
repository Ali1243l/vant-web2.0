import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, LockKeyhole, MessageCircle, Moon, Sun, Wrench, X } from 'lucide-react';
import { useSiteControls } from '../context/SiteControlsContext';
import { controlActive } from '../lib/siteControlModel';
import { maintenanceContactUrl } from '../lib/maintenanceContact';
import type { Theme } from '../types';
import { Sheet } from '../admin/Sheet';
import { Button, Input } from '../admin/ui';
import './MaintenanceScreen.css';

type Props = {
  maintenanceMessage?: string;
  maintenanceMessageAr?: string;
  theme?: Theme;
  onToggleTheme?: () => void;
} & ({ isPreview: true; onClosePreview: () => void; onAdminUnlock?: (pin: string) => boolean; onBypass?: () => void } | { isPreview?: false; onClosePreview?: () => void; onAdminUnlock: (pin: string) => boolean; onBypass: () => void });

export default function MaintenanceScreen({ maintenanceMessage = 'We are updating the store. Please check back soon.', maintenanceMessageAr = 'نجهّز المتجر ونحدّث التشكيلة. نرحّب بعودتك قريباً.', theme = 'dark', onToggleTheme, isPreview = false, onClosePreview, onAdminUnlock, onBypass }: Props) {
  const { getControl } = useSiteControls();
  const [adminOpen, setAdminOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const close = useRef(onClosePreview);
  close.current = onClosePreview;
  const contact = maintenanceContactUrl(getControl('cfg_whatsapp_phone').actionValue, controlActive(getControl('feature_whatsapp')));
  useEffect(() => {
    if (!isPreview) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const items = () => Array.from(root.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]') || []);
    items()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current?.(); }
      if (event.key !== 'Tab') return;
      const buttons = items(), first = buttons[0], last = buttons[buttons.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, [isPreview]);
  const dismissAdmin = () => { setAdminOpen(false); setPin(''); setError(false); };
  const unlock = (event: React.FormEvent) => {
    event.preventDefault();
    if (isPreview || !onAdminUnlock || !onBypass) return;
    if (!onAdminUnlock(pin)) { setError(true); setPin(''); return; }
    dismissAdmin(); onBypass();
  };
  const view = <div ref={root} data-scroll-lock-native className={`vant-maintenance ${theme === 'light' ? 'vant-maintenance--light' : ''} ${isPreview ? 'vant-maintenance--preview' : ''}`} role={isPreview ? 'dialog' : undefined} aria-modal={isPreview ? true : undefined} aria-label={isPreview ? 'معاينة واجهة الصيانة' : undefined}>
    <header className="vant-maintenance-header">
      <div className="vant-maintenance-brand" dir="ltr">VANT<span />{isPreview ? 'معاينة' : 'فانت'}</div>
      <div className="vant-maintenance-tools">{onToggleTheme && <button type="button" aria-label="تبديل مظهر معاينة الصيانة" onClick={onToggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>}{isPreview && <button type="button" aria-label="إغلاق معاينة الصيانة" onClick={onClosePreview}><X size={18} /><span>إغلاق</span></button>}</div>
    </header>
    <main className="vant-maintenance-main">
      <section className="vant-maintenance-copy">
        <div className="vant-maintenance-tag"><span />صيانة مؤقتة · STORE UPDATE</div>
        <h1>نرتّب التفاصيل.<br /><span>ونعود إليك قريباً.</span></h1>
        <p className="vant-maintenance-english-title" dir="ltr">A little pause.<br />A considered return.</p>
        <div className="vant-maintenance-messages"><p dir="rtl">{maintenanceMessageAr}</p><p dir="ltr">{maintenanceMessage}</p></div>
        <div className="vant-maintenance-actions">
          {contact && (isPreview ? <button type="button" className="vant-maintenance-contact" disabled><MessageCircle size={18} />تواصل عبر واتساب · معاينة</button> : <a href={contact} target="_blank" rel="noopener noreferrer" className="vant-maintenance-contact"><MessageCircle size={18} />تواصل معنا عبر واتساب<ArrowUpRight size={16} /></a>)}
          {!isPreview && <button type="button" className="vant-maintenance-admin" onClick={() => setAdminOpen(true)}><LockKeyhole size={16} />دخول الإدارة</button>}
        </div>
        <p className="vant-maintenance-note">{isPreview ? 'هذه معاينة لمسودتك؛ المتجر يبقى على حالته المنشورة.' : 'يمكنك العودة لاحقاً للاطّلاع على التشكيلة.'}</p>
      </section>
      <div className="vant-maintenance-art" aria-hidden="true"><div className="vant-maintenance-art-label">VANT / IN THE MAKING</div><div className="vant-maintenance-frame"><span>V</span><div className="vant-maintenance-tool"><Wrench size={26} strokeWidth={1.5} /></div></div><div className="vant-maintenance-art-bottom"><span>تفاصيل أفضل، خطوة بخطوة</span><span className="vant-maintenance-art-line" /></div></div>
    </main>
    <footer className="vant-maintenance-footer"><span>فانت · VANT</span><span>{isPreview ? 'معاينة فقط · بدون نشر' : 'المتجر قيد الصيانة'}</span></footer>
    {!isPreview && <Sheet isOpen={adminOpen} onClose={dismissAdmin} title="دخول إدارة فانت" description="أدخل رمز الدخول الخاص بك للوصول إلى لوحة الإدارة." widthClass="max-w-md"><form onSubmit={unlock} className="space-y-4"><Input label="رمز دخول الإدارة" type="password" autoComplete="current-password" dir="ltr" required value={pin} onChange={event => { setPin(event.target.value); setError(false); }} />{error && <p role="alert" className="text-sm text-rose-300">رمز الدخول غير صحيح. حاول مرة ثانية.</p>}<Button type="submit" className="min-h-11 w-full" disabled={!pin}>دخول الإدارة</Button></form></Sheet>}
  </div>;
  return isPreview ? createPortal(view, document.body) : view;
}
