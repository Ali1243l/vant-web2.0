import { shopperSessionRequest, broadcastShopperSession } from '../lib/shopperSession';
import { requestShopperLink } from '../lib/shopperSignIn';
import { useState } from 'react';
import { useShopper } from '../hooks/useShopper';
import { shopperClient } from '../lib/supabase';
import { trackSystemError } from '../lib/analytics/tracker';
import type { Language } from '../types';

export default function ShopperAccount({ lang }: { lang: Language }) {
  const { owner, status, notice, store } = useShopper();
  const [email, setEmail] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [sentUntil, setSentUntil] = useState(0);
  const ar = lang === 'ar';
  const label = ({ guest: ['محفوظ على هذا الجهاز', 'Saved on this device'], pending: ['بانتظار المزامنة', 'Waiting to sync'], syncing: ['جاري حفظ قائمتك…', 'Saving your list…'], synced: ['محفوظ بحسابك', 'Saved to your account'], offline: ['بدون اتصال؛ التعديلات بانتظار المزامنة', 'Offline; changes waiting to sync'], error: ['ما تأكد الحفظ السحابي؛ قائمتك باقية هنا', 'Cloud save unconfirmed; your list is kept here'], memory: ['تعذّر الحفظ على الجهاز؛ لا تغلق الصفحة قبل المزامنة', 'Device save failed; keep this page open until synced'] } as const)[status][ar ? 0 : 1];
  return <section className="rounded-2xl border border-current/15 p-3 text-xs space-y-2" aria-label={ar ? 'حفظ السلة والمفضلة' : 'Save cart and wishlist'}>
    <p role="status" className="leading-6">{label}{notice === 'updated-from-account' ? (ar ? ' · وصل تحديث من جهاز آخر.' : ' · Updated from another device.') : ''}</p>
    {notice === 'cache-unavailable' && <p role="alert">{ar ? 'تخزين المتصفح غير متاح؛ النسخة المحلية مو مضمونة.' : 'Browser storage is unavailable; the local copy is not guaranteed.'}</p>}
    {notice === 'account-unavailable' && <p role="alert">{ar ? 'تعذّر تأكيد الدخول. قائمتك باقية؛ جرّب أحدث رابط دخول بعد رجوع الاتصال.' : 'Sign-in could not be confirmed. Your list is kept; retry the latest link when online.'}</p>}
    {notice === 'wishlist-limit' && <p role="alert">{ar ? 'وصلت المفضلة حد 2000 قطعة. احذف قطعة حتى تضيف غيرها.' : 'Your wishlist reached 2,000 pieces. Remove one before adding another.'}</p>}
    {notice === 'guest-merged' && <p role="status">{ar ? 'اندمجت سلتك ومفضلتك ويا الحساب، بدون استبدال قائمتك السابقة.' : 'Your guest cart and wishlist were merged into your account.'}</p>}
    {notice === 'conflict-reviewed' && <p role="status">{ar ? 'راجع قائمتك: وصل حذف من جهاز آخر أو اندمجت كمية وصلت حد 99. ما رجّعنا القطعة المحذوفة تلقائياً.' : 'Review your list: a deletion from another device or the 99-item quantity limit affected a change. Deleted items were not restored automatically.'}</p>}
    {owner ? <div className="flex flex-wrap gap-3"><button type="button" className="min-h-11 underline" disabled={busy} onClick={() => void store.refresh()}>{ar ? 'مزامنة الآن' : 'Sync now'}</button><button type="button" className="min-h-11 underline" disabled={busy} onClick={async () => { setBusy(true); try { await shopperSessionRequest('logout'); await store.activate(null); broadcastShopperSession(); } catch (error) { trackSystemError('Customer sign-out failed', '', { kind: 'save', operation: 'shopper-sign-out' }); setMessage(ar ? 'تعذّر تسجيل الخروج؛ حاول مجدداً.' : 'Sign-out failed; retry.'); } finally { setBusy(false); } }}>{ar ? 'تسجيل الخروج من هذا الجهاز' : 'Sign out on this device'}</button></div> : <details><summary className="min-h-11 flex items-center cursor-pointer font-semibold">{ar ? 'احفظ سلتك ومفضلتك بين أجهزتك' : 'Keep your cart and wishlist across devices'}</summary><form className="space-y-2" onSubmit={async event => {
      event.preventDefault(); if (busy || Date.now() < sentUntil) return;
      setBusy(true); setMessage('');
      try {
        await requestShopperLink(shopperClient, email, location.origin);
        setSentUntil(Date.now() + 60000); setMessage(ar ? 'طلبنا رابط دخول على بريدك. افتح أحدث رسالة؛ السلة تبقى محفوظة وما تنمسح.' : 'A sign-in link was requested. Open the latest email; your cart stays saved.');
      } catch (error) { trackSystemError('Customer sign-in link request failed', '', { kind: 'save', operation: 'shopper-sign-in' }); setMessage(error instanceof Error && error.message === 'sync-unavailable' ? (ar ? 'المزامنة السحابية غير متاحة هسه. قائمتك تبقى على جهازك؛ جرّب لاحقاً.' : 'Cloud sync is unavailable. Your list stays on this device; try later.') : ar ? 'تعذّر طلب رابط الدخول. تحقق من البريد والاتصال، أو انتظر إذا كررت الطلب. سلتك باقية.' : 'Could not request the link. Check your email/connection or wait after repeated attempts. Your cart is kept.'); }
      finally { setBusy(false); }
    }}><label className="block">{ar ? 'بريدك الإلكتروني' : 'Email'}<input type="email" required maxLength={254} autoComplete="email" dir="ltr" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full min-h-11 rounded-xl bg-transparent border border-current/20 px-3 text-base"/></label><button type="submit" disabled={busy} className="min-h-11 rounded-xl bg-blue-600 text-white px-4 font-semibold disabled:opacity-50">{busy ? (ar ? 'جارِ الطلب…' : 'Requesting…') : (ar ? 'أرسل رابط الدخول' : 'Send sign-in link')}</button><p className="leading-6 opacity-65">{ar ? 'ما تحتاج كلمة مرور. المزامنة تبدأ بعد تأكيد البريد، وهذا ما يشترك بك بالتسويق.' : 'No password needed. Sync starts after email verification; this does not subscribe you to marketing.'}</p></form></details>}
    {message && <p role="status" className="leading-6">{message}</p>}
  </section>;
}
