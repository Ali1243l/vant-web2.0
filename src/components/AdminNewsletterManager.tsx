import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Users,
  ShieldCheck,
  AlertCircle,
  Gift,
  Layers,
  History,
  Sliders,
} from "lucide-react";
import {
  getStoredSubscribers,
  syncSubscribersFromCloud,
  getSavedCampaigns,
  recordCampaign,
  generateMailtoLink,
  dispatchCampaignEmail,
  getStoredCampaignTemplates,
  deleteCampaignTemplate,
  uploadCampaignImageFile,
  type NewsletterSubscriber,
  type CampaignOffer,
} from "../lib/newsletter";
import {
  DEFAULT_CAMPAIGN_TEMPLATES,
  type CampaignTemplateConfig,
} from "../lib/emailTemplates";
import AdminNewsletterBoxStudio from "./AdminNewsletterBoxStudio";
import { useSiteControls } from "../context/SiteControlsContext";
import SubscribersTab from "./newsletter/SubscribersTab";
import CampaignHistoryTab from "./newsletter/CampaignHistoryTab";
import WelcomeSettingsTab from "./newsletter/WelcomeSettingsTab";
import AddTemplateModal from "./newsletter/AddTemplateModal";
import CampaignComposeTab from "./newsletter/CampaignComposeTab";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  lang?: "ar" | "en";
  embedded?: boolean;
  initialTab?: "subscribers" | "compose" | "history" | "welcome_settings" | "box_design";
}

// Helper to guarantee absolute HTTPS image URLs for Supabase and external CDNs
const normalizeImageUrl = (raw: string): string => {
  const clean = (raw || "").trim();
  if (!clean) return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?fm=jpg&fit=crop&w=1200&q=85";
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
    return clean;
  }
  const cleanPath = clean.replace(/^\/+/, "").replace(/^product-images\//, "");
  return `https://gjjsdnyfhhbacuciqwbq.supabase.co/storage/v1/object/public/product-images/${cleanPath}`;
};

