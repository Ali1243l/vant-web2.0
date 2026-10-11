import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Tag,
  Copy,
  Download,
  Eye,
  Monitor,
  Smartphone,
  Code,
  Check,
} from 'lucide-react';
import { Card, Button } from '../ui';
import {
  WelcomeEmailTemplate,
  generateEmailHtml,
  EmailCampaignData,
} from '../WelcomeEmailTemplate';
import type { Subscriber, Product } from '../useAdminBridge';
import { templatePresets, heroPresets } from './presets';

interface Props {
  campaignData: EmailCampaignData;
  setCampaignData: React.Dispatch<React.SetStateAction<EmailCampaignData>>;
  handleSelectTemplate: (t: EmailCampaignData['templateType']) => void;
  subscribers: Subscriber[];
  currentAudienceList: Subscriber[];
  selectedAudience: 'active' | 'all' | 'vip';
  setSelectedAudience: (v: 'active' | 'all' | 'vip') => void;
  getAudienceSubscribers: (type: 'active' | 'all' | 'vip') => Subscriber[];
  previewDevice: 'desktop' | 'mobile';
  setPreviewDevice: (v: 'desktop' | 'mobile') => void;
  showHtmlCode: boolean;
  setShowHtmlCode: (v: boolean) => void;
  handleCopyHtmlCode: () => void;
  handleDownloadHtmlFile: () => void;
  products: Product[];
  isAr: boolean;
}

