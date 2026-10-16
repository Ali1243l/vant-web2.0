import React, { useEffect, useState } from 'react';
import type { Product, Language } from '../types';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import PremiumGlowWrapper from './ui/PremiumGlowWrapper';
import BlurFade from './ui/BlurFade';

interface Props {
  products: Product[];
  loading?: boolean;
  loadingMore?: boolean;
  lang: Language;
  onOpen?: (p: Product) => void;
  onSelect?: (p: Product) => void;
  isWishlisted?: (id: string | number) => boolean;
  onToggleWishlist?: (id: string | number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  layout?: 'grid-4' | 'grid-2';
}

const columnsFor = (w: number) => (w >= 1536 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : 2);

function useColumnCount() {
  const [cols, setCols] = useState(() => (typeof window !== 'undefined' ? columnsFor(window.innerWidth) : 4));
  useEffect(() => {
    const onResize = () => setCols(columnsFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return cols;
}

export default function MasonryGrid({
  products,
  loading,
  loadingMore,
  lang,
  onOpen,
  onSelect,
  isWishlisted,
  onToggleWishlist,
  layout = 'grid-4',
}: Props) {
  const handleOpen = onOpen || onSelect || (() => {});
  const columnCount = useColumnCount();

  const gridClasses =
    layout === 'grid-2'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 pb-4 pt-2 w-full max-w-5xl mx-auto'
      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 lg:gap-6 xl:gap-8 pb-4 pt-2 w-full max-w-screen-2xl mx-auto';

  if (loading) {
    return (
      <div className={gridClasses} aria-busy="true" aria-label="Loading archive catalog">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} aspectRatioClass="aspect-[3/4]" index={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="px-4 py-20 text-center max-w-md mx-auto">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.03] dark:bg-white/[0.04] text-[#6b7280] dark:text-[#9ca3af]">
          <span className="text-sm font-semibold">Ø</span>
        </div>
        <p className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
          {lang === 'ar'
            ? 'لا توجد قطع مطابقة لهذا الاختيار حالياً. يمكنك تغيير التصنيف أو التصفية.'
            : 'No pieces match your selection currently. Try adjusting your category or fabric filter.'}
        </p>
      </div>
    );
  }

  const renderCard = (p: Product, i: number) => (
    <BlurFade key={`blur-fade-${p.id}`} delay={(i % 4) * 0.08} duration={0.6}>
      <PremiumGlowWrapper>
        <ProductCard
          product={p}
          index={i}
          lang={lang}
          isWishlisted={isWishlisted ? isWishlisted(p.id) : false}
          onToggleWishlist={onToggleWishlist}
          onOpen={handleOpen}
        />
      </PremiumGlowWrapper>
    </BlurFade>
  );

  if (layout === 'grid-4') {
    // Masonry: each card keeps its own image height; dealing cards round-robin keeps the sort order reading across rows
    const columns: { p: Product; i: number }[][] = Array.from({ length: columnCount }, () => []);
    products.forEach((p, i) => columns[i % columnCount].push({ p, i }));
    return (
      <div className="flex items-start gap-3 sm:gap-5 md:gap-6 xl:gap-8 pb-4 pt-2 w-full max-w-screen-2xl mx-auto">
        {columns.map((col, c) => (
          <div key={c} className="flex min-w-0 flex-1 flex-col gap-5 sm:gap-6 md:gap-7 xl:gap-9">
            {col.map(({ p, i }) => renderCard(p, i))}
            {loadingMore && <SkeletonCard aspectRatioClass="aspect-[3/4]" index={products.length + c} />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {products.map(renderCard)}
      {loadingMore &&
        Array.from({ length: 4 }).map((_, idx) => (
          <SkeletonCard key={`more-skeleton-${idx}`} aspectRatioClass="aspect-[3/4]" index={products.length + idx} />
        ))}
    </div>
  );
}
