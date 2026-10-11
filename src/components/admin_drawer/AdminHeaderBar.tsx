import React from 'react';
import {
  LayoutDashboard,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Users,
  Loader2,
  UploadCloud,
  Sparkles,
  ChevronDown,
  Gift,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { UserBehaviorStats } from '../../lib/analytics';

export interface AdminHeaderBarProps {
  isAr?: boolean;
  siteSettings: {
    maintenance_mode?: boolean;
    [key: string]: any;
  };
  updateSiteSettings: (settings: any) => Promise<any> | void;
  controls: Record<string, any>;
  toggleVisibility: (key: string) => Promise<any> | void;
  analyticsStats: UserBehaviorStats;
  isSyncing: boolean;
  setIsSyncing: React.Dispatch<React.SetStateAction<boolean>>;
  setSyncToast: React.Dispatch<React.SetStateAction<boolean>>;
  syncAllToSupabaseCloud: () => Promise<any> | void;
  showTestsDropdown: boolean;
  setShowTestsDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  testsDropdownRef: React.RefObject<HTMLDivElement | null>;
  setIsPreviewSplash: (val: boolean) => void;
  setIsPreviewMaintenance: (val: boolean) => void;
  setIsPreviewWelcomeModal: (val: boolean) => void;
  adminMode: 'new' | 'classic';
  toggleAdminMode: (mode: 'new' | 'classic') => void;
  currencyCode: 'د.ع' | 'IQD' | 'USD';
  setCurrencyCode: (code: 'د.ع' | 'IQD' | 'USD') => void;
  lockAdmin: () => void;
  onClose: () => void;
}

export const AdminHeaderBar: React.FC<AdminHeaderBarProps> = ({
  isAr = true,
  siteSettings,
  updateSiteSettings,
  controls,
  toggleVisibility,
  analyticsStats,
  isSyncing,
  setIsSyncing,
  setSyncToast,
  syncAllToSupabaseCloud,
  showTestsDropdown,
  setShowTestsDropdown,
  testsDropdownRef,
  setIsPreviewSplash,
  setIsPreviewMaintenance,
  setIsPreviewWelcomeModal,
  adminMode,
  toggleAdminMode,
  currencyCode,
  setCurrencyCode,
  lockAdmin,
  onClose,
}) => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#12151f] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004ad7]/20 border border-[#004ad7]/30 text-[#3b82f6] shadow-sm">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
              {isAr ? 'مركز عمليات ڤانت المتكامل' : 'VANT Operations Command Center'}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isAr ? 'متصل مباشر' : 'Live Engine'}
            </span>
          </div>
          <p className="text-[11px] text-white/50 hidden sm:block">
            {isAr
              ? 'إدارة العروض والكتالوج، تخصيص البنرات، وتحليل سلوك الزوار المتقدم'
              : 'Live Catalog & Offers CMS, Banner Customizer & Deep Behavioral Analytics'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick 1-Click Store Maintenance Mode Toggle - Highly Accessible */}
        <button
          type="button"
          onClick={() =>
            updateSiteSettings({ maintenance_mode: !siteSettings.maintenance_mode })
          }
          className={`flex items-center gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
            siteSettings.maintenance_mode
              ? 'border-[#004ad7] bg-[#004ad7]/25 text-white hover:bg-[#004ad7]/35 ring-1 ring-[#3b82f6]/50 shadow-md shadow-[#004ad7]/20'
              : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white'
          }`}
          title={
            isAr
              ? 'تشغيل أو إيقاف شاشة الصيانة وإغلاق/فتح المتجر أمام الزبائن فوراً'
              : 'Toggle Store Maintenance Mode (Storefront Offline / Online)'
          }
        >
          {siteSettings.maintenance_mode ? (
            <Lock className="h-3.5 w-3.5 text-[#60a5fa] animate-pulse" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-white/40" />
          )}
          <span className="hidden lg:inline font-bold">
            {isAr ? 'وضع الصيانة:' : 'Maintenance:'}
          </span>
          <span className="lg:hidden font-bold">
            {isAr ? 'الصيانة:' : 'Maint:'}
          </span>
          <span
            className={`font-mono text-[11px] font-bold ${
              siteSettings.maintenance_mode ? 'text-[#60a5fa]' : 'text-white/40'
            }`}
          >
            {siteSettings.maintenance_mode
              ? isAr
                ? 'مفعل (مغلق)'
                : 'ON'
              : isAr
              ? 'معطل (مفتوح)'
              : 'OFF'}
          </span>
        </button>

        {/* Quick 1-Click Storefront Hero & Trends Banner Toggle - Highly Accessible */}
        <button
          type="button"
          onClick={() => toggleVisibility('banner_hero_visible')}
          className={`flex items-center gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 ${
            controls['banner_hero_visible']?.visible
              ? 'border-[#004ad7]/40 bg-[#004ad7]/15 text-white hover:bg-[#004ad7]/25'
              : 'border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80'
          }`}
          title={
            isAr
              ? 'تشغيل أو إيقاف واجهة التشكيلة والتريندات للزبائن في المتجر'
              : 'Toggle Storefront Welcome Hero & Trends Banner'
          }
        >
          {controls['banner_hero_visible']?.visible ? (
            <Eye className="h-3.5 w-3.5 text-[#3b82f6]" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-white/40" />
          )}
          <span className="hidden lg:inline font-bold">
            {isAr ? 'واجهة الترحيب والتريندات:' : 'Welcome Banner:'}
          </span>
          <span className="lg:hidden font-bold">
            {isAr ? 'التريندات:' : 'Banner:'}
          </span>
          <span
            className={`font-mono text-[11px] font-bold ${
              controls['banner_hero_visible']?.visible ? 'text-[#60a5fa]' : 'text-white/40'
            }`}
          >
            {controls['banner_hero_visible']?.visible
              ? isAr
                ? 'مفعلة'
                : 'ON'
              : isAr
              ? 'معطلة'
              : 'OFF'}
          </span>
        </button>

        {/* Live Visitors Counter Badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/10 px-3 py-1 text-xs text-white/80">
          <Users className="h-3.5 w-3.5 text-[#3b82f6]" />
          <span className="tabular-nums font-semibold text-white">
            {analyticsStats.activeOnlineNow}
          </span>
          <span className="text-[10px] text-white/50">{isAr ? 'نشط الآن' : 'online'}</span>
        </div>

        {/* Supabase Cloud Sync Status / Action */}
        <button
          type="button"
          onClick={async () => {
            setIsSyncing(true);
            await syncAllToSupabaseCloud();
            setIsSyncing(false);
            setSyncToast(true);
            setTimeout(() => setSyncToast(false), 3000);
          }}
          title={isAr ? 'مزامنة وحفظ فوري في سوبابيس' : 'Sync with Supabase Cloud'}
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
        >
          {isSyncing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          <span>{isAr ? 'مزامنة السحابة' : 'Cloud Sync'}</span>
        </button>

        {/* Consolidated Quick Screen Tests Dropdown */}
        <div className="relative" ref={testsDropdownRef}>
          <button
            type="button"
            onClick={() => setShowTestsDropdown((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 active:scale-95 transition-all cursor-pointer shadow-xs"
            title={isAr ? 'اختبار ومعاينة شاشات وواجهات المتجر' : 'Quick Preview Tests'}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {isAr ? 'معاينة الواجهات' : 'Preview Tests'}
            </span>
            <span className="sm:hidden">{isAr ? 'معاينة' : 'Tests'}</span>
            <ChevronDown
              className={`h-3 w-3 text-white/60 transition-transform duration-200 ${
                showTestsDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showTestsDropdown && (
            <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-64 rounded-2xl border border-white/15 bg-[#121522] p-2 shadow-2xl z-50 backdrop-blur-2xl">
              <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {isAr ? 'معاينة شاشات الزوار' : 'Live Screen Tests'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowTestsDropdown(false);
                  setIsPreviewSplash(true);
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-xs font-medium text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#004ad7]/25 text-[#60a5fa] border border-[#004ad7]/30">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {isAr ? 'شاشة التحميل الافتتاحية' : 'Splash Preloader'}
                  </div>
                  <div className="text-[10px] text-white/50">
                    {isAr ? 'أنميشن الشعار عند فتح الموقع' : 'Opening animation & logo'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTestsDropdown(false);
                  setIsPreviewMaintenance(true);
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-xs font-medium text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {isAr ? 'شاشة وضع الصيانة' : 'Maintenance Mode'}
                  </div>
                  <div className="text-[10px] text-white/50">
                    {isAr ? 'تجربة إيقاف المتجر مؤقتاً' : 'Boutique offline screen'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTestsDropdown(false);
                  setIsPreviewWelcomeModal(true);
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-xs font-medium text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Gift className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {isAr ? 'نافذة الترحيب والكوبون' : 'Welcome Modal & Voucher'}
                  </div>
                  <div className="text-[10px] text-white/50">
                    {isAr
                      ? 'رسالة الخصم الترحيبية للزوار'
                      : 'Welcome gift popup with coupon'}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Admin UI Style Mode Switcher (New Modern UI vs Classic Operations) */}
        <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-0.5">
          <button
            type="button"
            onClick={() => toggleAdminMode('new')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              (adminMode as string) === 'new'
                ? 'bg-gradient-to-r from-[#004ad7] to-indigo-600 text-white shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
            title={isAr ? 'الواجهة الحديثة المطورة' : 'Modern Hub'}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{isAr ? 'الواجهة المطورة' : 'Modern'}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleAdminMode('classic')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adminMode === 'classic'
                ? 'bg-white/20 text-white shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
            title={isAr ? 'الواجهة الكلاسيكية' : 'Classic Hub'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'الكلاسيكية' : 'Classic'}</span>
          </button>
        </div>

        {/* Currency Selector (Direct Supabase Cloud Sync) */}
        <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5">
          {(['د.ع', 'IQD', 'USD'] as const).map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => setCurrencyCode(curr)}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                currencyCode === curr
                  ? 'bg-[#004ad7] text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title={
                isAr
                  ? `تغيير العملة إلى ${curr} ومزامنتها لجميع الزبائن`
                  : `Set currency to ${curr}`
              }
            >
              {curr}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={lockAdmin}
          title={isAr ? 'قفل الجلسة' : 'Lock session'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <Lock className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
          aria-label="Close Command Center"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeaderBar;
