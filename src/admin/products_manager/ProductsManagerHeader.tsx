import React from 'react';
import { Search, Plus, List, LayoutGrid } from 'lucide-react';
import { Button, Input } from '../ui';
import { PriceRangeFilterWidget } from '../../components/admin/widgets/PriceRangeFilterWidget';

interface Props {
  isAr: boolean; productsCount: number; filteredCount: number; totalUnits: number; unknownStockCount: number; activeOffersCount: number; outOfStockCount: number;
  viewMode: 'table' | 'grid'; setViewMode: (value: 'table' | 'grid') => void; onNewProduct: () => void;
  search: string; setSearch: (value: string) => void; selectedCategory: string; setSelectedCategory: (value: string) => void; categories: string[];
  selectedStatus: string; setSelectedStatus: (value: string) => void; sortBy: 'default' | 'price-asc' | 'price-desc' | 'sales' | 'stock'; setSortBy: (value: Props['sortBy']) => void;
  priceRange: number[]; setPriceRange: (value: number[]) => void; onResetPriceRange: () => void; priceCeiling: number; onResetFilters: () => void;
}
export const ProductsManagerHeader: React.FC<Props> = props => {
  const { isAr, productsCount, viewMode, setViewMode, search, setSearch, selectedCategory, selectedStatus, sortBy, priceRange, priceCeiling } = props;
  const filtered = !!search || selectedCategory !== 'all' || selectedStatus !== 'all' || sortBy !== 'default' || priceRange[0] > 0 || priceRange[1] < priceCeiling;
  const selectClass = 'mt-2 w-full min-h-11 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200';
  return <div className="space-y-4">
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div><h2 className="text-xl sm:text-2xl font-bold text-white">{isAr ? 'كتالوج المنتجات' : 'Product catalog'}</h2><p className="text-sm text-slate-400 mt-2">{productsCount} {isAr ? 'منتج محمّل · إدارة الأسعار والتوفّر والصور والألوان.' : 'loaded products · Manage pricing, availability, images and colors.'}</p></div>
      <div className="flex flex-wrap gap-2 items-center"><div role="group" aria-label={isAr ? 'طريقة عرض المنتجات' : 'Product display'} className="flex gap-1 rounded-xl border border-slate-700 p-1">{(['table', 'grid'] as const).map(value => <Button key={value} size="icon" variant={viewMode === value ? 'primary' : 'ghost'} aria-label={isAr ? (value === 'table' ? 'عرض جدولي' : 'عرض بطاقات') : (value === 'table' ? 'Table view' : 'Grid view')} aria-pressed={viewMode === value} onClick={() => setViewMode(value)}>{value === 'table' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}</Button>)}</div><Button onClick={props.onNewProduct} leftIcon={<Plus className="w-4 h-4" />}>{isAr ? 'إضافة منتج' : 'Add product'}</Button></div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[[isAr ? 'النتائج المطابقة' : 'Matching products', props.filteredCount], [isAr ? 'المخزون المسجّل' : 'Known stock', props.totalUnits], [isAr ? 'عروض بسعر مخفّض' : 'Valid offers', props.activeOffersCount], [isAr ? 'نفد المخزون' : 'Out of stock', props.outOfStockCount]].map(([title, value]) => <div key={title} className="min-w-0 rounded-xl bg-slate-900 border border-slate-800 p-4"><p className="text-xs text-slate-400">{title}</p><p className="text-xl font-bold text-white mt-2">{value}</p></div>)}</div>
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 items-end">
        <label className="text-xs text-slate-400">{isAr ? 'البحث بالاسم أو SKU أو المعرّف' : 'Search name, SKU or ID'}<Input className="mt-2 min-h-11" aria-label={isAr ? 'بحث المنتجات' : 'Search products'} icon={Search} value={search} onChange={event => setSearch(event.target.value)} /></label>
        <label className="text-xs text-slate-400">{isAr ? 'التصنيف' : 'Category'}<select value={selectedCategory} onChange={event => props.setSelectedCategory(event.target.value)} className={selectClass}><option value="all">{isAr ? 'كل التصنيفات' : 'All categories'}</option>{props.categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
        <label className="text-xs text-slate-400">{isAr ? 'التوفّر' : 'Availability'}<select value={selectedStatus} onChange={event => props.setSelectedStatus(event.target.value)} className={selectClass}><option value="all">{isAr ? 'كل الحالات' : 'All statuses'}</option><option value="active">{isAr ? 'متوفر' : 'Available'}</option><option value="lowStock">{isAr ? 'محدود' : 'Limited'}</option><option value="outOfStock">{isAr ? 'نفد المخزون' : 'Out of stock'}</option><option value="draft">{isAr ? 'قريباً' : 'Coming soon'}</option></select></label>
        <label className="text-xs text-slate-400">{isAr ? 'الترتيب' : 'Sort'}<select value={sortBy} onChange={event => props.setSortBy(event.target.value as Props['sortBy'])} className={selectClass}><option value="default">{isAr ? 'ترتيب الكتالوج' : 'Catalog order'}</option><option value="price-asc">{isAr ? 'السعر الأقل' : 'Lowest price'}</option><option value="price-desc">{isAr ? 'السعر الأعلى' : 'Highest price'}</option><option value="sales">{isAr ? 'القطع المسلّمة الأكثر' : 'Most delivered items'}</option><option value="stock">{isAr ? 'المخزون الأقل المسجّل' : 'Lowest known stock'}</option></select></label>
      </div>
      <details><summary className="cursor-pointer py-2 text-sm text-indigo-300">{isAr ? 'تصفية سعر البيع' : 'Filter selling price'}</summary><div className="mt-3 max-w-xl"><PriceRangeFilterWidget value={[Math.min(priceRange[0], priceCeiling), Math.min(priceRange[1], priceCeiling)]} onChange={props.setPriceRange} min={0} max={priceCeiling} step={1} lang={isAr ? 'ar' : 'en'} currency="IQD" label={isAr ? 'السعر الفعلي بعد الخصم' : 'Effective price after discount'} onReset={props.onResetPriceRange} /></div></details>
      <div className="flex flex-wrap justify-between items-center gap-3 border-t border-slate-800 pt-3"><p role="status" className="text-xs text-slate-400">{props.filteredCount} / {productsCount} {isAr ? `منتج · ${props.unknownStockCount} بدون كمية مخزون مسجّلة` : `products · ${props.unknownStockCount} without recorded stock`}</p>{filtered && <Button size="sm" variant="outline" onClick={props.onResetFilters}>{isAr ? 'مسح الفلاتر' : 'Clear filters'}</Button>}</div>
    </div>
  </div>;
};
