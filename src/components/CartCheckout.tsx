import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Tag } from 'lucide-react';
import type { CartItem } from '../lib/cart';
import { saveVerifiedCheckoutDraft, checkoutMessage, type CheckoutDraft } from '../lib/checkoutDraft';
import type { CartQuote } from '../lib/cartQuote';
import { useShopper } from '../hooks/useShopper';
import { trackSystemError } from '../lib/analytics/tracker';
import type { Language } from '../types';

export default function CartCheckout({ items, lang, phone, enabled, label, format }: { items: CartItem[]; lang: Language; phone: string; enabled: boolean; label: string; format: (value: number) => string }) {
  const ar = lang === 'ar', t = (a: string, e: string) => ar ? a : e;
  const { coupon, store } = useShopper();
  const [code, setCode] = useState(coupon), [quote, setQuote] = useState<CartQuote | null>(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [retry, setRetry] = useState(0), generation = useRef(0);
  const current = useRef({ items, coupon }); current.current = { items, coupon };
  const signature = JSON.stringify([items, coupon]);
  const verify = async (signal?: AbortSignal): Promise<CartQuote> => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(abort, 10000);
    try {
    const response = await fetch('/api/cart-quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: current.current.items.map(({ id, productId, variantId, size, color, title, price, quantity }) => ({ id, productId, variantId, size, color, title, price, quantity })), code: current.current.coupon }), signal: controller.signal });
    if (!response.ok) throw Error('Server quote unavailable');
    const result = await response.json();
    if (!Array.isArray(result.items) || typeof result.blocked !== 'boolean' || !Number.isFinite(result.checkedAt)) throw Error('Invalid server quote');
    return result;
    } finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
  };
  useEffect(() => {
    const id = ++generation.current, controller = new AbortController();
    setDraft(null); setQuote(null); setError(''); setBusy(true);
    const timer = setTimeout(() => { void verify(controller.signal).then(result => { if (id === generation.current) setQuote(result); }).catch(reason => {
      if (id !== generation.current || controller.signal.aborted) return;
      trackSystemError(reason instanceof Error ? reason.message : 'Cart verification failed', '', { kind: 'save', operation: 'cart-quote' });
      setError(t('تعذّر التحقق من السعر والتوفر. سلتك محفوظة؛ أعد المحاولة عند رجوع الاتصال.', 'Price and availability could not be verified. Your cart is kept; retry when online.'));
    }).finally(() => { if (id === generation.current) setBusy(false); }); }, 400);
    const reconnect = () => setRetry(value => value + 1);
    window.addEventListener('online', reconnect);
    return () => { generation.current++; controller.abort(); clearTimeout(timer); window.removeEventListener('online', reconnect); };
  }, [signature, retry]);
  useEffect(() => { setCode(coupon); }, [coupon]);
  const prepare = async () => {
    const id = generation.current;
    setBusy(true); setDraft(null); setError('');
    try {
      const result = await verify();
      if (id !== generation.current) return;
      setQuote(result);
      if (!result.blocked) setDraft(saveVerifiedCheckoutDraft(localStorage, result));
    } catch (reason) {
      trackSystemError(reason instanceof Error ? reason.message : 'Checkout review failed', '', { kind: 'save', operation: 'checkout-review' });
      setError(t('تعذّر تأكيد المراجعة. سلتك باقية؛ حاول مجدداً.', 'Review could not be confirmed. Your cart is kept; retry.'));
    } finally { if (id === generation.current) setBusy(false); }
  };
  return <section className="space-y-4" aria-label={t('مراجعة الطلب والخصم', 'Order review and discount')}>
    <div className="rounded-2xl border border-current/15 p-3 space-y-3">
      <label htmlFor="cart-coupon" className="flex gap-2 items-center text-xs font-semibold"><Tag size={16}/>{t('عندك كود خصم؟', 'Have a discount code?')}</label>
      <form className="flex gap-2" onSubmit={event => { event.preventDefault(); store.setCoupon(code.trim().toUpperCase()); setRetry(value => value + 1); }}><input id="cart-coupon" dir="ltr" maxLength={40} autoComplete="off" value={code} onChange={event => setCode(event.target.value)} className="min-w-0 w-full min-h-11 rounded-xl border border-current/15 px-3 bg-transparent text-base"/><button type="submit" disabled={busy || !code.trim()} className="min-h-11 px-3 rounded-xl border border-current/15 text-xs">{t('تطبيق', 'Apply')}</button></form>
      {coupon && <div className="flex items-center justify-between gap-2 text-xs"><span>{coupon}{quote && !quote.couponError ? t(' · تم التحقق', ' · Verified') : t(' · يحتاج تحقق', ' · Awaiting verification')}</span><button type="button" className="min-h-11 underline" onClick={() => store.setCoupon('')}>{t('إزالة الكود', 'Remove code')}</button></div>}
    </div>
    {busy && <p role="status" className="text-xs">{t('جاري مراجعة الأسعار والمخزون والكود…', 'Checking prices, stock and code…')}</p>}
    {error && <div role="alert" className="text-sm leading-7 text-red-600 dark:text-red-300"><p>{error}</p><button type="button" className="min-h-11 underline" onClick={() => setRetry(value => value + 1)}>{t('إعادة المحاولة', 'Retry')}</button></div>}
    {quote?.couponError && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{t('الكود غير صالح لهذا الطلب، انتهى أو تغيّرت شروطه. عدّله أو احذفه للمتابعة.', 'This code is unavailable, expired or no longer meets the conditions. Change or remove it.')}</p>}
    {quote?.items.filter(item => item.issue).map(item => <div key={item.id} role="status" className="rounded-xl border border-amber-500/30 p-3 text-xs leading-6"><p className="font-bold break-words">{item.title}</p><p>{item.issue === 'price' ? t(`السعر تغيّر من ${format(item.previousPrice)} إلى ${format(item.price)}.`, `Price changed from ${format(item.previousPrice)} to ${format(item.price)}.`) : item.issue === 'stock' ? t(item.maxQuantity ? `المتوفر حالياً ${item.maxQuantity} فقط.` : 'هذه القطعة أو اللون غير متوفر حالياً.', item.maxQuantity ? `Only ${item.maxQuantity} available.` : 'This piece or colour is unavailable.') : t('القطعة أو اختيار اللون/المقاس لم يعد متاحاً. احذفها واختر البديل من الكتالوج.', 'This piece or selection is no longer available. Remove it and select an alternative.')}</p><div className="flex flex-wrap gap-3">{item.issue === 'price' && <button type="button" className="min-h-11 underline" onClick={() => { const current = store.getSnapshot().items.find(row => row.id === item.id); if (current) store.change({ ...current, price: item.price, variantId: item.variantId }, 0); }}>{t('اعتماد السعر الجديد', 'Accept new price')}</button>}{item.issue === 'stock' && item.maxQuantity > 0 && <button type="button" className="min-h-11 underline" onClick={() => { const current = store.getSnapshot().items.find(row => row.id === item.id); if (current) store.change(current, item.maxQuantity - current.quantity); }}>{t('تقليل للكمية المتوفرة', 'Use available quantity')}</button>}<button type="button" className="min-h-11 underline" onClick={() => store.remove(item.id)}>{t('إزالة من السلة', 'Remove from cart')}</button></div></div>)}
    <dl className="space-y-2 text-sm"><div className="flex justify-between gap-3"><dt>{quote ? t('قيمة القطع المتاحة', 'Available items subtotal') : t('مجموع تقديري؛ غير مؤكّد', 'Estimated subtotal; unverified')}</dt><dd>{format(quote?.subtotal ?? items.reduce((sum, item) => sum + item.quantity * item.price, 0))}</dd></div>{!!quote?.discount && <div className="flex justify-between"><dt>{t('الخصم', 'Discount')}</dt><dd>− {format(quote.discount)}</dd></div>}{quote && <div className="flex justify-between border-t border-current/15 pt-3 font-bold"><dt>{t('بعد الخصم، قبل التوصيل', 'After discount, before delivery')}</dt><dd>{format(quote.total)}</dd></div>}</dl>
    <p className="text-xs leading-6 opacity-65">{t('السلة لا تحجز القطع. الدفع عند الاستلام والتثبيت وأجور التوصيل تُؤكّد ويا المتجر عبر واتساب. تطبيق الكود وحده ما يحسب استعمالاً نهائياً.', 'The cart does not reserve stock. Payment is on delivery; confirmation and delivery fees are agreed on WhatsApp. Applying a code alone does not redeem it.')}</p>
    {!draft ? <button type="button" disabled={!enabled || busy || !quote || quote.blocked} onClick={() => void prepare()} className="vant-primary-action w-full">{t('مراجعة طلب واتساب', 'Review WhatsApp order')}</button> : <div className="rounded-2xl border border-blue-500/30 p-3 space-y-3"><p className="text-xs leading-6">{t('مسودة محفوظة، مو طلب مؤكّد. المتجر يراجع السعر والتوفر والكود عند التثبيت.', 'Saved draft, not a confirmed order. The store checks price, availability and code on confirmation.')}</p><details><summary className="min-h-11 flex items-center cursor-pointer text-xs underline">{t('عرض نص الطلب', 'Preview order message')}</summary><textarea aria-label={t('نص رسالة الطلب', 'Order message')} readOnly rows={8} value={checkoutMessage(draft, ar, format)} className="w-full rounded-xl border border-current/15 bg-transparent p-3 text-xs leading-6"/></details><a href={`https://wa.me/${phone}?text=${encodeURIComponent(checkoutMessage(draft, ar, format))}`} target="_blank" rel="noopener noreferrer" className="vant-primary-action w-full" onClick={event => { if (Date.now() - quote!.checkedAt > 30000) { event.preventDefault(); setDraft(null); setRetry(value => value + 1); } }}><MessageCircle size={20}/>{label}</a><p className="text-xs">{t('راجع الرسالة واضغط إرسال بواتساب؛ فتحه وحده ما يرسل الطلب.', 'Review and press Send in WhatsApp; opening it does not send the order.')}</p></div>}
  </section>;
}
