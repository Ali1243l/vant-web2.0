import React from 'react';
import { ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { motion } from '../motion';
import { Card, Switch, Input } from '../ui';
import type { SiteSettings } from '../useAdminBridge';

interface MaintenanceModeCardProps {
  isAr: boolean;
  formData: SiteSettings;
  handleChange: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
  handleImmediateToggle: (key: keyof SiteSettings, value: any) => void;
}

export const MaintenanceModeCard: React.FC<MaintenanceModeCardProps> = ({
  isAr,
  formData,
  handleChange,
  handleImmediateToggle,
}) => {
  return (
    <Card
      className={`space-y-6 transition-all duration-300 ${
        formData.maintenanceMode
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900/90 shadow-lg shadow-amber-950/20'
          : 'border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              formData.maintenanceMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {isAr ? 'وضع الصيانة العام وقفل المتجر' : 'Global Maintenance Mode'}
              </h3>
              {formData.maintenanceMode ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {isAr ? 'المتجر مقفل حالياً' : 'Store Locked'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {isAr ? 'المتجر متاح ومباشر للعملاء' : 'Storefront Live'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'عند تفعيل هذا الخيار، يتم حجب الكتالوج والشراء عن الزوار وعرض شاشة توقف راقية مخصصة مع إبقاء لوحة الإدارة مفتوحة.'
                : 'Locks the customer storefront with an exquisite downtime splash while keeping admin access intact.'}
            </p>
          </div>
        </div>

        {/* Premium Toggle Switch */}
        <div className="shrink-0 flex items-center gap-3">
          <Switch
            checked={formData.maintenanceMode}
            onChange={(checked) => handleImmediateToggle('maintenanceMode', checked)}
            label={
              formData.maintenanceMode
                ? isAr
                  ? 'مفعّل (قيد الصيانة)'
                  : 'Enabled (Locked)'
                : isAr
                ? 'معطل (مفتوح)'
                : 'Disabled (Live)'
            }
          />
        </div>
      </div>

      {/* Maintenance Customization Details */}
      {formData.maintenanceMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 pt-2 border-t border-slate-800/60"
        >
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              {isAr
                ? 'تنبيه: المتجر حالياً لا يستقبل أي طلبات شراء جديدة من العملاء العاديين. يمكنك تعديل رسالة الاعتذار والوقت المقدر للعودة أدناه.'
                : 'Notice: Normal visitors currently see the maintenance screen and cannot place orders. Configure the public apology message below.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
                {isAr ? 'رسالة الصيانة للعملاء (بالعربية)' : 'Maintenance Notice (Arabic)'}
              </label>
              <textarea
                rows={3}
                value={formData.maintenanceMessageAr}
                onChange={(e) => handleChange('maintenanceMessageAr', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="نعتذر عن استقبال الطلبات مؤقتاً..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
                {isAr ? 'رسالة الصيانة للعملاء (بالإنجليزية)' : 'Maintenance Notice (English)'}
              </label>
              <textarea
                rows={3}
                value={formData.maintenanceMessageEn}
                onChange={(e) => handleChange('maintenanceMessageEn', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="We are currently upgrading our store..."
              />
            </div>
          </div>

          <div className="max-w-md">
            <Input
              label={isAr ? 'الموعد المقدر للعودة واستئناف البيع' : 'Estimated Return Time / Reopen ETA'}
              value={formData.maintenanceEstimatedBack}
              onChange={(e) => handleChange('maintenanceEstimatedBack', e.target.value)}
              placeholder={isAr ? 'خلال ساعتين (2 Hours)' : 'Within 2 Hours'}
              icon={Clock}
            />
          </div>
        </motion.div>
      )}
    </Card>
  );
};
