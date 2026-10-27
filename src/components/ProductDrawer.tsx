import { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Product, Language } from '../types';
import { DEFAULT_WHATSAPP_PHONE } from '../lib/constants';
import ShareModal from './ShareModal';
import ProductSheet from './product_drawer/ProductSheet';
import { useSiteControls } from '../context/SiteControlsContext';
import { trackEvent } from '../lib/analytics';
import { resolveProductColorVariants } from '../lib/productVariants';
import { useScrollLock } from '../hooks/useScrollLock';

import ProductDrawerGallery from './product_drawer/ProductDrawerGallery';
import ProductHeaderInfo from './product_drawer/ProductHeaderInfo';
import ProductColorSelector from './product_drawer/ProductColorSelector';
import ProductSizeSection from './product_drawer/ProductSizeSection';
import ProductOrderButton from './product_drawer/ProductOrderButton';
import ProductDetailsBadges from './product_drawer/ProductDetailsBadges';

interface Props {
  product: Product | null;
  loading?: boolean;
  lang: Language;
  onClose: () => void;
}

export default function ProductDrawer({ product, loading, lang, onClose }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { getControl, formatPrice, masterSizes } = useSiteControls();

  const whatsappControl = getControl('btn_product_whatsapp');
  const shareControl = getControl('btn_product_share');
  const copyControl = getControl('btn_product_copy');
  const sizeGuideControl = getControl('btn_product_size_guide');
  const bespokeControl = getControl('btn_product_bespoke');
  const whatsappPhoneControl = getControl('cfg_whatsapp_phone');
  const bespokePhoneControl = getControl('cfg_bespoke_phone');
  const deliveryBadgeControl = getControl('sec_product_delivery_badge');
  const craftBadgeControl = getControl('sec_product_craft_badge');
  const carouselNavControl = getControl('btn_product_carousel_nav');

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeFeedback, setSizeFeedback] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [calcHeight, setCalcHeight] = useState<string>('');
  const [calcWeight, setCalcWeight] = useState<string>('');

  // Algorithmic Garment Color & SKU Variant Intelligence
  const variantInfo = useMemo(() => {
    if (!product) return null;
    return resolveProductColorVariants(product, product.currency || 'IQD');
  }, [product]);

  const defaultVariantIdx = useMemo(() => {
    if (!variantInfo || variantInfo.variants.length === 0) return 0;
    const preferredKey = (product as any)?.activeColorKey;
    const preferredEn = (product as any)?.activeColorNameEn;
    const preferredId = (product as any)?.primaryVariantId;

    if (preferredKey || preferredEn || preferredId) {
      const foundIdx = variantInfo.variants.findIndex(
        (v) =>
          (preferredId && v.id === preferredId) ||
          (preferredKey && v.colorKey === preferredKey) ||
          (preferredEn && v.colorNameEn === preferredEn)
      );
      if (foundIdx >= 0) return foundIdx;
    }

    const bIdx = variantInfo.variants.findIndex((v) => v.isBaseline);
    return bIdx >= 0 ? bIdx : 0;
  }, [product, variantInfo]);

  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(defaultVariantIdx);
  const [hoverColorIdx, setHoverColorIdx] = useState<number | null>(null);

  useEffect(() => {
    if (product && variantInfo) {
      setSelectedColorIdx(defaultVariantIdx);
      setHoverColorIdx(null);
      setActiveImageIndex(0);
    }
  }, [product?.id, defaultVariantIdx, variantInfo]);

  const effectiveColorIdx = hoverColorIdx !== null ? hoverColorIdx : selectedColorIdx;

  const activeVariant = useMemo(() => {
    if (!variantInfo || variantInfo.variants.length === 0) return null;
    if (effectiveColorIdx !== null && variantInfo.variants[effectiveColorIdx]) {
      return variantInfo.variants[effectiveColorIdx];
    }
    return (
      variantInfo.variants[defaultVariantIdx] ||
      variantInfo.baselineVariant ||
      variantInfo.variants[0]
    );
  }, [variantInfo, effectiveColorIdx, defaultVariantIdx]);

  const images = useMemo(() => {
    if (!product || !variantInfo) return [];

    const targetVariant =
      effectiveColorIdx !== null && variantInfo.variants[effectiveColorIdx]
        ? variantInfo.variants[effectiveColorIdx]
        : variantInfo.variants[defaultVariantIdx] ||
          variantInfo.baselineVariant ||
          variantInfo.variants[0];

    if (targetVariant && Array.isArray(targetVariant.images) && targetVariant.images.length > 0) {
      const filtered = targetVariant.images.map((s) => s?.trim()).filter(Boolean) as string[];
      if (filtered.length > 0) return filtered;
    }

    if (product.image_url?.trim()) return [product.image_url.trim()];
    if (Array.isArray(product.images) && product.images.length > 0) {
      const filtered = product.images.map((s) => s?.trim()).filter(Boolean) as string[];
      if (filtered.length > 0) return filtered;
    }
    return [];
  }, [product, effectiveColorIdx, variantInfo, defaultVariantIdx]);

  useEffect(() => {
    if (product) {
      setSelectedSize(null);
      setSizeFeedback(null);
      setCopiedTitle(false);
      setShowSizeGuide(false);
      setShowShareModal(false);
    }
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;

    const pTitle = product.title_ar || product.title || 'القطعة المصممة';

    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      trackEvent('engagement_heartbeat', {
        productId: product.id,
        productTitle: pTitle,
        isExit: false,
      });
    }, 10000);

    return () => {
      clearInterval(intervalId);
      trackEvent('engagement_heartbeat', {
        productId: product.id,
        productTitle: pTitle,
        isExit: true,
      });
    };
  }, [product?.id, product?.title, product?.title_ar]);

  const displayTitle = lang === 'ar' && product?.title_ar ? product.title_ar : product?.title;

  const paginate = useCallback(
    (newDirection: number) => {
      if (images.length <= 1) return;
      let targetIndex = activeImageIndex + newDirection;
      if (targetIndex < 0) targetIndex = 0;
      if (targetIndex >= images.length) targetIndex = images.length - 1;
      setActiveImageIndex(targetIndex);
      if (product) {
        trackEvent('image_slide', { productId: product.id, title: displayTitle, imageIndex: targetIndex });
      }
    },
    [images.length, activeImageIndex, product, displayTitle]
  );

  const availability = activeVariant?.availability ?? product?.availability ?? 'in_stock';
  const isSoldOut = availability === 'sold_out';
  const availableSizes = useMemo(() => {
    if (isSoldOut) return new Set<string>();
    return new Set((activeVariant?.sizes || product?.sizes || []).map((s) => s.toUpperCase()));
  }, [isSoldOut, activeVariant?.sizes, product?.sizes]);

  const renderedSizes = useMemo(() => {
    return (activeVariant?.sizes || product?.sizes || []).filter(Boolean);
  }, [activeVariant?.sizes, product?.sizes]);

  const displayCategory = lang === 'ar' && product?.category_ar ? product.category_ar : product?.category;
  const displayDescription = lang === 'ar' && product?.description_ar ? product.description_ar : product?.description;

  let statusBadgeLabel = '';
  let statusBadgeClasses = '';
  let statusBannerText = '';
  let statusDotClass = '';
  let buttonLabel = '';

  switch (availability) {
    case 'sold_out':
      statusBadgeLabel = lang === 'ar' ? 'العرض منتهي' : 'Sold Out';
      statusBadgeClasses =
        'bg-black/75 dark:bg-black/85 text-white/70 dark:text-white/60 border-white/10 shadow-2xs';
      statusDotClass = 'bg-neutral-400 dark:bg-neutral-500';
      statusBannerText =
        lang === 'ar'
          ? 'العرض منتهي — نعتذر، نفدت الكمية والمقاسات بالكامل. يمكنك اختيار مقاسك بالأسفل لطلب إعادة توفيره.'
          : 'Sold Out — All sizes and allocations are currently exhausted. Select your size below to request a restock.';
      buttonLabel = selectedSize
        ? lang === 'ar'
          ? `طلب إعادة توفير مقاس (${selectedSize}) عبر واتساب`
          : `Request Restock for Size (${selectedSize})`
        : lang === 'ar'
        ? 'طلب إعادة توفير أو استفسار عبر واتساب'
        : 'Inquire on Restock via WhatsApp';
      break;
    case 'coming_soon':
      statusBadgeLabel = lang === 'ar' ? 'قريباً' : 'Coming Soon';
      statusBadgeClasses =
        'bg-[#15171c]/90 dark:bg-white/12 text-white border-white/15 dark:border-white/20 shadow-2xs';
      statusDotClass = 'bg-sky-400 animate-pulse';
      statusBannerText =
        lang === 'ar'
          ? 'قريباً — هذه القطعة قيد التجهيز الفاخر ضمن التشكيلة القادمة. يمكنك حجز أسبقية الاستلام فور توفرها.'
          : 'Coming Soon — This piece is in production for the upcoming drop. You may pre-register priority allocation.';
      buttonLabel = selectedSize
        ? lang === 'ar'
          ? `حجز مسبق لمقاس (${selectedSize}) عبر واتساب`
          : `Pre-Order Size (${selectedSize}) via WhatsApp`
        : lang === 'ar'
        ? 'حجز مسبق واستفسار عبر واتساب'
        : 'Pre-Order & Inquire via WhatsApp';
      break;
    case 'limited':
      statusBadgeLabel = lang === 'ar' ? 'قطع محدودة' : 'Limited Stock';
      statusBadgeClasses =
        'bg-white/90 dark:bg-[#14171f]/90 text-[#15171c] dark:text-white border-black/8 dark:border-white/12 shadow-2xs';
      statusDotClass = 'bg-amber-500';
      statusBannerText =
        lang === 'ar'
          ? 'قطع محدودة — تتوفر أعداد قليلة جداً من هذا الإصدار في المخزون.'
          : 'Limited Allocation — Only a few pieces remain in current stock.';
      buttonLabel = selectedSize
        ? lang === 'ar'
          ? `طلب مقاس (${selectedSize}) عبر واتساب`
          : `Order Size (${selectedSize}) via WhatsApp`
        : lang === 'ar'
        ? 'طلب واستفسار عبر واتساب'
        : 'Order & Inquire via WhatsApp';
      break;
    case 'in_stock':
    default:
      statusBadgeLabel = lang === 'ar' ? 'متوفر' : 'In Stock';
      statusBadgeClasses =
        'bg-white/90 dark:bg-[#14171f]/90 text-[#15171c] dark:text-white border-black/8 dark:border-white/12 shadow-2xs';
      statusDotClass = 'bg-emerald-500';
      statusBannerText =
        lang === 'ar'
          ? 'متوفر وجاهز للشحن الفوري والتسليم.'
          : 'In Stock and ready for immediate complimentary dispatch.';
      buttonLabel = selectedSize
        ? lang === 'ar'
          ? `طلب مقاس (${selectedSize}) عبر واتساب`
          : `Order Size (${selectedSize}) via WhatsApp`
        : lang === 'ar'
        ? 'طلب واستفسار عبر واتساب'
        : 'Order & Inquire via WhatsApp';
      break;
  }

  const activePrice = activeVariant ? activeVariant.price : (product?.price ?? 0);
  const productCode = activeVariant?.sku || (product?.id ? `#${product.id}` : '');
  const formattedProductPrice = formatPrice(activePrice);
  const colorSpecLabel = activeVariant ? `${activeVariant.colorNameAr} (${activeVariant.colorNameEn})` : '';

  const whatsappMessage = lang === 'ar'
    ? isSoldOut
      ? selectedSize
        ? `مرحباً ڤانت، أود الاستفسار عن إمكانية إعادة توفير قطعة "${displayTitle ?? ''}" - اللون: ${colorSpecLabel} بمقاس (${selectedSize}) (كود الموديل واللون: ${productCode} - السعر: ${formattedProductPrice})`
        : `مرحباً ڤانت، أود الاستفسار عن إمكانية إعادة توفير قطعة "${displayTitle ?? ''}" - اللون: ${colorSpecLabel} (كود الموديل واللون: ${productCode} - السعر: ${formattedProductPrice})`
      : availability === 'coming_soon'
      ? selectedSize
        ? `مرحباً ڤانت، أود حجز أسبقية لقطعة "${displayTitle ?? ''}" - اللون: ${colorSpecLabel} بمقاس (${selectedSize}) (كود الموديل واللون: ${productCode} - السعر: ${formattedProductPrice})`
        : `مرحباً ڤانت، أود الاستفسار وحجز أسبقية لقطعة "${displayTitle ?? ''}" - اللون: ${colorSpecLabel} (كود الموديل واللون: ${productCode} - السعر: ${formattedProductPrice})`
      : selectedSize
      ? `مرحباً ڤانت، أود طلب قطعة "${displayTitle ?? ''}" - اللون: ${colorSpecLabel} بمقاس (${selectedSize}) (كود الموديل واللون: ${productCode} - السعر: ${formattedProductPrice})`
      : `مرحباً ڤانت، أود الاستفسار والطلب لقطعة "${displayTitle ?? ''}" - اللون: ${colorSpecLabel} (كود الموديل واللون: ${productCode} - السعر: ${formattedProductPrice})`
    : isSoldOut
    ? selectedSize
      ? `Hello Maison VANT, I would like to inquire about restocking "${displayTitle ?? ''}" - Color: ${colorSpecLabel} in size (${selectedSize}) (SKU: ${productCode} - Price: ${formattedProductPrice})`
      : `Hello Maison VANT, I would like to inquire about restocking "${displayTitle ?? ''}" - Color: ${colorSpecLabel} (SKU: ${productCode} - Price: ${formattedProductPrice})`
    : availability === 'coming_soon'
    ? selectedSize
      ? `Hello Maison VANT, I would like to pre-register "${displayTitle ?? ''}" - Color: ${colorSpecLabel} for size (${selectedSize}) (SKU: ${productCode} - Price: ${formattedProductPrice})`
      : `Hello Maison VANT, I would like to pre-register/inquire about "${displayTitle ?? ''}" - Color: ${colorSpecLabel} (SKU: ${productCode} - Price: ${formattedProductPrice})`
    : selectedSize
    ? `Hello Maison VANT, I would like to order "${displayTitle ?? ''}" - Color: ${colorSpecLabel} in size (${selectedSize}) (SKU: ${productCode} - Price: ${formattedProductPrice})`
    : `Hello Maison VANT, I would like to order/inquire about "${displayTitle ?? ''}" - Color: ${colorSpecLabel} (SKU: ${productCode} - Price: ${formattedProductPrice})`;

  const whatsappText = encodeURIComponent(whatsappMessage);
  const targetPhone = (whatsappPhoneControl?.actionValue || '').replace(/[^0-9]/g, '') || DEFAULT_WHATSAPP_PHONE;
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${whatsappText}`;

  const bespokeWhatsappText = encodeURIComponent(
    lang === 'ar'
      ? `مرحباً ڤانت، أود الاستفسار عن خدمة التفصيل الخاص (Made-to-Measure) لقطعة "${displayTitle ?? ''}" (كود القطعة: ${productCode} - الطول: ${calcHeight} سم، الوزن: ${calcWeight} كغم، السعر: ${formattedProductPrice})`
      : `Hello Maison VANT, I would like to inquire about Made-to-Measure bespoke tailoring for "${displayTitle ?? ''}" (Code: ${productCode} - Height: ${calcHeight} cm, Weight: ${calcWeight} kg, Price: ${formattedProductPrice})`
  );
  const targetBespokePhone = (bespokePhoneControl?.actionValue || '').replace(/[^0-9]/g, '') || targetPhone;
  const bespokeWhatsappUrl = `https://wa.me/${targetBespokePhone}?text=${bespokeWhatsappText}`;

  const handleCopyTitle = async () => {
    if (!displayTitle) return;
    try {
      await navigator.clipboard.writeText(displayTitle);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = displayTitle;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    }
  };

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    if (product) {
      trackEvent('size_select', { productId: product.id, size, title: displayTitle });
    }
    if (isSoldOut) {
      setSizeFeedback(
        lang === 'ar'
          ? `المقاس (${size}) منتهي حالياً ضمن هذا العرض — تم تحديده لطلب إعادة توفيره عبر واتساب بالأسفل`
          : `Size (${size}) is sold out — selected for restock request via WhatsApp below`
      );
    } else if (availableSizes.has(size.toUpperCase())) {
      setSizeFeedback(
        lang === 'ar'
          ? `المقاس (${size}) متوفر وجاهز للشحن الفوري`
          : `Size (${size}) is currently in stock & ready for dispatch`
      );
    } else {
      setSizeFeedback(
        lang === 'ar'
          ? `عذراً، المقاس (${size}) نفد من المخزون لهذه القطعة`
          : `Apologies, size (${size}) is currently out of stock`
      );
    }
  };

  const isOpen = Boolean(product || loading);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!product || showShareModal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' && e.target instanceof Element && e.target.closest('input, textarea, select')) return;
      if (e.key === 'Escape') {
        if (showSizeGuide) {
          setShowSizeGuide(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        paginate(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [product, onClose, paginate, showSizeGuide, showShareModal]);

  return (
    <AnimatePresence>
      {loading && !product && (
        <ProductSheet key="loading-product" title={lang === 'ar' ? 'جاري تحميل القطعة' : 'Loading piece'} lang={lang} onClose={onClose} busy>
          <div className="product-detail-layout animate-pulse" aria-hidden="true">
            <div className="m-4 h-80 rounded-xl bg-black/5 dark:bg-white/5" />
            <div className="space-y-5 p-6"><div className="h-6 w-3/4 rounded bg-black/10 dark:bg-white/10" /><div className="h-8 w-1/2 rounded bg-black/10 dark:bg-white/10" /><div className="h-40 rounded bg-black/5 dark:bg-white/5" /></div>
          </div>
        </ProductSheet>
      )}
      {isOpen && product && (
        <ProductSheet
          key={product.id} title={displayTitle || 'VANT'} lang={lang} onClose={onClose} suspended={showShareModal}
          footer={
            <div className="product-purchase-row">
              <div className="hidden md:block min-w-0">
                <p className="truncate text-sm font-semibold">{displayTitle}</p>
                <p className="mt-1 text-xs text-black/50 dark:text-white/50">{selectedSize ? `${lang === 'ar' ? 'المقاس' : 'Size'} · ${selectedSize}` : (lang === 'ar' ? 'اختر المقاس المناسب' : 'Choose your size')}</p>
              </div>
              <div className="min-w-0 w-full md:max-w-md">
                <ProductOrderButton
                      whatsappControl={whatsappControl}
                      whatsappUrl={whatsappUrl}
                      product={product}
                      displayTitle={displayTitle}
                      activePrice={activePrice}
                      color={colorSpecLabel}
                      unavailable={availability === 'sold_out' || availability === 'coming_soon'}
                      selectedSize={selectedSize}
                      buttonLabel={buttonLabel}
                      lang={lang}
                    />
              </div>
            </div>
          }
        >
          <div className="product-detail-layout">
            <div className="product-detail-gallery">
              <ProductDrawerGallery
                    images={images}
                    product={product}
                    displayTitle={displayTitle}
                    activeImageIndex={activeImageIndex}
                    setActiveImageIndex={setActiveImageIndex}
                    carouselNavVisible={carouselNavControl.visible}
                    lang={lang}
                    paginate={paginate}
                  />
            </div>
            <div className="product-detail-info min-w-0">
              <section className="product-detail-section">
                <ProductHeaderInfo
                      displayCategory={displayCategory}
                      statusBadgeClasses={statusBadgeClasses}
                      statusDotClass={statusDotClass}
                      statusBadgeLabel={statusBadgeLabel}
                      displayTitle={displayTitle}
                      formatPrice={formatPrice}
                      activePrice={activePrice}
                      product={product}
                      activeVariant={activeVariant}
                      lang={lang}
                      availability={availability}
                      statusBannerText={statusBannerText}
                    />
              </section>
              {(renderedSizes.length > 0 || variantInfo?.hasMultipleColors || Boolean(product.colors?.length)) && <section className="product-detail-section space-y-5">
                <ProductColorSelector
                      variantInfo={variantInfo}
                      product={product}
                      lang={lang}
                      selectedColorIdx={selectedColorIdx}
                      setSelectedColorIdx={setSelectedColorIdx}
                      hoverColorIdx={hoverColorIdx}
                      setHoverColorIdx={setHoverColorIdx}
                      defaultVariantIdx={defaultVariantIdx}
                      onColorChange={() => {
                        setActiveImageIndex(0);
                      }}
                    />
                <ProductSizeSection
                      renderedSizes={renderedSizes}
                      availableSizes={availableSizes}
                      selectedSize={selectedSize}
                      onSizeClick={handleSizeClick}
                      sizeFeedback={sizeFeedback}
                      isSoldOut={isSoldOut}
                      lang={lang}
                      sizeGuideControl={sizeGuideControl}
                      showSizeGuide={showSizeGuide}
                      setShowSizeGuide={setShowSizeGuide}
                      masterSizes={masterSizes}
                      bespokeControl={bespokeControl}
                      bespokeWhatsappUrl={bespokeWhatsappUrl}
                      product={product}
                      displayTitle={displayTitle}
                      calcHeight={calcHeight}
                      setCalcHeight={setCalcHeight}
                      calcWeight={calcWeight}
                      setCalcWeight={setCalcWeight}
                    />
              </section>}
              <section className="product-detail-section">
                <ProductDetailsBadges
                      shareControl={shareControl}
                      copyControl={copyControl}
                      deliveryBadgeControl={deliveryBadgeControl}
                      craftBadgeControl={craftBadgeControl}
                      lang={lang}
                      displayDescription={displayDescription}
                      handleCopyTitle={handleCopyTitle}
                      copiedTitle={copiedTitle}
                      onOpenShareModal={() => setShowShareModal(true)}
                    />
              </section>
            </div>
          </div>
        </ProductSheet>
      )}
      <ShareModal isOpen={showShareModal && Boolean(product)} onClose={() => setShowShareModal(false)} product={product} lang={lang} />
    </AnimatePresence>
  );
}
