import React from 'react';
import { Bell } from 'lucide-react';
import { Card, Switch } from '../ui';
import type { SiteSettings } from '../useAdminBridge';

interface NotificationsCardProps {
  isAr: boolean;
  formData: SiteSettings;
  handleChange: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({
  isAr,
  formData,
  handleChange,
}) => {
  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">
            {isAr ? 'التنبيهات التلقائية وإشعارات الإدارة' : 'Automated Operational Notifications'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'تفعيل وتخصيص إشعارات البريد الإلكتروني والـ SMS للطلبات الجديدة ونفاد المخزون.'
              : 'Configure email & SMS alerts for new purchases and stock alerts.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <Switch
            checked={formData.emailAlerts}
            onChange={(checked) => handleChange('emailAlerts', checked)}
            label={isAr ? 'تنبيهات البريد للطلبات الجديدة' : 'Email Alerts on Orders'}
            description={isAr ? 'إشعار عند كل عملية بيع' : 'Instant mail alert'}
          />
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <Switch
            checked={formData.smsAlerts}
            onChange={(checked) => handleChange('smsAlerts', checked)}
            label={isAr ? 'رسائل SMS للمخزون المنخفض' : 'SMS Low Stock Alerts'}
            description={isAr ? 'تنبيه عند اقتراب النفاذ' : 'SMS when < 5 units'}
          />
        </div>
      </div>
    </Card>
  );
};