export const CampaignStudioTab: React.FC<Props> = ({
  campaignData,
  setCampaignData,
  handleSelectTemplate,
  subscribers,
  currentAudienceList,
  selectedAudience,
  setSelectedAudience,
  getAudienceSubscribers,
  previewDevice,
  setPreviewDevice,
  showHtmlCode,
  setShowHtmlCode,
  handleCopyHtmlCode,
  handleDownloadHtmlFile,
  isAr,
}) => {
  return (
    <motion.div
      key="tab-studio"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Template Selector Banner */}
      <Card className="p-4 bg-slate-900/60 border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'اختر قالب الحملة التسويقية' : 'Select Campaign Template'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'اختر من بين 5 قوالب مجهزة باحترافية أو خصص النصوص والصور كما يناسبك.'
                : 'Choose from 5 high-converting templates or customize your copy and visuals.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{isAr ? 'المشتركون المستهدفون:' : 'Target Audience:'}</span>
            <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              {currentAudienceList.length} {isAr ? 'مشترك' : 'subscribers'}
            </span>
          </div>
        </div>

        {/* Template Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(Object.keys(templatePresets) as Array<EmailCampaignData['templateType']>).map((tKey) => {
            const item = templatePresets[tKey];
            const Icon = item.icon;
            const isSelected = campaignData.templateType === tKey;
            return (
              <button
                key={tKey}
                onClick={() => handleSelectTemplate(tKey)}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg bg-slate-900 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{isAr ? item.nameAr : item.nameEn}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.nameEn}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Side-by-Side Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Campaign Builder Form */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>{isAr ? 'محتوى الرسالة والعرض' : 'Email Content & Details'}</span>
              </h4>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${templatePresets[campaignData.templateType].badgeBg}`}>
                {templatePresets[campaignData.templateType].nameAr}
              </span>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'عنوان البريد الإلكتروني (Subject Line)' : 'Email Subject Line'}
              </label>
              <input
                type="text"
                value={campaignData.subject}
                onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="مثال: 🎉 مرحباً بك! خصم 20% بانتظارك"
              />
            </div>

            {/* Preheader */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'النص المعاين قبل الفتح (Preheader)' : 'Preheader Text'}
              </label>
              <input
                type="text"
                value={campaignData.preheader}
                onChange={(e) => setCampaignData({ ...campaignData, preheader: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="النص الذي يظهر في صندوق الوارد بجانب العنوان"
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'العنوان الداخلي الرئيسي (Headline)' : 'Main Banner Headline'}
              </label>
              <input
                type="text"
                value={campaignData.headline}
                onChange={(e) => setCampaignData({ ...campaignData, headline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Body Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'نص الرسالة التسويقية' : 'Body Copy'}
              </label>
              <textarea
                rows={4}
                value={campaignData.bodyText}
                onChange={(e) => setCampaignData({ ...campaignData, bodyText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Coupon Block Inputs */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'قسيمة وكود الخصم' : 'Discount Coupon'}</span>
                </span>
                <span className="text-[10px] text-slate-400">{isAr ? 'اختياري' : 'Optional'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'كود الخصم' : 'Coupon Code'}</label>
                  <input
                    type="text"
                    value={campaignData.discountCode || ''}
                    onChange={(e) => setCampaignData({ ...campaignData, discountCode: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-xs font-bold rounded-lg px-2.5 py-1.5 uppercase"
                    placeholder="WELCOME20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'نسبة الخصم / الوصف' : 'Discount Label'}</label>
                  <input
                    type="text"
                    value={campaignData.discountPercent || ''}
                    onChange={(e) => setCampaignData({ ...campaignData, discountPercent: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5"
                    placeholder="20% خصم فوري"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{isAr ? 'صلاحية العرض / الاستعجال' : 'Urgency Note'}</label>
                <input
                  type="text"
                  value={campaignData.expireDate || ''}
                  onChange={(e) => setCampaignData({ ...campaignData, expireDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5"
                  placeholder="خلال 48 ساعة فقط"
                />
              </div>
            </div>

            {/* Hero Image Selector & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'صورة الغلاف الرئيسية (Hero Banner)' : 'Hero Banner Image'}
                </label>
              </div>

              <input
                type="url"
                value={campaignData.heroImage}
                onChange={(e) => setCampaignData({ ...campaignData, heroImage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 font-mono"
                placeholder="https://..."
              />

              {/* Preset quick buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                {heroPresets.map((hp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCampaignData({ ...campaignData, heroImage: hp.url })}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                      campaignData.heroImage === hp.url
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {hp.labelAr}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button Text & Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'نص زر الشراء (CTA)' : 'Button Label'}
                </label>
                <input
                  type="text"
                  value={campaignData.ctaText}
                  onChange={(e) => setCampaignData({ ...campaignData, ctaText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2"
                  placeholder="تسوق التشكيلة الآن"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'رابط الزر (URL)' : 'Button Link'}
                </label>
                <input
                  type="text"
                  value={campaignData.ctaUrl}
                  onChange={(e) => setCampaignData({ ...campaignData, ctaUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 font-mono"
                  placeholder="https://store.example.com"
                />
              </div>
            </div>

            {/* Audience Selection */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'تحديد شريحة المشتركين المستهدفة' : 'Target Audience Segment'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAudience('active')}
                  className={`p-2.5 rounded-xl border text-start text-xs cursor-pointer transition-all ${
                    selectedAudience === 'active'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">{isAr ? 'المشتركون النشطون' : 'Active Subscribers'}</div>
                  <div className="text-[10px] text-slate-400">
                    {subscribers.filter((s) => s.status === 'active').length} {isAr ? 'مشترك' : 'users'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAudience('vip')}
                  className={`p-2.5 rounded-xl border text-start text-xs cursor-pointer transition-all ${
                    selectedAudience === 'vip'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">{isAr ? 'عملاء VIP ذوو الإنفاق العالي' : 'High Spenders (VIP)'}</div>
                  <div className="text-[10px] text-slate-400">
                    {getAudienceSubscribers('vip').length} {isAr ? 'مشترك' : 'users'}
                  </div>
                </button>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<Copy className="w-4 h-4 text-indigo-400" />}
              onClick={handleCopyHtmlCode}
              className="flex-1"
            >
              {isAr ? 'نسخ كود HTML' : 'Copy HTML'}
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4 text-emerald-400" />}
              onClick={handleDownloadHtmlFile}
              className="flex-1"
            >
              {isAr ? 'تحميل كملف .html' : 'Download .html'}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Responsive Preview */}
        <div className="lg:col-span-7 space-y-4">
          {/* Preview Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>{isAr ? 'المعاينة الحية المتجاوبة' : 'Live Responsive Preview'}</span>
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live React Render
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Desktop View */}
              <button
                onClick={() => {
                  setPreviewDevice('desktop');
                  setShowHtmlCode(false);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  previewDevice === 'desktop' && !showHtmlCode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isAr ? 'معاينة سطح المكتب (Desktop)' : 'Desktop View'}
              >
                <Monitor className="w-4 h-4" />
              </button>

              {/* Mobile View */}
              <button
                onClick={() => {
                  setPreviewDevice('mobile');
                  setShowHtmlCode(false);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  previewDevice === 'mobile' && !showHtmlCode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isAr ? 'معاينة شاشة الهاتف (Mobile 375px)' : 'Mobile View'}
              >
                <Smartphone className="w-4 h-4" />
              </button>

              {/* HTML Code Inspector */}
              <button
                onClick={() => setShowHtmlCode(!showHtmlCode)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showHtmlCode
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isAr ? 'عرض الكود المصدري (HTML)' : 'Inspect HTML Code'}
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewport Frame */}
          <div className="p-4 sm:p-6 bg-slate-950 border border-slate-800/80 rounded-2xl min-h-[580px] flex items-center justify-center overflow-x-auto shadow-inner">
            {showHtmlCode ? (
              <div className="w-full max-h-[640px] overflow-y-auto font-mono text-[11px] bg-slate-900 p-4 rounded-xl text-slate-300 border border-slate-800 whitespace-pre">
                {generateEmailHtml(campaignData)}
              </div>
            ) : (
              <WelcomeEmailTemplate
                data={campaignData}
                previewDevice={previewDevice}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
