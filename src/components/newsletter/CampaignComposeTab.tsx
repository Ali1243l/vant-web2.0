import React from "react";
import {
  Tag,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Upload,
  Send,
  Check,
  Copy,
} from "lucide-react";
import {
  DEFAULT_CAMPAIGN_TEMPLATES,
  type CampaignTemplateConfig,
} from "../../lib/emailTemplates";
import WelcomeEmailTemplate from "../WelcomeEmailTemplate";

const CURATED_FASHION_PRESETS = [
  {
    id: "p1",
    nameAr: "موديل ستريتوير",
    nameEn: "Streetwear Model",
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p2",
    nameAr: "معطف ورانوي",
    nameEn: "Runway Overcoat",
    url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    nameAr: "سيلويت أسود",
    nameEn: "Dark Silhouette",
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p4",
    nameAr: "تفصيل وخياطة راقية",
    nameEn: "Atelier Tailoring",
    url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
  },
];

interface CampaignComposeTabProps {
  isAr: boolean;
  templates: CampaignTemplateConfig[];
  selectedTemplateId: string;
  handleSelectTemplate: (tpl: CampaignTemplateConfig) => void;
  handleDeleteTemplate: (tplId: string, e: React.MouseEvent) => void;
  setShowAddTemplateModal: (show: boolean) => void;
  campaignTitle: string;
  setCampaignTitle: (val: string) => void;
  campaignSubject: string;
  setCampaignSubject: (val: string) => void;
  campaignHeadline: string;
  setCampaignHeadline: (val: string) => void;
  campaignBadge: string;
  setCampaignBadge: (val: string) => void;
  discountCode: string;
  setDiscountCode: (val: string) => void;
  discountPercent: number;
  setDiscountPercent: (val: number) => void;
  campaignMessage: string;
  setCampaignMessage: (val: string) => void;
  customStoreUrl: string;
  setCustomStoreUrl: (val: string) => void;
  ctaButtonText: string;
  setCtaButtonText: (val: string) => void;
  heroImageUrl: string;
  setHeroImageUrl: (val: string) => void;
  uploadedFileName: string | null;
  setUploadedFileName: (val: string | null) => void;
  isUploadingImage: boolean;
  mainFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleMainImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  testRecipientEmail: string;
  setTestRecipientEmail: (val: string) => void;
  handleTestDispatchCampaign: () => Promise<void>;
  isDispatching: boolean;
  handleSendViaMailClient: () => Promise<void>;
  handleCopyBCCList: () => void;
  copiedKey: string | null;
  activeCount: number;
  normalizeImageUrl: (url: string) => string;
  editionNoteFromTpl: (tplId: string) => string;
}

