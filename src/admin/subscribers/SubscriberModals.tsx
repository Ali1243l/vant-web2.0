import React from 'react';
import { Send, Radio, Mail, ExternalLink } from 'lucide-react';
import { Modal, Input, Button } from '../ui';
import { WelcomeEmailTemplate, EmailCampaignData } from '../WelcomeEmailTemplate';
import type { SentCampaignRecord } from './types';
import type { Subscriber } from '../useAdminBridge';
import { templatePresets } from './presets';

interface SubscriberModalsProps {
  // Add Subscriber Modal
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  formName: string;
  setFormName: (v: string) => void;
  formEmail: string;
  setFormEmail: (v: string) => void;
  formPhone: string;
  setFormPhone: (v: string) => void;
  formTag: string;
  setFormTag: (v: string) => void;
  handleCreate: (e: React.FormEvent) => void;

  // Test Email Modal
  isTestEmailModalOpen: boolean;
  setIsTestEmailModalOpen: (open: boolean) => void;
  testEmailAddress: string;
  setTestEmailAddress: (v: string) => void;
  handleSendTestEmail: () => void;

  // Dispatch Campaign Modal
  isDispatchModalOpen: boolean;
  setIsDispatchModalOpen: (open: boolean) => void;
  campaignData: EmailCampaignData;
  currentAudienceList: Subscriber[];
  isSendingSimulation: boolean;
  simulationProgress: number;
  handleBroadcastViaSimulator: (channel: 'resend' | 'simulation') => void;
  handleBroadcastViaMailto: () => void;

  // Preview History Modal
  previewingHistoryItem: SentCampaignRecord | null;
  setPreviewingHistoryItem: (item: SentCampaignRecord | null) => void;
  handleLoadCampaignFromHistory: (item: SentCampaignRecord) => void;

  isAr: boolean;
}

