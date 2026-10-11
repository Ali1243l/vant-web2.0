import React, { useState } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  UploadCloud,
  Check,
  Loader2,
  Flame,
  Eye,
  EyeOff,
  Edit3,
} from "lucide-react";
import { useSiteControls } from "../../context/SiteControlsContext";
import { RECOMMENDED_IMAGE_SPECS } from "../../data/trends";
import { uploadImageToSupabase } from "../../lib/storage";
import AdminWhatsAppManager from "./AdminWhatsAppManager";

interface AdminBannersStudioTabProps {
  isAr: boolean;
}

export const AdminBannersStudioTab: React.FC<AdminBannersStudioTabProps> = ({ isAr }) => {
  const {
    controls,
    toggleVisibility,
    updateControl,
    trendItems,
    updateTrendItem,
    resetTrendsToDefault,
  } = useSiteControls();

  const [isUploadingHeroBg, setIsUploadingHeroBg] = useState(false);
  const [uploadHeroBgSuccess, setUploadHeroBgSuccess] = useState(false);
  const [uploadingTrendId, setUploadingTrendId] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-amber-400" />
                        <span>{isAr ? 'استوديو تعديل البنرات والوسائط ومقاسات الصور' : 'Banners, Media & Image Specs Studio'}</span>
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        {isAr
                          ? 'تعديل صور وبنرات الموقع مع دليل المقاسات الهندسية الدقيقة للظهور بأعلى دقة وفخامة'
                          : 'Customize hero backdrops & trend cards with exact image dimension specs'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetTrendsToDefault}
                      className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {isAr ? 'استعادة التريندات الافتراضية' : 'Reset Default Trends'}
                    </button>
                  </div>

                  {/* HIGH-FASHION IMAGE DIMENSIONS SPECIFICATION GUIDE */}
                  <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-b from-amber-500/10 via-black/40 to-black/60 p-5 sm:p-6 backdrop-blur-md shadow-xl">
                    <div className="flex items-center gap-2.5 mb-3 text-amber-400">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="text-sm font-bold tracking-wide uppercase">
                        {isAr ? 'دليل المقاسات والأبعاد المثالية للصور (Image Dimension Specifications)' : 'Master Image Sizing & Aspect Ratio Specs'}
                      </h3>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">
                      {isAr
                        ? 'لضمان ظهور الصور بأعلى نقاوة وفخامة معمارية دون تشويه أو اقتصاص غير مرغوب، يرجى الالتزام بالأبعاد التالية عند تصميم أو اختيار الصور:'
                        : 'To maintain pristine editorial visual fidelity, adhere to the recommended pixel dimensions and ratios:'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Spec 1: Hero Banner */}
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            {isAr ? 'خلفية البنر الترحيبي العريض' : 'Welcome Hero Background'}
                          </span>
                          <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                            1920 × 600 px
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50 block font-mono">النسبة: 16:5 (أفقي بانورامي عريض)</span>
                        <p className="text-[10px] text-white/60 mt-1">
                          {isAr ? 'صورة أفقية عريضة تغطي خلفية الترويسة بالكامل مع المحافظة على وضوح الخط' : 'Ultra-wide landscape banner backdrop'}
                        </p>
                      </div>

                      {/* Spec 2: Trend Cards */}
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                            {isAr ? 'كروت تريندات موسم 2026' : 'Seasonal Trend Cards'}
                          </span>
                          <span className="rounded-md bg-[#3b82f6]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#3b82f6]">
                            800 × 1000 px
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50 block font-mono">النسبة: 4:5 (عمودي بورتريه أزياء)</span>
                        <p className="text-[10px] text-white/60 mt-1">
                          {isAr ? 'تناسق طولي فاخر لإبراز قصات وتفاصيل المعاطف والتريكو والأقمشة' : 'Vertical fashion portrait ratio'}
                        </p>
                      </div>

                      {/* Spec 3: Product Primary */}
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            {isAr ? 'صورة القطعة الرئيسية بالكتالوج' : 'Catalog Primary Product'}
                          </span>
                          <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                            1200 × 1500 px
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50 block font-mono">النسبة: 4:5 (عالي الدقة)</span>
                        <p className="text-[10px] text-white/60 mt-1">
                          {isAr ? 'أفضل دقة للـ Zoom واستكشاف الخامات والتفاصيل بدون تشويش' : 'Crisp high-resolution product showcase'}
                        </p>
                      </div>

                      {/* Spec 4: Product Angles */}
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-purple-400" />
                            {isAr ? 'صور الزوايا والتفاصيل الإضافية' : 'Detail & Angle Images'}
                          </span>
                          <span className="rounded-md bg-purple-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
                            1200 × 1500 px
                          </span>
                        </div>
                        <span className="text-[11px] text-white/50 block font-mono">النسبة: 4:5 أو 1:1</span>
                        <p className="text-[10px] text-white/60 mt-1">
                          {isAr ? 'صور الدرزات، البطانة، الأزرار، والإطلالات الخلفية' : 'Detail zoom & fabric texture shots'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 1: Welcome Hero Banner Editor */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#3b82f6]" />
                          <span>{isAr ? 'البنر الترحيبي العريض (Welcome Hero Banner)' : 'Top Welcome Hero Banner'}</span>
                        </h3>
                        <span className="text-xs text-white/50">
                          {isAr ? 'المقاس الموصى به: 1920 × 600 px (نسبة 16:5)' : 'Recommended: 1920 × 600 px (16:5)'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleVisibility('banner_hero_visible')}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                          controls['banner_hero_visible']?.visible
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-500/20 border-red-500/40 text-red-300'
                        }`}
                      >
                        {controls['banner_hero_visible']?.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        <span>{controls['banner_hero_visible']?.visible ? (isAr ? 'ظاهر بالموقع' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
                      </button>
                    </div>

                    {/* Headline Arabic & English */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'العنوان الرئيسي (العربية)' : 'Main Headline (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_hero_title']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_hero_title', { label_ar: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'العنوان الرئيسي (الإنجليزية)' : 'Main Headline (English)'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_hero_title']?.label_en || ''}
                          onChange={(e) => updateControl('banner_hero_title', { label_en: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>
                    </div>

                    {/* Subtitle / Manifesto Text */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'نص الفلسفة والبيان (العربية)' : 'Manifesto Description (Arabic)'}
                        </label>
                        <textarea
                          rows={2}
                          value={controls['banner_hero_subtitle']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_hero_subtitle', { label_ar: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'نص الفلسفة والبيان (الإنجليزية)' : 'Manifesto Description (English)'}
                        </label>
                        <textarea
                          rows={2}
                          value={controls['banner_hero_subtitle']?.label_en || ''}
                          onChange={(e) => updateControl('banner_hero_subtitle', { label_en: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>
                    </div>

                    {/* Top Tag & Button Labels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'الشريط الأرشيفي أعلى البنر' : 'Top Tag Line'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_hero_tag']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_hero_tag', { label_ar: e.target.value, label_en: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'نص زر التصفح' : 'Action Button Label'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_hero_btn']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_hero_btn', { label_ar: e.target.value, label_en: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>
                    </div>

                    {/* Background Image URL with Preview & Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-white/70">
                          {isAr ? 'رابط صورة خلفية البنر الترحيبي' : 'Hero Background Image URL'}
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.2 rounded border border-amber-400/20">
                          1920 × 600 px (16:5)
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={controls['banner_hero_bg']?.actionValue || ''}
                          onChange={(e) => updateControl('banner_hero_bg', { actionValue: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="h-10 flex-1 rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />

                        {/* Direct File Upload to Supabase Storage */}
                        <label className={`flex items-center justify-center gap-1.5 rounded-xl px-4 h-10 text-xs font-bold text-white transition-all cursor-pointer shrink-0 ${
                          isUploadingHeroBg
                            ? 'bg-emerald-700/60 cursor-not-allowed opacity-80'
                            : 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/30'
                        }`}>
                          {isUploadingHeroBg ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                              <span>{isAr ? 'جار الرفع للسوبابيس...' : 'Uploading to Supabase...'}</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-4 w-4" />
                              <span>{isAr ? 'رفع ملف لسوبابيس' : 'Upload to Supabase'}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingHeroBg}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  setIsUploadingHeroBg(true);
                                  const url = await uploadImageToSupabase(file, 'banners');
                                  if (url) {
                                    updateControl('banner_hero_bg', { actionValue: url });
                                    setUploadHeroBgSuccess(true);
                                    setTimeout(() => setUploadHeroBgSuccess(false), 5000);
                                  }
                                } finally {
                                  setIsUploadingHeroBg(false);
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {Boolean(controls['banner_hero_bg']?.actionValue?.trim()) && (
                          <div className="h-10 w-24 shrink-0 rounded-xl overflow-hidden border border-white/20 relative group">
                            <img
                              src={controls['banner_hero_bg'].actionValue!}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <a
                              href={controls['banner_hero_bg'].actionValue}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                            >
                              {isAr ? 'عرض' : 'View'}
                            </a>
                          </div>
                        )}
                      </div>

                      {uploadHeroBgSuccess && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 animate-fade-in">
                          <Check className="h-4 w-4 shrink-0" />
                          <span>
                            {isAr
                              ? 'تم رفع الصورة وحفظها سحابياً في Supabase Storage بشكل دائم وبلا فقدان عند إعادة التحميل'
                              : 'Successfully uploaded and permanently synced to Supabase Cloud Storage'}
                          </span>
                        </div>
                      )}

                      {/* Quick Luxury Presets */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-white/40">{isAr ? 'خيارات سريعة جاهزة:' : 'Presets:'}</span>
                        {[
                          { name: isAr ? 'أزياء أرشيفية رمادية' : 'Minimalist Grey', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85' },
                          { name: isAr ? 'ستوديو معماري هادئ' : 'Architectural Studio', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=85' },
                          { name: isAr ? 'صوف كشمير عاجي' : 'Cashmere Wool Texture', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1920&q=85' },
                          { name: isAr ? 'خياطة إيطالية ليلية' : 'Nocturnal Atelier', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => updateControl('banner_hero_bg', { actionValue: preset.url })}
                            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white/70 hover:text-white hover:border-[#3b82f6] transition-all cursor-pointer"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: 5 Seasonal Trend Cards Studio */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Flame className="h-4 w-4 text-amber-400" />
                          <span>{isAr ? 'كروت تريندات الموسم الخمسة (Seasonal Trends 2026 Cards)' : 'Seasonal Trends Cards'}</span>
                        </h3>
                        <span className="text-xs text-white/50">
                          {isAr ? 'المقاس الموصى به لكل كارت: 800 × 1000 px (نسبة 4:5)' : 'Recommended for each card: 800 × 1000 px (4:5)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-0.5 rounded-full border border-[#3b82f6]/20">
                          {trendItems.length} {isAr ? 'كروت نشطة' : 'Active Cards'}
                        </span>
                      </div>
                    </div>

                    {/* Trends Headline Setting */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'عنوان القسم الرئيسي (العربية)' : 'Section Title (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_trends_title']?.label_ar || ''}
                          onChange={(e) => updateControl('banner_trends_title', { label_ar: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/70 block mb-1">
                          {isAr ? 'عنوان القسم الرئيسي (الإنجليزية)' : 'Section Title (English)'}
                        </label>
                        <input
                          type="text"
                          value={controls['banner_trends_title']?.label_en || ''}
                          onChange={(e) => updateControl('banner_trends_title', { label_en: e.target.value })}
                          className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                        />
                      </div>
                    </div>

                    {/* 5 Trend Cards List */}
                    <div className="space-y-3 pt-2">
                      {trendItems.map((trend, idx) => (
                        <div
                          key={trend.id}
                          className="rounded-2xl border border-white/10 bg-black/40 p-4 transition-all hover:border-white/20 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#3b82f6] font-mono">
                              #{idx + 1} {trend.tagAr || trend.tagEn}
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.2 rounded border border-amber-400/20">
                              800 × 1000 px (4:5)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'العنوان (العربية)' : 'Title (AR)'}</label>
                              <input
                                type="text"
                                value={trend.titleAr}
                                onChange={(e) => updateTrendItem(trend.id, { titleAr: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'العنوان (الإنجليزية)' : 'Title (EN)'}</label>
                              <input
                                type="text"
                                value={trend.titleEn}
                                onChange={(e) => updateTrendItem(trend.id, { titleEn: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'الوصف الفرعي (العربية)' : 'Subtitle (AR)'}</label>
                              <input
                                type="text"
                                value={trend.subtitleAr}
                                onChange={(e) => updateTrendItem(trend.id, { subtitleAr: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'الوسم الأرشيفي' : 'Tag'}</label>
                              <input
                                type="text"
                                value={trend.tagAr}
                                onChange={(e) => updateTrendItem(trend.id, { tagAr: e.target.value, tagEn: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-white/70 block mb-1">{isAr ? 'القسم المرتبط' : 'Category Target'}</label>
                              <select
                                value={trend.category}
                                onChange={(e) => updateTrendItem(trend.id, { category: e.target.value })}
                                className="h-9 w-full rounded-lg border border-white/15 bg-black/60 px-2 text-xs text-white outline-none cursor-pointer"
                              >
                                <option value="Tailoring">Tailoring</option>
                                <option value="Outerwear">Outerwear</option>
                                <option value="Knitwear">Knitwear</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Leather Goods">Leather Goods</option>
                                <option value="Footwear">Footwear</option>
                              </select>
                            </div>
                          </div>

                          {/* Image URL with live preview thumbnail & file upload */}
                          <div>
                            <label className="text-[11px] text-white/70 block mb-1">
                              {isAr ? 'رابط أو رفع صورة الكارت' : 'Card Image'}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={trend.image}
                                onChange={(e) => updateTrendItem(trend.id, { image: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="h-9 flex-1 rounded-lg border border-white/15 bg-black/60 px-2.5 text-xs text-white outline-none focus:border-[#3b82f6]"
                              />

                              <label className={`flex items-center gap-1 rounded-lg px-2.5 h-9 text-[11px] font-bold text-white transition-all cursor-pointer shrink-0 ${
                                uploadingTrendId === trend.id
                                  ? 'bg-emerald-700/60 cursor-not-allowed opacity-80'
                                  : 'bg-emerald-600 hover:bg-emerald-500'
                              }`}>
                                {uploadingTrendId === trend.id ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>{isAr ? 'جار الرفع...' : 'Uploading...'}</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="h-3.5 w-3.5" />
                                    <span>{isAr ? 'رفع' : 'Upload'}</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingTrendId === trend.id}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        setUploadingTrendId(trend.id);
                                        const url = await uploadImageToSupabase(file, 'trends');
                                        if (url) updateTrendItem(trend.id, { image: url });
                                      } finally {
                                        setUploadingTrendId(null);
                                      }
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {Boolean(trend.image?.trim()) && (
                                <div className="h-9 w-12 shrink-0 rounded-lg overflow-hidden border border-white/20">
                                  <img src={trend.image} alt="" className="h-full w-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>


      {/* Card 3: Multi-Number WhatsApp Concierge & Phone Manager */}
      <AdminWhatsAppManager isAr={isAr} />
    </div>
  );
};

export default AdminBannersStudioTab;
