import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useAdminBridge, SiteSettings } from './useAdminBridge';
import { Button } from './ui';

import { SettingsHeader } from './settings/SettingsHeader';
import { MaintenanceModeCard } from './settings/MaintenanceModeCard';
import { SplashStudioCard } from './settings/SplashStudioCard';
import { HeroBannerCard } from './settings/HeroBannerCard';
import { StoreSecurityCard } from './settings/StoreSecurityCard';
import { useSiteControls } from '../context/SiteControlsContext';

export const SettingsView: React.FC = () => {
  const { lang, siteSettings, updateSiteSettings, setCurrentStore } = useAdminBridge();
  const isAr = lang === 'ar';

  // Local form state cloned from siteSettings
  const [formData, setFormData] = useState<SiteSettings>(siteSettings);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; sub?: string } | null>(null);
  const { setIsPreviewSplash } = useSiteControls();
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadNotice, setBannerUploadNotice] = useState<string | null>(null);

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
      const res = await updateSiteSettings(formData);

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

  // Handle banner image upload with Supabase Storage support
  const handleBannerUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setBannerUploadNotice(isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    setIsUploadingBanner(true);
    setBannerUploadNotice(null);

    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const fileName = `banner-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const uploadRes = await fetch(
          `${supabaseUrl}/storage/v1/object/product-images/${fileName}`,
          {
            method: 'POST',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': file.type,
            },
            body: file,
          }
        );

        if (uploadRes.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${fileName}`;
          handleChange('heroBannerBg', publicUrl);
          setBannerUploadNotice(
            isAr ? 'تم رفع البنر بنجاح إلى Supabase Storage' : 'Banner uploaded to Supabase Storage'
          );
          setIsUploadingBanner(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase banner upload error, falling back to local preview:', err);
      }
    }

    // Local data URL preview fallback
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        handleChange('heroBannerBg', dataUrl);
        setBannerUploadNotice(
          isAr
            ? 'تم تحميل البنر للمعاينة المحلية الفورية'
            : 'Banner loaded for instant local preview'
        );
      }
      setIsUploadingBanner(false);
    };
    reader.onerror = () => {
      setBannerUploadNotice(isAr ? 'فشل تحميل الصورة' : 'Failed to read image');
      setIsUploadingBanner(false);
    };
    reader.readAsDataURL(file);
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
          onOpenTestSplash={() => setIsPreviewSplash(true)}
        />

        {/* SECTION 3: STORE FRONT BANNERS (HERO BANNER) */}
        <HeroBannerCard
          isAr={isAr}
          formData={formData}
          handleChange={handleChange}
          isUploadingBanner={isUploadingBanner}
          bannerUploadNotice={bannerUploadNotice}
          onBannerUpload={handleBannerUpload}
        />

        {/* SECTION 4: STORE IDENTITY & SECURITY */}
        <StoreSecurityCard
          isAr={isAr}
          formData={formData}
          handleChange={handleChange}
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
    </div>
  );
};

export default SettingsView;
