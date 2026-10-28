import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui';
import {
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  Zap,
  Wand2,
  Check,
  UploadCloud,
} from 'lucide-react';
import type { MagicNoticeState } from './productFormTypes';

interface Props {
  isAr: boolean;
  isAnalyzingColors: boolean;
  analyzingStatus: string;
  isDraggingMagic: boolean;
  magicNotice: MagicNoticeState | null;
  onDropFiles: (files: FileList | File[]) => void;
  onClearNotice: () => void;
  setIsDraggingMagic: (dragging: boolean) => void;
}

export const ProductMagicColorDropzone: React.FC<Props> = ({
  isAr,
  isAnalyzingColors,
  analyzingStatus,
  isDraggingMagic,
  magicNotice,
  onDropFiles,
  onClearNotice,
  setIsDraggingMagic,
}) => {
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      {/* Hidden File Input for Bulk Upload */}
      <input
        ref={bulkFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onDropFiles(e.target.files);
          }
          if (e.target) e.target.value = '';
        }}
      />

      {/* Success / Feedback Banner */}
      <AnimatePresence>
        {magicNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-indigo-950/80 border border-emerald-500/40 shadow-xl backdrop-blur-md relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    {magicNotice.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {magicNotice.subtitle}
                  </p>

                  {/* Extracted Swatches */}
                  {magicNotice.swatches.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {isAr ? 'الألوان المكتشفة:' : 'Identified Swatches:'}
                      </span>
                      {magicNotice.swatches.map((hex, idx) => (
                        <div
                          key={`${hex}-${idx}`}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-200 shadow-sm"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="font-bold">{hex}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClearNotice}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dropzone Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingMagic(true);
        }}
        onDragLeave={() => setIsDraggingMagic(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingMagic(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onDropFiles(e.dataTransfer.files);
          }
        }}
        className={`relative rounded-2xl p-4.5 sm:p-5 border-2 border-dashed transition-all duration-200 overflow-hidden ${
          isDraggingMagic
            ? 'border-indigo-400 bg-indigo-950/40 shadow-[0_0_30px_rgba(99,102,241,0.25)] scale-[1.008]'
            : 'border-indigo-500/35 hover:border-indigo-500/60 bg-gradient-to-br from-indigo-950/30 via-slate-950/70 to-purple-950/20 shadow-md'
        }`}
      >
        {/* Ambient Background Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Active Scanning Animation */}
        {isAnalyzingColors ? (
          <div className="py-5 flex flex-col items-center justify-center text-center space-y-3 relative z-10">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
                <Loader2 className="w-6.5 h-6.5 animate-spin" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -inset-1 rounded-2xl bg-indigo-500/15 blur-sm -z-10"
              />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {isAr ? 'جاري الفرز الذكي وتحليل درجات القماش...' : 'AI Analyzing Colors & Clustering Variants...'}
              </h4>
              <p className="text-xs text-indigo-300 font-mono">
                {analyzingStatus || (isAr ? 'معالجة محلية فورية عبر المتصفح' : 'Instant in-browser Canvas quantization')}
              </p>
            </div>

            {/* Pulsing Scanline */}
            <div className="w-full max-w-md h-1.5 bg-slate-800 rounded-full overflow-hidden relative mt-2">
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 rounded-full"
              />
            </div>

            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'معالجة مجانية 100% بدون أي تكلفة أو استدعاء خارجي (Zero API Cost)' : '100% Free Client-Side Processing • Zero API Cost'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5 text-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-600/10 shrink-0">
                <Wand2 className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {isAr
                      ? 'اقتراح ألوان من صور المنتج'
                      : 'Suggest colors from product images'}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {isAr ? 'معالجة داخل المتصفح' : 'Processed in your browser'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                  {isAr
                    ? 'ارفع صور المنتج لاقتراح مجموعات ألوان. الإضاءة والخلفية تؤثران على النتيجة؛ راجع اللون والصور والمقاسات والكمية قبل الحفظ.'
                    : 'Upload product images to suggest color groups. Lighting and backgrounds affect results; review colors, images, sizes and quantities before saving.'}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {isAr ? 'تجميع تقريبي حسب اللون' : 'Approximate color grouping'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    {isAr ? 'مراجعة يدوية قبل الحفظ' : 'Review before saving'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {isAr ? 'الكمية والسعر تُحددان يدوياً' : 'Set quantities and prices manually'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => bulkFileInputRef.current?.click()}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-md shadow-indigo-600/30 whitespace-nowrap cursor-pointer"
              >
                {isAr ? 'رفع حزمة صور للمنتج' : 'Bulk Upload Photos'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
