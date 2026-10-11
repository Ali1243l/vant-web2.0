import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import type { SiteSettings } from '../useAdminBridge';
import { SPLASH_MOTIFS, SPLASH_TEXT_PRESETS } from './constants';

interface SplashStudioCardProps {
  isAr: boolean;
  formData: SiteSettings;
  handleChange: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
  onOpenTestSplash: () => void;
}

export const SplashStudioCard: React.FC<SplashStudioCardProps> = ({
  isAr,
  formData,
  handleChange,
  onOpenTestSplash,
}) => {
  return (
    <Card className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'مخصص شاشة الترحيب والتحميل السينمائية' : 'Cinematic Splash Screen Customizer'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'تخصيص الرمز الملكي، نصوص التحميل الفاخرة، ومدة العرض عند فتح التطبيق لأول مرة.'
                : 'Customize royal motif emblems, luxury loading typography, and duration on app entry.'}
            </p>
          </div>
        </div>

        {/* Test Splash Screen Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onOpenTestSplash}
          className="text-amber-300 border-amber-500/30 hover:bg-amber-500/10 gap-2 shrink-0"
          leftIcon={<Play className="w-4 h-4 fill-amber-400 text-amber-400" />}
        >
          {isAr ? 'معاينة شاشة البداية الحية' : 'Test Splash Screen'}
        </Button>
      </div>

      {/* Motif Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300 text-start">
          {isAr ? '1. الرمز الملكي لشاشة التحميل (Splash Motif)' : '1. Splash Emblem Motif'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SPLASH_MOTIFS.map((motif) => {
            const IconComp = motif.icon;
            const isSelected = formData.splashMotif === motif.key;
            return (
              <button
                key={motif.key}
                type="button"
                onClick={() => handleChange('splashMotif', motif.key)}
                className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-950'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  )}
                </div>
                <div>
                  <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {isAr ? motif.labelAr : motif.labelEn}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {isAr ? motif.descAr : motif.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Customization & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 text-start">
              {isAr ? '2. نص التحميل بالعربية' : '2. Loading Text (Arabic)'}
            </label>
            <span className="text-[10px] text-slate-500">
              {isAr ? 'اختر نموذجاً أدناه أو اكتب يدوياً' : 'Preset or manual'}
            </span>
          </div>
          <Input
            value={formData.splashTextAr}
            onChange={(e) => handleChange('splashTextAr', e.target.value)}
            placeholder="دار الرافدين للأزياء..."
          />
          {/* Presets chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SPLASH_TEXT_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChange('splashTextAr', p.ar)}
                className="text-[10px] px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/50 truncate max-w-full text-start"
                title={p.ar}
              >
                {p.ar}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 text-start">
              {isAr ? 'نص التحميل بالإنجليزية' : 'Loading Text (English)'}
            </label>
            <span className="text-[10px] text-slate-500">English Headline</span>
          </div>
          <Input
            value={formData.splashTextEn}
            onChange={(e) => handleChange('splashTextEn', e.target.value)}
            placeholder="Dar Al-Rafidain Haute Couture..."
          />
          {/* Presets chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SPLASH_TEXT_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChange('splashTextEn', p.en)}
                className="text-[10px] px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/50 truncate max-w-full text-start"
                title={p.en}
              >
                {p.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration Selector */}
      <div className="pt-2 border-t border-slate-800/60 max-w-sm">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
          {isAr ? 'مدة عرض شاشة التحميل (بالثواني)' : 'Splash Display Duration'}
        </label>
        <div className="flex items-center gap-2">
          {[1500, 2500, 3500, 4500].map((dur) => (
            <button
              key={dur}
              type="button"
              onClick={() => handleChange('splashDurationMs', dur)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                formData.splashDurationMs === dur
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {(dur / 1000).toFixed(1)}s
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
