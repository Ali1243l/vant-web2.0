import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import {
  saveCampaignTemplate,
  uploadCampaignImageFile,
} from '../../lib/newsletter';
import type { CampaignTemplateConfig } from '../../lib/emailTemplates';

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAr: boolean;
  onTemplateCreated: (tpl: CampaignTemplateConfig) => void;
  setFeedbackMsg: React.Dispatch<
    React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>
  >;
}

export const AddTemplateModal: React.FC<AddTemplateModalProps> = ({
  isOpen,
  onClose,
  isAr,
  onTemplateCreated,
  setFeedbackMsg,
}) => {
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplSubject, setNewTplSubject] = useState('');
  const [newTplHeadline, setNewTplHeadline] = useState('');
  const [newTplMessage, setNewTplMessage] = useState('');
  const [newTplCode, setNewTplCode] = useState('VANT-SPECIAL-20');
  const [newTplPercent, setNewTplPercent] = useState(20);
  const [newTplBadge, setNewTplBadge] = useState('VIP PRIVILEGE ACCESS');
  const [newTplHeroImage, setNewTplHeroImage] = useState(
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'
  );
  const [isUploadingModalImage, setIsUploadingModalImage] = useState(false);

  if (!isOpen) return null;

  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingModalImage(true);
    try {
      const uploadedUrl = await uploadCampaignImageFile(file);
      setNewTplHeroImage(uploadedUrl);
    } catch {
      alert(isAr ? 'فشل رفع ملف الصورة' : 'Failed to upload image');
    } finally {
      setIsUploadingModalImage(false);
    }
  };

  const handleCreateNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle.trim()) {
      alert(isAr ? 'يرجى كتابة اسم القالب' : 'Please provide template name');
      return;
    }

    const newTpl: CampaignTemplateConfig = {
      id: `tpl_custom_${Date.now()}`,
      type: 'custom',
      title: newTplTitle.trim(),
      titleEn: newTplTitle.trim(),
      subject: newTplSubject.trim() || `VANT Special // Privilege Offer (${newTplCode})`,
      badgeText: newTplBadge.trim() || 'VIP PRIVILEGE ACCESS',
      badgeTextEn: newTplBadge.trim() || 'VIP PRIVILEGE ACCESS',
      headline: newTplHeadline.trim() || newTplTitle.trim(),
      headlineEn: newTplHeadline.trim() || newTplTitle.trim(),
      message: newTplMessage.trim() || 'عرض خاص ومحدود لمشتركي الأرشيف الخاص لـ فانت.',
      messageEn: newTplMessage.trim() || 'Exclusive private curation for VANT members.',
      discountCode: newTplCode.trim().toUpperCase(),
      discountPercent: Number(newTplPercent),
      heroImage:
        newTplHeroImage.trim() ||
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'تصفح التشكيلة واستفد من الخصم',
      ctaTextEn: 'EXPLORE COLLECTION // SHOP NOW',
      themeColor: '#004ad7',
      editionNote: `CUSTOM ARCHIVE · ${newTplCode.toUpperCase()}`,
    };

    await saveCampaignTemplate(newTpl);
    onTemplateCreated(newTpl);
    onClose();
    setNewTplTitle('');
    setNewTplHeadline('');
    setNewTplMessage('');

    setFeedbackMsg({
      type: 'success',
      text: isAr ? `تمت إضافة القالب الجديد (${newTpl.title}) بنجاح!` : 'New template added successfully!',
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-[#14171d] rounded-3xl border border-black/10 dark:border-white/15 p-6 space-y-4 text-start shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
          <h3 className="text-sm font-bold text-black dark:text-white">
            {isAr ? 'إنشاء وتجهيز قالب عرض جديد' : 'Create New Campaign Template'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCreateNewTemplate} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
              {isAr ? 'اسم القالب الداخلي:' : 'Template Internal Name:'}
            </label>
            <input
              type="text"
              required
              value={newTplTitle}
              onChange={(e) => setNewTplTitle(e.target.value)}
              placeholder="عرض العيد الحصري 2026"
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                {isAr ? 'كود الخصم:' : 'Discount Code:'}
              </label>
              <input
                type="text"
                required
                value={newTplCode}
                onChange={(e) => setNewTplCode(e.target.value.toUpperCase())}
                placeholder="EID-VIP-25"
                className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3 py-2 text-xs text-[#004ad7] dark:text-[#60a5fa] font-bold outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                {isAr ? 'نسبة الخصم (%):' : 'Discount (%):'}
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={newTplPercent}
                onChange={(e) => setNewTplPercent(Number(e.target.value))}
                className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3 py-2 text-xs text-black dark:text-white outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
              {isAr ? 'العنوان الرئيسي داخل الرسالة:' : 'Headline:'}
            </label>
            <input
              type="text"
              value={newTplHeadline}
              onChange={(e) => setNewTplHeadline(e.target.value)}
              placeholder="احتفالية خاصة — خصم 25% على كامل التشكيلة"
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black px-3.5 py-2 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
              {isAr ? 'تفاصيل ونص العرض:' : 'Offer Message Body:'}
            </label>
            <textarea
              rows={3}
              value={newTplMessage}
              onChange={(e) => setNewTplMessage(e.target.value)}
              placeholder="يسرنا دعوتكم للاستفادة من العرض الحصري..."
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-black p-3 text-xs text-black dark:text-white outline-none focus:border-[#004ad7]"
            />
          </div>

          {/* Upload Image File for Modal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block">
              {isAr ? 'صورة الغلاف (رفع كملف من جهازك):' : 'Hero Image File:'}
            </label>
            <input
              type="file"
              ref={modalFileInputRef}
              accept="image/*"
              onChange={handleModalImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => modalFileInputRef.current?.click()}
              disabled={isUploadingModalImage}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#004ad7]/40 hover:border-[#004ad7] bg-black/5 dark:bg-black text-xs font-bold text-black dark:text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploadingModalImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 text-[#004ad7]" />
              )}
              <span>{isAr ? 'انقر لاختيار صورة من جهازك' : 'Choose image file'}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#004ad7] hover:bg-[#003db3] text-white text-xs font-bold rounded-xl shadow-md shadow-[#004ad7]/20 cursor-pointer"
            >
              {isAr ? 'حفظ وتفعيل القالب' : 'Save & Activate'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTemplateModal;
