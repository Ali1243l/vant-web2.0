import React from 'react';
import { Play, AlertTriangle, Sparkles, Search } from 'lucide-react';

export interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSimulation: (scenario: 'hesitation' | 'vip_order' | 'zero_search') => Promise<void> | void;
  isSimulating: boolean;
  isAr?: boolean;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  onRunSimulation,
  isSimulating,
  isAr = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#12151f] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'مختبر محاكاة سلوك الزبائن وتدقيق الخوارزميات' : 'Behavior Telemetry Simulator'}
              </h3>
              <p className="text-xs text-white/50">
                {isAr ? 'اختبر رد فعل الخوارزميات الثلاث ومزامنتها الحية بنقرة واحدة' : 'Simulate live journeys to test the 3 algorithms instantly'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* Scenario 1: Hesitation */}
          <button
            type="button"
            disabled={isSimulating}
            onClick={async () => {
              onClose();
              await onRunSimulation('hesitation');
            }}
            className="w-full flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-3.5 text-start hover:bg-rose-500/10 hover:border-rose-500/40 transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {isAr ? '1. محاكاة تردد في المقاس (Hesitation Signal)' : '1. Sizing Hesitation Journey'}
                </span>
                <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300">الخوارزمية 1</span>
              </div>
              <p className="text-[11px] text-white/60 mt-1">
                {isAr
                  ? 'محاكاة عميل يقلب المقاسات ويبقى في تفاصيل القطعة دون إتمام الطلب، لتفعيل إشعار الاستعادة عبر واتساب'
                  : 'Simulate hesitation loop triggering automated WhatsApp recovery draft'}
              </p>
            </div>
          </button>

          {/* Scenario 2: VIP Buyer */}
          <button
            type="button"
            disabled={isSimulating}
            onClick={async () => {
              onClose();
              await onRunSimulation('vip_order');
            }}
            className="w-full flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3.5 text-start hover:bg-amber-500/10 hover:border-amber-500/40 transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {isAr ? '2. محاكاة عميل VIP مع طلب واتساب (VIP Journey)' : '2. VIP Buyer High-Intent Journey'}
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">الخوارزمية 2</span>
              </div>
              <p className="text-[11px] text-white/60 mt-1">
                {isAr
                  ? 'محاكاة جلسة تصفح متعمقة مع إضافة للمفضلة ونقر إتمام الطلب بنقاط نية عالية 95/100'
                  : 'Simulate high engagement session resulting in a WhatsApp checkout with 95/100 intent'}
              </p>
            </div>
          </button>

          {/* Scenario 3: Unmet Search Demand */}
          <button
            type="button"
            disabled={isSimulating}
            onClick={async () => {
              onClose();
              await onRunSimulation('zero_search');
            }}
            className="w-full flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-3.5 text-start hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all cursor-pointer group disabled:opacity-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {isAr ? '3. محاكاة بحث غير متوفر (Unmet Demand)' : '3. Zero-Result Search Demand'}
                </span>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">الخوارزمية 3</span>
              </div>
              <p className="text-[11px] text-white/60 mt-1">
                {isAr
                  ? 'محاكاة بحث زائر عن عباية أو فستان غير موجود لتسجيل فرصة بيع في رادار الطلب المفقود'
                  : 'Simulate search query without matching catalog items to track missed revenue opportunity'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulatorModal;
