import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import type { Product, Language } from '../../types';
import Lens from '../ui/Lens';
import MobileTouchZoom from '../ui/MobileTouchZoom';
import { zoomImageSource } from '../../lib/responsiveImage';

interface Props {
  images: string[];
  product: Product | null;
  displayTitle?: string;
  activeImageIndex: number;
  setActiveImageIndex: Dispatch<SetStateAction<number>>;
  carouselNavVisible: boolean;
  carouselNavEnabled?: boolean;
  carouselNavLabel?: string;
  lang: Language;
  paginate: (direction: number) => void;
}

/** Native horizontal snapping leaves vertical swipes free to scroll the sheet. */
export default function ProductDrawerGallery({ images, product, displayTitle, activeImageIndex, setActiveImageIndex, carouselNavVisible, carouselNavEnabled = true, carouselNavLabel = '', lang, paginate }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIndexRef = useRef(activeImageIndex);
  activeIndexRef.current = activeImageIndex;
  const isAr = lang === 'ar';
  const [detailSources, setDetailSources] = useState<Record<string, string>>({});
  const requestedDetails = useRef(new Set<string>());
  const prepareDetail = (source: string) => {
    const detail = zoomImageSource(source);
    if (detail === source || requestedDetails.current.has(source)) return;
    requestedDetails.current.add(source);
    const image = new Image();
    image.referrerPolicy = 'no-referrer';
    image.onload = () => { image.decode().then(() => setDetailSources(previous => ({ ...previous, [source]: detail }))).catch(() => {}); };
    image.src = detail;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    const left = activeImageIndex * track.clientWidth;
    if (Math.abs(track.scrollLeft - left) > 2) {
      track.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }, [activeImageIndex, images]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const resize = new ResizeObserver(() => {
      track.scrollTo({ left: activeIndexRef.current * track.clientWidth, behavior: 'instant' });
    });
    resize.observe(track);
    return () => { resize.disconnect(); if (settleTimer.current) clearTimeout(settleTimer.current); };
  }, []);

  const syncIndex = () => {
    const track = trackRef.current;
    if (track && track.clientWidth > 0 && images.length > 0) {
      setActiveImageIndex(Math.min(images.length - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth))));
    }
  };

  return (
    <div className="product-gallery" dir="ltr" aria-label={isAr ? 'صور القطعة' : 'Piece gallery'}>
      <div className="product-gallery-stage">
        <div
          ref={trackRef} className="product-gallery-track no-scrollbar" dir="ltr"
          onScroll={() => {
            if (settleTimer.current) clearTimeout(settleTimer.current);
            settleTimer.current = setTimeout(syncIndex, 140);
          }}
          onScrollEnd={syncIndex}
        >
          {images.length ? images.map((src, index) => (
            <div key={`${src}-${index}`} className="product-gallery-slide" aria-hidden={index !== activeImageIndex}
              onPointerEnter={() => prepareDetail(src)} onFocus={() => prepareDetail(src)} onTouchStart={() => prepareDetail(src)}>
              <MobileTouchZoom className="h-full w-full">
                <Lens className="h-full w-full focus-visible:outline-2 focus-visible:outline-blue-500" disabled={index !== activeImageIndex} ariaLabel={isAr ? 'تكبير الصورة: Enter للتفعيل، الأسهم للتحريك، Escape للإيقاف' : 'Image zoom: Enter to toggle, arrows to explore, Escape to stop'}>
              <img src={detailSources[src] || src} alt={`${displayTitle || 'VANT'} · ${index + 1}`} draggable={false}
                loading={index === activeImageIndex ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer"
                onError={event => {
                  const fallback = product?.image_url?.trim();
                  if (fallback && images.includes(fallback) && event.currentTarget.getAttribute('src') !== fallback) event.currentTarget.src = fallback;
                }} />
                </Lens>
              </MobileTouchZoom>
            </div>
          )) : <div className="product-gallery-slide flex-col gap-3 text-black/35 dark:text-white/35"><ImageOff size={32} /><span className="text-xs">{isAr ? 'لا توجد صورة لهذه القطعة' : 'No image available'}</span></div>}
        </div>
        {images.length > 1 && <>
          <span className="product-gallery-counter" aria-live="polite">{activeImageIndex + 1}<span className="opacity-40"> / </span>{images.length}</span>
          {carouselNavVisible && <>
            <button type="button" className="product-gallery-arrow left-3" disabled={!carouselNavEnabled || activeImageIndex === 0} onClick={() => paginate(-1)} aria-label={carouselNavLabel + (isAr ? ' · السابقة' : ' · Previous')}><ChevronLeft size={20} /></button>
            <button type="button" className="product-gallery-arrow right-3" disabled={!carouselNavEnabled || activeImageIndex >= images.length - 1} onClick={() => paginate(1)} aria-label={carouselNavLabel + (isAr ? ' · التالية' : ' · Next')}><ChevronRight size={20} /></button>
          </>}
        </>}
      </div>
      {images.length > 0 && <p className="product-gallery-zoom-hint text-center text-xs leading-relaxed text-black/55 dark:text-white/60 px-4 py-2"><span className="zoom-mouse-hint">{isAr ? 'حرّك المؤشر فوق الصورة للتكبير' : 'Hover over the image to inspect details'}</span><span className="zoom-touch-hint">{isAr ? 'اضغط مطوّلاً للتكبير، وارفع إصبعك للرجوع' : 'Hold still to zoom; release to return'}</span></p>}
      {images.length > 1 && <div className="product-gallery-thumbnails no-scrollbar" aria-label={isAr ? 'اختيار صورة' : 'Choose image'}>
        {images.map((src, index) => <button key={`${src}-${index}`} type="button" aria-pressed={index === activeImageIndex} aria-label={isAr ? `عرض الصورة ${index + 1}` : `View image ${index + 1}`} onClick={() => setActiveImageIndex(index)}>
          <img src={src} alt="" loading="lazy" draggable={false} referrerPolicy="no-referrer" />
        </button>)}
      </div>}
    </div>
  );
}