export default function AdminNewsletterManager({
  isOpen = true,
  onClose,
  lang = "ar",
  embedded = false,
  initialTab,
}: Props) {
  const isAr = lang === "ar";
  const { siteSettings } = useSiteControls();
  const [activeTab, setActiveTab] = useState<"subscribers" | "compose" | "history" | "welcome_settings" | "box_design">(
    initialTab || "compose"
  );

  const mainFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOffer[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplateConfig[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Campaign Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl_welcome_vip");
  const [campaignTitle, setCampaignTitle] = useState("الترحيب بالعضوية الحصرية · كود 15%");
  const [campaignSubject, setCampaignSubject] = useState("Welcome to VANT // Access Granted (VANT-WELCOME-15)");
  const [campaignHeadline, setCampaignHeadline] = useState("أهلاً بك في الأرشيف الخاص لـ ڤانت");
  const [campaignBadge, setCampaignBadge] = useState("VIP PRIVILEGE ACCESS");
  const [discountCode, setDiscountCode] = useState("VANT-WELCOME-15");
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [campaignMessage, setCampaignMessage] = useState(
    "يسعدنا انضمامك إلى القائمة الحصرية لعشاق الخياطة الراقية والتصاميم المعمارية الفاخرة. استمتع بتجربة تسوق استثنائية مع كود الخصم الترحيبي الخاص بطلبك الأول."
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
  );
  const [ctaButtonText, setCtaButtonText] = useState("تصفح التشكيلة واستفد من الخصم");
  const [testRecipientEmail, setTestRecipientEmail] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [customStoreUrl, setCustomStoreUrl] = useState(
    siteSettings.custom_store_url || "https://vant-web.vercel.app/"
  );

  useEffect(() => {
    if (siteSettings.custom_store_url) {
      setCustomStoreUrl(siteSettings.custom_store_url);
    }
  }, [siteSettings.custom_store_url]);

  // Custom Template Creation Modal State
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);

  // Initial Data Load & Cloud Sync
  useEffect(() => {
    if (isOpen || embedded) {
      loadData();
    }
  }, [isOpen, embedded]);

  const loadData = async () => {
    try {
      const localSubs = getStoredSubscribers();
      setSubscribers(localSubs);
      setCampaigns(getSavedCampaigns());
      setTemplates(getStoredCampaignTemplates());

      // Background cloud sync
      const syncedSubs = await syncSubscribersFromCloud();
      setSubscribers(syncedSubs);
    } catch (e) {
      console.warn("Failed to load newsletter data", e);
    }
  };

  // Switch Active Template
  const handleSelectTemplate = (tpl: CampaignTemplateConfig) => {
    setSelectedTemplateId(tpl.id);
    setCampaignTitle(isAr ? tpl.title : tpl.titleEn);
    setCampaignSubject(tpl.subject);
    setCampaignHeadline(isAr ? tpl.headline : tpl.headlineEn);
    setCampaignBadge(isAr ? tpl.badgeText : tpl.badgeTextEn);
    setDiscountCode(tpl.discountCode);
    setDiscountPercent(tpl.discountPercent);
    setCampaignMessage(isAr ? tpl.message : tpl.messageEn);
    setHeroImageUrl(tpl.heroImage);
    setCtaButtonText(isAr ? tpl.ctaText : tpl.ctaTextEn);
    setUploadedFileName(null);
  };

  // Handle Image File Upload for Main Campaign Form
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadCampaignImageFile(file);
      setHeroImageUrl(normalizeImageUrl(uploadedUrl));
      setUploadedFileName(file.name);
      setFeedbackMsg({
        type: "success",
        text: isAr ? `✓ تم رفع وتثبيت صورة الغلاف (${file.name})` : `Image uploaded (${file.name})`,
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      setFeedbackMsg({
        type: "error",
        text: isAr ? "فشل رفع ملف الصورة، يرجى المحاولة ثانية" : "Failed to upload image file",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const activeCount = useMemo(
    () => subscribers.filter((s) => s.status === "active").length,
    [subscribers]
  );

  const handleCopyBCCList = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === "active")
      .map((s) => s.email.trim())
      .join(", ");

    if (!activeEmails) {
      setFeedbackMsg({
        type: "error",
        text: isAr ? "لا يوجد مشتركون نشطون للنسخ" : "No active subscribers to copy",
      });
      return;
    }

    navigator.clipboard.writeText(activeEmails);
    setCopiedKey("bcc-list");
    setTimeout(() => setCopiedKey(null), 2500);
    setFeedbackMsg({
      type: "success",
      text: isAr
        ? `تم نسخ (${activeCount}) بريد إلكتروني كـ BCC وجاهزة للإرسال الجماعي!`
        : `Copied ${activeCount} emails to clipboard (BCC ready)!`,
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Test send campaign to specific email
  const handleTestDispatchCampaign = async () => {
    const target = testRecipientEmail.trim().toLowerCase();
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      alert(isAr ? "يرجى كتابة بريد إلكتروني صحيح لإجراء الإرسال التجريبي" : "Please enter a valid email address for testing");
      return;
    }

    setIsDispatching(true);
    try {
      const activeTpl = templates.find((t) => t.id === selectedTemplateId);
      const res = await dispatchCampaignEmail({
        recipientEmail: target,
        template: activeTpl,
        customHeadline: campaignHeadline,
        customMessage: campaignMessage,
        couponCode: discountCode,
        discountPercent: Number(discountPercent),
        subject: campaignSubject,
        badgeText: campaignBadge,
        heroImage: normalizeImageUrl(heroImageUrl),
        ctaText: ctaButtonText,
        ctaUrl: customStoreUrl,
      });

      if (res.emailSent) {
        setFeedbackMsg({
          type: "success",
          text: isAr
            ? `✓ تم إرسال نسخة العرض الفاخرة المعتمدة إلى إيميلك (${target}) بنجاح!`
            : `Delivered luxury email to (${target})!`,
        });
      } else {
        setFeedbackMsg({
          type: "success",
          text: isAr
            ? `✓ تم توثيق الرسالة في السجل وفتح مسودة الإرسال إلى (${target})!`
            : `Campaign documented and prepared for (${target})!`,
        });
      }
      setCampaigns(getSavedCampaigns());
    } catch {
      setFeedbackMsg({
        type: "error",
        text: isAr ? "حدث خطأ أثناء محاولة إرسال العرض" : "Error sending campaign",
      });
    } finally {
      setIsDispatching(false);
      setTimeout(() => setFeedbackMsg(null), 4500);
    }
  };

  // Send via Mail Client (BCC Broadcast)
  const handleSendViaMailClient = async () => {
    if (activeCount === 0) {
      alert(isAr ? "لا يوجد مشتركون نشطون لإرسال العرض لهم" : "No active subscribers to send to");
      return;
    }

    const mailBody = `${campaignHeadline}\n\n${campaignMessage}\n\nبيانات الخصم:\n• كود الخصم: ${discountCode}\n• نسبة الخصم: ${discountPercent}%\n• رابط المتجر: https://vant.fashion\n\nفريق ڤانت للأزياء الحصرية`;
    const mailto = generateMailtoLink(subscribers, campaignSubject, mailBody);
    if (!mailto) return;

    // Record the campaign in archive
    const recorded = await recordCampaign({
      title: campaignTitle,
      subject: campaignSubject,
      discount_code: discountCode,
      discount_percent: discountPercent,
      body: mailBody,
      sent_count: activeCount,
      template_id: selectedTemplateId,
    });
    setCampaigns((prev) => [recorded, ...prev]);

    // Open mail client
    window.location.href = mailto;

    setFeedbackMsg({
      type: "success",
      text: isAr
        ? `تم تجهيز رسالة العرض في برنامج البريد لـ (${activeCount}) مشترك، وحفظ العرض في السجل!`
        : `Email prepared for ${activeCount} recipients and campaign saved to archive!`,
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Delete template
  const handleDeleteTemplate = async (tplId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isAr ? "هل أنت متأكد من حذف هذا القالب؟" : "Delete this template?")) {
      const updated = await deleteCampaignTemplate(tplId);
      setTemplates(updated);
      if (selectedTemplateId === tplId) {
        handleSelectTemplate(updated[0] || DEFAULT_CAMPAIGN_TEMPLATES[0]);
      }
    }
  };

  const content = (
    <div className={`flex flex-col text-black dark:text-white font-sans ${embedded ? "space-y-5" : "relative w-full max-w-5xl max-h-[92vh] rounded-3xl border border-black/10 dark:border-white/10 bg-[#f8f9fa] dark:bg-[#0d0f12] shadow-2xl overflow-hidden"}`}>
      
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-6 py-4.5 border-b border-black/5 dark:border-white/10 ${embedded ? "bg-white/80 dark:bg-[#14171d]/90 rounded-2xl border" : "bg-white/80 dark:bg-[#14171d]/90 backdrop-blur-xl"}`}>
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004ad7] to-[#3b82f6] text-white shadow-lg shadow-[#004ad7]/25">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#15171c] dark:text-white">
                {isAr ? "مركز النشرة البريدية والعروض الحصرية" : "VANT Newsletter & Campaign Studio"}
              </h2>
              <span className="rounded-full bg-[#004ad7]/10 dark:bg-[#004ad7]/20 border border-[#004ad7]/30 px-3 py-0.5 text-xs font-bold text-[#004ad7] dark:text-[#60a5fa] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#004ad7] dark:bg-[#3b82f6] animate-pulse" />
                <span>{activeCount} {isAr ? "مشترك نشط" : "active members"}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isAr
                ? "إدارة إيميلات المشتركين، تصميم العروض الحصرية، ورفع الصور كملفات مباشرة"
                : "Manage subscriber dossier, upload campaign images as files, and dispatch official emails"}
            </p>
          </div>
        </div>

        {!embedded && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`mx-6 mt-3 px-4 py-2.5 text-xs font-semibold flex items-center gap-2 rounded-xl border ${
            feedbackMsg.type === "success"
              ? "bg-[#004ad7]/10 text-[#004ad7] dark:text-[#93c5fd] border-[#004ad7]/30"
              : "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#004ad7] dark:text-[#60a5fa]" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          )}
          <span>{feedbackMsg.text}</span>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className={`flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-black/5 dark:border-white/10 ${embedded ? "bg-white/60 dark:bg-[#11141a] rounded-2xl border" : "bg-white/60 dark:bg-[#11141a]"} overflow-x-auto text-xs font-bold`}>
        <button
          type="button"
          onClick={() => setActiveTab("compose")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === "compose"
              ? "bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold"
              : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>{isAr ? "واجهات العروض والحملات" : "Campaign & Offer Templates"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === "subscribers"
              ? "bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold"
              : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{isAr ? "قائمة المشتركين" : "Subscribers Dossier"}</span>
          <span className="bg-black/10 dark:bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
            {subscribers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("welcome_settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === "welcome_settings"
              ? "bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold"
              : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>{isAr ? "إعدادات الترحيب التلقائي" : "Welcome Automation"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("box_design")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === "box_design"
              ? "bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold"
              : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Sliders className="h-4 w-4 text-emerald-400" />
          <span>{isAr ? "تخصيص مستطيل النشرة في المتجر" : "Store Box Customizer"}</span>
          <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full text-[9.5px]">
            {isAr ? "تعديل شامل" : "Studio"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
            activeTab === "history"
              ? "bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/25 font-bold"
              : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <History className="h-4 w-4" />
          <span>{isAr ? "سجل الحملات" : "Sent History"}</span>
        </button>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: COMPOSE & TEMPLATES STUDIO */}
        {activeTab === "compose" && (
          <CampaignComposeTab
            isAr={isAr}
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            handleSelectTemplate={handleSelectTemplate}
            handleDeleteTemplate={handleDeleteTemplate}
            setShowAddTemplateModal={setShowAddTemplateModal}
            campaignTitle={campaignTitle}
            setCampaignTitle={setCampaignTitle}
            campaignSubject={campaignSubject}
            setCampaignSubject={setCampaignSubject}
            campaignHeadline={campaignHeadline}
            setCampaignHeadline={setCampaignHeadline}
            campaignBadge={campaignBadge}
            setCampaignBadge={setCampaignBadge}
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            campaignMessage={campaignMessage}
            setCampaignMessage={setCampaignMessage}
            customStoreUrl={customStoreUrl}
            setCustomStoreUrl={setCustomStoreUrl}
            ctaButtonText={ctaButtonText}
            setCtaButtonText={setCtaButtonText}
            heroImageUrl={heroImageUrl}
            setHeroImageUrl={setHeroImageUrl}
            uploadedFileName={uploadedFileName}
            setUploadedFileName={setUploadedFileName}
            isUploadingImage={isUploadingImage}
            mainFileInputRef={mainFileInputRef}
            handleMainImageUpload={handleMainImageUpload}
            testRecipientEmail={testRecipientEmail}
            setTestRecipientEmail={setTestRecipientEmail}
            handleTestDispatchCampaign={handleTestDispatchCampaign}
            isDispatching={isDispatching}
            handleSendViaMailClient={handleSendViaMailClient}
            handleCopyBCCList={handleCopyBCCList}
            copiedKey={copiedKey}
            activeCount={activeCount}
            normalizeImageUrl={normalizeImageUrl}
            editionNoteFromTpl={editionNoteFromTpl}
          />
        )}

        {/* TAB 2: SUBSCRIBERS DOSSIER */}
        {activeTab === "subscribers" && (
          <SubscribersTab
            isAr={isAr}
            subscribers={subscribers}
            setSubscribers={setSubscribers}
            setFeedbackMsg={setFeedbackMsg}
          />
        )}

        {/* TAB 3: WELCOME AUTOMATION SETTINGS */}
        {activeTab === "welcome_settings" && (
          <WelcomeSettingsTab
            isAr={isAr}
            heroImageUrl={heroImageUrl}
            setFeedbackMsg={setFeedbackMsg}
          />
        )}

        {/* TAB 4: CAMPAIGNS HISTORY */}
        {activeTab === "history" && (
          <CampaignHistoryTab
            isAr={isAr}
            campaigns={campaigns}
          />
        )}

        {/* TAB 5: NEWSLETTER STORE BOX CUSTOMIZER */}
        {activeTab === "box_design" && (
          <AdminNewsletterBoxStudio isAr={isAr} />
        )}
      </div>

      {/* Modal: Add Custom Template */}
      <AddTemplateModal
        isOpen={showAddTemplateModal}
        onClose={() => setShowAddTemplateModal(false)}
        isAr={isAr}
        onTemplateCreated={(newTpl) => {
          setTemplates((prev) => [newTpl, ...prev]);
          handleSelectTemplate(newTpl);
        }}
        setFeedbackMsg={setFeedbackMsg}
      />
    </div>
  );

  if (embedded) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-5xl"
        >
          {content}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function editionNoteFromTpl(tplId: string): string {
  switch (tplId) {
    case "tpl_welcome_vip":
      return "ONBOARDING // VIP VERIFIED";
    case "tpl_new_drop":
      return "RUNWAY CAPSULE // LIMITED RUN";
    case "tpl_weekend_sale":
      return "TIME-LIMITED // 48H VAULT";
    case "tpl_loyalty_gift":
      return "TIER NOIR // BESPOKE REWARD";
    case "tpl_restock_alert":
      return "RESTOCKED // SERIALIZED";
    default:
      return "ARCHIVE // EXCLUSIVE CURATION";
  }
}
