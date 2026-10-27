import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Product, Language } from '../types';
import { DEFAULT_WHATSAPP_PHONE } from '../lib/constants';
import ShareModal from './ShareModal';
import ProductDrawerSkeleton from './ProductDrawerSkeleton';
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
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
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
      setSlideDirection(newDirection);
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

  const productId = product?.id;
  useEffect(() => {
    if (!productId) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus({ preventScroll: true });
    return () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); };
  }, [productId]);

  const isOpen = Boolean(product || loading);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!product || showShareModal) return;

    const onKeyDown = (e: KeyboardEvent) => {
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
        <ProductDrawerSkeleton key="skeleton" lang={lang} onClose={onClose} />
      )}
      {isOpen && product && (
        <>
          {/* 1. Backdrop (Click to close) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md touch-none"
          />

          {/* 2. Modal Wrapper: Centered Modal on Desktop (fixed inset-0 flex items-center justify-center), Bottom Sheet on Mobile */}
          <div className="fixed inset-0 z-[1001] flex items-end md:items-center justify-center p-0 md:p-6 lg:p-8 pointer-events-none">
            <motion.div
              key={`drawer-panel-${product.id}`}
              data-scroll-lock-scrollable
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={displayTitle}
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key !== 'Tab' || showShareModal) return;
                const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || []).filter((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (!first) { event.preventDefault(); return; }
                if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
                  event.preventDefault(); last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault(); first.focus();
                }
              }}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260, mass: 0.8 }}
              className="pointer-events-auto relative z-10 flex flex-col md:flex-row w-full max-w-5xl lg:max-w-6xl h-[92dvh] sm:h-[90dvh] md:h-[84vh] md:max-h-[800px] bg-[#f8f9fa] dark:bg-[#0d0f12] border-t md:border border-black/10 dark:border-white/10 rounded-t-[28px] sm:rounded-t-[32px] md:rounded-[32px] overflow-y-auto overscroll-contain md:overflow-hidden no-scrollbar shadow-2xl will-change-transform"
            >
              {/* Mobile Top Drag Indicator */}
              <div className="md:hidden flex items-center justify-center pt-2 pb-0.5 shrink-0 w-full select-none touch-none">
                <div className="h-1.5 w-10 rounded-full bg-black/20 dark:bg-white/25" />
              </div>

              {/* Keep the close control reachable while the mobile sheet scrolls. */}
              <div className="sticky top-0 z-50 h-0 w-full shrink-0 md:absolute md:inset-x-0">
              <button
                type="button"
                ref={closeRef}
                onClick={onClose}
                className="absolute top-2.5 right-3 rtl:right-auto rtl:left-3 md:top-4.5 md:right-4.5 md:rtl:right-auto md:rtl:left-4.5 z-50 flex h-11 w-11 items-center justify-center bg-white/90 dark:bg-[#1a1e28]/90 hover:bg-white dark:hover:bg-[#1a1e28] rounded-full hover:scale-105 transition-all cursor-pointer backdrop-blur-md border border-black/6 dark:border-white/10 shadow-xs text-black dark:text-white"
                aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-black dark:text-white" />
              </button>
              </div>

              {/* 3. Bento Box Layout Container */}
              <div className="flex flex-col md:flex-row w-full shrink-0 md:shrink min-h-0 md:h-full p-2.5 sm:p-5 md:p-6 gap-2.5 sm:gap-4 md:gap-5">
                {/* Left Box: Product Image (Bento Box 1) */}
                <div className="w-full md:w-[48%] h-[clamp(200px,34dvh,280px)] sm:h-[380px] md:h-full rounded-[18px] sm:rounded-[22px] md:rounded-[26px] bg-black/5 dark:bg-white/5 overflow-hidden relative shrink-0">
                  <ProductDrawerGallery
                    images={images}
                    product={product}
                    displayTitle={displayTitle}
                    activeImageIndex={activeImageIndex}
                    setActiveImageIndex={setActiveImageIndex}
                    slideDirection={slideDirection}
                    setSlideDirection={setSlideDirection}
                    carouselNavVisible={carouselNavControl.visible}
                    lang={lang}
                    paginate={paginate}
                  />
                </div>

                {/* Right Column: Details & Actions */}
                <div
                  className="w-full md:w-[52%] flex flex-col gap-2.5 sm:gap-3.5 md:overflow-y-auto md:overscroll-contain md:h-full no-scrollbar md:pr-1.5 pb-2"
                >
                  {/* Title & Price (Bento Box 2) */}
                  <div className="p-3.5 sm:p-5 rounded-[18px] sm:rounded-[22px] md:rounded-[24px] bg-white dark:bg-[#16191f] border border-black/6 dark:border-white/8 shadow-xs">
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
                  </div>

                  {/* Sizes & Colors (Bento Box 3) */}
                  <div className="p-3.5 sm:p-5 rounded-[18px] sm:rounded-[22px] md:rounded-[24px] bg-white dark:bg-[#16191f] border border-black/6 dark:border-white/8 shadow-xs flex flex-col gap-3 sm:gap-3.5">
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

                    {variantInfo && (variantInfo.hasMultipleColors || (Array.isArray(product?.colors) && product.colors.length > 0)) && renderedSizes.length > 0 && (
                      <div className="h-px w-full bg-black/5 dark:bg-white/5" />
                    )}

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
                  </div>

                  {/* Features/Info (Bento Box 4) */}
                  <div className="p-3.5 sm:p-5 rounded-[18px] sm:rounded-[22px] md:rounded-[24px] bg-white dark:bg-[#16191f] border border-black/6 dark:border-white/8 shadow-xs">
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
                  </div>

                  {/* Sticky Bottom Actions (Add to Cart & WhatsApp) */}
                  <div className="sticky bottom-0 pt-2 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-[#f8f9fa] dark:from-[#0d0f12] via-[#f8f9fa]/95 dark:via-[#0d0f12]/95 to-transparent mt-auto z-20">
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
              </div>
            </motion.div>
          </div>

          {/* Share Modal Dialog */}
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            product={product}
            lang={lang}
          />
        </>
      )}
    </AnimatePresence>
  );
}
