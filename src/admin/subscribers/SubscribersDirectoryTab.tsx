import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  CheckCircle2,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { Card, StatusBadge, Input } from '../ui';
import type { Subscriber } from '../useAdminBridge';

interface Props {
  subscribers: Subscriber[];
  filteredSubscribers: Subscriber[];
  totalSpentAll: number;
  search: string;
  setSearch: (v: string) => void;
  filterStatus: 'all' | 'active' | 'unsubscribed';
  setFilterStatus: (v: 'all' | 'active' | 'unsubscribed') => void;
  deleteSubscriber: (id: string) => void;
  isAr: boolean;
  formatCurrency: (val: number, cur: any, lang: string) => string;
}

export const SubscribersDirectoryTab: React.FC<Props> = ({
  subscribers,
  filteredSubscribers,
  totalSpentAll,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  deleteSubscriber,
  isAr,
  formatCurrency,
}) => {
  return (
    <motion.div
      key="tab-directory"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{isAr ? 'إجمالي العملاء' : 'Total Subscribers'}</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{subscribers.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAr ? 'قاعدة بيانات العملاء المسجلين' : 'Auto-synced with store accounts'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{isAr ? 'المشتركون النشطون' : 'Active Subscribers'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {subscribers.filter((s) => s.status === 'active').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAr ? 'مستعدون لاستقبال الحملات الإعلانية' : 'Ready for campaign broadcasts'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{isAr ? 'إجمالي المشتريات (بالدينار العراقي)' : 'Total Customer Value (IQD)'}</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totalSpentAll, 'IQD', isAr ? 'ar' : 'en')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isAr ? 'عائد المبيعات التراكمي للعملاء بالدينار' : 'Cumulative sales volume in IQD'}
          </p>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1">
            <Input
              icon={Search}
              placeholder={
                isAr
                  ? 'ابحث بالاسم، البريد الإلكتروني أو رقم الهاتف...'
                  : 'Search subscriber name, email or phone...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="active">{isAr ? 'نشط في القائمة' : 'Active Only'}</option>
              <option value="unsubscribed">{isAr ? 'ملغي الاشتراك' : 'Unsubscribed'}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Subscribers Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-start">{isAr ? 'العميل' : 'Customer'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'بيانات الاتصال' : 'Contact'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'الطلبات' : 'Orders'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'إجمالي المشتريات (IQD)' : 'Total Spent (IQD)'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الانضمام' : 'Joined'}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="py-3.5 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Name and Tags */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white text-sm">{sub.name}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {sub.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Email & Phone */}
                  <td className="py-3 px-4">
                    <div className="text-slate-300 font-mono text-xs">{sub.email}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{sub.phone}</div>
                  </td>

                  {/* Orders */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-white">{sub.totalOrders}</span> {isAr ? 'طلب' : 'orders'}
                  </td>

                  {/* Total Spent in Iraqi Dinar */}
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-400">
                    {formatCurrency(sub.totalSpent, 'IQD', isAr ? 'ar' : 'en')}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono">
                    {sub.joinedDate}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge
                      status={sub.status === 'active' ? 'active' : 'inactive'}
                      label={
                        sub.status === 'active'
                          ? isAr
                            ? 'نشط'
                            : 'Active'
                          : isAr
                          ? 'ملغي الاشتراك'
                          : 'Unsubscribed'
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-end whitespace-nowrap">
                    <button
                      onClick={() => deleteSubscriber(sub.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">
                    {isAr ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching subscribers found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};
