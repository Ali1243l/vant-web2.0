import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  lang?: 'ar' | 'en';
  showFirstLast?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  lang = 'ar',
  showFirstLast = false,
  className,
  disabled = false,
}: PaginationProps) {
  const isAr = lang === 'ar';

  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  // Compute pagination range array with ellipses
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= safeTotalPages) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(safeCurrentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(safeCurrentPage + siblingCount, safeTotalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < safeTotalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = safeTotalPages;

    // Case 1: No left dots, right dots only
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'dots-right', lastPageIndex];
    }

    // Case 2: Left dots only, no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => safeTotalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, 'dots-left', ...rightRange];
    }

    // Case 3: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, 'dots-left', ...middleRange, 'dots-right', lastPageIndex];
    }

    return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
  }, [safeTotalPages, siblingCount, safeCurrentPage]);

  if (safeTotalPages <= 0) return null;

  const canPrev = safeCurrentPage > 1 && !disabled;
  const canNext = safeCurrentPage < safeTotalPages && !disabled;

  return (
    <nav
      role="navigation"
      aria-label={isAr ? 'التنقل بين الصفحات' : 'Pagination Navigation'}
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        'flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/70 dark:bg-[#12141a]/80 backdrop-blur-xl border border-black/8 dark:border-white/10 shadow-xs text-xs sm:text-sm select-none transition-all',
        className
      )}
    >
      {/* First Page Button (Optional) */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => canPrev && onPageChange(1)}
          disabled={!canPrev}
          aria-label={isAr ? 'الصفحة الأولى' : 'First page'}
          className={cn(
            'hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-black/5 dark:border-white/5 transition-all duration-150 active:scale-95 cursor-pointer',
            canPrev
              ? 'text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
              : 'opacity-35 cursor-not-allowed pointer-events-none'
          )}
        >
          {isAr ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      )}

      {/* Previous Button */}
      <button
        type="button"
        onClick={() => canPrev && onPageChange(safeCurrentPage - 1)}
        disabled={!canPrev}
        aria-label={isAr ? 'الصفحة السابقة' : 'Previous page'}
        className={cn(
          'flex h-8 sm:h-9 items-center gap-1 px-2.5 sm:px-3 rounded-full border border-black/6 dark:border-white/10 transition-all duration-150 active:scale-95 font-medium cursor-pointer',
          canPrev
            ? 'bg-black/4 dark:bg-white/6 text-neutral-800 dark:text-neutral-200 hover:bg-black/8 dark:hover:bg-white/12 hover:text-black dark:hover:text-white'
            : 'opacity-30 cursor-not-allowed pointer-events-none'
        )}
      >
        {isAr ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        <span className="hidden xs:inline">{isAr ? 'السابق' : 'Prev'}</span>
      </button>

      {/* Mobile Center Display (Previous/Next only + Page X of Y counter) */}
      <div className="flex sm:hidden items-center justify-center px-3 py-1 rounded-full bg-black/4 dark:bg-white/6 border border-black/5 dark:border-white/8 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
        <span>
          {isAr
            ? `صفحة ${safeCurrentPage} من ${safeTotalPages}`
            : `Page ${safeCurrentPage} of ${safeTotalPages}`}
        </span>
      </div>

      {/* Desktop Number Pills Track */}
      <div className="hidden sm:flex items-center gap-1">
        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === 'dots-left' || pageNumber === 'dots-right') {
            return (
              <span
                key={`${pageNumber}-${idx}`}
                className="flex h-9 w-9 items-center justify-center text-xs text-neutral-400 dark:text-neutral-500 font-bold select-none"
              >
                •••
              </span>
            );
          }

          const page = pageNumber as number;
          const isActive = page === safeCurrentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => !disabled && onPageChange(page)}
              disabled={disabled}
              aria-current={isActive ? 'page' : undefined}
              aria-label={isAr ? `صفحة ${page}` : `Page ${page}`}
              className={cn(
                'relative flex h-9 min-w-9 px-2 items-center justify-center rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer',
                isActive
                  ? 'bg-[#004ad7] text-white dark:bg-[#3b82f6] dark:text-[#12141a] font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/8'
              )}
            >
              <span>{page}</span>
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => canNext && onPageChange(safeCurrentPage + 1)}
        disabled={!canNext}
        aria-label={isAr ? 'الصفحة التالية' : 'Next page'}
        className={cn(
          'flex h-8 sm:h-9 items-center gap-1 px-2.5 sm:px-3 rounded-full border border-black/6 dark:border-white/10 transition-all duration-150 active:scale-95 font-medium cursor-pointer',
          canNext
            ? 'bg-black/4 dark:bg-white/6 text-neutral-800 dark:text-neutral-200 hover:bg-black/8 dark:hover:bg-white/12 hover:text-black dark:hover:text-white'
            : 'opacity-30 cursor-not-allowed pointer-events-none'
        )}
      >
        <span className="hidden xs:inline">{isAr ? 'التالي' : 'Next'}</span>
        {isAr ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {/* Last Page Button (Optional) */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => canNext && onPageChange(safeTotalPages)}
          disabled={!canNext}
          aria-label={isAr ? 'الصفحة الأخيرة' : 'Last page'}
          className={cn(
            'hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-black/5 dark:border-white/5 transition-all duration-150 active:scale-95 cursor-pointer',
            canNext
              ? 'text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
              : 'opacity-35 cursor-not-allowed pointer-events-none'
          )}
        >
          {isAr ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
        </button>
      )}
    </nav>
  );
}

export default Pagination;
