import { productCampaignPrice } from './offerModel';
import React from 'react';
import { Search, Plus, Sparkles, Check, Tag } from 'lucide-react';
import type { Product, Offer } from '../useAdminBridge';
import { formatCurrency } from '../format';
import { Button, Input } from '../ui';
import { quickCampaignTemplates } from './presets';

interface CampaignListTabProps {
  product: Product;
  products: Product[];
  offers: Offer[];
  isAr: boolean;
  selectedOfferId: string;
  setSelectedOfferId: (id: string) => void;
  campaignSearch: string;
  setCampaignSearch: (val: string) => void;
  showCreateCampaignForm: boolean;
  setShowCreateCampaignForm: (show: boolean) => void;
  newCampaignTitle: string;
  setNewCampaignTitle: (title: string) => void;
  newCampaignCode: string;
  setNewCampaignCode: (code: string) => void;
  newCampaignPercent: number;
  setNewCampaignPercent: (pct: number) => void;
  applyToCategory: boolean;
  categoryCount: number;
  filteredCampaigns: Offer[];
  campaignSaving: boolean;
  handleCreateNewCampaign: (e: React.FormEvent) => void;
  handleApplyCampaignOffer: () => void;
  onClose: () => void;
}

export const CampaignListTab: React.FC<CampaignListTabProps> = ({
  product,
  products,
  isAr,
  selectedOfferId,
  setSelectedOfferId,
  campaignSearch,
  setCampaignSearch,
  showCreateCampaignForm,
  setShowCreateCampaignForm,
  newCampaignTitle,
  setNewCampaignTitle,
  newCampaignCode,
  setNewCampaignCode,
  newCampaignPercent,
  setNewCampaignPercent,
  applyToCategory,
  categoryCount,
  filteredCampaigns,
  campaignSaving,
  handleCreateNewCampaign,
  handleApplyCampaignOffer,
  onClose,
}) => {
  return (
    <div className="space-y-4 pt-1">
      {/* Search & Add New Campaign Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <Input
            placeholder={
              isAr
                ? 'بحث باسم الحملة أو كود الكوبون (مثال: الشتاء، WINTER25)...'
                : 'Search campaigns or codes...'
            }
            value={campaignSearch}
            onChange={(e) => setCampaignSearch(e.target.value)}
            icon={Search}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCreateCampaignForm(!showCreateCampaignForm)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10"
        >
          {isAr ? 'إنشاء حملة عروض جديدة' : 'Create Campaign'}
        </Button>
      </div>

      {/* Inline Inline Create New Campaign Form */}
      {showCreateCampaignForm && (
        <form
          onSubmit={handleCreateNewCampaign}
          className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAr ? 'إضافة حملة عروض ترويجية جديدة:' : 'New Promotional Campaign:'}</span>
            </h5>
            {/* Quick Templates */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[10px] text-slate-500 me-1">
                {isAr ? 'قوالب مقترحة:' : 'Presets:'}
              </span>
              {quickCampaignTemplates.map((tmpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setNewCampaignTitle(tmpl.title);
                    setNewCampaignCode(tmpl.code);
                    setNewCampaignPercent(tmpl.pct);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                >
                  {tmpl.code}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label={isAr ? 'عنوان الحملة:' : 'Campaign Title:'}
                placeholder={isAr ? 'تخفيضات رأس السنة، العيد' : 'Clearance, Eid Specials'}
                value={newCampaignTitle}
                onChange={(e) => setNewCampaignTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label={isAr ? 'كود الكوبون:' : 'Promo Code:'}
                placeholder="WINTER25"
                value={newCampaignCode}
                onChange={(e) => setNewCampaignCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">
                {isAr ? 'نسبة الخصم:' : 'Discount:'}
              </span>
              <div className="flex gap-1.5">
                {[15, 20, 25, 30, 40].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewCampaignPercent(p)}
                    className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                      newCampaignPercent === p
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    %{p}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" isLoading={campaignSaving} variant="emerald" size="sm" className="w-full sm:w-auto">
              {isAr ? 'حفظ وإضافة للقوائم' : 'Save Campaign'}
            </Button>
          </div>
        </form>
      )}

      <p className="text-xs text-slate-400">{isAr ? 'تظهر الحملات ضمن الصلاحية فقط، بدون حد شراء أو استخدام؛ الشروط الخاصة تحتاج ربطاً بالدفع.' : 'Only valid campaigns without spend or usage conditions appear; conditional codes require checkout integration.'}</p>
      {!filteredCampaigns.length && <p role="status" className="p-4 text-sm text-slate-400">{isAr ? 'لا توجد حملات مؤهلة لهذا المنتج.' : 'No eligible campaigns for this product.'}</p>}
      {/* Campaign Options List */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pe-1 scrollbar-thin scrollbar-thumb-slate-700">
        {filteredCampaigns.map((campaign) => {
          const isSelected = selectedOfferId === campaign.id;

          // Calculate product price under this campaign
          const promoPrice = productCampaignPrice(campaign, product.price);
          if (promoPrice === null) return null;
          const savings = product.price - promoPrice;

          // Count items assigned to this campaign
          const assignedCount = products.filter(
            (p) => p.offerCampaign === campaign.code || p.offerBadgeText === campaign.code || p.offerCampaign === campaign.title || p.offerCampaign === campaign.titleEn
          ).length;

          return (
            <div
              key={campaign.id}
              onClick={() => setSelectedOfferId(campaign.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                      {isAr ? campaign.title : campaign.titleEn || campaign.title}
                    </h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {campaign.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                    <span>
                      {campaign.discountType === 'percentage'
                        ? `${isAr ? 'خصم' : 'Discount'} %${campaign.discountValue}`
                        : `${isAr ? 'خصم ثابت' : 'Fixed'} ${formatCurrency(campaign.discountValue, 'IQD', 'en')}`}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-400 font-medium">
                      {isAr ? 'توفير للزبون' : 'Saves'}{' '}
                      <span dir="ltr" className="font-mono">
                        {formatCurrency(savings, 'IQD', 'en')}
                      </span>
                    </span>
                    {assignedCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-indigo-300">
                          {isAr ? `مطبق على ${assignedCount} سلع` : `${assignedCount} items`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-start sm:text-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 flex sm:flex-col items-center sm:items-end justify-between">
                <span className="text-xs text-slate-400">
                  {isAr ? 'السعر بعد الخصم:' : 'Discounted Price:'}
                </span>
                <span className="text-sm font-extrabold text-white font-mono tracking-tight" dir="ltr">
                  {formatCurrency(promoPrice, 'IQD', 'en')}
                </span>
              </div>
            </div>
          );
        })}

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
            {isAr ? 'لا توجد حملات تطابق البحث.' : 'No matching campaigns.'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-800/80">
        <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={!selectedOfferId}
          onClick={handleApplyCampaignOffer}
          leftIcon={<Check className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          {applyToCategory
            ? isAr
              ? `إضافة جميع منتجات فئة ${product.category} (${categoryCount}) للقائمة`
              : `Add All ${categoryCount} ${product.category} Items to Campaign`
            : isAr
            ? 'تأكيد إضافة القطعة إلى قائمة العرض'
            : 'Confirm & Add to Campaign'}
        </Button>
      </div>
    </div>
  );
};
