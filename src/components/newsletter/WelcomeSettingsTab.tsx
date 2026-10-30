import React, { useState, useEffect } from 'react';
import { Loader2, Save, Send } from 'lucide-react';
import { useSiteControls } from '../../context/SiteControlsContext';
import { dispatchWelcomeEmailCopy } from '../../lib/newsletter';
import WelcomeEmailTemplate from '../WelcomeEmailTemplate';

interface WelcomeSettingsTabProps {
  isAr: boolean;
  heroImageUrl: string;
  setFeedbackMsg: React.Dispatch<
    React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>
  >;
}

export const WelcomeSettingsTab: React.FC<WelcomeSettingsTabProps> = ({
  isAr,
  heroImageUrl,
  setFeedbackMsg,
}) => {
  const { siteSettings, updateSiteSettings } = useSiteControls();

  const [welcomeTitleAr, setWelcomeTitleAr] = useState(siteSettings.welcome_title_ar || 'أهلاً بك في ڤانت!');
  const [welcomeTitleEn, setWelcomeTitleEn] = useState(siteSettings.welcome_title_en || 'Welcome to VANT!');
  const [welcomeMessageAr, setWelcomeMessageAr] = useState(
    siteSettings.welcome_message_ar ||
      'تم تفعيل اشتراكك بنجاح، وتم إرسال نسخة من العرض الترحيبي وكود الخصم إلى بريدك الإلكتروني.'
  );
  const [welcomeMessageEn, setWelcomeMessageEn] = useState(
    siteSettings.welcome_message_en ||
      'Your subscription is active! A welcome voucher and discount code have been dispatched to your email.'
  );
  const [welcomeCoupon, setWelcomeCoupon] = useState(siteSettings.welcome_coupon_code || 'VANT-WELCOME-15');
  const [welcomePct, setWelcomePct] = useState<number>(siteSettings.welcome_discount_percent ?? 15);
  const [welcomeModalEnabled, setWelcomeModalEnabled] = useState<boolean>(siteSettings.welcome_modal_enabled ?? true);
  const [welcomeAutoDispatch, setWelcomeAutoDispatch] = useState<boolean>(siteSettings.welcome_auto_dispatch ?? true);
  const [customStoreUrl, setCustomStoreUrl] = useState(
    siteSettings.custom_store_url || 'https://vant-web.vercel.app/'
  );
  const [testWelcomeEmail, setTestWelcomeEmail] = useState('');
  const [isSavingWelcome, setIsSavingWelcome] = useState(false);
  const [isTestingWelcome, setIsTestingWelcome] = useState(false);

  useEffect(() => {
    if (siteSettings.custom_store_url) {
      setCustomStoreUrl(siteSettings.custom_store_url);
    }
  }, [siteSettings.custom_store_url]);

  const handleSaveWelcomeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWelcome(true);
    try {
      const saved = await updateSiteSettings({
        welcome_title_ar: welcomeTitleAr.trim(),
        welcome_title_en: welcomeTitleEn.trim(),
        welcome_message_ar: welcomeMessageAr.trim(),
        welcome_message_en: welcomeMessageEn.trim(),
        welcome_coupon_code: welcomeCoupon.trim().toUpperCase(),
        welcome_discount_percent: Number(welcomePct),
        welcome_modal_enabled: welcomeModalEnabled,
        welcome_auto_dispatch: welcomeAutoDispatch,
        custom_store_url: customStoreUrl.trim() || 'https://vant-web.vercel.app/',
      });
      if (!saved) { window.alert(isAr ? "تعذّر الحفظ. حاول مرة ثانية." : "Save failed. Please retry."); return; }
      setFeedbackMsg({
        type: 'success',
        text: isAr ? 'تم حفظ وتحديث إعدادات الرسالة الترحيبية ورابط المتجر بنجاح!' : 'Welcome settings and store URL saved!',
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setIsSavingWelcome(false);
    }
  };

  const handleTestSendWelcome = async () => {
    const target = testWelcomeEmail.trim().toLowerCase();
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      alert(isAr ? 'يرجى كتابة بريد إلكتروني صحيح لتجربة الإرسال' : 'Please enter a valid email address for testing');
      return;
    }

    setIsTestingWelcome(true);
    try {
      const res = await dispatchWelcomeEmailCopy(
        target,
        welcomeCoupon.trim().toUpperCase(),
        Number(welcomePct),
        isAr ? welcomeTitleAr : welcomeTitleEn,
        isAr ? welcomeMessageAr : welcomeMessageEn,
        heroImageUrl
      );

      if (res.emailSent) {
        setFeedbackMsg({
          type: 'success',
          text: isAr
            ? `✓ تم إرسال نسخة رسمية وموثقة إلى إيميلك (${target}) بنجاح!`
            : `Official copy dispatched to (${target})!`,
        });
      } else {
        setFeedbackMsg({
          type: 'success',
          text: isAr ? `تم توثيق الرسالة وفتح مسودة الإرسال إلى (${target})!` : `Prepared test copy to (${target})!`,
        });
      }
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: isAr ? 'حدث خطأ أثناء محاولة إرسال النسخة' : 'Error sending email copy',
      });
    } finally {
      setIsTestingWelcome(false);
      setTimeout(() => setFeedbackMsg(null), 4500);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form
        onSubmit={handleSaveWelcomeSettings}
        className="lg:col-span-7 bg-white dark:bg-[#14171d] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <span className="text-sm font-bold text-black dark:text-white">
            {isAr ? 'إعدادات رسالة الترحيب التلقائية وكوبون الخصم' : 'Automated Welcome Voucher'}
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            مزامنة سحابية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
              {isAr ? 'عنوان الترحيب (العربية)' : 'Welcome Title (Ar)'}
            </label>
            <input
              type="text"
              value={welcomeTitleAr}
              onChange={(e) => setWelcomeTitleAr(e.target.value)}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
              {isAr ? 'عنوان الترحيب (الإنجليزية)' : 'Welcome Title (En)'}
            </label>
            <input
              type="text"
              value={welcomeTitleEn}
              onChange={(e) => setWelcomeTitleEn(e.target.value)}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
            {isAr ? 'نص الرسالة الترحيبية (العربية)' : 'Welcome Message (Ar)'}
          </label>
          <textarea
            rows={2}
            value={welcomeMessageAr}
            onChange={(e) => setWelcomeMessageAr(e.target.value)}
            className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 p-3 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
              {isAr ? 'رمز الكوبون الترحيبي' : 'Welcome Code:'}
            </label>
            <input
              type="text"
              value={welcomeCoupon}
              onChange={(e) => setWelcomeCoupon(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs font-mono font-bold text-[#004ad7] dark:text-[#60a5fa] outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
              {isAr ? 'نسبة الخصم (%)' : 'Discount (%):'}
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={welcomePct}
              onChange={(e) => setWelcomePct(Number(e.target.value))}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs font-bold text-black dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Store URL & Domain Setting */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
              {isAr ? 'رابط المتجر الرسمي المعتمد (Store URL / Domain):' : 'Official Store URL / Custom Domain:'}
            </label>
            <button
              type="button"
              onClick={() => setCustomStoreUrl('https://vant-web.vercel.app/')}
              className="text-[10px] text-[#004ad7] dark:text-[#60a5fa] hover:underline cursor-pointer"
            >
              {isAr ? 'استعادة الافتراضي' : 'Reset to Default'}
            </button>
          </div>
          <input
            type="url"
            value={customStoreUrl}
            onChange={(e) => setCustomStoreUrl(e.target.value)}
            placeholder="https://vant-web.vercel.app/"
            className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs font-mono text-black dark:text-white outline-none focus:border-[#004ad7]"
          />
          <span className="text-[10.5px] text-zinc-500 block mt-1">
            {isAr
              ? 'يمكنك تغيير هذا الرابط في أي وقت عند حجز دومين جديد أو تعديل نطاق المتجر.'
              : 'Easily update this URL whenever you bind a new custom domain.'}
          </span>
        </div>

        <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
          <label className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-black/20 cursor-pointer">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
              {isAr ? 'تفعيل ظهور نافذة الترحيب للزبون فور الاشتراك' : 'Enable Welcome Popup Modal'}
            </span>
            <input
              type="checkbox"
              checked={welcomeModalEnabled}
              onChange={(e) => setWelcomeModalEnabled(e.target.checked)}
              className="accent-[#004ad7] h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-black/20 cursor-pointer">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
              {isAr ? 'إرسال نسخة موثقة تلقائياً إلى بريد الزبون' : 'Auto-Dispatch Email to Subscriber'}
            </span>
            <input
              type="checkbox"
              checked={welcomeAutoDispatch}
              onChange={(e) => setWelcomeAutoDispatch(e.target.checked)}
              className="accent-[#004ad7] h-4 w-4"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSavingWelcome}
          className="w-full flex items-center justify-center gap-2 bg-[#004ad7] hover:bg-[#003db3] text-white py-3 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#004ad7]/20 disabled:opacity-50"
        >
          {isSavingWelcome ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isAr ? 'حفظ وتحديث الإعدادات في السحابة' : 'Save & Publish to Cloud'}</span>
        </button>
      </form>

      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white dark:bg-[#14171d] p-5 rounded-3xl border border-black/5 dark:border-white/10 space-y-3 shadow-sm">
          <span className="text-xs font-bold text-black dark:text-white block">
            {isAr ? 'تجربة إرسال رسالة الترحيب الموثقة:' : 'Test Send Welcome Email:'}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={testWelcomeEmail}
              onChange={(e) => setTestWelcomeEmail(e.target.value)}
              placeholder="admin@example.com"
              className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3.5 py-2 text-xs text-black dark:text-white font-mono outline-none focus:border-[#004ad7]"
            />
            <button
              type="button"
              onClick={handleTestSendWelcome}
              disabled={isTestingWelcome}
              className="bg-[#004ad7] hover:bg-[#003db3] text-white px-4 py-2 text-xs font-bold rounded-xl cursor-pointer shadow-sm shadow-[#004ad7]/20 disabled:opacity-50"
            >
              {isTestingWelcome ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <WelcomeEmailTemplate
          welcomeTitle={welcomeTitleAr}
          welcomeMessage={welcomeMessageAr}
          couponCode={welcomeCoupon}
          discountPercent={welcomePct}
          ctaUrl={customStoreUrl}
          customerEmail={testWelcomeEmail || 'client@vant.archive'}
          isInteractive={false}
        />
      </div>
    </div>
  );
};

export default WelcomeSettingsTab;
