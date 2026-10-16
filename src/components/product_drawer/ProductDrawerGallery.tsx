import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, Language } from '../../types';
import { trackEvent } from '../../lib/analytics';
import Lens from '../ui/Lens';
import MobileTouchZoom from '../ui/MobileTouchZoom';

interface ProductDrawerGalleryProps {
  images: string[];
  product: Product | null;
  displayTitle?: string;
  activeImageIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
  slideDirection: number;
  setSlideDirection: (dir: number) => void;
  carouselNavVisible: boolean;
  lang: Language;
  paginate: (direction: number) => void;
}

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isPhone;
}

export const ProductDrawerGallery: React.FC<ProductDrawerGalleryProps> = ({
  images,
  product,
  displayTitle,
  activeImageIndex,
  setActiveImageIndex,
  setSlideDirection,
  carouselNavVisible,
  lang,
  paginate,
}) => {
  const [carouselDragOffset, setCarouselDragOffset] = useState(0);
  const [isSwipingCarousel, setIsSwipingCarousel] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});

  const carouselPointerRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    startTime: number;
    isLocked: boolean;
    lockDirection: 'horizontal' | 'vertical' | null;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    isLocked: false,
    lockDirection: null,
  });

  const lastWheelTimeRef = useRef(0);
  const carouselViewportRef = useRef<HTMLDivElement>(null);
  const slideItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Preload gallery images & calculate aspect ratios
  useEffect(() => {
    if (product) {
      setCarouselDragOffset(0);
      setIsSwipingCarousel(false);

      images.forEach((imgSrc) => {
        if (imgSrc && !imgSrc.startsWith('data:') && !imageRatios[imgSrc]) {
          const img = new Image();
          img.src = imgSrc;
          img.onload = () => {
            setLoadedImages((prev) => new Set(prev).add(imgSrc));
            if (img.naturalWidth && img.naturalHeight) {
              const r = img.naturalWidth / img.naturalHeight;
              setImageRatios((prev) => ({ ...prev, [imgSrc]: r }));
            }
          };
        }
      });
    }
  }, [product?.id, images]);

  // Helper to parse aspect ratio like "3:4" or "4/5" or "1:1"
  const parseRatioString = useCallback((ar?: string): number | null => {
    if (!ar) return null;
    const parts = ar.includes('/') ? ar.split('/') : ar.split(':');
    if (parts.length === 2) {
      const w = parseFloat(parts[0]);
      const h = parseFloat(parts[1]);
      if (w > 0 && h > 0) return w / h;
    }
    return null;
  }, []);

  // Compute smart dynamic aspect ratio for the currently displayed image
  const activeImageSrc = images[activeImageIndex] || product?.image_url;
  const activeRatio = useMemo(() => {
    if (activeImageSrc && imageRatios[activeImageSrc]) {
      return imageRatios[activeImageSrc];
    }
    const parsed = parseRatioString(product?.aspect_ratio);
    if (parsed) return parsed;
    if (product?.width && product?.height && product.width > 0 && product.height > 0) {
      return product.width / product.height;
    }
    return null;
  }, [activeImageSrc, imageRatios, product?.aspect_ratio, product?.width, product?.height, parseRatioString]);

  // Auto-center active thumbnail smoothly strictly within its own scroll container
  useEffect(() => {
    const container = thumbnailContainerRef.current;
    const activeItem = thumbnailItemRefs.current[activeImageIndex];
    if (container && activeItem) {
      const containerWidth = container.clientWidth;
      const itemOffsetLeft = activeItem.offsetLeft;
      const itemWidth = activeItem.clientWidth;
      const targetScrollLeft = itemOffsetLeft - containerWidth / 2 + itemWidth / 2;
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });
    }
  }, [activeImageIndex]);

  const onCarouselPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) {
      return;
    }
    e.preventDefault();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    carouselPointerRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      startTime: Date.now(),
      isLocked: false,
      lockDirection: null,
    };
    setIsSwipingCarousel(true);
  };

  const onCarouselPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwipingCarousel || carouselPointerRef.current.pointerId !== e.pointerId) return;

    const clientX = e.clientX;
    const clientY = e.clientY;
    carouselPointerRef.current.currentX = clientX;
    carouselPointerRef.current.currentY = clientY;

    const deltaX = clientX - carouselPointerRef.current.startX;
    const deltaY = clientY - carouselPointerRef.current.startY;

    if (!carouselPointerRef.current.isLocked) {
      if (Math.abs(deltaY) > 6 && Math.abs(deltaY) > Math.abs(deltaX)) {
        carouselPointerRef.current.isLocked = true;
        carouselPointerRef.current.lockDirection = 'vertical';
      } else if (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
        carouselPointerRef.current.isLocked = true;
        carouselPointerRef.current.lockDirection = 'horizontal';
      }
    }

    if (carouselPointerRef.current.lockDirection === 'horizontal') {
      if (images.length > 1) {
        let offset = deltaX;
        if (activeImageIndex === 0 && deltaX > 0) {
          offset = deltaX * 0.25;
        } else if (activeImageIndex === images.length - 1 && deltaX < 0) {
          offset = deltaX * 0.25;
        }
        setCarouselDragOffset(offset);
      }
    }
  };

  const onCarouselPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwipingCarousel || carouselPointerRef.current.pointerId !== e.pointerId) return;
    setIsSwipingCarousel(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    const { startX, currentX, startTime, lockDirection } = carouselPointerRef.current;
    carouselPointerRef.current.pointerId = null;

    const deltaX = currentX - startX;
    const duration = Math.max(1, Date.now() - startTime);
    const velocityX = deltaX / duration;

    if (lockDirection === 'horizontal' && images.length > 1) {
      const threshold = 40;
      const isFlick = Math.abs(velocityX) > 0.2;

      if (deltaX < -threshold || (isFlick && velocityX < 0)) {
        if (activeImageIndex < images.length - 1) {
          setSlideDirection(1);
          setActiveImageIndex((prev) => prev + 1);
        }
      } else if (deltaX > threshold || (isFlick && velocityX > 0)) {
        if (activeImageIndex > 0) {
          setSlideDirection(-1);
          setActiveImageIndex((prev) => prev - 1);
        }
      }

      setCarouselDragOffset(0);
    } else {
      setCarouselDragOffset(0);
    }
  };

  // Phones get a native scroll-snap carousel: the finger drives the scroll directly, so swiping is smooth
  const isPhone = useIsPhone();
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  // Set when the index changed because the finger scrolled the track; the track must not be scrolled back then
  const indexFromScrollRef = useRef(false);
  // One stable frame height per product (first photo), so the page doesn't jump between slides
  const firstRatio = (images[0] && imageRatios[images[0]]) || activeRatio || 0.75;
  const mobileRatio = Math.min(1.25, Math.max(0.72, firstRatio));

  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!isPhone || !track) return;
    if (indexFromScrollRef.current) {
      indexFromScrollRef.current = false;
      return;
    }
    track.scrollTo({ left: activeImageIndex * track.clientWidth, behavior: 'smooth' });
  }, [activeImageIndex, isPhone]);

  const onMobileScroll = () => {
    const track = mobileTrackRef.current;
    if (!track || !track.clientWidth) return;
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    if (idx !== activeImageIndex && idx >= 0 && idx < images.length) {
      indexFromScrollRef.current = true;
      setSlideDirection(idx > activeImageIndex ? 1 : -1);
      setActiveImageIndex(idx);
    }
  };

  if (isPhone) {
    return (
      <div dir="ltr" className="relative w-full [direction:ltr]">
        <div
          className="relative w-full overflow-hidden rounded-[18px] bg-gradient-to-b from-black/[0.03] to-black/[0.07] dark:from-white/[0.02] dark:to-white/[0.05]"
          style={{ aspectRatio: `${mobileRatio}` }}
        >
          {images.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-[#15171c]/40 dark:text-white/40">
              <span className="text-xs tracking-widest uppercase font-medium">VANT · ڤانت</span>
            </div>
          ) : (
            <div
              ref={mobileTrackRef}
              onScroll={onMobileScroll}
              className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
            >
              {images.map((imgSrc, idx) => {
                const src = (imgSrc || product?.image_url || '').trim();
                return (
                  <div key={idx} className="relative h-full w-full shrink-0 snap-center snap-always">
                    {!loadedImages.has(imgSrc) && (
                      <div className="absolute inset-0 overflow-hidden bg-neutral-200/70 dark:bg-neutral-800/50">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />
                      </div>
                    )}
                    {src && (
                      <MobileTouchZoom zoomFactor={2.2} className="h-full w-full">
                        <img
                          src={src}
                          alt={`${displayTitle} - ${idx + 1}`}
                          decoding="async"
                          loading={idx <= 1 ? 'eager' : 'lazy'}
                          referrerPolicy="no-referrer"
                          draggable={false}
                          onLoad={() => imgSrc && setLoadedImages((prev) => new Set(prev).add(imgSrc))}
                          className="h-full w-full object-contain select-none"
                        />
                      </MobileTouchZoom>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {images.length > 1 && (
            <>
              <div className="pointer-events-none absolute top-3 right-3 z-20 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-white">
                {activeImageIndex + 1} / {images.length}
              </div>
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i === activeImageIndex ? 'w-5 bg-[#004ad7] dark:bg-[#3b82f6]' : 'w-1.5 bg-black/25 dark:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails: same order as the slides, tap to jump */}
        {images.length > 1 && (
          <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto px-0.5 pb-0.5 [&>*:first-child]:ms-auto [&>*:last-child]:me-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSlideDirection(idx > activeImageIndex ? 1 : -1);
                  setActiveImageIndex(idx);
                }}
                aria-label={`View image ${idx + 1}`}
                aria-current={idx === activeImageIndex}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  idx === activeImageIndex ? 'border-[#004ad7] dark:border-[#3b82f6]' : 'border-transparent opacity-60'
                }`}
              >
                {img?.trim() && <img src={img.trim()} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const onCarouselWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current > 350) {
        lastWheelTimeRef.current = now;
        if (e.deltaX > 0) {
          paginate(1);
        } else {
          paginate(-1);
        }
      }
    }
  };

  return (
    <div
      dir="ltr"
      className="relative flex flex-col justify-center md:justify-between bg-black/[0.02] dark:bg-black/20 p-2 sm:p-4 md:p-7 lg:p-8 md:col-span-6 md:border-e md:border-black/5 md:dark:border-white/10 md:overflow-y-auto md:h-full [direction:ltr] no-scrollbar"
    >
      {/* Main Active Image Viewport with Dynamic Proportional Aspect Ratio Matching Uploaded Image */}
      <div
        ref={carouselViewportRef}
        dir="ltr"
        style={{
          aspectRatio: activeRatio ? `${activeRatio}` : '3 / 4',
        }}
        className="relative flex flex-1 min-h-0 items-center justify-center w-full max-w-full sm:max-w-md md:max-w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-black/[0.03] to-black/[0.07] dark:from-white/[0.02] dark:to-white/[0.05] border border-black/5 dark:border-white/10 touch-pan-y select-none cursor-grab active:cursor-grabbing [direction:ltr] shadow-inner max-h-[58vh] sm:max-h-[62vh] md:max-h-[520px] lg:max-h-[560px] xl:max-h-[600px] mx-auto transition-[aspect-ratio] duration-300 ease-out"
        onPointerDown={onCarouselPointerDown}
        onPointerMove={onCarouselPointerMove}
        onPointerUp={onCarouselPointerUp}
        onPointerCancel={onCarouselPointerUp}
        onWheel={onCarouselWheel}
      >
        {/* Ambient Luxury Spotlight Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,74,215,0.06),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />

        {/* Continuous Hardware-Accelerated Sliding Track */}
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 h-full w-full min-h-[300px] text-[#15171c]/40 dark:text-white/40">
            <svg className="w-16 h-16 stroke-[1.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="mt-3 text-xs tracking-widest uppercase font-medium">VANT · ڤانت</span>
          </div>
        ) : (
          <div
            dir="ltr"
            className="flex h-full w-full will-change-transform [direction:ltr]"
            style={{
              transform: `translate3d(calc(-${activeImageIndex * 100}% + ${carouselDragOffset}px), 0, 0)`,
              transition: isSwipingCarousel ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {images.map((imgSrc, idx) => {
              const isImageLoaded = loadedImages.has(imgSrc);

              return (
                <div
                  key={idx}
                  ref={(el) => {
                    slideItemRefs.current[idx] = el;
                  }}
                  data-slide-index={idx}
                  dir="ltr"
                  className="relative flex h-full w-full shrink-0 items-center justify-center p-3 sm:p-5 select-none [direction:ltr]"
                >
                  {/* High-fidelity shimmer skeleton placeholder while image is fetching */}
                  {!isImageLoaded && (
                    <div className="absolute inset-3 sm:inset-5 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800/60 overflow-hidden flex items-center justify-center pointer-events-none border border-black/5 dark:border-white/10">
                      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-white/12 to-transparent pointer-events-none" />
                      <div className="opacity-20 dark:opacity-10 pointer-events-none">
                        <svg className="w-12 h-12 stroke-[1.2] text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {(imgSrc || product?.image_url)?.trim() ? (
                    <MobileTouchZoom zoomFactor={2.2} className="relative flex items-center justify-center max-h-full max-w-full w-full h-full">
                      <Lens zoomFactor={1.5} lensSize={130} className="relative flex items-center justify-center max-h-full max-w-full">
                        <img
                          src={(imgSrc || product?.image_url)!.trim()}
                          alt={`${displayTitle} - ${idx + 1}`}
                          decoding="async"
                          loading={idx === 0 || idx === activeImageIndex ? 'eager' : 'lazy'}
                          referrerPolicy="no-referrer"
                          draggable={false}
                          className={`max-h-full max-w-full w-auto h-auto object-contain drop-shadow-md select-none transition-opacity duration-250 ${
                            isImageLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (product?.image_url?.trim() && target.src !== product.image_url.trim()) {
                              target.src = product.image_url.trim();
                            }
                          }}
                          onLoad={() => {
                            if (imgSrc) {
                              setLoadedImages((prev) => new Set(prev).add(imgSrc));
                            }
                          }}
                        />
                      </Lens>
                    </MobileTouchZoom>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {carouselNavVisible && images.length > 1 && (
          <>
            <button
              type="button"
              disabled={activeImageIndex <= 0}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (activeImageIndex > 0) paginate(-1);
              }}
              className={`absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-13 lg:w-13 items-center justify-center rounded-full bg-white/90 dark:bg-[#16191f]/90 text-[#15171c] dark:text-white backdrop-blur-md shadow-lg border border-black/10 dark:border-white/15 transition-all ${
                activeImageIndex > 0
                  ? 'hover:scale-110 active:scale-95 cursor-pointer opacity-100'
                  : 'opacity-0 pointer-events-none'
              }`}
              aria-label={lang === 'ar' ? 'الصورة السابقة' : 'Previous image'}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5 lg:h-6 lg:w-6" />
            </button>

            <button
              type="button"
              disabled={activeImageIndex >= images.length - 1}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (activeImageIndex < images.length - 1) paginate(1);
              }}
              className={`absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-13 lg:w-13 items-center justify-center rounded-full bg-white/90 dark:bg-[#16191f]/90 text-[#15171c] dark:text-white backdrop-blur-md shadow-lg border border-black/10 dark:border-white/15 transition-all ${
                activeImageIndex < images.length - 1
                  ? 'hover:scale-110 active:scale-95 cursor-pointer opacity-100'
                  : 'opacity-0 pointer-events-none'
              }`}
              aria-label={lang === 'ar' ? 'الصورة التالية' : 'Next image'}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-5.5 md:w-5.5 lg:h-6 lg:w-6" />
            </button>

            {/* Floating Image Counter Badge */}
            <div className="absolute top-3 ltr:left-3 rtl:right-3 z-20 flex items-center gap-1 rounded-full bg-black/60 dark:bg-black/75 px-2.5 py-0.5 text-[10.5px] font-mono font-semibold tracking-wide text-white/95 backdrop-blur-md border border-white/15 shadow-xs select-none">
              <span className="text-[#60a5fa] font-bold">{activeImageIndex + 1}</span>
              <span className="text-white/35">/</span>
              <span className="text-white/75">{images.length}</span>
            </div>

            {/* Pagination Dots Indicator */}
            <div
              dir="ltr"
              className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-black/60 dark:bg-black/80 px-2.5 py-1 backdrop-blur-md border border-white/15 shadow-lg pointer-events-auto select-none [direction:ltr]"
            >
              {images.map((_, i) => {
                const isCurrent = i === activeImageIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideDirection(i > activeImageIndex ? 1 : -1);
                      setActiveImageIndex(i);
                    }}
                    className="relative flex items-center justify-center p-0.5 cursor-pointer focus:outline-none"
                    aria-label={`Slide ${i + 1}`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      className={`block rounded-full ${
                        isCurrent
                          ? 'w-4.5 h-1.5 bg-gradient-to-r from-[#004ad7] to-[#3b82f6] shadow-sm shadow-[#3b82f6]/50'
                          : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/75'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Navigation Strip */}
      {images.length > 1 && (
        <div
          ref={thumbnailContainerRef}
          dir="ltr"
          className="mt-3 sm:mt-4 hidden md:flex items-center justify-center overflow-x-auto py-1 px-2 no-scrollbar scroll-smooth [direction:ltr] w-full min-h-[64px] sm:min-h-[72px] md:min-h-[76px] shrink-0"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 mx-auto min-w-fit">
            {images.map((img, idx) => {
              const isActive = idx === activeImageIndex;
              return (
                <button
                  key={idx}
                  ref={(el) => {
                    thumbnailItemRefs.current[idx] = el;
                  }}
                  dir="ltr"
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setSlideDirection(idx > activeImageIndex ? 1 : -1);
                    setActiveImageIndex(idx);
                  }}
                  onMouseEnter={() => {
                    if (idx !== activeImageIndex) {
                      setSlideDirection(idx > activeImageIndex ? 1 : -1);
                      setActiveImageIndex(idx);
                    }
                  }}
                  className={`group relative h-13 w-13 sm:h-15 sm:w-15 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer [direction:ltr] ${
                    isActive
                      ? 'ring-2 ring-[#004ad7] dark:ring-[#3b82f6] ring-offset-2 ring-offset-[#f8f9fa] dark:ring-offset-[#16191f] shadow-md scale-105'
                      : 'opacity-60 hover:opacity-100 hover:scale-100 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  {img?.trim() ? (
                    <img
                      src={img.trim()}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : null}

                  <span className="absolute bottom-1 right-1 z-10 rounded-md bg-black/65 px-1 py-0.2 text-[8.5px] font-mono font-bold text-white backdrop-blur-xs">
                    {idx + 1}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="active-thumb-glow"
                      className="absolute inset-0 bg-[#004ad7]/15 dark:bg-[#3b82f6]/20 ring-1 ring-inset ring-white/30"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDrawerGallery;
