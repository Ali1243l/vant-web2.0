import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useAdminBridge, SiteSettings } from './useAdminBridge';
import { Button } from './ui';

import { SettingsHeader } from './settings/SettingsHeader';
import { MaintenanceModeCard } from './settings/MaintenanceModeCard';
import { SplashStudioCard } from './settings/SplashStudioCard';
import { StoreSecurityCard } from './settings/StoreSecurityCard';
import { SplashPreviewModal } from './settings/SplashPreviewModal';

export const SettingsView: React.FC = () => {
  const { lang, siteSettings, updateSiteSettings, setCurrentStore, setActiveView } = useAdminBridge();
  const isAr = lang === 'ar';

  // Local form state cloned from siteSettings
  const [formData, setFormData] = useState<SiteSettings>(siteSettings);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; sub?: string } | null>(null);
  const [isTestSplashOpen, setIsTestSplashOpen] = useState(false);

  // Sync when siteSettings change externally
  useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  // Handle setting updates
  const handleChange = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const showToast = (text: string, sub?: string) => {
    setToastMessage({ text, sub });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Immediate toggle for critical flags (like Maintenance Mode) with auto-sync
  const handleImmediateToggle = async (key: keyof SiteSettings, value: any) => {
    handleChange(key, value);
    const result = await updateSiteSettings({ [key]: value });
    showToast(
      isAr ? 'تم تحديث الإعدادات فورياً' : 'Setting updated instantly',
      result.syncedWithCloud
        ? isAr ? 'متزامن مع سحابة Supabase' : 'Synced with Supabase Cloud'
        : isAr ? 'تم الحفظ محلياً' : 'Saved locally'
    );
  };

  // Save all settings
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      setCurrentStore(formData.storeName);

      // Credentials are changed only from the Security tab.
      const { pin: _pin, ...payload } = formData;

      const res = await updateSiteSettings(payload);

      showToast(
        isAr ? 'تم حفظ كافة إعدادات المتجر بنجاح' : 'All store settings saved successfully',
        res.syncedWithCloud
          ? isAr ? 'تمت المزامنة الحية مع Supabase' : 'Synced live with Supabase cloud'
          : isAr ? 'تم الحفظ في التخزين المحلي الآمن' : 'Saved to local storage'
      );
    } catch (err) {
      console.error(err);
      showToast(isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <SettingsHeader
        isAr={isAr}
        isSaving={isSaving}
        onSaveAll={() => handleSaveAll()}
        toastMessage={toastMessage}
        onClearToast={() => setToastMessage(null)}
      />

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* SECTION 1: GLOBAL MAINTENANCE MODE */}
        <MaintenanceModeCard
          isAr={isAr}
          formData={formData}
          handleChange={handleChange}
          handleImmediateToggle={handleImmediateToggle}
        />

        {/* SECTION 2: SPLASH SCREEN CUSTOMIZER & TEST LAUNCHER */}
        <SplashStudioCard
          isAr={isAr}
          formData={formData}
          handleChange={handleChange}
          onOpenTestSplash={() => setIsTestSplashOpen(true)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 p-5">
          <p className="text-sm text-slate-300">{isAr ? 'إعدادات الصورة والتدرّج والنصوص موجودة في صفحة البانر والترحيب.' : 'Image, fade and caption settings live in Banner & welcome.'}</p>
          <Button type="button" onClick={() => setActiveView('banners')}>{isAr ? 'تخصيص البانر' : 'Customize banner'}</Button>
        </div>

        {/* SECTION 4: STORE IDENTITY & SECURITY */}
        <StoreSecurityCard
          isAr={isAr}
          formData={formData}
          handleChange={handleChange}
          showSecurity={false}
          tempPin=""
          setTempPin={() => {}}
          showPin={false}
          setShowPin={() => {}}
        />

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            {isAr
              ? 'تتم المزامنة التلقائية مع Supabase عند توفر المفاتيح، مع حفظ احتياطي محلي دائم.'
              : 'Auto-syncs with Supabase if configured, with resilient local storage backup.'}
          </p>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            className="px-8 shadow-lg shadow-indigo-950/40"
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isAr ? 'حفظ كافة التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* FULL-SCREEN CINEMATIC TEST SPLASH SCREEN OVERLAY */}
      <SplashPreviewModal
        isOpen={isTestSplashOpen}
        onClose={() => setIsTestSplashOpen(false)}
        isAr={isAr}
        formData={formData}
      />
    </div>
  );
};

export default SettingsView;
