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
        'flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-750 text-slate-100 shadow-md select-none transition-all',
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
          title={isAr ? 'الصفحة الأولى' : 'First page'}
          className={cn(
            'hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer',
            canPrev
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:text-white shadow-xs'
              : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed pointer-events-none'
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
          'flex h-9 sm:h-10 items-center gap-1.5 px-3 sm:px-4 rounded-xl border transition-all duration-150 active:scale-95 font-bold text-xs sm:text-sm cursor-pointer shadow-xs',
          canPrev
            ? 'bg-slate-800 border-slate-700 text-white hover:bg-indigo-600 hover:border-indigo-500 hover:shadow-indigo-600/30'
            : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed pointer-events-none'
        )}
      >
        {isAr ? <ChevronRight className="h-4 w-4 stroke-[2.5]" /> : <ChevronLeft className="h-4 w-4 stroke-[2.5]" />}
        <span className="hidden xs:inline">{isAr ? 'السابق' : 'Prev'}</span>
      </button>

      {/* Mobile Center Display (Previous/Next only + Page X of Y counter) */}
      <div className="flex sm:hidden items-center justify-center px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white shadow-xs">
        <span>
          {isAr
            ? `صفحة ${safeCurrentPage} من ${safeTotalPages}`
            : `Page ${safeCurrentPage} of ${safeTotalPages}`}
        </span>
      </div>

      {/* Desktop Number Pills Track */}
      <div className="hidden sm:flex items-center gap-1.5">
        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === 'dots-left' || pageNumber === 'dots-right') {
            return (
              <span
                key={`${pageNumber}-${idx}`}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-xs text-slate-400 font-bold select-none tracking-widest"
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
                'relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer',
                isActive
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400/40 scale-105 z-10'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:text-white shadow-xs'
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
          'flex h-9 sm:h-10 items-center gap-1.5 px-3 sm:px-4 rounded-xl border transition-all duration-150 active:scale-95 font-bold text-xs sm:text-sm cursor-pointer shadow-xs',
          canNext
            ? 'bg-slate-800 border-slate-700 text-white hover:bg-indigo-600 hover:border-indigo-500 hover:shadow-indigo-600/30'
            : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed pointer-events-none'
        )}
      >
        <span className="hidden xs:inline">{isAr ? 'التالي' : 'Next'}</span>
        {isAr ? <ChevronLeft className="h-4 w-4 stroke-[2.5]" /> : <ChevronRight className="h-4 w-4 stroke-[2.5]" />}
      </button>

      {/* Last Page Button (Optional) */}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => canNext && onPageChange(safeTotalPages)}
          disabled={!canNext}
          aria-label={isAr ? 'الصفحة الأخيرة' : 'Last page'}
          title={isAr ? 'الصفحة الأخيرة' : 'Last page'}
          className={cn(
            'hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer',
            canNext
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:text-white shadow-xs'
              : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed pointer-events-none'
          )}
        >
          {isAr ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
        </button>
      )}
    </nav>
  );
}

export default Pagination;
