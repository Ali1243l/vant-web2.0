import React, { useState, useEffect } from 'react';
import { Tag, Layers } from 'lucide-react';
import { Product, Offer } from './useAdminBridge';
import { toEnglishDigits } from './format';
import { Modal } from './ui';

import { ProductIdentityBar } from './offers/ProductIdentityBar';
import { CustomOfferTab } from './offers/CustomOfferTab';
import { CampaignListTab } from './offers/CampaignListTab';

interface ProductOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  products?: Product[];
  offers: Offer[];
  onApplyOffer: (
    productId: string,
    updates: {
      isOnOffer: boolean;
      salePrice?: number;
      offerCampaign?: string;
      offerBadgeText?: string;
      discountPercent?: number;
    },
    applyToAllInCategory?: boolean
  ) => void;
  onRemoveOffer: (productId: string, removeFromAllInCategory?: boolean) => void;
  onAddNewOfferCampaign: (campaign: Omit<Offer, 'id' | 'usedCount'>) => void;
  isAr: boolean;
}

export const ProductOfferModal: React.FC<ProductOfferModalProps> = ({
  isOpen,
  onClose,
  product,
  products = [],
  offers,
  onApplyOffer,
  onRemoveOffer,
  onAddNewOfferCampaign,
  isAr,
}) => {
  // Hooks must ALWAYS be called unconditionally at the top
  const [activeTab, setActiveTab] = useState<'custom' | 'campaign'>('custom');

  // Custom Offer Form State
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [customSalePrice, setCustomSalePrice] = useState<string>('');
  const [customBadgeText, setCustomBadgeText] = useState<string>('');
  const [pricingMode, setPricingMode] = useState<'percent' | 'fixedPrice'>('percent');

  // Category Bulk Apply Convenience
  const [applyToCategory, setApplyToCategory] = useState<boolean>(false);

  // Campaign List Selection State
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [campaignSearch, setCampaignSearch] = useState<string>('');
  const [showCreateCampaignForm, setShowCreateCampaignForm] = useState<boolean>(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState<string>('');
  const [newCampaignCode, setNewCampaignCode] = useState<string>('');
  const [newCampaignPercent, setNewCampaignPercent] = useState<number>(20);

  // Initialize or reset when product opens
  useEffect(() => {
    if (product) {
      if (product.offerCampaign) {
        const matched = offers.find(
          (o) => o.title === product.offerCampaign || o.titleEn === product.offerCampaign
        );
        if (matched) {
          setSelectedOfferId(matched.id);
        }
        setActiveTab('campaign');
      } else if (product.salePrice) {
        setActiveTab('custom');
        const calculatedPct = Math.round(
          ((product.price - product.salePrice) / product.price) * 100
        );
        if (calculatedPct > 0) {
          setDiscountPercent(calculatedPct);
        }
        setCustomSalePrice(product.salePrice.toString());
      } else {
        setActiveTab('custom');
        setDiscountPercent(15);
        setCustomSalePrice('');
      }
      setCustomBadgeText(product.offerBadgeText || '');
      setShowCreateCampaignForm(false);
      setApplyToCategory(false);
      setCampaignSearch('');
    }
  }, [product, offers]);

  // Safe guard: Do not render modal if not open or product is missing
  if (!isOpen || !product) return null;

  const originalPrice = product.price || 0;

  // Calculate prices for Custom Offer safely
  const calculatedCustomPrice =
    pricingMode === 'percent'
      ? Math.max(0, Math.round((originalPrice * (1 - discountPercent / 100)) / 250) * 250)
      : parseFloat(customSalePrice) || 0;

  const currentFinalSalePrice =
    pricingMode === 'percent'
      ? calculatedCustomPrice
      : parseFloat(customSalePrice) || calculatedCustomPrice;

  const customSavings = Math.max(0, originalPrice - currentFinalSalePrice);
  const actualSavingsPct =
    originalPrice > 0
      ? Math.max(0, Math.round(((originalPrice - currentFinalSalePrice) / originalPrice) * 100))
      : 0;

  // Count items in category
  const categoryProducts = products.filter((p) => p.category === product.category);
  const categoryCount = categoryProducts.length;

  // Active campaigns filtered by search
  const filteredCampaigns = offers.filter((o) => {
    if (o.status !== 'active') return false;
    if (!campaignSearch.trim()) return true;
    const q = campaignSearch.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      (o.titleEn && o.titleEn.toLowerCase().includes(q)) ||
      o.code.toLowerCase().includes(q)
    );
  });

  // Quick steppers
  const adjustPriceBy = (amount: number) => {
    setPricingMode('fixedPrice');
    const base = currentFinalSalePrice > 0 ? currentFinalSalePrice : originalPrice;
    const target = Math.max(500, Math.min(originalPrice - 500, base + amount));
    setCustomSalePrice(target.toString());
  };

  // Neat Iraqi Dinar rounding (nearest 500 or 1000 IQD)
  const roundToNearestDinar = (unit: 500 | 1000) => {
    setPricingMode('fixedPrice');
    const base = currentFinalSalePrice > 0 ? currentFinalSalePrice : originalPrice;
    const rounded = Math.round(base / unit) * unit;
    const safeRounded = Math.max(500, Math.min(originalPrice - 500, rounded));
    setCustomSalePrice(safeRounded.toString());
  };

  // Handle applying custom offer
  const handleApplyCustomOffer = () => {
    if (!product) return;
    if (currentFinalSalePrice <= 0 || currentFinalSalePrice >= product.price) {
      return;
    }

    onApplyOffer(
      product.id,
      {
        isOnOffer: true,
        salePrice: currentFinalSalePrice,
        offerBadgeText: customBadgeText.trim() || undefined,
        discountPercent: actualSavingsPct,
      },
      applyToCategory
    );
    onClose();
  };

  // Handle creating new campaign on the fly
  const handleCreateNewCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle.trim() || !newCampaignCode.trim()) return;

    onAddNewOfferCampaign({
      title: newCampaignTitle.trim(),
      titleEn: newCampaignTitle.trim(),
      code: newCampaignCode.trim().toUpperCase(),
      discountType: 'percentage',
      discountValue: newCampaignPercent,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setShowCreateCampaignForm(false);
    setNewCampaignTitle('');
    setNewCampaignCode('');
  };

  // Handle applying selected campaign offer
  const handleApplyCampaignOffer = () => {
    if (!product || !selectedOfferId) return;

    const matched = offers.find((o) => o.id === selectedOfferId);
    if (!matched) return;

    let finalPrice = product.price;
    if (matched.discountType === 'percentage') {
      finalPrice = Math.round((product.price * (1 - matched.discountValue / 100)) / 250) * 250;
    } else {
      finalPrice = Math.max(0, product.price - matched.discountValue);
    }

    onApplyOffer(
      product.id,
      {
        isOnOffer: true,
        salePrice: finalPrice,
        offerCampaign: matched.title,
        offerBadgeText: matched.code,
        discountPercent:
          matched.discountType === 'percentage'
            ? matched.discountValue
            : Math.round(((product.price - finalPrice) / product.price) * 100),
      },
      applyToCategory
    );
    onClose();
  };

  const hasCurrentOffer = Boolean(product.isOnOffer || product.salePrice);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAr ? 'إدارة التخفيضات والعروض الخاصة' : 'Manage Discount & Promotional Offers'}
      description={
        isAr
          ? 'حاسبة الخصم الذكية، الخصم السريع بالدينار العراقي، وإمكانية تطبيق العرض على فئة كاملة بنقرة واحدة.'
          : 'Smart pricing tools, instant IQD deductions, and one-click category-wide application.'
      }
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Product Identity Bar & Bulk Category Switch */}
        <ProductIdentityBar
          product={product}
          hasCurrentOffer={hasCurrentOffer}
          isAr={isAr}
          categoryCount={categoryCount}
          applyToCategory={applyToCategory}
          setApplyToCategory={setApplyToCategory}
          onRemoveOffer={onRemoveOffer}
          onClose={onClose}
        />

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span className="truncate">{isAr ? '1. عرض مخصص بالقطعة' : '1. Custom Promo'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('campaign')}
            className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'campaign'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {isAr ? '2. ربط بقائمة عروض (تخفيضات الشتاء)' : '2. Campaign List'}
            </span>
          </button>
        </div>

        {/* TAB 1: CUSTOM OFFER CALCULATOR */}
        {activeTab === 'custom' && (
          <CustomOfferTab
            product={product}
            isAr={isAr}
            pricingMode={pricingMode}
            setPricingMode={setPricingMode}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            customSalePrice={customSalePrice}
            setCustomSalePrice={setCustomSalePrice}
            customBadgeText={customBadgeText}
            setCustomBadgeText={setCustomBadgeText}
            currentFinalSalePrice={currentFinalSalePrice}
            calculatedCustomPrice={calculatedCustomPrice}
            customSavings={customSavings}
            actualSavingsPct={actualSavingsPct}
            applyToCategory={applyToCategory}
            categoryCount={categoryCount}
            adjustPriceBy={adjustPriceBy}
            roundToNearestDinar={roundToNearestDinar}
            onApplyCustomOffer={handleApplyCustomOffer}
            onClose={onClose}
          />
        )}

        {/* TAB 2: CAMPAIGN LIST SELECTION */}
        {activeTab === 'campaign' && (
          <CampaignListTab
            product={product}
            products={products}
            offers={offers}
            isAr={isAr}
            selectedOfferId={selectedOfferId}
            setSelectedOfferId={setSelectedOfferId}
            campaignSearch={campaignSearch}
            setCampaignSearch={setCampaignSearch}
            showCreateCampaignForm={showCreateCampaignForm}
            setShowCreateCampaignForm={setShowCreateCampaignForm}
            newCampaignTitle={newCampaignTitle}
            setNewCampaignTitle={setNewCampaignTitle}
            newCampaignCode={newCampaignCode}
            setNewCampaignCode={setNewCampaignCode}
            newCampaignPercent={newCampaignPercent}
            setNewCampaignPercent={setNewCampaignPercent}
            applyToCategory={applyToCategory}
            categoryCount={categoryCount}
            filteredCampaigns={filteredCampaigns}
            handleCreateNewCampaign={handleCreateNewCampaign}
            handleApplyCampaignOffer={handleApplyCampaignOffer}
            onClose={onClose}
          />
        )}
      </div>
    </Modal>
  );
};

export default ProductOfferModal;
