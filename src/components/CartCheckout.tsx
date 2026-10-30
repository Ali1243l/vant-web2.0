import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Tag, Check } from 'lucide-react';
import type { CartItem } from '../lib/cart';
import { checkoutQuote, prepareCheckoutDraft, checkoutMessage, type CheckoutDraft } from '../lib/checkoutDraft';
import { normalizeOffers } from '../admin/offers/offerModel';
import { fetchOfferSnapshot } from '../lib/offerStorage';
import { supabase } from '../lib/supabase';
import type { Language } from '../types';

export default function CartCheckout({ items, lang, phone, enabled, label, format }: { items: CartItem[]; lang: Language; phone: string; enabled: boolean; label: string; format: (value: number) => string }) {
  const ar = lang === 'ar';
  const [offers, setOffers] = useState(() => { try { return normalizeOffers(JSON.parse(localStorage.getItem('vant_offers_v1') || '[]')); } catch { return []; } });
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const review = useRef<HTMLDivElement>(null);
  const [offerError, setOfferError] = useState(false);
  const [offerRetry, setOfferRetry] = useState(0);
  const [loading, setLoading] = useState(!!supabase);
  useEffect(() => {
    let active = true;
    setLoading(!!supabase);
    setOfferError(false);
    const refreshLocal = () => { if (!supabase) { try { setOffers(normalizeOffers(JSON.parse(localStorage.getItem('vant_offers_v1') || '[]'))); } catch {} } };
    window.addEventListener('storage', refreshLocal);
    if (supabase) fetchOfferSnapshot(supabase).then(rows => { if (!active) return; setOffers(normalizeOffers(rows || [])); setOfferError(rows === null); setLoading(false); });
    return () => { active = false; window.removeEventListener('storage', refreshLocal); };
  }, [offerRetry]);
  useEffect(() => { setDraft(null); }, [items, applied, offers]);
  useEffect(() => { if (draft) review.current?.focus(); }, [draft]);
  let quote: ReturnType<typeof checkoutQuote> | null = null;
  try { quote = checkoutQuote(items, applied, offers); } catch {}
  const couponError = ar ? 'الكود غير صالح لهذا الطلب أو انتهت صلاحيته. راجع الحد الأدنى وشروط العرض.' : 'This code is unavailable for this order. Check dates, minimum spend and usage limits.';
  const prepare = () => {
    try { setDraft(prepareCheckoutDraft(localStorage, items, applied, offers)); setError(''); }
    catch (reason) { setDraft(null); setError(reason instanceof Error && ['coupon', 'cart'].includes(reason.message) ? couponError : (ar ? 'تعذّر حفظ المسودة. تأكد من إتاحة تخزين المتصفح ثم حاول مجدداً؛ السلة باقية.' : 'Could not save the draft. Check browser storage and retry; your cart is unchanged.')); }
  };
  return <section className="space-y-4" aria-label={ar ? 'مراجعة الطلب والخصم' : 'Order review & discount'}>
    <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 space-y-3">
      <label htmlFor="cart-coupon" className="flex gap-2 items-center text-xs font-semibold"><Tag className="h-4 w-4" />{ar ? 'عندك كود خصم؟' : 'Have a discount code?'}</label>
      <div className="flex gap-2"><input id="cart-coupon" dir="ltr" maxLength={40} autoCapitalize="characters" autoComplete="off" spellCheck={false} value={code} onChange={event => { setCode(event.target.value); setError(''); }} placeholder="VANT…" className="min-w-0 w-full min-h-11 rounded-xl border border-black/10 dark:border-white/15 px-3 bg-transparent text-sm" /><button type="button" disabled={loading || !code.trim()} className="min-h-11 shrink-0 rounded-xl border border-black/10 dark:border-white/15 px-3 text-xs font-bold" onClick={() => { try { checkoutQuote(items, code, offers); setApplied(code.trim().toUpperCase()); setError(''); } catch { setError(couponError); } }}>{ar ? 'تطبيق' : 'Apply'}</button></div>
      {applied && <div role="status" className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="flex items-center gap-1"><Check className="h-4 w-4" />{applied}</span><button type="button" className="min-h-11 px-2 underline" onClick={() => { setApplied(''); setCode(''); setError(''); }}>{ar ? 'إزالة الكود' : 'Remove code'}</button></div>}
      {offerError && <div role="alert" className="text-xs leading-relaxed"><p>{ar ? 'تعذّر تحديث الأكواد. أعد المحاولة قبل تطبيق الخصم.' : 'Codes could not refresh. Retry before applying a discount.'}</p><button type="button" className="min-h-11 underline" onClick={() => setOfferRetry(value => value + 1)}>{ar ? 'إعادة المحاولة' : 'Retry'}</button></div>}
      {loading && <p role="status" className="text-xs">{ar ? 'جاري التحقق من الأكواد…' : 'Checking codes…'}</p>}
    </div>
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-300 leading-relaxed">{error}</p>}
    {quote ? <dl className="space-y-2 text-sm"><div className="flex justify-between gap-3"><dt>{ar ? 'قيمة القطع' : 'Items subtotal'}</dt><dd dir="auto">{format(quote.subtotal)}</dd></div>{quote.discount > 0 && <div className="flex justify-between gap-3 text-emerald-600 dark:text-emerald-300"><dt>{ar ? 'الخصم' : 'Discount'}</dt><dd dir="auto">− {format(quote.discount)}</dd></div>}<div className="flex justify-between gap-3 border-t border-black/10 dark:border-white/10 pt-3 font-bold"><dt>{ar ? 'بعد الخصم' : 'After discount'}</dt><dd dir="auto">{format(quote.total)}</dd></div></dl> : <p role="alert" className="text-sm">{couponError}</p>}
    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{ar ? 'أجور التوصيل تُحدّد مع المتجر. الدفع عند الاستلام، والتأكيد بعد رد المتجر على واتساب.' : 'Delivery fees are agreed with the store. Pay on delivery; confirmation follows the store’s WhatsApp reply.'}</p>
    {!draft ? <button type="button" disabled={!enabled || !quote} onClick={prepare} className="vant-primary-action w-full">{ar ? 'مراجعة طلب واتساب' : 'Review WhatsApp order'}</button> : <div ref={review} tabIndex={-1} className="rounded-2xl border border-blue-500/30 p-3 space-y-3 focus-visible:outline-2 focus-visible:outline-blue-500">
      <p className="text-xs leading-relaxed">{ar ? 'مسودة محفوظة على هذا الجهاز، وليست طلباً مؤكداً.' : 'Draft saved on this device; it is not a confirmed order.'}<span dir="ltr" className="block mt-2 break-all font-mono">{draft.id}</span></p>
      <details><summary className="min-h-11 flex items-center cursor-pointer text-xs underline">{ar ? 'عرض نص الطلب قبل الإرسال' : 'Preview order message'}</summary><textarea aria-label={ar ? 'نص رسالة الطلب' : 'Order message'} readOnly rows={8} value={checkoutMessage(draft, ar, format)} className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent p-3 text-xs leading-relaxed" /></details>
      <a onClick={event => { try { checkoutQuote(items, applied, offers); } catch { event.preventDefault(); setDraft(null); setError(couponError); } }} href={enabled && quote ? `https://wa.me/${phone}?text=${encodeURIComponent(checkoutMessage(draft, ar, format))}` : undefined} aria-disabled={!enabled || !quote} tabIndex={enabled && quote ? 0 : -1} target="_blank" rel="noopener noreferrer" className="vant-primary-action w-full"><MessageCircle className="h-5 w-5" />{label}</a>
      <p className="text-xs leading-relaxed">{ar ? 'راجع الرسالة واضغط إرسال داخل واتساب. فتح التطبيق وحده لا يرسل الطلب.' : 'Review the message and press Send in WhatsApp. Opening the app does not send the order.'}</p>
    </div>}
  </section>;
}
