import React, { useState } from 'react';
import { normalizePhone } from '../lib/constants';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Truck,
  Scissors,
  CreditCard,
  MessageCircle,
  Printer,
  ChevronDown,
  Edit3,
  Save,
  AlertCircle,
  Crown,
  Ruler,
  Layers,
  ArrowRight,
  User,
  Package,
} from 'lucide-react';
import { Sheet } from './Sheet';
import { StatusBadge } from './ui';
import {
  Order,
  OrderStatus,
  OrderType,
  useAdminBridge,
} from './useAdminBridge';

interface OrderDetailsSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsSheet: React.FC<OrderDetailsSheetProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { lang, updateOrderStatus, updateOrderArtisanNotes } = useAdminBridge();
  const isAr = lang === 'ar';

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [artisanNotes, setArtisanNotes] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [statusNoteInput, setStatusNoteInput] = useState('');

  // Keep notes synchronized when order changes
  React.useEffect(() => {
    if (order) {
      setArtisanNotes(order.bespokeDetails?.artisanNotes || '');
      setIsEditingNotes(false);
      setIsStatusDropdownOpen(false);
      setStatusNoteInput('');
    }
  }, [order]);

  if (!order) return null;

  const formatPrice = (num: number) => {
    return `${new Intl.NumberFormat('en-US').format(num)} IQD`;
  };

  const statusConfigs: Record<
    OrderStatus,
    { labelAr: string; labelEn: string; badgeStatus: 'draft' | 'warning' | 'active' | 'success' | 'danger'; icon: React.ElementType }
  > = {
    pending_payment: {
      labelAr: 'بانتظار الدفع',
      labelEn: 'Pending Payment',
      badgeStatus: 'draft',
      icon: Clock,
    },
    processing: {
      labelAr: 'قيد التفصيل / التجهيز',
      labelEn: 'In Atelier / Processing',
      badgeStatus: 'warning',
      icon: Scissors,
    },
    shipped: {
      labelAr: 'تم الشحن للتوصيل',
      labelEn: 'Shipped / In Transit',
      badgeStatus: 'active',
      icon: Truck,
    },
    delivered: {
      labelAr: 'تم التسليم بنجاح',
      labelEn: 'Delivered',
      badgeStatus: 'success',
      icon: CheckCircle2,
    },
    cancelled: {
      labelAr: 'تم الإلغاء',
      labelEn: 'Cancelled',
      badgeStatus: 'danger',
      icon: AlertCircle,
    },
  };

  const handleSaveNotes = () => {
    updateOrderArtisanNotes(order.id, artisanNotes);
    setIsEditingNotes(false);
  };

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus, statusNoteInput.trim() || undefined);
    setIsStatusDropdownOpen(false);
    setStatusNoteInput('');
  };

  const handleWhatsAppCustomer = () => {
    const cleanPhone = normalizePhone(order.customerPhone);
    const greeting = isAr ? `مرحباً ${order.customerName}` : `Hi ${order.customerName}`;
    const statusText = isAr
      ? statusConfigs[order.status].labelAr
      : statusConfigs[order.status].labelEn;

    const fitting = order.type === 'bespoke' && order.bespokeDetails?.fittingDate ? order.bespokeDetails.fittingDate : '';
    const message = isAr
      ? `${greeting}،\nهذا تحديث من فانت VANT عن طلبك رقم #${order.id}.\nحالة الطلب: *${statusText}*.\n${fitting ? `موعد البروفة: ${fitting}\n` : ''}\nإذا عندك أي سؤال، رد علينا هنا.`
      : `${greeting},\nAn update from VANT on your order #${order.id}.\nStatus: *${statusText}*.\n${fitting ? `Fitting: ${fitting}\n` : ''}\nReply here if you have any questions.`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    // Customer fields come from the public checkout form, so everything is escaped before it becomes HTML
    const esc = (value: unknown) =>
      String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
    const money = (n: number) => `${Number(n || 0).toLocaleString('en-US')} IQD`;

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td>${esc(item.name)}<br/><small>${[item.selectedSize && `${isAr ? 'المقاس' : 'Size'}: ${esc(item.selectedSize)}`, item.fabricOption && esc(item.fabricOption)].filter(Boolean).join(' • ')}</small></td>
        <td class="c">${esc(item.quantity)}</td>
        <td class="n">${money(item.price)}</td>
        <td class="n"><b>${money(item.price * item.quantity)}</b></td>
      </tr>`
      )
      .join('');

    printWindow.document.write(`<!DOCTYPE html>
      <html dir="${isAr ? 'rtl' : 'ltr'}" lang="${isAr ? 'ar' : 'en'}">
      <head>
        <meta charset="utf-8">
        <title>${isAr ? 'فاتورة' : 'Invoice'} VANT #${esc(order.id)}</title>
        <style>
          body { font-family: -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif; margin: 40px; color: #15171c; }
          .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #15171c; padding-bottom: 18px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; margin: 0; } .logo span { letter-spacing: .28em; }
          .muted { color: #6b7280; margin: 4px 0; }
          .box { background: #f8f9fa; padding: 14px 16px; border-radius: 10px; margin-bottom: 20px; } .box p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: start; background: #f8f9fa; padding: 10px 8px; border-bottom: 2px solid #d1d5db; font-size: 13px; }
          td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; } td small { color: #6b7280; }
          .c { text-align: center; } .n { text-align: end; font-family: monospace; white-space: nowrap; }
          .total { margin-top: 20px; font-size: 18px; font-weight: 800; text-align: end; color: #004ad7; }
          button { margin-top: 24px; padding: 8px 20px; background: #004ad7; color: #fff; border: 0; border-radius: 8px; cursor: pointer; font-weight: 700; }
          @media print { button { display: none; } body { margin: 15mm; } }
        </style>
      </head>
      <body>
        <div class="head">
          <div>
            <h1 class="logo" dir="ltr"><span>VANT</span> | فانت</h1>
          </div>
          <div style="text-align: end;">
            <h2 style="margin: 0; color: #004ad7;">#${esc(order.id)}</h2>
            <p class="muted">${isAr ? 'التاريخ' : 'Date'}: ${esc(order.orderDate)}</p>
            <p class="muted">${isAr ? 'الدفع' : 'Payment'}: ${esc(order.paymentMethod)}</p>
          </div>
        </div>
        <div class="box">
          <p><b>${isAr ? 'الاسم' : 'Name'}:</b> ${esc(order.customerName)}</p>
          <p><b>${isAr ? 'الهاتف' : 'Phone'}:</b> <span dir="ltr">${esc(order.customerPhone)}</span></p>
          <p><b>${isAr ? 'العنوان' : 'Address'}:</b> ${esc(order.shippingAddress)}</p>
        </div>
        <table>
          <thead><tr>
            <th>${isAr ? 'القطعة' : 'Item'}</th><th class="c">${isAr ? 'العدد' : 'Qty'}</th>
            <th class="n">${isAr ? 'السعر' : 'Price'}</th><th class="n">${isAr ? 'المجموع' : 'Subtotal'}</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p class="total">${isAr ? 'الإجمالي' : 'Total'}: ${money(order.totalPrice)}</p>
        <button onclick="window.print()">${isAr ? 'طباعة' : 'Print'}</button>
      </body>
      </html>`);
    printWindow.document.close();
  };

  const stepsList: { status: OrderStatus; labelAr: string; labelEn: string; icon: React.ElementType }[] = [
    { status: 'pending_payment', labelAr: 'تسجيل الطلب', labelEn: 'Order Placed', icon: Clock },
    { status: 'processing', labelAr: 'الخياطة في الأتيليه', labelEn: 'In Atelier', icon: Scissors },
    { status: 'shipped', labelAr: 'تم الشحن', labelEn: 'Dispatched', icon: Truck },
    { status: 'delivered', labelAr: 'تم التسليم', labelEn: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepState = (stepStatus: OrderStatus) => {
    const flow = ['pending_payment', 'processing', 'shipped', 'delivered'];
    const currentIndex = flow.indexOf(order.status);
    const stepIndex = flow.indexOf(stepStatus);

    if (order.status === 'cancelled') {
      return 'cancelled';
    }
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? `تفاصيل الطلب #${order.id}` : `Order Details #${order.id}`}
      description={
        isAr
          ? `تاريخ الإنشاء: ${order.orderDate} • نوع الطلب: ${order.type === 'bespoke' ? 'تفصيل ملكي خاص' : 'منتج جاهز'}`
          : `Created: ${order.orderDate} • Type: ${order.type === 'bespoke' ? 'VIP Bespoke Atelier' : 'Ready-to-Wear'}`
      }
      widthClass="max-w-2xl sm:max-w-3xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/95 backdrop-blur-md p-1 border-t border-slate-800">
          {/* Status Changer Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs border border-slate-700/80 transition-all cursor-pointer shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'تغيير مرحلة الطلب' : 'Update Stage'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Quick Status Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div
                className={`absolute bottom-full mb-2 ${
                  isAr ? 'right-0' : 'left-0'
                } w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95`}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  {isAr ? 'اختر الحالة الجديدة' : 'Select New Status'}
                </div>
                {(['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => {
                  const conf = statusConfigs[st];
                  const Icon = conf.icon;
                  const isCurrent = order.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-start ${
                        isCurrent
                          ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{isAr ? conf.labelAr : conf.labelEn}</span>
                      </span>
                      {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}

                <div className="mt-2 pt-2 border-t border-slate-800 px-1">
                  <input
                    type="text"
                    value={statusNoteInput}
                    onChange={(e) => setStatusNoteInput(e.target.value)}
                    placeholder={isAr ? 'ملاحظة التحديث (اختياري)...' : 'Update note (optional)...'}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp & Print Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintInvoice}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-all cursor-pointer"
              title={isAr ? 'طباعة فاتورة رسمية' : 'Print Invoice'}
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{isAr ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
            </button>

            <button
              onClick={handleWhatsAppCustomer}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-950 transition-all cursor-pointer"
              title={isAr ? 'مراسلة العميل عبر واتساب كونسيرج' : 'Send WhatsApp Update'}
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>{isAr ? 'تحديث واتساب كونسيرج' : 'WhatsApp Concierge'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-6 text-start">
        {/* Top Highlight Banner with VIP Indicator */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                  order.isVip
                    ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-amber-900/30 ring-2 ring-amber-400/40'
                    : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                }`}
              >
                {order.isVip ? <Crown className="w-6 h-6 text-amber-950" /> : <Scissors className="w-6 h-6 text-indigo-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-wide">#{order.id}</h3>
                  {order.isVip && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.35)] animate-pulse">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>{isAr ? 'عميل كبار الشخصيات VIP' : 'VIP Bespoke Client'}</span>
                    </span>
                  )}
                  {order.type === 'bespoke' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      <Scissors className="w-3 h-3 text-indigo-400" />
                      <span>{isAr ? 'خياطة خاصة' : 'Atelier Bespoke'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {order.paymentMethod} {order.trackingNumber ? `• تتبع: ${order.trackingNumber}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400">{isAr ? 'إجمالي الطلب' : 'Total Amount'}</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Fulfillment Journey Timeline Stepper */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'مسار رحلة الطلب والتجهيز' : 'Fulfillment Journey Timeline'}</span>
            </h4>
            <StatusBadge
              status={statusConfigs[order.status].badgeStatus}
              label={isAr ? statusConfigs[order.status].labelAr : statusConfigs[order.status].labelEn}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
            {stepsList.map((step, idx) => {
              const state = getStepState(step.status);
              const StepIcon = step.icon;

              return (
                <div
                  key={step.status}
                  className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    state === 'current'
                      ? 'bg-indigo-600/15 border-indigo-500/50 shadow-sm shadow-indigo-950/50'
                      : state === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-950/50 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 text-xs font-bold ${
                      state === 'current'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 animate-pulse'
                        : state === 'completed'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {state === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      state === 'current'
                        ? 'text-indigo-300'
                        : state === 'completed'
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {isAr ? step.labelAr : step.labelEn}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {state === 'completed'
                      ? isAr
                        ? 'مكتمل'
                        : 'Completed'
                      : state === 'current'
                      ? isAr
                        ? 'المرحلة الحالية'
                        : 'In Progress'
                      : isAr
                      ? 'بانتظار البدء'
                      : 'Upcoming'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chronological History Log */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {isAr ? 'سجل النشاطات والمحطات:' : 'Activity History Log:'}
              </span>
              {order.timeline.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-200">
                      {isAr ? evt.title : evt.titleEn}
                    </span>
                    {evt.note && <p className="text-slate-400 mt-0.5 text-[11px]">{evt.note}</p>}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">{evt.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Customer & Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'بيانات العميل' : 'Customer Profile'}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'الاسم:' : 'Name:'}</span>
                <span className="font-bold text-white">{order.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'الهاتف:' : 'Phone:'}</span>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="font-mono text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-indigo-400" />
                  <span>{order.customerPhone}</span>
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isAr ? 'البريد:' : 'Email:'}</span>
                <span className="font-mono text-slate-300 truncate max-w-[180px]">{order.customerEmail}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'عنوان التوصيل والشحن' : 'Delivery Address'}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              {order.shippingAddress}
            </p>
          </div>
        </div>

        {/* 3. Bespoke VIP Tailoring Measurement Card (If applicable) */}
        {order.type === 'bespoke' && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{isAr ? 'بطاقة قياسات الأتيليه الملكية (VIP Atelier Card)' : 'Royal Bespoke Measurement Card'}</span>
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  </h4>
                  <p className="text-xs text-amber-300/80">
                    {order.bespokeDetails?.atelierMaster || (isAr ? 'إشراف كبير خياطي الأتيليه' : 'Head Master Tailor')}
                  </p>
                </div>
              </div>

              {order.bespokeDetails?.urgency && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {order.bespokeDetails.urgency === 'royal_vip'
                    ? isAr
                      ? 'أولوية ملكية عاجلة'
                      : 'Royal VIP Priority'
                    : isAr
                    ? 'أولوية خاصة'
                    : 'High Priority'}
                </span>
              )}
            </div>

            {/* Measurement Grid */}
            {order.bespokeDetails?.clientMeasurements && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                {Object.entries(order.bespokeDetails.clientMeasurements).map(([key, val]) => {
                  const measurementLabels: Record<string, { ar: string; en: string }> = {
                    chest: { ar: 'محيط الصدر', en: 'Chest' },
                    waist: { ar: 'محيط الخصر', en: 'Waist' },
                    shoulder: { ar: 'عرض الأكتاف', en: 'Shoulder' },
                    sleeveLength: { ar: 'طول الكم', en: 'Sleeve Length' },
                    jacketLength: { ar: 'طول السترة/الثوب', en: 'Jacket/Full Length' },
                    collar: { ar: 'محيط الياقة', en: 'Collar' },
                    height: { ar: 'الطول الكلي', en: 'Height' },
                    posture: { ar: 'هيئة القوام', en: 'Posture' },
                  };
                  const label = measurementLabels[key] || { ar: key, en: key };

                  return (
                    <div
                      key={key}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col text-start"
                    >
                      <span className="text-[10px] text-slate-400 truncate">{isAr ? label.ar : label.en}</span>
                      <span className="text-xs font-bold font-mono text-amber-200 mt-0.5 truncate">{val}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Artisan Atelier Notes Section */}
            <div className="mt-3 pt-3 border-t border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'ملاحظات الخياط ومسؤول الأتيليه:' : 'Master Tailor & Artisan Notes:'}</span>
                </span>
                {!isEditingNotes ? (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isAr ? 'تعديل الملاحظات' : 'Edit Notes'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveNotes}
                    className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isAr ? 'حفظ' : 'Save'}</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <textarea
                  value={artisanNotes}
                  onChange={(e) => setArtisanNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-amber-500/50 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                  placeholder={isAr ? 'اكتب ملاحظات التفصيل الدقيقة هنا...' : 'Enter artisan tailored notes here...'}
                />
              ) : (
                <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl leading-relaxed">
                  {order.bespokeDetails?.artisanNotes || (isAr ? 'لا توجد ملاحظات إضافية مسجلة.' : 'No notes recorded.')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 4. Purchased Items List */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'القطع والمنتجات المطلوبة' : 'Purchased Items'}</span>
            </span>
            <span className="text-slate-400 font-mono">
              {order.items.reduce((acc, cur) => acc + cur.quantity, 0)} {isAr ? 'قطع' : 'items'}
            </span>
          </h4>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl hover:border-slate-700 transition-colors"
              >
                {item.imageUrl?.trim() ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-800 shrink-0 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Package className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">{isAr ? item.name : item.nameEn}</h5>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                      {item.selectedSize}
                    </span>
                    {item.fabricOption && (
                      <span className="text-amber-300/90 truncate max-w-[200px]" title={item.fabricOption}>
                        • {item.fabricOption}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400 font-mono">
                      {isAr ? 'الكمية:' : 'Qty:'} {item.quantity} × {formatPrice(item.price)}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span className="font-mono text-slate-200">{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{isAr ? 'رسوم التوصيل والكونسيرج:' : 'Concierge White-Glove Delivery:'}</span>
              <span className="text-emerald-400 font-bold">{isAr ? 'مجاني (VIP)' : 'Complimentary'}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>{isAr ? 'المجموع الإجمالي:' : 'Grand Total:'}</span>
              <span className="font-mono text-emerald-400">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
