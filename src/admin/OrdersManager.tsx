import React, { useMemo, useState } from 'react';
import { LayoutGrid, List, Search, Eye, ShoppingBag } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { useAdminBridge, type Order, type OrderStatus } from './useAdminBridge';
import { OrderDetailsSheet } from './OrderDetailsSheet';
import { Button } from './ui';
import { DateRangeFilterWidget } from '../components/admin/widgets/DateRangeFilterWidget';
import { PaginationWidget } from '../components/admin/widgets/PaginationWidget';
import { normalizeOrders, filterOrders, orderMetrics, orderStatuses, orderStatusLabels } from '../lib/orderModel';

import { formatCurrency } from './format';

export const OrdersManager: React.FC = () => {
  const { orders: storedOrders, lang } = useAdminBridge();
  const isAr = lang === 'ar';

  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [range, setRange] = useState<DateRange>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const orders = useMemo(() => normalizeOrders(storedOrders), [storedOrders]);
  const filtered = useMemo(() => filterOrders(orders, { query, type, status, sort, from: range?.from, to: range?.to }), [orders, query, type, status, sort, range]);
  const metrics = orderMetrics(filtered);
  const selected = orders.find(order => order.id === selectedId) || null;
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const money = (amount: number) => formatCurrency(amount, 'IQD', lang);
  const label = (value: OrderStatus) => orderStatusLabels[value][isAr ? 'ar' : 'en'];
  const date = (value: string) => value ? new Date(value).toLocaleDateString(isAr ? 'ar-IQ' : 'en-GB') : '—';
  const resetFilters = () => { setQuery(''); setType('all'); setStatus('all'); setRange(undefined); setSort('newest'); setPage(1); };
  const hasFilters = !!query || type !== 'all' || status !== 'all' || !!range?.from || sort !== 'newest';
  const statusClass = (value: OrderStatus) => value === 'cancelled' ? 'text-rose-300 border-rose-500/30' : value === 'delivered' ? 'text-emerald-300 border-emerald-500/30' : 'text-indigo-300 border-slate-700';

  return <div className="orders-manager min-w-0 space-y-5 text-start">
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div><h2 className="text-xl sm:text-2xl font-bold text-white">{isAr ? 'إدارة الطلبات' : 'Order management'}</h2>
          <p className="text-sm text-slate-400 mt-2">{isAr ? 'متابعة الطلب من التأكيد إلى التسليم، مع سجل تغييرات واضح.' : 'Track orders from confirmation to delivery with a clear change history.'}</p></div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-slate-700 p-1" role="group" aria-label={isAr ? 'طريقة عرض الطلبات' : 'Order display'}>
            <Button size="sm" variant={view === 'kanban' ? 'primary' : 'ghost'} aria-pressed={view === 'kanban'} onClick={() => setView('kanban')}><LayoutGrid className="w-4 h-4 me-2" />{isAr ? 'المراحل' : 'Stages'}</Button>
            <Button size="sm" variant={view === 'table' ? 'primary' : 'ghost'} aria-pressed={view === 'table'} onClick={() => setView('table')}><List className="w-4 h-4 me-2" />{isAr ? 'الجدول' : 'Table'}</Button>
          </div>
        </div>
      </div>
      {storedOrders.length > orders.length && <p role="alert" className="text-xs text-amber-300">{isAr ? 'استُبعدت سجلات مكررة أو غير صالحة؛ راجع المصدر قبل التشغيل الفعلي.' : 'Duplicate or invalid records were excluded; review the source before live use.'}</p>}
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        [isAr ? 'الطلبات المطابقة' : 'Matching orders', metrics.total],
        [isAr ? 'بانتظار التأكيد' : 'Pending confirmation', metrics.pending],
        [isAr ? 'قيد التجهيز' : 'Processing', metrics.processing],
        [isAr ? 'تم التسليم' : 'Delivered', metrics.delivered],
        [isAr ? 'ملغي' : 'Cancelled', metrics.cancelled],
        [isAr ? 'إيراد الطلبات المسلّمة' : 'Delivered revenue', money(metrics.revenue)],
      ].map(([title, value]) => <div key={title} className="min-w-0 rounded-xl bg-slate-900 border border-slate-800 p-4"><p className="text-xs text-slate-400">{title}</p><p className="mt-3 text-lg font-bold text-white break-words">{value}</p></div>)}
    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 items-end">
        <label className="block text-xs text-slate-400">{isAr ? 'البحث بالطلب أو العميل أو القطعة' : 'Search order, customer or item'}<div className="relative mt-2"><Search className="absolute start-3 top-3 w-4 h-4" /><input aria-label={isAr ? 'بحث الطلبات' : 'Search orders'} value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} className="w-full min-h-11 rounded-xl bg-slate-950 border border-slate-700 ps-9 pe-3 text-white" /></div></label>
        <label className="text-xs text-slate-400">{isAr ? 'حالة الطلب' : 'Order status'}<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="mt-2 w-full min-h-11 rounded-xl bg-slate-950 border border-slate-700 px-3 text-white"><option value="all">{isAr ? 'كل الحالات' : 'All statuses'}</option>{orderStatuses.map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>
        <label className="text-xs text-slate-400">{isAr ? 'نوع الطلب' : 'Order type'}<select value={type} onChange={event => { setType(event.target.value); setPage(1); }} className="mt-2 w-full min-h-11 rounded-xl bg-slate-950 border border-slate-700 px-3 text-white"><option value="all">{isAr ? 'كل الأنواع' : 'All types'}</option><option value="ready_to_wear">{isAr ? 'جاهز' : 'Ready to wear'}</option><option value="bespoke">{isAr ? 'تفصيل خاص' : 'Bespoke'}</option></select></label>
        <label className="text-xs text-slate-400">{isAr ? 'ترتيب الطلبات' : 'Sort orders'}<select value={sort} onChange={event => { setSort(event.target.value); setPage(1); }} className="mt-2 w-full min-h-11 rounded-xl bg-slate-950 border border-slate-700 px-3 text-white"><option value="newest">{isAr ? 'الأحدث أولاً' : 'Newest first'}</option><option value="oldest">{isAr ? 'الأقدم أولاً' : 'Oldest first'}</option><option value="value">{isAr ? 'الأعلى قيمة' : 'Highest value'}</option></select></label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3"><DateRangeFilterWidget value={range} onChange={value => { setRange(value); setPage(1); }} lang={lang} label={isAr ? 'تاريخ التسجيل' : 'Created date'} />{hasFilters && <Button size="sm" variant="outline" onClick={resetFilters}>{isAr ? 'مسح الفلاتر' : 'Clear filters'}</Button>}</div>
      <p role="status" className="text-xs text-slate-400">{filtered.length} / {orders.length} {isAr ? 'طلب · الأرقام أعلاه تتبع الفلاتر. الإيراد للمسلّم فقط ولا يثبت تحصيل الدفع.' : 'orders · Metrics follow filters. Delivered revenue does not confirm payment collection.'}</p>
    </div>

    {orders.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400"><ShoppingBag className="mx-auto mb-3 w-8 h-8" /><p>{isAr ? 'لا توجد طلبات محمّلة حالياً.' : 'No orders are currently loaded.'}</p></div> : filtered.length === 0 ? <p role="status" className="text-center py-10 text-slate-400">{isAr ? 'لا توجد طلبات تطابق الفلاتر.' : 'No orders match these filters.'}</p> : view === 'kanban' ?
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 items-start">
        {orderStatuses.filter(value => status === 'all' || status === value).map(value => { const column = filtered.filter(order => order.status === value); return <section key={value} aria-label={label(value)} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden"><div className="p-4 border-b border-slate-800 flex justify-between gap-2"><h3 className={`text-sm font-semibold ${statusClass(value)}`}>{label(value)}</h3><span className="text-xs text-slate-400">{column.length}</span></div><div className="p-3 space-y-3 max-h-[65dvh] overflow-y-auto overscroll-contain">{column.length ? column.map(order => <button key={order.id} onClick={() => setSelectedId(order.id)} className="w-full text-start rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-indigo-400 focus-visible:outline-2 focus-visible:outline-indigo-400 space-y-2"><span className="block text-xs font-mono text-indigo-300 break-all">#{order.id}</span><span className="block font-semibold text-white text-sm">{order.customerName || '—'}</span><span className="block text-xs text-slate-400">{date(order.orderDate)} · {order.type === 'bespoke' ? (isAr ? 'تفصيل خاص' : 'Bespoke') : (isAr ? 'جاهز' : 'Ready to wear')}</span><span className="block text-xs text-slate-300 truncate">{order.items.map(item => isAr ? item.name : item.nameEn).join('، ') || '—'}</span><span className="block text-sm font-semibold text-emerald-300">{money(order.totalPrice)}</span><span className="block text-xs text-indigo-300">{isAr ? 'عرض التفاصيل' : 'View details'}</span></button>) : <p className="py-6 text-center text-xs text-slate-500">{isAr ? 'لا توجد طلبات بهذه المرحلة' : 'No orders in this stage'}</p>}</div></section>; })}
      </div> : <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-800"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-start text-sm"><thead className="bg-slate-900 text-slate-400"><tr>{[isAr ? 'الطلب' : 'Order', isAr ? 'العميل' : 'Customer', isAr ? 'التاريخ' : 'Date', isAr ? 'الحالة' : 'Status', isAr ? 'القيمة المسجّلة' : 'Recorded value', isAr ? 'التفاصيل' : 'Details'].map(title => <th key={title} scope="col" className="p-4 text-start">{title}</th>)}</tr></thead><tbody className="divide-y divide-slate-800">{visible.map(order => <tr key={order.id} className="bg-slate-950/30"><td className="p-4 font-mono text-indigo-300">#{order.id}</td><td className="p-4 text-white">{order.customerName || '—'}</td><td className="p-4 text-slate-400">{date(order.orderDate)}</td><td className={`p-4 ${statusClass(order.status)}`}>{label(order.status)}</td><td className="p-4 text-emerald-300">{money(order.totalPrice)}</td><td className="p-4"><Button size="icon" variant="outline" aria-label={`${isAr ? 'تفاصيل الطلب' : 'Order details'} ${order.id}`} onClick={() => setSelectedId(order.id)}><Eye className="w-4 h-4" /></Button></td></tr>)}</tbody></table></div><div className="p-3"><PaginationWidget currentPage={safePage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={value => { setPageSize(value); setPage(1); }} pageSizeOptions={[8, 12, 25]} lang={lang} itemLabel={isAr ? 'طلب' : 'orders'} /></div></div>}

    <OrderDetailsSheet order={selected} isOpen={!!selected} onClose={() => setSelectedId(null)} />
  </div>;
};
export default OrdersManager;