export const CampaignComposeTab: React.FC<CampaignComposeTabProps> = ({
  isAr,
  templates,
  selectedTemplateId,
  handleSelectTemplate,
  handleDeleteTemplate,
  setShowAddTemplateModal,
  campaignSubject,
  setCampaignSubject,
  campaignHeadline,
  setCampaignHeadline,
  campaignBadge,
  setCampaignBadge,
  discountCode,
  setDiscountCode,
  discountPercent,
  setDiscountPercent,
  campaignMessage,
  setCampaignMessage,
  customStoreUrl,
  setCustomStoreUrl,
  ctaButtonText,
  setCtaButtonText,
  heroImageUrl,
  setHeroImageUrl,
  uploadedFileName,
  setUploadedFileName,
  isUploadingImage,
  mainFileInputRef,
  handleMainImageUpload,
  testRecipientEmail,
  setTestRecipientEmail,
  handleTestDispatchCampaign,
  isDispatching,
  handleSendViaMailClient,
  handleCopyBCCList,
  copiedKey,
  activeCount,
  normalizeImageUrl,
  editionNoteFromTpl,
}) => {
  return (
          <div className="space-y-6">
            
            {/* Template Selector Carousel / Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <Tag className="h-4 w-4 text-[#004ad7] dark:text-[#3b82f6]" />
                  <span>{isAr ? 'اختر قالب العرض الترويجي (أو أضف قالباً جديداً):' : 'Select Campaign Template Preset:'}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowAddTemplateModal(true)}
                  className="inline-flex items-center gap-1.5 bg-[#004ad7]/10 dark:bg-[#004ad7]/20 hover:bg-[#004ad7]/20 dark:hover:bg-[#004ad7]/30 border border-[#004ad7]/30 text-[#004ad7] dark:text-[#60a5fa] px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAr ? 'إضافة قالب جديد +' : 'Add New Template +'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const isDefault = DEFAULT_CAMPAIGN_TEMPLATES.some((d) => d.id === tpl.id);

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer text-start shadow-xs ${
                        isSelected
                          ? 'border-[#004ad7] bg-[#004ad7]/5 dark:bg-[#004ad7]/15 ring-2 ring-[#004ad7]/30'
                          : 'border-black/5 dark:border-white/10 bg-white dark:bg-[#14171d] hover:border-black/15 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">
                          {tpl.badgeText || 'SPECIAL OFFER'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#004ad7] dark:text-[#60a5fa] bg-[#004ad7]/10 dark:bg-[#004ad7]/25 px-2.5 py-0.5 rounded-full">
                            خصم {tpl.discountPercent}%
                          </span>
                          {!isDefault && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                              title={isAr ? 'حذف القالب' : 'Delete'}
                              className="text-zinc-400 hover:text-rose-500 transition-colors p-0.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="mt-2 text-sm font-bold text-[#15171c] dark:text-white line-clamp-1">
                        {isAr ? tpl.title : tpl.titleEn}
                      </h4>

                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 border-t border-black/5 dark:border-white/5 pt-2">
                        <span className="text-[#004ad7] dark:text-[#3b82f6] font-mono font-bold">{tpl.discountCode}</span>
                        <span className="text-[11px]">{isSelected ? (isAr ? 'محدد حالياً' : 'Active') : (isAr ? 'انقر للتحديد' : 'Select')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Editor and Live Luxury Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Offer Details Editor (Selector 2) */}
              <div className="lg:col-span-6 space-y-4.5 bg-white dark:bg-[#14171d] p-5 sm:p-6 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
                  <span className="text-sm font-bold text-[#15171c] dark:text-white">
                    {isAr ? 'تخصيص بيانات ورسالة العرض' : 'Customize Offer Copy'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#004ad7] dark:text-[#60a5fa] bg-[#004ad7]/10 dark:bg-[#004ad7]/20 px-2.5 py-0.5 rounded-md">
                    {discountCode}
                  </span>
                </div>

                {/* Email Subject Line */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                    {isAr ? 'عنوان الرسالة (Email Subject):' : 'Email Subject:'}
                  </label>
                  <input
                    type="text"
                    value={campaignSubject}
                    onChange={(e) => setCampaignSubject(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2.5 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
                  />
                </div>

                {/* Badge & Headline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                      {isAr ? 'وسم الترويسة (Badge):' : 'Badge Tag:'}
                    </label>
                    <input
                      type="text"
                      value={campaignBadge}
                      onChange={(e) => setCampaignBadge(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                      {isAr ? 'العنوان الرئيسي داخل الرسالة:' : 'Headline:'}
                    </label>
                    <input
                      type="text"
                      value={campaignHeadline}
                      onChange={(e) => setCampaignHeadline(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7] font-bold"
                    />
                  </div>
                </div>

                {/* Code & Discount Percent */}
                <div className="grid grid-cols-2 gap-3 bg-black/5 dark:bg-black/30 p-3.5 rounded-2xl border border-black/5 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      {isAr ? 'رمز كود الخصم:' : 'Discount Code:'}
                    </label>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-[#004ad7]/30 bg-white dark:bg-black px-3 py-2 text-xs font-mono font-bold text-[#004ad7] dark:text-[#60a5fa] uppercase outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      {isAr ? 'نسبة الخصم (%):' : 'Discount Percent (%):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full rounded-xl border border-black/10 dark:border-white/20 bg-white dark:bg-black px-3 py-2 text-xs font-bold text-black dark:text-white outline-none shadow-xs"
                    />
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1.5">
                    {isAr ? 'نص بيان وتفاصيل العرض:' : 'Offer Message Text:'}
                  </label>
                  <textarea
                    rows={4}
                    value={campaignMessage}
                    onChange={(e) => setCampaignMessage(e.target.value)}
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black/40 p-3.5 text-xs text-black dark:text-white leading-relaxed outline-none focus:border-[#004ad7]"
                  />
                </div>

                {/* Store URL & CTA Button Text (Editable Domain for Future Proofing) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/5 dark:bg-black/30 p-3.5 rounded-2xl border border-black/5 dark:border-white/10">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {isAr ? 'رابط المتجر / الدومين:' : 'Store URL / Domain:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomStoreUrl('https://vant-web.vercel.app/')}
                        className="text-[10px] text-[#004ad7] dark:text-[#60a5fa] hover:underline"
                      >
                        {isAr ? 'افتراضي' : 'Default'}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={customStoreUrl}
                      onChange={(e) => setCustomStoreUrl(e.target.value)}
                      placeholder="https://vant-web.vercel.app/"
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 py-2 text-xs font-mono text-black dark:text-white outline-none focus:border-[#004ad7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      {isAr ? 'نص زر الإجراء (CTA Text):' : 'CTA Button Text:'}
                    </label>
                    <input
                      type="text"
                      value={ctaButtonText}
                      onChange={(e) => setCtaButtonText(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 py-2 text-xs font-bold text-black dark:text-white outline-none focus:border-[#004ad7]"
                    />
                  </div>
                </div>

                {/* HERO IMAGE FILE UPLOAD (Selector 1) */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#004ad7] dark:text-[#3b82f6]" />
                      <span>{isAr ? 'صورة الغلاف (رفع كملف مباشرة من جهازك):' : 'Editorial Hero Image (Upload File):'}</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">JPG, PNG, WEBP</span>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={mainFileInputRef}
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />

                  {/* Drag / Click Upload Area */}
                  <div className="border border-dashed border-black/15 dark:border-white/15 hover:border-[#004ad7] dark:hover:border-[#3b82f6] bg-black/5 dark:bg-black/40 p-4 rounded-2xl transition-all text-center space-y-2">
                    {heroImageUrl ? (
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-20 shrink-0 rounded-xl border border-black/10 dark:border-white/20 overflow-hidden bg-black shadow-xs">
                          <img
                            src={heroImageUrl}
                            alt="Banner Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-start min-w-0">
                          <span className="text-xs font-bold text-black dark:text-white block truncate">
                            {uploadedFileName || (isAr ? 'صورة الغلاف المعتمدة' : 'Active Banner')}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                            {isAr ? '✓ الصورة جاهزة للإرسال في الإيميل' : '✓ Ready for dispatch'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => mainFileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 text-black dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 border border-black/5 dark:border-white/10"
                          >
                            {isUploadingImage ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6]" />
                            )}
                            <span>{isAr ? 'تغيير الملف' : 'Replace'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => mainFileInputRef.current?.click()}
                        className="py-4 cursor-pointer hover:opacity-85 transition-opacity"
                      >
                        <Upload className="h-7 w-7 text-[#004ad7] dark:text-[#3b82f6] mx-auto mb-2" />
                        <span className="text-xs font-bold text-black dark:text-white block">
                          {isAr ? 'انقر هنا لرفع صورة من جهازك كملف' : 'Click to upload image file from device'}
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-1">
                          {isAr ? 'أو اختر من النماذج الجاهزة أدناه' : 'or choose a preset below'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Direct Image URL input */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      {isAr ? 'أو أدخل رابط صورة مباشر (URL):' : 'Or enter direct image URL:'}
                    </label>
                    <input
                      type="url"
                      value={heroImageUrl}
                      onChange={(e) => {
                        setHeroImageUrl(e.target.value);
                        setUploadedFileName(null);
                      }}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          setHeroImageUrl(normalizeImageUrl(e.target.value));
                        }
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3 py-1.5 text-xs font-mono text-black dark:text-white outline-none focus:border-[#004ad7]"
                    />
                  </div>

                  {/* Curated Presets Quick Selector */}
                  <div>
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-2">
                      {isAr ? 'أو اختر صورة جاهزة بنقرة واحدة:' : 'Or choose curated preset:'}
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {CURATED_FASHION_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setHeroImageUrl(p.url);
                            setUploadedFileName(isAr ? p.nameAr : p.nameEn);
                          }}
                          className={`relative h-14 rounded-xl border overflow-hidden transition-all cursor-pointer group shadow-xs ${
                            heroImageUrl === p.url
                              ? 'border-[#004ad7] dark:border-[#3b82f6] ring-2 ring-[#004ad7]/30'
                              : 'border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25'
                          }`}
                        >
                          {p.url?.trim() ? (
                            <img
                              src={p.url}
                              alt={p.nameEn}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                            <span className="text-[9px] text-white truncate font-bold">
                              {isAr ? p.nameAr : p.nameEn}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dispatch Controls */}
                <div className="pt-3 border-t border-black/5 dark:border-white/10 space-y-3">
                  {/* Test Dispatch to Single Email */}
                  <div className="bg-black/5 dark:bg-black/40 p-4 rounded-2xl border border-black/5 dark:border-white/10 space-y-2.5">
                    <span className="text-xs font-bold text-[#15171c] dark:text-white block">
                      {isAr ? 'إرسال نسخة تجريبية فورية إلى بريدك:' : 'Send Test Copy to Your Inbox:'}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={testRecipientEmail}
                        onChange={(e) => setTestRecipientEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-black px-3.5 py-2 text-xs text-black dark:text-white font-mono outline-none focus:border-[#004ad7]"
                      />
                      <button
                        type="button"
                        onClick={handleTestDispatchCampaign}
                        disabled={isDispatching}
                        className="inline-flex items-center gap-1.5 bg-[#004ad7] hover:bg-[#003db3] text-white px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-md shadow-[#004ad7]/20"
                      >
                        {isDispatching ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        <span>{isAr ? 'إرسال تجريبي' : 'Send Test'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mass Broadcast Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSendViaMailClient}
                      className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-[#004ad7] to-[#2563eb] hover:from-[#003db3] hover:to-[#1d4ed8] text-white py-3 px-5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#004ad7]/30 active:scale-98"
                    >
                      <Send className="h-4 w-4" />
                      <span>
                        {isAr
                          ? `إرسال العرض للمشتركين (${activeCount})`
                          : `Broadcast to ${activeCount} Subscribers`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyBCCList}
                      className="flex items-center gap-1.5 border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white px-4 py-3 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-98"
                    >
                      {copiedKey === 'bcc-list' ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>{isAr ? 'نسخ BCC' : 'Copy BCC'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Luxury Email Template Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-500 px-1">
                  <span>{isAr ? 'معاينة الواجهة الحية للبريد:' : 'Live Email Client Preview:'}</span>
                  <span className="text-[#004ad7] dark:text-[#60a5fa]">{editionNoteFromTpl(selectedTemplateId)}</span>
                </div>

                <WelcomeEmailTemplate
                  welcomeTitle={campaignHeadline}
                  welcomeMessage={campaignMessage}
                  couponCode={discountCode}
                  discountPercent={discountPercent}
                  badgeText={campaignBadge}
                  heroImage={normalizeImageUrl(heroImageUrl)}
                  ctaText={ctaButtonText}
                  ctaUrl={customStoreUrl}
                  customerEmail={testRecipientEmail || 'client@vant.archive'}
                  isInteractive={true}
                />
              </div>

            </div>
          </div>
  );
};

export default CampaignComposeTab;
