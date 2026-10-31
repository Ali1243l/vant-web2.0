import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, ZoomIn } from 'lucide-react';
import type { Product, Language } from '../../types';
import ProductImageZoom from './ProductImageZoom';

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
  const [zoomImage, setZoomImage] = useState<string | null>(null);

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
            <div key={`${src}-${index}`} className="product-gallery-slide" aria-hidden={index !== activeImageIndex}>
              <img src={src} alt={`${displayTitle || 'VANT'} · ${index + 1}`} draggable={false}
                loading={index === activeImageIndex ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer"
                onError={event => {
                  const fallback = product?.image_url?.trim();
                  if (fallback && images.includes(fallback) && event.currentTarget.getAttribute('src') !== fallback) event.currentTarget.src = fallback;
                }} />
            </div>
          )) : <div className="product-gallery-slide flex-col gap-3 text-black/35 dark:text-white/35"><ImageOff size={32} /><span className="text-xs">{isAr ? 'لا توجد صورة لهذه القطعة' : 'No image available'}</span></div>}
        </div>
        {images[activeImageIndex] && <button type="button" className="product-gallery-zoom" onClick={() => setZoomImage(images[activeImageIndex])} aria-label={isAr ? 'تكبير الصورة' : 'Zoom image'}><ZoomIn size={20} /><span>{isAr ? 'تكبير' : 'Zoom'}</span></button>}
        {images.length > 1 && <>
          <span className="product-gallery-counter" aria-live="polite">{activeImageIndex + 1}<span className="opacity-40"> / </span>{images.length}</span>
          {carouselNavVisible && <>
            <button type="button" className="product-gallery-arrow left-3" disabled={!carouselNavEnabled || activeImageIndex === 0} onClick={() => paginate(-1)} aria-label={carouselNavLabel + (isAr ? ' · السابقة' : ' · Previous')}><ChevronLeft size={20} /></button>
            <button type="button" className="product-gallery-arrow right-3" disabled={!carouselNavEnabled || activeImageIndex >= images.length - 1} onClick={() => paginate(1)} aria-label={carouselNavLabel + (isAr ? ' · التالية' : ' · Next')}><ChevronRight size={20} /></button>
          </>}
        </>}
      </div>
      {images.length > 1 && <div className="product-gallery-thumbnails no-scrollbar" aria-label={isAr ? 'اختيار صورة' : 'Choose image'}>
        {images.map((src, index) => <button key={`${src}-${index}`} type="button" aria-pressed={index === activeImageIndex} aria-label={isAr ? `عرض الصورة ${index + 1}` : `View image ${index + 1}`} onClick={() => setActiveImageIndex(index)}>
          <img src={src} alt="" loading="lazy" draggable={false} referrerPolicy="no-referrer" />
        </button>)}
      </div>}
      {zoomImage && <ProductImageZoom key={zoomImage} src={zoomImage} title={displayTitle || 'VANT'} lang={lang} onClose={() => setZoomImage(null)} />}
    </div>
  );
}
