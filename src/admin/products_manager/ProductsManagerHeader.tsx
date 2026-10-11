import React from 'react';
import { Search, Plus, List, LayoutGrid } from 'lucide-react';
import { Button, Card, Input } from '../ui';

interface ProductsManagerHeaderProps {
  isAr: boolean;
  productsCount: number;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  onNewProduct: () => void;
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: string[];
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'sales' | 'stock';
  setSortBy: (val: 'default' | 'price-asc' | 'price-desc' | 'sales' | 'stock') => void;
  filteredCount: number;
  totalUnits: number;
  activeOffersCount: number;
  outOfStockCount: number;
}

export const ProductsManagerHeader: React.FC<ProductsManagerHeaderProps> = ({
  isAr,
  productsCount,
  viewMode,
  setViewMode,
  onNewProduct,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  filteredCount,
  totalUnits,
  activeOffersCount,
  outOfStockCount,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{isAr ? 'كتالوج المنتجات والمخزون' : 'Products & Stock Inventory'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
              CMS V3
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {isAr
              ? `إدارة ${productsCount} من السلع، الإجراءات السريعة (العروض، التعديل، مشاركة الرابط)، والمقاسات بالدينار العراقي.`
              : `Manage ${productsCount} catalog items with Quick Actions (Toggle Offer, Quick Edit, Copy Link) and cloud media.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle (Grid / Table) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isAr ? 'عرض جدولي' : 'Table view'}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isAr ? 'عرض بطاقات' : 'Grid view'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onNewProduct}
          >
            {isAr ? 'إضافة منتج جديد' : 'New Product'}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="w-full md:flex-1">
            <Input
              icon={Search}
              placeholder={isAr ? 'بحث بالاسم، الباركود أو الـ SKU...' : 'Search product title or SKU...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Category Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'جميع الفئات' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="active">{isAr ? 'متوفر نشط' : 'Active'}</option>
              <option value="lowStock">{isAr ? 'مخزون منخفض' : 'Low Stock'}</option>
              <option value="outOfStock">{isAr ? 'نفد من المخزون' : 'Out of Stock'}</option>
              <option value="draft">{isAr ? 'مسودة' : 'Draft'}</option>
            </select>
          </div>
          {/* Sort By */}
          <div className="w-full md:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 h-9.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">{isAr ? 'الترتيب: الافتراضي' : 'Sort: Default'}</option>
              <option value="price-asc">{isAr ? 'السعر: الأقل أولاً' : 'Price: Low to High'}</option>
              <option value="price-desc">{isAr ? 'السعر: الأعلى أولاً' : 'Price: High to Low'}</option>
              <option value="sales">{isAr ? 'الأكثر مبيعاً' : 'Top Sales'}</option>
              <option value="stock">{isAr ? 'الأقل مخزوناً' : 'Lowest Stock'}</option>
            </select>
          </div>
        </div>

        {/* Quick status counters */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <span>
            {isAr ? 'النتائج المعروضة:' : 'Results:'}{' '}
            <strong className="text-white">{filteredCount}</strong>
          </span>
          <span>·</span>
          <span>
            {isAr ? 'إجمالي المخزون:' : 'Total Units:'}{' '}
            <strong className="text-emerald-400">{totalUnits}</strong>{' '}
            {isAr ? 'قطعة' : 'units'}
          </span>
          <span>·</span>
          <span>
            {isAr ? 'عروض نشطة:' : 'Active Offers:'}{' '}
            <strong className="text-amber-400">{activeOffersCount}</strong>
          </span>
          <span>·</span>
          <span>
            {isAr ? 'نفد المخزون:' : 'Out of Stock:'}{' '}
            <strong className="text-rose-400">{outOfStockCount}</strong>
          </span>
        </div>
      </Card>
    </div>
  );
};
