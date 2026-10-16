import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import type { SiteSettings } from '../useAdminBridge';

interface SplashStudioCardProps {
  isAr: boolean;
  formData: SiteSettings;
  handleChange: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
  onOpenTestSplash: () => void;
}

export const SplashStudioCard: React.FC<SplashStudioCardProps> = ({
  isAr,
  formData,
  handleChange,
  onOpenTestSplash,
}) => {
  return (
    <Card className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'شاشة البداية' : 'Splash screen'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'الجملة الي تطلع تحت الشعار لحظة فتح الموقع. احفظ التغييرات قبل المعاينة.'
                : 'The line under the logo while the site opens. Save before previewing.'}
            </p>
          </div>
        </div>

        {/* Test Splash Screen Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onOpenTestSplash}
          className="gap-2 shrink-0"
          leftIcon={<Play className="w-4 h-4" />}
        >
          {isAr ? 'معاينة شاشة البداية' : 'Preview splash screen'}
        </Button>
      </div>

      {/* Text Customization & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 text-start">
              {isAr ? 'النص بالعربي' : 'Arabic text'}
            </label>
            <span className="text-[10px] text-slate-500">
              {isAr ? 'اتركه فارغ للنص الافتراضي' : 'Leave empty for the default'}
            </span>
          </div>
          <Input
            value={formData.splashTextAr}
            onChange={(e) => handleChange('splashTextAr', e.target.value)}
            placeholder="لحظة ونجهزلك التشكيلة"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 text-start">
              {isAr ? 'النص بالإنگليزي' : 'English text'}
            </label>
            <span className="text-[10px] text-slate-500">{isAr ? 'اتركه فارغ للنص الافتراضي' : 'Leave empty for the default'}</span>
          </div>
          <Input
            value={formData.splashTextEn}
            onChange={(e) => handleChange('splashTextEn', e.target.value)}
            placeholder="Getting the collection ready"
          />
        </div>
      </div>

    </Card>
  );
};
