import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { X } from 'lucide-react';
import type { Product, Language } from '../types';
import { DEFAULT_WHATSAPP_PHONE } from '../lib/constants';
import ShareModal from './ShareModal';
import ProductDrawerSkeleton from './ProductDrawerSkeleton';
import { useSiteControls } from '../context/SiteControlsContext';
import { trackEvent } from '../lib/analytics';
import { resolveProductColorVariants } from '../lib/productVariants';

import ProductDrawerGallery from './product_drawer/ProductDrawerGallery';
import ProductHeaderInfo from './product_drawer/ProductHeaderInfo';
import ProductColorSelector from './product_drawer/ProductColorSelector';
import ProductSizeSection from './product_drawer/ProductSizeSection';
import ProductOrderButton from './product_drawer/ProductOrderButton';
import ProductDetailsBadges from './product_drawer/ProductDetailsBadges';
import ProductMobileOrderBar from './product_drawer/ProductMobileOrderBar';

interface Props {
  product: Product | null;
  loading?: boolean;
  lang: Language;
  onClose: () => void;
}

export default function ProductDrawer({ product, loading, lang, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Determine the primary/default variant index (matches what is shown in catalog card)
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

  // Sync selectedColorIdx when product changes or preferred color is passed
  useEffect(() => {
    if (product && variantInfo) {
      setSelectedColorIdx(defaultVariantIdx);
      setHoverColorIdx(null);
      setActiveImageIndex(0);
    }
  }, [product?.id, defaultVariantIdx, variantInfo]);

  // When a color is selected, hover previews another color variant smoothly.
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

  // STRICT RULE: Each color variant strictly and exclusively displays ONLY its own images!
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

  // Reset product-level state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(null);
      setSizeFeedback(null);
      setCopiedTitle(false);
      setShowSizeGuide(false);
    }
  }, [product?.id]);

  // Heartbeat Telemetry: Fire 'engagement_heartbeat' every 10 seconds while the product drawer is open & tab is visible
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
    const prodSizes = (activeVariant?.sizes || product?.sizes || []).filter(Boolean);
    return prodSizes;
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

  // Mobile & Modal Drag Handlers
  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 280], [1, 0]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (product) {
      isClosingRef.current = false;
      if (isMobile) {
        dragY.set(typeof window !== 'undefined' ? window.innerHeight : 650);
        animate(dragY, 0, {
          type: 'spring',
          damping: 28,
          stiffness: 340,
          mass: 0.8,
        });
      } else {
        dragY.set(0);
      }
    }
  }, [product, isMobile, dragY]);

  const touchStateRef = useRef<{
    startY: number;
    startX: number;
    startTime: number;
    isDragging: boolean;
    initialScrollTop: number;
  }>({
    startY: 0,
    startX: 0,
    startTime: 0,
    isDragging: false,
    initialScrollTop: 0,
  });

  const onTouchStartDrag = (e: React.TouchEvent) => {
    if (!isMobile || isClosingRef.current) return;
    const touch = e.touches[0];
    const initialScrollTop = scrollContainerRef.current ? scrollContainerRef.current.scrollTop : 0;
    touchStateRef.current = {
      startY: touch.clientY,
      startX: touch.clientX,
      startTime: Date.now(),
      isDragging: true,
      initialScrollTop,
    };
  };

  const onTouchMoveDrag = (e: React.TouchEvent) => {
    if (!isMobile || !touchStateRef.current.isDragging || isClosingRef.current) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStateRef.current.startY;
    const deltaX = touch.clientX - touchStateRef.current.startX;

    if (deltaY > 0 && touchStateRef.current.initialScrollTop <= 0 && deltaY > Math.abs(deltaX) * 0.25) {
      dragY.set(deltaY);
    } else if (deltaY < 0 && dragY.get() > 0) {
      dragY.set(Math.max(0, dragY.get() + deltaY * 0.15));
    }
  };

  const onTouchEndDrag = () => {
    if (!isMobile || !touchStateRef.current.isDragging || isClosingRef.current) return;
    touchStateRef.current.isDragging = false;

    const currentDeltaY = dragY.get();
    const elapsedTime = Math.max(1, Date.now() - touchStateRef.current.startTime);
    const velocity = currentDeltaY / elapsedTime;

    if (currentDeltaY > 25 || velocity > 0.12) {
      isClosingRef.current = true;
      const targetY = typeof window !== 'undefined' ? window.innerHeight : 650;
      animate(dragY, targetY, {
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => {
          onClose();
        },
      });
    } else {
      animate(dragY, 0, { type: 'spring', damping: 28, stiffness: 350 });
    }
  };

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    if (isMobile) {
      isClosingRef.current = true;
      const targetY = typeof window !== 'undefined' ? window.innerHeight : 650;
      animate(dragY, targetY, {
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => {
          onClose();
        },
      });
    } else {
      onClose();
    }
  }, [isMobile, dragY, onClose]);

  // Keyboard navigation: ESC to close, Left/Right for gallery + Zero-Reflow Body Lock
  useEffect(() => {
    if (!product) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyPaddingRight = document.body.style.paddingRight;

    if (!isMobile) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }

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
      if (!isMobile) {
        document.body.style.overflow = prevBodyOverflow;
        document.body.style.paddingRight = prevBodyPaddingRight;
      }
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [product, onClose, paginate, showSizeGuide, isMobile]);

  return (
    <AnimatePresence>
      {loading && !product && (
        <ProductDrawerSkeleton key="skeleton" lang={lang} onClose={onClose} />
      )}
      {product && (
        <div
          key="drawer-modal-container"
          className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none md:items-center p-0 md:p-6 lg:p-8 xl:p-10"
        >
          {/* Backdrop with click to dismiss */}
          <motion.div
            key="backdrop"
            style={isMobile ? { opacity: backdropOpacity } : undefined}
            className="fixed inset-0 bg-black/45 dark:bg-black/60 pointer-events-auto touch-none will-change-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={handleClose}
          />

          {/* Responsive Sheet/Modal Panel */}
          <motion.div
            key={`sheet-panel-${product.id}`}
            role="dialog"
            aria-modal="true"
            aria-label={displayTitle}
            style={isMobile ? { y: dragY } : undefined}
            className="pointer-events-auto relative z-10 flex w-full flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#16191f] shadow-2xl transition-colors duration-250 
                       rounded-t-[28px] sm:rounded-t-[32px] h-[92dvh] sm:h-[94dvh] max-h-[100dvh]
                       md:h-[88vh] md:max-h-[820px] md:min-h-[620px] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl md:rounded-[32px] md:border md:border-black/5 md:dark:border-white/10 will-change-transform"
            initial={isMobile ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={isMobile ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { opacity: 0, transition: { duration: 0.05 } } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={
              isMobile
                ? undefined
                : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
            }
          >
            {/* Mobile Drag to Close Zone */}
            <div
              className="flex flex-col shrink-0 items-center justify-center pt-2.5 pb-2 cursor-grab active:cursor-grabbing md:hidden select-none touch-none w-full"
              onTouchStart={onTouchStartDrag}
              onTouchMove={onTouchMoveDrag}
              onTouchEnd={onTouchEndDrag}
              onTouchCancel={onTouchEndDrag}
            >
              <div className="h-1.5 w-11 rounded-full bg-black/25 dark:bg-white/30 active:bg-black/50 transition-colors" />
              <span className="mt-1 text-[10px] font-medium text-black/40 dark:text-white/40 tracking-wider select-none">
                {lang === 'ar' ? 'اسحب للأسفل للإغلاق' : 'Swipe down to close'}
              </span>
            </div>

            {/* Dedicated Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-3.5 md:top-5 z-20 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/85 dark:bg-[#0d0f12]/85 text-[#15171c] dark:text-white backdrop-blur-md shadow-xs border border-black/5 dark:border-white/10 transition-all hover:bg-white dark:hover:bg-[#0d0f12] active:scale-95 ltr:right-3.5 rtl:left-3.5 md:ltr:right-5 md:rtl:left-5 cursor-pointer"
              aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            {/* Responsive Layout Grid (Split screen on Desktop, Stack on Mobile) */}
            <div
              ref={scrollContainerRef}
              className="grid flex-1 overflow-y-auto overscroll-contain touch-pan-y md:grid-cols-12 md:overflow-hidden md:h-full pb-20 md:pb-0"
            >
              {/* GALLERY SECTION (Column 1-6 on desktop) */}
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

              {/* DETAILS SECTION (Column 7-12 on desktop) */}
              <div className="flex flex-col justify-between p-4 sm:p-6 md:p-7 lg:p-8 md:col-span-6 lg:col-span-6 md:overflow-y-auto md:h-full no-scrollbar pb-6 md:pb-8">
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Category, Title, Price & Status Info */}
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

                  {/* Garment Colors Selector */}
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

                  {/* Sizing & Fit Section + Smart Guide */}
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

                  {/* Primary Conversion Action: Desktop WhatsApp Order Button */}
                  <ProductOrderButton
                    whatsappControl={whatsappControl}
                    whatsappUrl={whatsappUrl}
                    product={product}
                    displayTitle={displayTitle}
                    selectedSize={selectedSize}
                    buttonLabel={buttonLabel}
                    lang={lang}
                  />

                  {/* Secondary Actions & Editorial Highlights */}
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
              </div>
            </div>

            {/* Dedicated Sticky Mobile Quick-Order Floating Bar */}
            <ProductMobileOrderBar
              whatsappControl={whatsappControl}
              selectedSize={selectedSize}
              lang={lang}
              activePrice={activePrice}
              formatPrice={formatPrice}
              whatsappUrl={whatsappUrl}
              product={product}
              displayTitle={displayTitle}
              buttonLabel={buttonLabel}
            />
          </motion.div>

          {/* Share Modal Dialog */}
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            product={product}
            lang={lang}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
