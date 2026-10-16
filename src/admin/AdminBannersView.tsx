import React, { useState, useRef } from 'react';
import { useAdminBridge } from './useAdminBridge';
import { useSiteControls } from '../context/SiteControlsContext';
import { uploadImageToSupabase, fileToOptimizedDataUrl } from '../lib/storage';
import {
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Layers,
  Upload,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  FolderOpen,
} from 'lucide-react';

export const AdminBannersView: React.FC = () => {
  const { lang } = useAdminBridge();
  const {
    controls,
    updateControl,
    toggleVisibility,
    trendItems,
    updateTrendItem,
    resetTrendsToDefault,
  } = useSiteControls();

  const isAr = lang === 'ar';
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroUploadNotice, setHeroUploadNotice] = useState<string | null>(null);
  const [uploadingTrendId, setUploadingTrendId] = useState<string | null>(null);
  const [trendUploadNotice, setTrendUploadNotice] = useState<Record<string, string>>({});
  const [draggingTrendId, setDraggingTrendId] = useState<string | null>(null);
  const [isDraggingHero, setIsDraggingHero] = useState(false);

  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const heroPresets = [
    { name: isAr ? 'أزياء فاخرة' : 'High Fashion', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80' },
    { name: isAr ? 'تصميم هندسي' : 'Editorial Minimal', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1920&q=80' },
    { name: isAr ? 'استوديو الأزياء' : 'Studio Atelier', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80' },
    { name: isAr ? 'أقمشة كلاسيك' : 'Tailoring Texture', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80' },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleHeroFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast(isAr ? 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)' : 'Please select a valid image file');
      return;
    }
    setIsUploadingHero(true);
    setHeroUploadNotice(null);
    try {
      const uploadedUrl = await uploadImageToSupabase(file, 'banners');
      if (uploadedUrl) {
        updateControl('banner_hero_bg', { actionValue: uploadedUrl });
        setHeroUploadNotice(isAr ? '✓ تم رفع صورة الغلاف كملف وحفظها بنجاح' : 'Banner uploaded successfully');
        setTimeout(() => setHeroUploadNotice(null), 4000);
        showToast(isAr ? '✓ تم رفع صورة البنر بنجاح' : 'Hero banner uploaded');
      }
    } catch (err) {
      console.warn('Supabase upload fallback to optimized data URL:', err);
      try {
        const fallback = await fileToOptimizedDataUrl(file);
        updateControl('banner_hero_bg', { actionValue: fallback });
        showToast(isAr ? '✓ تم حفظ الصورة بنجاح' : 'Image saved');
      } catch {
        showToast(isAr ? 'تعذر قراءة ملف الصورة' : 'Failed to read image');
      }
    } finally {
      setIsUploadingHero(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  const handleTrendFileUpload = async (trendId: string, file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast(isAr ? 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)' : 'Please select a valid image file');
      return;
    }
    setUploadingTrendId(trendId);
    try {
      const uploadedUrl = await uploadImageToSupabase(file, 'trends');
      if (uploadedUrl) {
        updateTrendItem(trendId, { image: uploadedUrl });
        setTrendUploadNotice((prev) => ({
          ...prev,
          [trendId]: isAr ? '✓ تم رفع الصورة كملف بنجاح' : 'Image uploaded',
        }));
        setTimeout(() => {
          setTrendUploadNotice((prev) => {
            const next = { ...prev };
            delete next[trendId];
            return next;
          });
        }, 4000);
        showToast(isAr ? '✓ تم رفع وتحديث صورة التريند كملف بنجاح' : 'Trend image uploaded');
      }
    } catch (err) {
      console.warn('Error uploading trend image, fallback:', err);
      try {
        const fallback = await fileToOptimizedDataUrl(file);
        updateTrendItem(trendId, { image: fallback });
        showToast(isAr ? '✓ تم حفظ الصورة بنجاح' : 'Image saved');
      } catch {
        showToast(isAr ? 'تعذر قراءة ملف الصورة' : 'Failed to read image');
      }
    } finally {
      setUploadingTrendId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 start-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {isAr ? 'البانرات واستوديو وسائط المتجر والمقاسات' : 'Banners, Media & Specs Studio'}
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {isAr ? 'دقة فائقة' : 'Ultra High-Res'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'رفع الصور كملفات مباشرة من جهازك، تعديل خلفيات البنرات الرئيسية، بطاقات التريندات، ونصوص الترويسة.'
                  : 'Upload images directly as files from your device, customize hero backdrops, trend cards, and headline banners.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm(isAr ? 'هل تريد استعادة التريندات الافتراضية؟' : 'Reset trend items?')) {
                resetTrendsToDefault();
                showToast(isAr ? 'تمت استعادة التريندات' : 'Trends reset');
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعادة التريندات' : 'Reset Trends'}</span>
          </button>
        </div>
      </div>

      {/* High-Fashion Image Dimensions Specification Guide */}
      <div className="bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-amber-400 mb-3">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            {isAr ? 'دليل المقاسات والأبعاد المثالية للصور (Image Dimension Specifications)' : 'Master Image Sizing & Specs'}
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {isAr
            ? 'لضمان ظهور الصور بأعلى نقاوة وفخامة معمارية دون تشويه أو اقتصاص غير مرغوب، يمكنك رفع الملفات بأي حجم وسيقوم النظام بضبطها تلقائياً، مع التوصية بالأبعاد التالية:'
            : 'Adhere to recommended resolutions for pristine editorial reproduction:'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{isAr ? 'خلفية البنر الترحيبي' : 'Hero Backdrop'}</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">1920 × 600 px</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">16:5 (أفقي بانورامي)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{isAr ? 'كروت تريندات 2026' : 'Trend Cards'}</span>
              <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">800 × 1000 px</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">4:5 (بورتريه أزياء)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{isAr ? 'صورة المنتج الرئيسية' : 'Primary Product'}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">1200 × 1500 px</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">4:5 (عالي الدقة)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{isAr ? 'صور الزوايا والتفاصيل' : 'Angles & Zoom'}</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">1200 × 1500 px</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">4:5 أو 1:1</div>
          </div>
        </div>
      </div>

      {/* Card 1: Welcome Hero Banner Customizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'البنر الترحيبي العريض (Hero Banner)' : 'Storefront Hero Banner'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'تخصيص صورة خلفية الترويسة الرئيسية وعنوان الحملة مع رفع مباشر للملفات' : 'Configure headline and wide backdrop image with direct file upload'}
            </p>
          </div>

          <button
            onClick={() => {
              toggleVisibility('banner_hero_visible');
              showToast(isAr ? 'تم تحديث ظهور البنر' : 'Toggled banner visibility');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              controls['banner_hero_visible']?.visible
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {controls['banner_hero_visible']?.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{controls['banner_hero_visible']?.visible ? (isAr ? 'ظاهر للزبائن' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isAr ? 'العنوان الترويجي (عربي)' : 'Headline (Arabic)'}
            </label>
            <input
              type="text"
              value={controls['banner_hero_title']?.label_ar || ''}
              onChange={(e) => updateControl('banner_hero_title', { label_ar: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isAr ? 'العنوان الترويجي (إنجليزي)' : 'Headline (English)'}
            </label>
            <input
              type="text"
              value={controls['banner_hero_title']?.label_en || ''}
              onChange={(e) => updateControl('banner_hero_title', { label_en: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>

          {/* Hero Banner File Upload Section */}
          <div className="md:col-span-2 space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'صورة خلفية البنر (رفع كملف من جهازك أو لصق رابط):' : 'Hero Backdrop Image (Upload File or URL):'}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {isAr ? 'يدعم السحب والإفلات أو التصفح' : 'Drag & drop or browse'}
              </span>
            </div>

            {/* Drag & Drop Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingHero(true);
              }}
              onDragLeave={() => setIsDraggingHero(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingHero(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleHeroFileUpload(file);
              }}
              onClick={() => heroFileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDraggingHero
                  ? 'border-amber-400 bg-amber-500/15 scale-[1.01]'
                  : 'border-slate-700 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-950'
              }`}
            >
              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingHero}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleHeroFileUpload(file);
                }}
              />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  {isUploadingHero ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {isUploadingHero
                      ? isAr
                        ? 'جاري رفع ملف صورة البنر وتخزينه...'
                        : 'Uploading banner image...'
                      : isAr
                      ? 'اضغط هنا لرفع صورة الغلاف كملف من جهازك'
                      : 'Click or drop to upload banner image file'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAr
                      ? 'PNG, JPG, WebP أو اسحب الصورة وأفلتها هنا مباشرة'
                      : 'PNG, JPG, WebP or drop image file here'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isUploadingHero}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                {isUploadingHero ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{isAr ? 'اختيار ملف صورة' : 'Choose File'}</span>
                  </>
                )}
              </button>
            </div>

            {heroUploadNotice && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>{heroUploadNotice}</span>
              </div>
            )}

            {/* Presets and URL Fallback */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={controls['banner_hero_bg']?.actionValue || ''}
                  onChange={(e) => updateControl('banner_hero_bg', { actionValue: e.target.value })}
                  placeholder={isAr ? 'أو اكتب/الصق رابط صورة مباشر...' : 'Or enter direct image URL...'}
                  className="w-full bg-transparent text-white text-xs font-mono outline-none"
                />
              </div>

              {/* Presets buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                <span className="text-[10px] text-slate-400 shrink-0">{isAr ? 'عينات:' : 'Presets:'}</span>
                {heroPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      updateControl('banner_hero_bg', { actionValue: preset.url });
                      showToast(isAr ? `تم اختيار: ${preset.name}` : `Selected: ${preset.name}`);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 hover:text-white transition-colors shrink-0"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Hero Backdrop Preview */}
        {Boolean(controls['banner_hero_bg']?.actionValue?.trim()) && (
          <div className="relative h-32 sm:h-44 rounded-xl overflow-hidden border border-slate-800">
            <img
              src={controls['banner_hero_bg'].actionValue!}
              alt="Hero Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4 text-center">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1">
                  {controls['banner_hero_tag']?.label_ar || 'فانت · كتالوج 2026'}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {controls['banner_hero_title']?.label_ar || 'الصياغة المعمارية للأزياء'}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Trend Items Studio (The focused element with full file uploading!) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? 'بطاقات تريندات وتصنيفات الموسم' : 'Seasonal Trends & Curations'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'تخصيص صور التريندات مع إمكانية رفع أي صورة كملف من جهازك مباشرة دون الحاجة لروابط.'
                : 'Customize trend images with direct device file upload without needing external links.'}
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
            {trendItems.length} {isAr ? 'تريندات' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendItems.map((item, idx) => {
            const isUploadingThis = uploadingTrendId === item.id;
            const isDraggingThis = draggingTrendId === item.id;
            const notice = trendUploadNotice[item.id];

            return (
              <div
                key={item.id || idx}
                className={`p-4 rounded-xl bg-slate-950 border transition-all space-y-3.5 relative overflow-hidden ${
                  isDraggingThis
                    ? 'border-indigo-400 ring-2 ring-indigo-500/30 bg-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Image Drop & Preview Container */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDraggingTrendId(item.id);
                  }}
                  onDragLeave={() => setDraggingTrendId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDraggingTrendId(null);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleTrendFileUpload(item.id, file);
                  }}
                  className="relative h-44 rounded-xl overflow-hidden border border-slate-800 group bg-slate-900 flex items-center justify-center"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.titleAr}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center gap-1">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[11px]">{isAr ? 'لا توجد صورة' : 'No image'}</span>
                    </div>
                  )}

                  {/* Badge */}
                  <span className="absolute top-2.5 start-2.5 px-2.5 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-amber-300 backdrop-blur-xs border border-white/10 shadow-sm z-10">
                    {item.tagAr}
                  </span>

                  {/* Uploading Spinner Overlay */}
                  {isUploadingThis && (
                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                      <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                      <span className="text-xs font-bold text-indigo-300">
                        {isAr ? 'جاري رفع وتخزين الصورة كملف...' : 'Uploading image file...'}
                      </span>
                    </div>
                  )}

                  {/* Drag drop highlight overlay */}
                  {isDraggingThis && (
                    <div className="absolute inset-0 bg-indigo-600/30 border-2 border-indigo-400 backdrop-blur-xs flex items-center justify-center z-20">
                      <span className="text-xs font-bold text-white bg-indigo-900/90 px-3 py-1.5 rounded-lg shadow-lg">
                        {isAr ? 'أفلت الصورة هنا لرفعها' : 'Drop image here to upload'}
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay Button to pick file */}
                  <label
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center z-10"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'انقر أو اسحب لرفع صورة كملف' : 'Click or drop to upload file'}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {isAr ? 'من جهاز الكمبيوتر أو الهاتف' : 'From your phone or PC'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingThis}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleTrendFileUpload(item.id, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                {/* Direct Action Button to Upload File */}
                <div>
                  <label className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600/20 via-indigo-600/25 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm">
                    {isUploadingThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-indigo-400" />
                        <span>{isAr ? 'رفع صورة كملف من جهازك' : 'Upload Image as File'}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingThis}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleTrendFileUpload(item.id, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                {notice && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{notice}</span>
                  </div>
                )}

                {/* Editable Title */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    {isAr ? 'العنوان بالعربية' : 'Arabic Title'}
                  </label>
                  <input
                    type="text"
                    value={item.titleAr || ''}
                    onChange={(e) => updateTrendItem(item.id, { titleAr: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Editable Tag Badge */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    {isAr ? 'شارة التصنيف (التاج)' : 'Badge Tag'}
                  </label>
                  <input
                    type="text"
                    value={item.tagAr || ''}
                    onChange={(e) => updateTrendItem(item.id, { tagAr: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Direct Image URL input as fallback option */}
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    {isAr ? 'رابط الصورة المباشر (أو الرابط السحابي):' : 'Direct Image URL:'}
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-indigo-500">
                    <LinkIcon className="w-3 h-3 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={item.image || ''}
                      onChange={(e) => updateTrendItem(item.id, { image: e.target.value })}
                      className="w-full bg-transparent text-white text-[11px] font-mono outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminBannersView;

