import React from 'react';
import { Pagination } from '../../ui/Pagination';
import { cn } from '../../../lib/utils';

export interface PaginationWidgetProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  lang?: 'ar' | 'en';
  className?: string;
  itemLabel?: string;
}

export function PaginationWidget({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 16, 24, 48],
  lang = 'ar',
  className,
  itemLabel,
}: PaginationWidgetProps) {
  const isAr = lang === 'ar';
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(safeCurrentPage * pageSize, totalItems);

  const defaultItemLabel = isAr ? 'عنصر' : 'items';
  const displayLabel = itemLabel || defaultItemLabel;

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
      onPageChange(1); // Always reset to page 1 on page size change to avoid empty pages
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xs text-xs select-none w-full',
        className
      )}
    >
      {/* 1. Items Readout and Page Size Selector */}
      <div className="flex items-center gap-3 text-slate-400">
        <span>
          {isAr
            ? `عرض ${startItem}-${endItem} من ${totalItems} ${displayLabel}`
            : `Showing ${startItem}-${endItem} of ${totalItems} ${displayLabel}`}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 border-s border-slate-800 ps-3">
            <span className="text-[11px] text-slate-500">{isAr ? 'لكل صفحة:' : 'Per page:'}</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-slate-800/90 border border-slate-700/80 rounded-lg px-2 py-0.5 text-slate-200 text-xs font-mono outline-none cursor-pointer hover:border-slate-600 transition-colors"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Responsive Core Pagination Component */}
      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        lang={lang}
        className="border-0 bg-transparent p-0 shadow-none"
      />
    </div>
  );
}

export default PaginationWidget;
