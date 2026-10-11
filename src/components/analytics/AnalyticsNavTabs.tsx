import React from 'react';
import {
  BarChart3,
  Layers,
  AlertTriangle,
  Sparkles,
  Zap,
  ShieldCheck,
} from 'lucide-react';

export type AlgorithmViewType =
  | 'all'
  | 'piece_matrix'
  | 'algorithm1_hesitation'
  | 'algorithm2_personas'
  | 'algorithm3_demand'
  | 'system_health';

export interface AnalyticsNavTabsProps {
  activeAlgorithmView: AlgorithmViewType;
  setActiveAlgorithmView: (view: AlgorithmViewType) => void;
  productsCount: number;
  hesitationSignalsCount: number;
  customerSessionsCount: number;
  openErrorsCount: number;
  isAr?: boolean;
}

export const AnalyticsNavTabs: React.FC<AnalyticsNavTabsProps> = ({
  activeAlgorithmView,
  setActiveAlgorithmView,
  productsCount,
  hesitationSignalsCount,
  customerSessionsCount,
  openErrorsCount,
  isAr = true,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
      <button
        type="button"
        onClick={() => setActiveAlgorithmView('all')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeAlgorithmView === 'all'
            ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30'
            : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
        }`}
      >
        <BarChart3 className="h-4 w-4" />
        <span>{isAr ? '🌐 النظرة الشاملة' : 'Overview'}</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveAlgorithmView('piece_matrix')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeAlgorithmView === 'piece_matrix'
            ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
            : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <Layers className="h-4 w-4" />
        <span>{isAr ? '📊 مصفوفة القطع' : 'Pieces Matrix'}</span>
        <span className="rounded-full bg-white/15 text-[10px] font-mono font-bold px-1.5 py-0.2 text-white">
          {productsCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setActiveAlgorithmView('algorithm1_hesitation')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
          activeAlgorithmView === 'algorithm1_hesitation'
            ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
            : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>{isAr ? '⚠️ 1. كشف التردد' : '1. Hesitation'}</span>
        {hesitationSignalsCount > 0 && (
          <span className="rounded-full bg-white/15 text-[10px] font-mono font-bold px-1.5 py-0.2 text-white">
            {hesitationSignalsCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveAlgorithmView('algorithm2_personas')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeAlgorithmView === 'algorithm2_personas'
            ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
            : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <Sparkles className="h-4 w-4" />
        <span>{isAr ? '💎 2. التنميط والعملاء' : '2. Personas'}</span>
        <span className="rounded-full bg-white/15 text-[10px] font-mono font-bold px-1.5 py-0.2 text-white">
          {customerSessionsCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setActiveAlgorithmView('algorithm3_demand')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeAlgorithmView === 'algorithm3_demand'
            ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
            : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <Zap className="h-4 w-4" />
        <span>{isAr ? '🚀 3. سرعة الطلب' : '3. Demand Matrix'}</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveAlgorithmView('system_health')}
        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
          activeAlgorithmView === 'system_health'
            ? 'bg-[#004ad7] text-white shadow-md shadow-[#004ad7]/30 ring-1 ring-[#3b82f6]/40'
            : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <ShieldCheck className="h-4 w-4" />
        <span>{isAr ? '🛡️ رادار الأخطاء' : '4. Error Tracker'}</span>
        {openErrorsCount > 0 && (
          <span className="rounded-full bg-rose-500 text-[10px] font-mono font-bold px-1.5 py-0.2 text-white">
            {openErrorsCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default AnalyticsNavTabs;
