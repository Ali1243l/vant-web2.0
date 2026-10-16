import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, History, Trash2, Sparkles } from 'lucide-react';
import type { Language } from '../types';

const SEARCH_HISTORY_KEY = 'vant_recent_searches';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lang: Language;
}

export default function SearchOverlay({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  lang,
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSearchTerm = useCallback((term: string) => {
    const cleaned = term.trim();
    if (!cleaned || cleaned.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleaned.toLowerCase());
      const updated = [cleaned, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const removeSearchTerm = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch {}
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (searchQuery) {
          onSearchChange('');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchQuery, onSearchChange, onClose]);

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleClose = () => {
    onSearchChange('');
    onClose();
  };

  // Results render in the catalog behind the overlay, so showing them means closing it with the query kept
  const handleShowResults = () => {
    if (!searchQuery.trim()) return onClose();
    saveSearchTerm(searchQuery);
    onClose();
    setTimeout(() => {
      const grid = document.getElementById('catalog-grid');
      const headerHeight = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      if (grid) window.scrollTo({ top: grid.getBoundingClientRect().top + window.scrollY - headerHeight - 12, behavior: 'smooth' });
    }, 80);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleShowResults();
  };

  const handleSelectRecent = (term: string) => {
    onSearchChange(term);
    saveSearchTerm(term);
    inputRef.current?.focus();
  };

  const suggestedKeywords =
    lang === 'ar'
      ? ['صوف', 'كشمير', 'معطف', 'أزياء رسمية', 'أحذية', 'سترة']
      : ['Wool', 'Cashmere', 'Coat', 'Tailoring', 'Shoes', 'Blazer'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center pt-4 px-4 sm:px-6">
          {/* Dark blur backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleShowResults}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md"
          />

          {/* The Search Bar itself */}
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-2xl shadow-2xl rounded-full px-4 sm:px-6 h-14 flex items-center gap-3 border border-black/10 dark:border-white/15">
              <div className="relative flex flex-1 items-center">
                <Search
                  className={`absolute pointer-events-none h-4 w-4 text-[#6b7280] dark:text-[#9ca3af] ${
                    lang === 'ar' ? 'right-3' : 'left-3'
                  }`}
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  enterKeyHint="search"
                  placeholder={
                    lang === 'ar'
                      ? 'ابحث بالاسم، الخامة (صوف، كشمير)، أو القطعة...'
                      : 'Search by name, fabric, or style...'
                  }
                  className={`h-9.5 w-full rounded-full border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-xs sm:text-sm text-[#15171c] dark:text-[#f3f4f6] placeholder:text-[#6b7280]/70 dark:placeholder:text-[#9ca3af]/60 transition-all duration-200 outline-none focus:border-[#004ad7] dark:focus:border-[#3b82f6] focus:ring-2 focus:ring-[#004ad7]/20 ${
                    lang === 'ar' ? 'pr-9 pl-9' : 'pl-9 pr-9'
                  }`}
                  aria-label={lang === 'ar' ? 'البحث في المجموعة' : 'Search collection'}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={`absolute flex h-6 w-6 items-center justify-center rounded-full text-[#6b7280] dark:text-[#9ca3af] hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#15171c] dark:hover:text-white transition-colors cursor-pointer ${
                      lang === 'ar' ? 'left-2.5' : 'right-2.5'
                    }`}
                    aria-label={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {searchQuery.trim() ? (
                <button
                  type="button"
                  onClick={handleShowResults}
                  className="shrink-0 px-3.5 py-1.5 flex items-center justify-center rounded-full text-xs font-bold bg-[#004ad7] dark:bg-[#3b82f6] text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {lang === 'ar' ? 'عرض النتائج' : 'Show results'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="shrink-0 px-3 py-1.5 flex items-center justify-center rounded-full text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af] hover:text-[#15171c] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              )}
            </div>

            {/* The Search Dropdown */}
            <div className="absolute top-[110%] left-0 right-0 w-full bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden border border-black/8 dark:border-white/12 py-3.5 px-4 sm:px-6 mt-2">
              <div className="mx-auto max-w-7xl xl:max-w-[1440px]">
                {recentSearches.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#6b7280] dark:text-[#9ca3af]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#15171c] dark:text-[#f3f4f6]">
                        <History className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6]" />
                        <span>{lang === 'ar' ? 'عمليات البحث الأخيرة' : 'Recent Searches'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearAllSearches}
                        className="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3 opacity-70" />
                        <span>{lang === 'ar' ? 'مسح السجل' : 'Clear all'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          className="group inline-flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/12 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] px-3 py-1 text-xs text-[#15171c] dark:text-white transition-all cursor-pointer shadow-2xs"
                          onClick={() => handleSelectRecent(term)}
                        >
                          <History className="h-3 w-3 text-[#6b7280] dark:text-[#9ca3af]" />
                          <span className="font-medium">{term}</span>
                          <button
                            type="button"
                            onClick={(e) => removeSearchTerm(term, e)}
                            className="text-[#6b7280] hover:text-red-500 dark:text-[#9ca3af] dark:hover:text-red-400 p-0.5 rounded-full transition-colors cursor-pointer"
                            aria-label={`Remove ${term}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6b7280] dark:text-[#9ca3af]">
                      <Sparkles className="h-3.5 w-3.5 text-[#004ad7] dark:text-[#3b82f6]" />
                      <span>{lang === 'ar' ? 'كلمات مقترحة للبحث' : 'Suggested Searches'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                      {suggestedKeywords.map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleSelectRecent(kw)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/12 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-[#004ad7]/10 dark:hover:bg-[#3b82f6]/15 hover:border-[#004ad7]/30 dark:hover:border-[#3b82f6]/30 hover:text-[#004ad7] dark:hover:text-[#3b82f6] px-3 py-1 text-xs text-[#15171c] dark:text-white transition-all cursor-pointer shadow-2xs font-medium"
                        >
                          <Search className="h-3 w-3 opacity-60" />
                          <span>{kw}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
