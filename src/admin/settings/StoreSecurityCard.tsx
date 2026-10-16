import React from 'react';
import { Store, Link as LinkIcon } from 'lucide-react';
import { Card, Input } from '../ui';
import type { SiteSettings } from '../useAdminBridge';

interface StoreSecurityCardProps {
  isAr: boolean;
  formData: SiteSettings;
  handleChange: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}

export const StoreSecurityCard: React.FC<StoreSecurityCardProps> = ({
  isAr,
  formData,
  handleChange,
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
              ? 'اسم المتجر ورابط الموقع.'
              : 'Store name and website address.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={isAr ? 'اسم المتجر' : 'Storefront Name'}
          value={formData.storeName || ''}
          onChange={(e) => handleChange('storeName', e.target.value)}
          placeholder="فانت VANT"
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

    </Card>
  );
};