export const SubscriberModals: React.FC<SubscriberModalsProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
  formName,
  setFormName,
  formEmail,
  setFormEmail,
  formPhone,
  setFormPhone,
  formTag,
  setFormTag,
  handleCreate,

  isTestEmailModalOpen,
  setIsTestEmailModalOpen,
  testEmailAddress,
  setTestEmailAddress,
  handleSendTestEmail,

  isDispatchModalOpen,
  setIsDispatchModalOpen,
  campaignData,
  currentAudienceList,
  isSendingSimulation,
  simulationProgress,
  handleBroadcastViaSimulator,
  handleBroadcastViaMailto,

  previewingHistoryItem,
  setPreviewingHistoryItem,
  handleLoadCampaignFromHistory,

  isAr,
}) => {
  return (
    <>
      {/* MODAL 1: ADD SUBSCRIBER */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={isAr ? 'إضافة عميل أو مشترك جديد' : 'Add New Subscriber'}
        description={
          isAr
            ? 'أدخل معلومات الاتصال الخاصة بالعميل لحفظها في القاعدة.'
            : 'Register new customer contact details.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={isAr ? 'الاسم الكامل' : 'Full Name'}
            placeholder={isAr ? 'محمد الجبوري' : 'Ali Hassan'}
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <Input
            label={isAr ? 'البريد الإلكتروني' : 'Email Address'}
            type="email"
            placeholder="customer@example.com"
            required
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />

          <Input
            label={isAr ? 'رقم الهاتف / الجوال' : 'Phone Number'}
            placeholder="+964 770 123 4567"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />

          <Input
            label={isAr ? 'وسم / تصنيف مخصص' : 'Customer Tag'}
            placeholder={isAr ? 'عميل مميز' : 'VIP'}
            value={formTag}
            onChange={(e) => setFormTag(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" type="submit">
              {isAr ? 'حفظ العميل' : 'Save Subscriber'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: SEND TEST EMAIL */}
      <Modal
        isOpen={isTestEmailModalOpen}
        onClose={() => setIsTestEmailModalOpen(false)}
        title={isAr ? 'إرسال بريد تجريبي إلى بريدي' : 'Send Test Email to Admin'}
        description={
          isAr
            ? 'أدخل البريد الإلكتروني الذي ترغب في استلام المعاينة التجريبية عليه.'
            : 'Send a test preview to verify inbox appearance.'
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label={isAr ? 'البريد الإلكتروني للمعاينة' : 'Test Email Address'}
            type="email"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
          />

          <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
            {isAr
              ? 'سيتم إرسال بريد يحتوي على كافة التنسيقات والأزرار وأكواد الخصم لتجربتها بنفسك في صندوق الوارد.'
              : 'A test email rendered with real campaign assets will be dispatched to this inbox.'}
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsTestEmailModalOpen(false)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" leftIcon={<Send className="w-4 h-4" />} onClick={handleSendTestEmail}>
              {isAr ? 'إرسال المعاينة الآن' : 'Send Test Mail'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: DISPATCH CAMPAIGN */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title={isAr ? 'تأكيد إرسال وإطلاق الحملة' : 'Confirm Campaign Dispatch'}
        description={
          isAr
            ? 'يرجى مراجعة تفاصيل الحملة وشريحة المستلمين قبل بدء البث المباشر.'
            : 'Review summary details before broadcasting.'
        }
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'عنوان البريد:' : 'Subject:'}</span>
              <span className="font-bold text-white text-end max-w-[240px] truncate">
                {campaignData.subject}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'القالب المستخدم:' : 'Template:'}</span>
              <span className="text-indigo-400 font-semibold">
                {templatePresets[campaignData.templateType]?.nameAr}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'عدد المشتركين المستهدفين:' : 'Target Audience:'}</span>
              <span className="font-bold text-emerald-400 text-sm">
                {currentAudienceList.length} {isAr ? 'مشترك نشط' : 'recipients'}
              </span>
            </div>
          </div>

          {/* Simulation Progress Bar */}
          {isSendingSimulation ? (
            <div className="space-y-3 p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-xl text-center">
              <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <Send className="w-4 h-4 text-indigo-400 animate-bounce" />
                <span>{isAr ? 'جاري إرسال الحملة إلى المشتركين...' : 'Dispatching emails in progress...'}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${simulationProgress}%` }}
                />
              </div>
              <div className="text-xs font-mono text-indigo-300">
                {simulationProgress}% {isAr ? 'مكتمل' : 'completed'}
              </div>
            </div>
          ) : (
            /* Dispatch Options */
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isAr ? 'اختر قناة البث والإرسال:' : 'Select Dispatch Channel:'}
              </div>

              {/* Channel 1: Resend / Automated API */}
              <button
                type="button"
                onClick={() => handleBroadcastViaSimulator('resend')}
                className="w-full p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-950/40 text-start flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {isAr ? 'إرسال مباشر وسريع عبر Resend API' : 'Broadcast via Resend API'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isAr
                        ? 'إرسال فوري مع تسجيل تقارير التسليم ونسب الفتح التقديرية'
                        : 'Direct API dispatch with delivery tracking'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full border border-indigo-500/30">
                  {isAr ? 'موصى به' : 'Recommended'}
                </span>
              </button>

              {/* Channel 2: Mailto with BCC */}
              <button
                type="button"
                onClick={handleBroadcastViaMailto}
                className="w-full p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-start flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-200">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isAr ? 'فتح في تطبيق البريد المباشر (BCC)' : 'Open in Default Mail Client (BCC)'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isAr
                        ? 'يفتح Gmail / Outlook مع وضع عناوين المشتركين في النسخة المخفية BCC'
                        : 'Opens native client with all emails in BCC'}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              disabled={isSendingSimulation}
              onClick={() => setIsDispatchModalOpen(false)}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: PREVIEW SENT CAMPAIGN FROM HISTORY */}
      <Modal
        isOpen={!!previewingHistoryItem}
        onClose={() => setPreviewingHistoryItem(null)}
        title={previewingHistoryItem?.subject || ''}
        description={
          isAr
            ? `أرسلت بتاريخ: ${previewingHistoryItem?.sentDate}`
            : `Sent on: ${previewingHistoryItem?.sentDate}`
        }
        maxWidth="lg"
      >
        {previewingHistoryItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl text-xs border border-slate-800">
              <div>
                <span className="text-slate-400">{isAr ? 'المستلمون:' : 'Delivered:'} </span>
                <span className="font-bold text-white">{previewingHistoryItem.recipientsCount}</span>
              </div>
              <div>
                <span className="text-slate-400">{isAr ? 'نسبة الفتح:' : 'Open Rate:'} </span>
                <span className="font-bold text-indigo-400">{previewingHistoryItem.openRate}%</span>
              </div>
              <div>
                <span className="text-slate-400">{isAr ? 'نسبة النقر:' : 'Click Rate:'} </span>
                <span className="font-bold text-emerald-400">{previewingHistoryItem.clickRate}%</span>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800/80">
              <WelcomeEmailTemplate
                data={previewingHistoryItem.campaignData}
                previewDevice="desktop"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="primary"
                onClick={() => {
                  handleLoadCampaignFromHistory(previewingHistoryItem);
                  setPreviewingHistoryItem(null);
                }}
              >
                {isAr ? 'تعديل وإعادة استخدام في الاستوديو' : 'Re-use in Studio'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
