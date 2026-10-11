import React from 'react';
import {
  Layers,
  Search,
  Eye,
  Heart,
  MessageCircle,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import type { Product } from '../../types';

export interface DetailedPieceItem {
  product: Product;
  views: number;
  wishlistAdds: number;
  whatsappClicks: number;
  conversionRate: number;
  ctr: number;
  velocityScore: number;
  velocityStatus: 'hot_trending' | 'steady_interest' | 'cold_dormant';
  hesitationCount: number;
}

export interface PiecesMatrixTabProps {
  detailedPiecesData: DetailedPieceItem[];
  pieceSearchQuery: string;
  setPieceSearchQuery: (query: string) => void;
  pieceCatFilter: string;
  setPieceCatFilter: (category: string) => void;
  pieceSortBy: 'views' | 'wishlist' | 'whatsapp' | 'ctr' | 'velocity';
  setPieceSortBy: (sortBy: 'views' | 'wishlist' | 'whatsapp' | 'ctr' | 'velocity') => void;
  pieceCategories: string[];
  totalProductViews: number;
  totalWhatsAppClicks: number;
  isAr?: boolean;
}

export const PiecesMatrixTab: React.FC<PiecesMatrixTabProps> = ({
  detailedPiecesData,
  pieceSearchQuery,
  setPieceSearchQuery,
  pieceCatFilter,
  setPieceCatFilter,
  pieceSortBy,
  setPieceSortBy,
  pieceCategories,
  totalProductViews,
  totalWhatsAppClicks,
  isAr = true,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-black/40 to-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-400" />
              <span>
                {isAr
                  ? 'مصفوفة أداء وتحليل القطع الفردية (Detailed Pieces Intelligence)'
                  : 'Pieces Performance Matrix'}
              </span>
            </h3>
            <p className="text-xs text-white/50 mt-1">
              {isAr
                ? 'رصد شامل لأداء كل قطعة في الكتالوج بناءً على تفاعل الزوار الفعلي، معدل التحويل إلى واتساب، وسرعة دوران الطلب'
                : 'Granular telemetry breakdown for every item in your catalog based on real customer conversion signals'}
            </p>
          </div>

          {/* Storewide Catalog Aggregates */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-mono text-white/80">
              {isAr ? 'القطع المعروضة: ' : 'Total: '}
              <strong className="text-white font-bold">{detailedPiecesData.length}</strong>
            </span>
            <span className="rounded-xl border border-[#004ad7]/30 bg-[#004ad7]/15 px-3 py-1.5 text-xs font-mono text-white">
              {isAr ? 'إجمالي المشاهدات: ' : 'Views: '}
              <strong className="text-[#60a5fa] font-bold">{totalProductViews}</strong>
            </span>
            <span className="rounded-xl border border-[#004ad7]/30 bg-[#004ad7]/15 px-3 py-1.5 text-xs font-mono text-white">
              {isAr ? 'طلبات واتساب: ' : 'Orders: '}
              <strong className="text-[#60a5fa] font-bold">{totalWhatsAppClicks}</strong>
            </span>
          </div>
        </div>

        {/* Controls: Search, Category, Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-white/10">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={pieceSearchQuery}
              onChange={(e) => setPieceSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث باسم القطعة أو التصنيف...' : 'Search piece title or category...'}
              className="w-full rounded-xl border border-white/15 bg-black/50 py-2 pr-10 pl-4 text-xs text-white placeholder-white/40 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-4">
            <select
              value={pieceCatFilter}
              onChange={(e) => setPieceCatFilter(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/50 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#12151f] text-white">
                {isAr ? 'كافة التصنيفات (All Categories)' : 'All Categories'}
              </option>
              {pieceCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#12151f] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Filter */}
          <div className="sm:col-span-3">
            <select
              value={pieceSortBy}
              onChange={(e) => setPieceSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-white/15 bg-black/50 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="views" className="bg-[#12151f] text-white">
                {isAr ? 'الأكثر مشاهدة' : 'Most Viewed'}
              </option>
              <option value="whatsapp" className="bg-[#12151f] text-white">
                {isAr ? 'الأكثر طلباً (واتساب)' : 'Most WhatsApp Orders'}
              </option>
              <option value="wishlist" className="bg-[#12151f] text-white">
                {isAr ? 'الأكثر حفظاً بالمفضلة' : 'Most Wishlisted'}
              </option>
              <option value="ctr" className="bg-[#12151f] text-white">
                {isAr ? 'أعلى معدل تحويل %' : 'Highest Conversion'}
              </option>
              <option value="velocity" className="bg-[#12151f] text-white">
                {isAr ? 'سرعة دوران الطلب 🔥' : 'Demand Velocity'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Pieces Cards Grid */}
      {detailedPiecesData.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-3">
          <Layers className="h-10 w-10 text-white/20 mx-auto" />
          <p className="text-sm font-semibold text-white/60">
            {isAr ? 'لم يتم العثور على قطع تطابق البحث الحالي.' : 'No pieces found matching the filter.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setPieceSearchQuery('');
              setPieceCatFilter('all');
            }}
            className="text-xs text-blue-400 hover:underline cursor-pointer"
          >
            {isAr ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detailedPiecesData.map((item) => {
            const prod = item.product;
            const isHot = item.velocityStatus === 'hot_trending';
            const isSteady = item.velocityStatus === 'steady_interest';

            return (
              <div
                key={prod.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-4.5 backdrop-blur-md hover:border-white/20 transition-all space-y-3.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Thumbnail & Top Badges */}
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                    {prod.image_url?.trim() ? (
                      <img
                        src={prod.image_url}
                        alt={prod.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border backdrop-blur-md shadow-md ${
                          isHot
                            ? 'bg-[#004ad7] text-white border-[#3b82f6]/50 shadow-[#004ad7]/30'
                            : isSteady
                            ? 'bg-white/15 text-white border-white/30'
                            : 'bg-black/60 text-white/70 border-white/15'
                        }`}
                      >
                        {isHot
                          ? (isAr ? '🔥 تريند نشط' : 'Hot')
                          : isSteady
                          ? (isAr ? '⚡ طلب مستمر' : 'Steady')
                          : (isAr ? '❄️ هادئ' : 'Dormant')}
                      </span>
                    </div>

                    {/* Category & Price Overlay */}
                    <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-end justify-between">
                      <span className="rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white/90 border border-white/15">
                        {prod.category}
                      </span>
                      <span className="font-mono font-bold text-xs text-white bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20">
                        {Number(prod.price).toLocaleString()} {prod.currency || 'د.ع'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Sizes */}
                  <div className="mt-3">
                    <h4 className="font-bold text-sm text-white line-clamp-1" title={prod.title}>
                      {isAr && prod.title_ar ? prod.title_ar : prod.title}
                    </h4>

                    {/* Sizes pills */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {prod.sizes?.map((sz) => (
                        <span
                          key={sz}
                          className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.2 text-[9px] font-mono text-white/70"
                        >
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
                    {/* Views */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[#60a5fa] text-[10px]">
                        <Eye className="h-3 w-3" />
                        <span>{isAr ? 'مشاهدات' : 'Views'}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white mt-0.5 block">{item.views}</span>
                    </div>

                    {/* Wishlist */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[#60a5fa] text-[10px]">
                        <Heart className="h-3 w-3" />
                        <span>{isAr ? 'مفضلة' : 'Saved'}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white mt-0.5 block">{item.wishlistAdds}</span>
                    </div>

                    {/* WhatsApp Inquiries */}
                    <div className="rounded-xl border border-white/10 bg-black/40 p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[#60a5fa] text-[10px]">
                        <MessageCircle className="h-3 w-3" />
                        <span>{isAr ? 'واتساب' : 'Orders'}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-white mt-0.5 block">{item.whatsappClicks}</span>
                    </div>
                  </div>

                  {/* Conversion Gauge Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/50">{isAr ? 'معدل التحويل (Conversion):' : 'Conversion:'}</span>
                      <span className="font-mono font-bold text-[#60a5fa]">{item.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#004ad7] to-[#3b82f6] transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, item.conversionRate * 5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Hesitation Signal Alert if triggered */}
                  {item.hesitationCount > 0 && (
                    <div className="mt-2.5 rounded-xl border border-[#004ad7]/30 bg-[#004ad7]/15 px-2.5 py-1.5 flex items-center justify-between text-[11px] text-[#93c5fd]">
                      <span className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#60a5fa] shrink-0" />
                        {isAr ? 'حيرة مقاس متكررة' : 'Sizing Hesitation'}
                      </span>
                      <span className="font-mono font-bold">{item.hesitationCount} {isAr ? 'مرات' : 'times'}</span>
                    </div>
                  )}
                </div>

                {/* Footer Velocity Score */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                  <span>{isAr ? 'مؤشر الحركة والطلب:' : 'Velocity Score:'}</span>
                  <span className="font-mono font-bold text-white/90 flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber-400" />
                    {item.velocityScore} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PiecesMatrixTab;
