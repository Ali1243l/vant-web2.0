import React from 'react';
import { Sliders, Check } from 'lucide-react';
import { Button } from '../ui';
import ToastNotification from '../../components/ToastNotification';

interface SettingsHeaderProps {
  isAr: boolean;
  isSaving: boolean;
  onSaveAll: () => void;
  toastMessage: { text: string; sub?: string } | null;
  onClearToast: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  isAr,
  isSaving,
  onSaveAll,
  toastMessage,
  onClearToast,
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isAr ? 'الإعدادات والتحكم الشامل بالمتجر' : 'Master Site Controls & Settings'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'التحكم المباشر في جاهزية واجهة المتجر للعملاء، شاشة التحميل السينمائية، البنرات الترويجية، وأرقام خدمة الواتساب.'
              : 'Govern storefront accessibility, cinematic splash branding, promotional hero banners, and VIP WhatsApp concierges.'}
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onSaveAll}
            isLoading={isSaving}
            variant="primary"
            className="px-5 shadow-lg shadow-indigo-950/50"
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isAr ? 'حفظ كافة الإعدادات' : 'Save All Settings'}
          </Button>
        </div>
      </div>

      <ToastNotification message={toastMessage} onClose={onClearToast} position="top-end" />
    </>
  );
};
