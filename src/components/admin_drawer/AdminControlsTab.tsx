import React from "react";
import {
  Sliders,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Shirt,
} from "lucide-react";
import { useSiteControls, type SplashMotifType } from "../../context/SiteControlsContext";
import { AVAILABLE_SPLASH_MOTIFS } from "../SplashLoader";

interface AdminControlsTabProps {
  isAr: boolean;
}

export const AdminControlsTab: React.FC<AdminControlsTabProps> = ({ isAr }) => {
  const {
    controls,
    toggleVisibility,
    updateControl,
    resetAllControls,
    currencyCode,
    setCurrencyCode,
    siteSettings,
    updateSiteSettings,
    setIsPreviewSplash,
    setIsPreviewMaintenance,
  } = useSiteControls();

  return (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sliders className="h-5 w-5 text-purple-400" />
                        <span>{isAr ? 'التحكم بأزرار وخصائص الموقع' : 'Buttons & Interactive Controls'}</span>
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        {isAr
                          ? 'إظهار أو إخفاء أي زر بالموقع بنقرة واحدة مع تحديث فوري'
                          : 'Toggle visibility of all buttons and modules'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetAllControls}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}
                    </button>
                  </div>

                  {/* CARD 0: GLOBAL MAINTENANCE MODE & CINEMATIC SPLASH SETTINGS */}
                  <div className="rounded-3xl border border-[#004ad7]/30 bg-gradient-to-b from-[#004ad7]/10 via-[#0e121b] to-[#0a0c10] p-6 space-y-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${siteSettings.maintenance_mode ? 'bg-[#3b82f6] animate-pulse shadow-sm shadow-[#3b82f6]' : 'bg-emerald-400'}`} />
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            {isAr ? 'وضع الصيانة وإغلاق المتجر المؤقت (Maintenance Mode)' : 'Global Maintenance Mode Controller'}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                          {isAr
                            ? 'عند التفعيل، يتم حجب المتجر بالكامل عن الزوار وعرض شاشة الصيانة الفاخرة (مع إمكانية دخول المشرفين فقط).'
                            : 'When active, locks store access and displays the high-fashion maintenance screen (Admin bypass enabled).'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => updateSiteSettings({ maintenance_mode: !siteSettings.maintenance_mode })}
                          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold border transition-all cursor-pointer shadow-md ${
                            siteSettings.maintenance_mode
                              ? 'bg-[#004ad7] hover:bg-[#003db3] text-white border-[#3b82f6]/50 shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]'
                              : 'bg-white/10 hover:bg-white/15 text-white/80 border-white/20'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${siteSettings.maintenance_mode ? 'bg-white animate-pulse' : 'bg-emerald-400'}`} />
                          <span>
                            {siteSettings.maintenance_mode
                              ? (isAr ? 'وضع الصيانة مفعّل (المتجر مغلق)' : 'Maintenance ACTIVE (Offline)')
                              : (isAr ? 'المتجر متاح للجميع (Online)' : 'Store LIVE (Online)')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* LIVE INTERACTIVE TEST & PREVIEW BUTTONS BAR */}
                    <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <Eye className="h-4 w-4 text-[#3b82f6]" />
                          <span>{isAr ? 'أزرار اختبار وتجربة الشاشات (Live Test & Preview):' : 'Interactive Screen Testing & Previews:'}</span>
                        </span>
                        <p className="text-[11px] text-white/55 mt-0.5">
                          {isAr
                            ? 'انقر على أي زر لمعاينة الشاشة مباشرة وتجربة التصميم والنصوص وحركات الأنيميشن دون التأثير على الزوار'
                            : 'Test and preview the splash animation and maintenance screen in real time.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Test Splash Loader Button */}
                        <button
                          type="button"
                          onClick={() => setIsPreviewSplash(true)}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#004ad7] to-[#3b82f6] hover:from-[#003db3] hover:to-[#2563eb] text-white px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{isAr ? 'معاينة شاشة التحميل (Splash)' : 'Test Splash Screen'}</span>
                        </button>

                        {/* Test Maintenance Screen Button */}
                        <button
                          type="button"
                          onClick={() => setIsPreviewMaintenance(true)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#004ad7]/40 bg-[#004ad7]/15 hover:bg-[#004ad7]/25 text-white px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                          <Lock className="h-3.5 w-3.5 text-[#60a5fa]" />
                          <span>{isAr ? 'معاينة شاشة الصيانة' : 'Test Maintenance'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Maintenance Messages Form */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-[#60a5fa]" />
                          <span>{isAr ? 'رسائل وتفاصيل شاشة الصيانة (Maintenance Messages):' : 'Maintenance Screen Messages:'}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsPreviewMaintenance(true)}
                          className="text-[11px] font-semibold text-[#60a5fa] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>{isAr ? 'تجربة الظهور الآن' : 'Preview Live'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-white/80 block mb-1">
                            {isAr ? 'رسالة الصيانة (الإنجليزية)' : 'Maintenance Subtitle (English)'}
                          </label>
                          <input
                            type="text"
                            value={siteSettings.maintenance_message}
                            onChange={(e) => updateSiteSettings({ maintenance_message: e.target.value })}
                            placeholder="We are preparing Volume 02. Please check back later."
                            className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-white/80 block mb-1">
                            {isAr ? 'رسالة الصيانة (العربية)' : 'Maintenance Subtitle (Arabic)'}
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={siteSettings.maintenance_message_ar || ''}
                            onChange={(e) => updateSiteSettings({ maintenance_message_ar: e.target.value })}
                            placeholder="نعمل حالياً على تجهيز التشكيلة الجديدة وتحديث النظام. يرجى العودة لاحقاً."
                            className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cinematic Splash Screen Texts */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#3b82f6]" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            {isAr ? 'نصوص شاشة التحميل الافتتاحية (Cinematic Splash Loader)' : 'Cinematic Splash Screen Subtitles'}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPreviewSplash(true)}
                          className="text-[11px] font-semibold text-[#3b82f6] hover:text-[#60a5fa] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>{isAr ? 'تشغيل ومعاينة التحميل' : 'Preview Loader'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-white/70 block mb-1">
                            {isAr ? 'نص التحميل الافتتاحي (الإنجليزية)' : 'Splash Loading Text (English)'}
                          </label>
                          <input
                            type="text"
                            value={siteSettings.loading_text_en}
                            onChange={(e) => updateSiteSettings({ loading_text_en: e.target.value })}
                            placeholder="INITIALIZING ARCHIVE"
                            className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6] font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-white/70 block mb-1">
                            {isAr ? 'نص التحميل الافتتاحي (العربية)' : 'Splash Loading Text (Arabic)'}
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={siteSettings.loading_text_ar}
                            onChange={(e) => updateSiteSettings({ loading_text_ar: e.target.value })}
                            placeholder="جاري تحميل الأرشيف وتجهيز التشكيلة"
                            className="h-10 w-full rounded-xl border border-white/15 bg-black/50 px-3 text-xs text-white outline-none focus:border-[#3b82f6]"
                          />
                        </div>
                      </div>

                      {/* Fashion Motif Models Selector Grid */}
                      <div className="pt-4 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shirt className="h-4 w-4 text-[#3b82f6]" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              {isAr ? 'نموذج حركة أيقونة الأزياء (Haute-Couture Animated Motif)' : 'Fashion Animation Motif Style'}
                            </h4>
                          </div>
                          <span className="text-[10.5px] font-mono text-white/50">
                            {isAr ? 'اختر النموذج المفضل ليظهر في شاشة البداية' : 'Select active splash motif'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                          {AVAILABLE_SPLASH_MOTIFS.map((item) => {
                            const isSelected = (siteSettings.splash_motif || 'hanger') === item.id;
                            const isPrintOrApparel = item.id === 'print_press' || item.id === 'tshirt_print' || item.id === 'embroidery';
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={async () => {
                                  await updateSiteSettings({ splash_motif: item.id as SplashMotifType });
                                }}
                                className={`flex flex-col text-start p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                                  isSelected
                                    ? 'bg-[#004ad7]/20 border-[#3b82f6] shadow-[0_0_20px_rgba(0,74,215,0.25)] ring-1 ring-[#3b82f6]'
                                    : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-xs font-bold ${isSelected ? 'text-[#60a5fa]' : 'text-white'}`}>
                                      {isAr ? item.titleAr : item.titleEn}
                                    </span>
                                  </div>
                                  {isSelected ? (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#004ad7] text-white text-[10px]">
                                      ✓
                                    </span>
                                  ) : isPrintOrApparel ? (
                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                      {isAr ? 'طباعة' : 'PRINT'}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[11px] text-white/55 leading-relaxed">
                                  {isAr ? item.subtitleAr : item.subtitleEn}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Currency Cloud Setting Card */}
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white">
                          {isAr ? 'تنسيق عرض العملة للكتالوج (مزامنة سحابية مباشرة)' : 'Catalog Currency Format (Live Cloud Sync)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 mt-0.5">
                        {isAr
                          ? 'أي تغيير هنا يُحفظ فوراً في السحابة ويظهر لجميع الزبائن على كافة الأجهزة فوراً'
                          : 'Changes immediately persist to Supabase and sync live across all visitors.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/40 p-1 rounded-xl border border-white/10">
                      {(['د.ع', 'IQD', 'USD'] as const).map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setCurrencyCode(curr)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            currencyCode === curr
                              ? 'bg-[#004ad7] text-white shadow-sm'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.values(controls)
                      .filter((c) => !c.id.startsWith('banner_'))
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="min-w-0 flex-1 pr-2 rtl:pr-0 rtl:pl-2">
                            <span className="text-xs font-bold text-white block truncate">
                              {isAr ? item.name_ar : item.name_en}
                            </span>
                            <span className="text-[11px] text-white/50 block line-clamp-1">
                              {isAr ? item.description_ar : item.description_en}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleVisibility(item.id)}
                            className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold border transition-all cursor-pointer ${
                              item.visible
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-red-500/20 border-red-500/40 text-red-300'
                            }`}
                          >
                            {item.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            <span>{item.visible ? (isAr ? 'ظاهر' : 'Visible') : (isAr ? 'مخفي' : 'Hidden')}</span>
                          </button>
                        </div>
                      </div>
                      ))}
                  </div>
                </div>

  );
};

export default AdminControlsTab;
