import React from 'react';
import { Store, KeyRound, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';
import { Card, Input } from '../ui';
import type { SiteSettings } from '../useAdminBridge';

interface StoreSecurityCardProps {
  isAr: boolean;
  showSecurity?: boolean;
  formData: SiteSettings;
  handleChange: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
  tempPin: string;
  setTempPin: (val: string) => void;
  showPin: boolean;
  setShowPin: (val: boolean) => void;
}

export const StoreSecurityCard: React.FC<StoreSecurityCardProps> = ({
  isAr,
  showSecurity = true,
  formData,
  handleChange,
  tempPin,
  setTempPin,
  showPin,
  setShowPin,
}) => {
  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">
            {isAr ? 'هوية المتجر' : 'Store identity'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAr
              ? 'تحديث اسم المتجر المعروض ورابط الموقع. إعدادات الدخول في تبويب الأمان.'
              : 'Update store branding and public URL. Access settings are in the Security tab.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={isAr ? 'اسم المتجر' : 'Storefront Name'}
          value={formData.storeName || ''}
          onChange={(e) => handleChange('storeName', e.target.value)}
          placeholder="فانت"
          icon={Store}
        />

        <Input
          label={isAr ? 'رابط الموقع الرسمي (Domain URL)' : 'Public Domain URL'}
          value={(formData as any).storeUrl || (formData as any).custom_store_url || ''}
          onChange={(e) => handleChange('storeUrl' as any, e.target.value)}
          placeholder="https://vant.store"
          icon={LinkIcon}
        />
      </div>

      {/* Security PIN Field */}
      {showSecurity && <div className="pt-2 border-t border-slate-800/60 max-w-md">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
          {isAr ? 'رمز PIN السري لوحة التحكم (Admin Master PIN)' : 'Admin Master PIN Passkey'}
        </label>
        <div className="relative">
          <Input
            type={showPin ? 'text' : 'password'}
            value={tempPin}
            onChange={(e) => setTempPin(e.target.value)}
            placeholder="1234"
            maxLength={6}
            icon={KeyRound}
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-white p-1"
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5 text-start">
          {isAr
            ? 'يستخدم هذا الرمز لإلغاء قفل لوحة التحكم فوراً عند الضغط على قفل اللوحة أو بعد فترات الخمول.'
            : 'Protects the administrative console from unauthorized access.'}
        </p>
      </div>}
    </Card>
  );
};
