import React, { useRef } from 'react';
import {
  Image as ImageIcon,
  Check,
  Upload,
  RefreshCw,
  CheckCircle2,
  Link as LinkIcon,
} from 'lucide-react';
import { Card, Input } from '../ui';
import type { SiteSettings } from '../useAdminBridge';
import { BANNER_PRESETS } from './constants';

interface HeroBannerCardProps {
  isAr: boolean;
  formData: SiteSettings;
  handleChange: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
  isUploadingBanner: boolean;
  bannerUploadNotice: string | null;
  onBannerUpload: (files: FileList | null) => void;
}

export const HeroBannerCard: React.FC<HeroBannerCardProps> = ({
  isAr,
  formData,
  handleChange,
  isUploadingBanner,
  bannerUploadNotice,
  onBannerUpload,
}) => {
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'بنر الواجهة الرئيسي والمعاينة الحية' : 'Hero Promotional Banner Customizer'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'تحديد الصورة التجريدية، العنوان التحريري الفاخر، وأزرار الشراء السريعة.'
                : 'Configure background photography, luxury headlines, and hero CTA triggers.'}
            </p>
          </div>
        </div>
      </div>

      {/* Live Hero Banner Preview Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-[21/9] sm:aspect-[24/9] shadow-2xl group">
        <img
          src={formData.heroBannerBg}
          alt="Hero Background Preview"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 sm:p-8 flex flex-col justify-end">
          <div className="space-y-2 max-w-xl">
            {formData.heroBadgeAr && (
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {isAr ? formData.heroBadgeAr : formData.heroBadgeEn}
              </span>
            )}
            <h4 className="text-base sm:text-2xl font-black text-white leading-tight">
              {isAr ? formData.heroHeadlineAr : formData.heroHeadlineEn}
            </h4>
            <p className="text-xs text-slate-300/90 line-clamp-2">
              {isAr ? formData.heroSubtitleAr : formData.heroSubtitleEn}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-950">
                {isAr ? formData.heroCtaTextAr : formData.heroCtaTextEn}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Preset Gallery */}
      <div className="space-y-2.5 pt-2">
        <label className="block text-xs font-semibold text-slate-300 text-start">
          {isAr ? '1. معرض الصور الحصرية الجاهزة (Preset Gallery)' : '1. Curated Luxury Presets'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BANNER_PRESETS.map((preset, idx) => {
            const isSelected = formData.heroBannerBg === preset.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleChange('heroBannerBg', preset.url)}
                className={`relative rounded-xl overflow-hidden border aspect-video group cursor-pointer text-start transition-all ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                  <p className="text-[10px] font-semibold text-white truncate">
                    {isAr ? preset.nameAr : preset.name}
                  </p>
                </div>
                {isSelected && (
                  <span className="absolute top-1.5 end-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload to Supabase Storage & URL Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
        {/* Supabase Upload Button */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
            {isAr ? '2. رفع صورة بنر مخصصة (Supabase Storage)' : '2. Upload Custom Banner (Supabase Storage)'}
          </label>
          <input
            ref={bannerFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onBannerUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => bannerFileInputRef.current?.click()}
            disabled={isUploadingBanner}
            className="w-full h-24 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/70 bg-slate-900/50 hover:bg-slate-800/40 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-white cursor-pointer"
          >
            {isUploadingBanner ? (
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            ) : (
              <Upload className="w-6 h-6 text-indigo-400" />
            )}
            <span className="text-xs font-semibold">
              {isUploadingBanner
                ? isAr
                  ? 'جاري الرفع إلى سحابة Supabase...'
                  : 'Uploading to Supabase...'
                : isAr
                ? 'اضغط لاختيار صورة بنر عالية الدقة'
                : 'Click to select high-res banner'}
            </span>
            <span className="text-[10px] text-slate-500">
              {isAr ? 'حاوية التخزين: product-images / store-banners' : 'Storage bucket: product-images'}
            </span>
          </button>
          {bannerUploadNotice && (
            <p className="text-[11px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1 text-start">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              {bannerUploadNotice}
            </p>
          )}
        </div>

        {/* Direct URL Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
            {isAr ? 'أو رابط صورة البنر المباشر (URL CDN)' : 'Or Direct Image URL (CDN)'}
          </label>
          <Input
            value={formData.heroBannerBg}
            onChange={(e) => handleChange('heroBannerBg', e.target.value)}
            placeholder="https://images.unsplash.com/..."
            icon={LinkIcon}
          />
          <p className="text-[11px] text-slate-500 mt-2 text-start leading-relaxed">
            {isAr
              ? 'يمكنك وضع أي رابط صورة خارجي عالي الدقة (WebP, JPG, PNG).'
              : 'Direct URL to any cloud image or CDN asset.'}
          </p>
        </div>
      </div>

      {/* Banner Headlines & Subtitles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
        <Input
          label={isAr ? 'العنوان الرئيسي للبنر (بالعربية)' : 'Banner Headline (Arabic)'}
          value={formData.heroHeadlineAr}
          onChange={(e) => handleChange('heroHeadlineAr', e.target.value)}
        />
        <Input
          label={isAr ? 'العنوان الرئيسي للبنر (بالإنجليزية)' : 'Banner Headline (English)'}
          value={formData.heroHeadlineEn}
          onChange={(e) => handleChange('heroHeadlineEn', e.target.value)}
        />
        <Input
          label={isAr ? 'العنوان الفرعي للبنر (بالعربية)' : 'Banner Subtitle (Arabic)'}
          value={formData.heroSubtitleAr}
          onChange={(e) => handleChange('heroSubtitleAr', e.target.value)}
        />
        <Input
          label={isAr ? 'العنوان الفرعي للبنر (بالإنجليزية)' : 'Banner Subtitle (English)'}
          value={formData.heroSubtitleEn}
          onChange={(e) => handleChange('heroSubtitleEn', e.target.value)}
        />
        <Input
          label={isAr ? 'الشارة العلوية (Badge AR)' : 'Top Badge (Arabic)'}
          value={formData.heroBadgeAr}
          onChange={(e) => handleChange('heroBadgeAr', e.target.value)}
          placeholder="الموسم الجديد 2026"
        />
        <Input
          label={isAr ? 'الشارة العلوية (Badge EN)' : 'Top Badge (English)'}
          value={formData.heroBadgeEn}
          onChange={(e) => handleChange('heroBadgeEn', e.target.value)}
          placeholder="New Season 2026"
        />
        <Input
          label={isAr ? 'نص زر الشراء (CTA Text AR)' : 'Call To Action (Arabic)'}
          value={formData.heroCtaTextAr}
          onChange={(e) => handleChange('heroCtaTextAr', e.target.value)}
        />
        <Input
          label={isAr ? 'نص زر الشراء (CTA Text EN)' : 'Call To Action (English)'}
          value={formData.heroCtaTextEn}
          onChange={(e) => handleChange('heroCtaTextEn', e.target.value)}
        />
      </div>
    </Card>
  );
};
