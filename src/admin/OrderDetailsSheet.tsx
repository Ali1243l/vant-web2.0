import React, { useEffect, useState } from 'react';
import { Printer, Copy } from 'lucide-react';
import { Sheet } from './Sheet';
import { Button } from './ui';
import { useAdminBridge, type Order, type OrderStatus } from './useAdminBridge';
import { allowedOrderStatuses, orderStatusLabels, transitionOrder, escapeOrderText } from '../lib/orderModel';
import { formatCurrency } from './format';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  onUpdate?: (order: Order) => void;
}

export const OrderDetailsSheet: React.FC<Props> = ({ order, isOpen, onClose, readOnly = true, onUpdate }) => {
  const { lang } = useAdminBridge();
  const isAr = lang === 'ar';
  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [printHtml, setPrintHtml] = useState('');
  useEffect(() => {
    setNextStatus(''); setNote(''); setNotes(order?.bespokeDetails?.artisanNotes || ''); setMessage(''); setPrintHtml('');
  }, [order?.id, isOpen]);
  if (!order) return null;
  const money = (amount: number) => formatCurrency(amount, 'IQD', lang);
  const statusName = (status: OrderStatus) => orderStatusLabels[status][isAr ? 'ar' : 'en'];
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const statuses = allowedOrderStatuses(order.status);
  const summary = `${isAr ? 'فانت — ملخص طلب' : 'VANT — Order summary'} #${order.id}\n${statusName(order.status)}\n${money(order.totalPrice)}`;

  const applyStatus = () => {
    if (readOnly || !onUpdate || !nextStatus) return;
    try {
      onUpdate(transitionOrder(order, nextStatus, note));
      setNextStatus(''); setNote(''); setMessage(isAr ? 'تم تحديث حالة الطلب التجريبي بالذاكرة فقط.' : 'Demo status updated in memory only.');
    } catch { setMessage(isAr ? 'الانتقال غير مسموح أو سبب الإلغاء مفقود.' : 'Transition not allowed or cancellation reason missing.'); }
  };
  const printSummary = () => {
    const esc = escapeOrderText;
    setPrintHtml(`<!doctype html><html lang="${lang}" dir="${isAr ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>VANT ${esc(order.id)}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:32px auto;padding:16px;color:#111}td,th{padding:12px;text-align:start;border-bottom:1px solid #ddd}table{width:100%;border-collapse:collapse}@media print{button{display:none}}</style></head><body><h1>VANT · ${isAr ? 'ملخص طلب' : 'Order summary'}</h1><p>${readOnly ? '' : (isAr ? 'تجربة فقط — لا تمثل معاملة فعلية' : 'DEMO ONLY — not a real transaction')}</p><h2>#${esc(order.id)}</h2><p>${esc(order.customerName)} · ${esc(statusName(order.status))}</p><p>${esc(order.orderDate || '—')}</p><table><thead><tr><th>${isAr ? 'القطعة' : 'Item'}</th><th>${isAr ? 'المقاس' : 'Size'}</th><th>${isAr ? 'الكمية' : 'Quantity'}</th><th>${isAr ? 'القيمة' : 'Value'}</th></tr></thead><tbody>${order.items.map(item => `<tr><td>${esc(isAr ? item.name : item.nameEn)}</td><td>${esc(item.selectedSize)}</td><td>${esc(item.quantity)}</td><td>${esc(money(item.price * item.quantity))}</td></tr>`).join('')}</tbody></table><p>${isAr ? 'إجمالي القطع' : 'Item subtotal'}: ${esc(money(subtotal))}</p><p>${isAr ? 'الإجمالي المسجّل' : 'Recorded total'}: ${esc(money(order.totalPrice))}</p><p>${isAr ? 'رسوم التوصيل والخصم وحالة تحصيل الدفع غير موثّقة في هذا الملخص.' : 'Delivery fees, discounts and payment collection are not verified in this summary.'}</p><button onclick="window.print()">${isAr ? 'طباعة الملخص' : 'Print summary'}</button></body></html>`);

  };

  if (printHtml) return <Sheet isOpen={isOpen} onClose={onClose} title={isAr ? 'معاينة ملخص الطلب' : 'Order summary preview'} description={isAr ? 'راجع الملخص ثم اطبعه من الزر داخل المعاينة.' : 'Review the summary, then use the print button in the preview.'} widthClass="max-w-3xl" footer={<Button variant="outline" onClick={() => setPrintHtml('')}>{isAr ? 'العودة للتفاصيل' : 'Back to details'}</Button>}><iframe title={isAr ? 'ملخص الطلب للطباعة' : 'Printable order summary'} srcDoc={printHtml} className="w-full min-h-[65dvh] rounded-xl border border-slate-700 bg-white" /></Sheet>;
  return <Sheet isOpen={isOpen} onClose={onClose} title={`${isAr ? 'تفاصيل الطلب' : 'Order details'} #${order.id}`} description={readOnly ? (isAr ? 'عرض فقط أثناء التجربة' : 'Read-only during testing') : (isAr ? 'تجربة معزولة — بدون حفظ أو إرسال' : 'Isolated demo — no persistence or sending')} widthClass="max-w-2xl" footer={<Button variant="outline" onClick={onClose}>{isAr ? 'إغلاق التفاصيل' : 'Close details'}</Button>}>
    <div className="order-details min-w-0 space-y-5 text-start">
      <section className="rounded-2xl border border-slate-700 p-4 space-y-3">
        <div className="flex flex-wrap justify-between gap-3"><span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">{statusName(order.status)}</span><span className="text-sm text-slate-400">{order.orderDate ? new Date(order.orderDate).toLocaleString(isAr ? 'ar-IQ' : 'en-GB') : (isAr ? 'تاريخ غير مسجّل' : 'Date unavailable')}</span></div>
        <p className="text-2xl font-bold text-white">{money(order.totalPrice)}</p>
        <p className="text-xs text-slate-400">{isAr ? 'طريقة الدفع المسجّلة: ' : 'Recorded payment method: '}{order.paymentMethod || '—'}</p>
        <p className="text-xs text-slate-400">{isAr ? 'رقم التتبع: ' : 'Tracking number: '}{order.trackingNumber || '—'}</p>
        <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={printSummary}><Printer className="w-4 h-4 me-2" />{isAr ? 'طباعة ملخص' : 'Print summary'}</Button><Button size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(summary); setMessage(isAr ? 'تم نسخ الملخص.' : 'Summary copied.'); } catch { setMessage(isAr ? 'تعذر النسخ؛ تحقق من صلاحية الحافظة.' : 'Copy failed; check clipboard permission.'); } }}><Copy className="w-4 h-4 me-2" />{isAr ? 'نسخ ملخص' : 'Copy summary'}</Button></div>
        {message && <p role="status" className="text-xs text-indigo-200">{message}</p>}
      </section>
      <section className="rounded-2xl border border-slate-800 p-4"><h3 className="font-semibold text-white mb-3">{isAr ? 'بيانات العميل' : 'Customer details'}</h3><dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm break-words">{[[isAr ? 'الاسم' : 'Name', order.customerName], [isAr ? 'الهاتف' : 'Phone', order.customerPhone], [isAr ? 'البريد' : 'Email', order.customerEmail], [isAr ? 'العنوان' : 'Address', order.shippingAddress]].map(([title, value]) => <div key={title}><dt className="text-xs text-slate-500">{title}</dt><dd className="text-slate-200 mt-1">{value || '—'}</dd></div>)}</dl></section>
      <section className="rounded-2xl border border-slate-800 p-4 space-y-3"><h3 className="font-semibold text-white">{isAr ? 'القطع المطلوبة' : 'Ordered items'}</h3>{order.items.length ? order.items.map((item, index) => <div key={index} className="rounded-xl bg-slate-950/50 p-3 text-sm"><p className="font-semibold text-slate-200">{(isAr ? item.name : item.nameEn) || '—'}</p><p className="text-xs text-slate-400 mt-2">{isAr ? 'المقاس' : 'Size'}: {item.selectedSize || '—'} · {isAr ? 'الكمية' : 'Quantity'}: {item.quantity}</p><p className="mt-2 text-emerald-300">{money(item.price)} × {item.quantity} = {money(item.price * item.quantity)}</p></div>) : <p className="text-sm text-amber-300">{isAr ? 'لا توجد تفاصيل قطع صالحة مسجّلة.' : 'No valid item details recorded.'}</p>}
        <dl className="space-y-2 text-sm border-t border-slate-800 pt-3"><div className="flex justify-between gap-2"><dt className="text-slate-400">{isAr ? 'مجموع القطع' : 'Item subtotal'}</dt><dd className="text-white">{money(subtotal)}</dd></div><div className="flex justify-between gap-2"><dt className="text-slate-400">{isAr ? 'الإجمالي المسجّل' : 'Recorded total'}</dt><dd className="text-white">{money(order.totalPrice)}</dd></div></dl><p className="text-xs text-slate-500 leading-6">{isAr ? 'رسوم التوصيل والخصم غير مفصّلة بالمصدر؛ ما نفترض أن التوصيل مجاني. الإجمالي المسجّل لا يثبت استلام الدفع.' : 'Delivery and discounts are not itemized at source; free delivery is not assumed. Recorded total does not prove payment collection.'}</p>
      </section>
      {order.type === 'bespoke' && <section className="rounded-2xl border border-slate-800 p-4 space-y-3"><h3 className="font-semibold text-white">{isAr ? 'تفاصيل التفصيل الخاص' : 'Bespoke details'}</h3>{order.bespokeDetails?.clientMeasurements && <dl className="grid grid-cols-2 gap-3 text-sm">{Object.entries(order.bespokeDetails.clientMeasurements).map(([key, value]) => <div key={key}><dt className="text-slate-400">{key}</dt><dd className="text-white">{String(value || '—')}</dd></div>)}</dl>}<p className="text-sm text-slate-400">{isAr ? 'الخامة: ' : 'Fabric: '}{order.bespokeDetails?.fabricSelection || '—'}</p><p className="text-sm text-slate-400">{isAr ? 'موعد القياس المسجّل: ' : 'Recorded fitting date: '}{order.bespokeDetails?.fittingDate || '—'}</p><label className="block text-xs text-slate-400">{isAr ? 'ملاحظات التفصيل' : 'Tailoring notes'}<textarea value={notes} readOnly={readOnly} onChange={event => setNotes(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white" /></label>{!readOnly && <Button size="sm" variant="outline" disabled={!onUpdate || notes === (order.bespokeDetails?.artisanNotes || '')} onClick={() => { onUpdate?.({ ...order, bespokeDetails: { ...order.bespokeDetails, artisanNotes: notes } }); setMessage(isAr ? 'حُفظت الملاحظات التجريبية بالذاكرة فقط.' : 'Demo notes saved in memory only.'); }}>{isAr ? 'حفظ الملاحظات التجريبية' : 'Save demo notes'}</Button>}</section>}
      {!readOnly && <section className="rounded-2xl border border-indigo-500/30 p-4 space-y-3"><h3 className="font-semibold text-white">{isAr ? 'تغيير الحالة التجريبية' : 'Change demo status'}</h3>{statuses.length ? <><label className="block text-xs text-slate-400">{isAr ? 'الحالة الجديدة' : 'New status'}<select value={nextStatus} onChange={event => setNextStatus(event.target.value as OrderStatus | '')} className="mt-2 w-full min-h-11 rounded-xl bg-slate-950 border border-slate-700 px-3 text-white"><option value="">{isAr ? 'اختر الحالة' : 'Choose status'}</option>{statuses.map(status => <option key={status} value={status}>{statusName(status)}</option>)}</select></label><label className="block text-xs text-slate-400">{nextStatus === 'cancelled' ? (isAr ? 'سبب الإلغاء (مطلوب)' : 'Cancellation reason (required)') : (isAr ? 'ملاحظة اختيارية' : 'Optional note')}<textarea value={note} onChange={event => setNote(event.target.value)} rows={2} className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-white" /></label><Button size="sm" onClick={applyStatus} disabled={!nextStatus || (nextStatus === 'cancelled' && !note.trim())}>{isAr ? 'تطبيق الحالة التجريبية' : 'Apply demo status'}</Button></> : <p className="text-sm text-slate-400">{isAr ? 'هذه حالة نهائية؛ لا يمكن نقلها لمرحلة سابقة.' : 'This is a terminal status; it cannot move backwards.'}</p>}</section>}
      <section className="rounded-2xl border border-slate-800 p-4 space-y-3"><h3 className="font-semibold text-white">{isAr ? 'سجل الحالات المسجّل' : 'Recorded status history'}</h3>{order.timeline.length ? [...order.timeline].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).map((event, index) => <div key={`${event.timestamp}-${index}`} className="border-s-2 border-indigo-500/50 ps-3 text-sm"><p className="text-white">{statusName(event.status)}</p><p className="text-xs text-slate-500 mt-1">{new Date(event.timestamp).toLocaleString(isAr ? 'ar-IQ' : 'en-GB')}</p>{event.note && <p className="text-slate-300 mt-2">{event.note}</p>}</div>) : <p className="text-sm text-slate-400">{isAr ? 'لا يوجد سجل تغييرات موثّق لهذا الطلب.' : 'No change history recorded for this order.'}</p>}</section>
    </div>
  </Sheet>;
};
