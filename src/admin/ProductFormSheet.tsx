import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet } from './Sheet';
import { Button, Input } from './ui';
import { Product, ProductVariant, useAdminBridge } from './useAdminBridge';
import { ImageUploader } from './components/ImageUploader';
import {
  Plus,
  X,
  Sparkles,
  Shirt,
  FileText,
  Image as ImageIcon,
  Box,
  Coins,
  Info,
  Check,
  Palette,
  ChevronDown,
  Trash2,
  Sliders,
  Layers,
  ArrowRight,
  UploadCloud,
  Loader2,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { toEnglishDigits, formatCurrency } from './format';
import {
  extractDominantColor,
  groupImagesByColor,
  hexToRgb,
  colorDistance,
  getClosestLuxuryColorName,
} from './utils/colorExtraction';
import { translateArabicToEnglish } from './utils/magicTranslate';
import { validateProductNumbers, stockAvailability } from './products_manager/catalogModel';
import { uploadImageToSupabase, uploadDataUrlToSupabase } from '../lib/storage';

import {
  type ProductFormData,
  type MagicNoticeState,
  type ProductFormSheetProps,
  STANDARD_SIZES as standardSizes,
  LUXURY_COLOR_PRESETS,
} from "./productForm/productFormTypes";
import { ProductMagicColorDropzone } from "./productForm/ProductMagicColorDropzone";
import { ProductBasicInfoSection } from "./productForm/ProductBasicInfoSection";
import { ProductColorVariantsSection } from "./productForm/ProductColorVariantsSection";
import { ProductSingleMediaSection } from "./productForm/ProductSingleMediaSection";
import { ProductDetailsSection } from "./productForm/ProductDetailsSection";
export const ProductFormSheet: React.FC<ProductFormSheetProps> = ({
  isOpen,
  onClose,
  editingProduct,
  initialProduct,
}) => {
  const { addProduct, updateProduct, lang } = useAdminBridge();
  const isAr = lang === 'ar';

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    nameEn: "",
    sku: "",
    category: "ملابس وأزياء",
    price: "",
    salePrice: "",
    stock: "",
    status: "active",
    images: [],
    sizes: ["M", "L", "XL"],
    descriptionAr: "",
    descriptionEn: "",
    materialDetails: "",
    availabilityStatus: "in_stock",
    hasVariants: false,
    variants: [],
  });

  // Track expanded/collapsed cards for variants
  const [expandedVariantIds, setExpandedVariantIds] = useState<Record<string, boolean>>({});
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [variantCustomSizeInputs, setVariantCustomSizeInputs] = useState<Record<string, string>>({});
  const [variantShowCustom, setVariantShowCustom] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Magic Smart Upload (Client-Side Color Sorting) States
  const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState("");
  const [isDraggingMagic, setIsDraggingMagic] = useState(false);
  const [magicNotice, setMagicNotice] = useState<MagicNoticeState | null>(null);
  // Magic Translation States
  const [translatingField, setTranslatingField] = useState<string | null>(null);
  const [translateNotice, setTranslateNotice] = useState<string | null>(null);

  useEffect(() => {
    setFormError('');
    const source = editingProduct || initialProduct;
    if (source) {
      const initialImages =
        source.images && source.images.length > 0
          ? source.images
          : source.imageUrl
          ? [source.imageUrl]
          : [];

      const variantsList = source.variants || [];
      const hasVars = !!(source.hasVariants && variantsList.length > 0);

      setFormData({
        name: source.name,
        nameEn: source.nameEn || '',
        sku: source.sku,
        category: source.category,
        price: source.price.toString(),
        salePrice: source.salePrice ? source.salePrice.toString() : '',
        stock: source.stockKnown === false ? '' : source.stock.toString(),
        status: source.status,
        images: initialImages,
        sizes: source.sizes || ['M', 'L', 'XL'],
        descriptionAr: source.descriptionAr || '',
        descriptionEn: source.descriptionEn || '',
        materialDetails: source.materialDetails || '',
        availabilityStatus: source.availabilityStatus || 'in_stock',
        hasVariants: hasVars,
        variants: variantsList,
      });

      // Expand all variants by default when opening
      const expandedMap: Record<string, boolean> = {};
      variantsList.forEach((v) => {
        expandedMap[v.id] = true;
      });
      setExpandedVariantIds(expandedMap);
    } else {
      // Reset form for fresh product
      const defaultSku = `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        name: '',
        nameEn: '',
        sku: defaultSku,
        category: 'ملابس وأزياء',
        price: '',
        salePrice: '',
        stock: '',
        status: 'active',
        images: [],
        sizes: ['M', 'L', 'XL'],
        descriptionAr: '',
        descriptionEn: '',
        materialDetails: '',
        availabilityStatus: 'in_stock',
        hasVariants: false,
        variants: [],
      });
      setExpandedVariantIds({});
    }
    setShowCustomInput(false);
    setCustomSizeInput('');
    setVariantCustomSizeInputs({});
    setVariantShowCustom({});
  }, [editingProduct, initialProduct, isOpen]);

  // Standard sizes toggle for base product
  const toggleSize = (size: string) => {
    if (size === 'Custom') {
      setShowCustomInput((prev) => !prev);
      return;
    }
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const updated = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: updated };
    });
  };

  const addCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!formData.sizes.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, trimmed] }));
    }
    setCustomSizeInput('');
  };

  const removeSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== size),
    }));
  };

  // Variant operations
  const handleAddNewVariant = (preset?: { ar: string; en: string; hex: string }) => {
    const newId = `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const baseP = parseFloat(formData.price) || 0;
    const baseSp = formData.salePrice ? parseFloat(formData.salePrice) : undefined;

    const newVariant: ProductVariant = {
      id: newId,
      colorNameAr: preset ? preset.ar : isAr ? 'لون جديد' : 'New Color',
      colorNameEn: preset ? preset.en : 'New Color',
      colorHex: preset ? preset.hex : '#0f172a',
      price: baseP > 0 ? baseP : undefined,
      salePrice: baseSp,
      stock: 0,
      sizes: ['M', 'L', 'XL'],
      images: formData.images.length > 0 ? [...formData.images] : [],
    };

    setFormData((prev) => ({
      ...prev,
      hasVariants: true,
      variants: [...prev.variants, newVariant],
    }));

    setExpandedVariantIds((prev) => ({
      ...prev,
      [newId]: true,
    }));
  };

  const handleDeleteVariant = (id: string) => {
    setFormData((prev) => {
      const filtered = prev.variants.filter((v) => v.id !== id);
      return {
        ...prev,
        variants: filtered,
        hasVariants: filtered.length > 0,
      };
    });
  };

  const toggleVariantExpand = (id: string) => {
    setExpandedVariantIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  };

  const toggleVariantSize = (variantId: string, size: string) => {
    if (size === 'Custom') {
      setVariantShowCustom((prev) => ({
        ...prev,
        [variantId]: !prev[variantId],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id !== variantId) return v;
        const exists = v.sizes.includes(size);
        const updatedSizes = exists ? v.sizes.filter((s) => s !== size) : [...v.sizes, size];
        return { ...v, sizes: updatedSizes };
      }),
    }));
  };

  const addVariantCustomSize = (variantId: string) => {
    const inputVal = variantCustomSizeInputs[variantId]?.trim().toUpperCase();
    if (!inputVal) return;

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id !== variantId) return v;
        if (v.sizes.includes(inputVal)) return v;
        return { ...v, sizes: [...v.sizes, inputVal] };
      }),
    }));

    setVariantCustomSizeInputs((prev) => ({ ...prev, [variantId]: '' }));
  };

  const removeVariantSize = (variantId: string, size: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => {
        if (v.id !== variantId) return v;
        return { ...v, sizes: v.sizes.filter((s) => s !== size) };
      }),
    }));
  };

  // ========================================================
  // Task 4: Magic Bulk Image Upload & Client-Side Color Sorting
  // ========================================================
  const handleBulkMagicUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const fileList: File[] = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) return;

    setIsAnalyzingColors(true);
    setAnalyzingStatus(
      isAr
        ? `جاري فحص طيف درجات الألوان وتصفية الخلفيات لـ ${fileList.length} صور (HTML5 Canvas)...`
        : `Analyzing color spectrum and studio backdrops for ${fileList.length} images (HTML5 Canvas)...`
    );

    try {
      // Process client-side via 2-Pass Double-Check CIELAB Clustering
      const groupedClusters = await groupImagesByColor(fileList, 9.2);

      if (groupedClusters.length === 0) {
        setIsAnalyzingColors(false);
        return;
      }

      const baseP = parseFloat(formData.price) || 0;
      const baseSp = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
      const baseSizes = formData.sizes.length > 0 ? formData.sizes : ['M', 'L', 'XL'];

      let updatedVariants: ProductVariant[] = [...formData.variants];
      const newlyExpanded: Record<string, boolean> = { ...expandedVariantIds };
      const generatedSwatches: string[] = [];

      // If variants already exist, merge matching colors (Double-Check: CIELAB ΔE <= 9.2 AND same category)
      if (formData.hasVariants && updatedVariants.length > 0) {
        for (const cluster of groupedClusters) {
          generatedSwatches.push(cluster.hex);
          const clusterRgb = hexToRgb(cluster.hex);

          // Find closest matching existing variant
          let matchedIdx = -1;
          let bestDist = Infinity;

          updatedVariants.forEach((v, idx) => {
            const vRgb = hexToRgb(v.colorHex || '#000000');
            const dist = colorDistance(clusterRgb, vRgb);
            const sameCategory = cluster.colorNameAr === v.colorNameAr;
            if (sameCategory && dist < bestDist && dist <= 9.2) {
              bestDist = dist;
              matchedIdx = idx;
            }
          });

          if (matchedIdx !== -1) {
            // Append cluster images to matched variant
            const existing = updatedVariants[matchedIdx];
            const mergedImages = [...existing.images, ...cluster.images];
            updatedVariants[matchedIdx] = {
              ...existing,
              images: mergedImages,
            };
            newlyExpanded[existing.id] = true;
          } else {
            // Add as new variant
            const newVar: ProductVariant = {
              id: cluster.id,
              colorNameAr: cluster.colorNameAr,
              colorNameEn: cluster.colorNameEn,
              colorHex: cluster.hex,
              price: baseP > 0 ? baseP : undefined,
              salePrice: baseSp,
              stock: 0,
              sizes: [...baseSizes],
              images: cluster.images,
            };
            updatedVariants.push(newVar);
            newlyExpanded[newVar.id] = true;
          }
        }
      } else {
        // First-time generation: construct variants from all detected clusters
        updatedVariants = groupedClusters.map((cluster) => {
          generatedSwatches.push(cluster.hex);
          return {
            id: cluster.id,
            colorNameAr: cluster.colorNameAr,
            colorNameEn: cluster.colorNameEn,
            colorHex: cluster.hex,
            price: baseP > 0 ? baseP : undefined,
            salePrice: baseSp,
            stock: 0,
            sizes: [...baseSizes],
            images: cluster.images,
          };
        });

        updatedVariants.forEach((v) => {
          newlyExpanded[v.id] = true;
        });
      }

      // Automatically toggle hasVariants to TRUE and populate variants state
      setFormData((prev) => ({
        ...prev,
        hasVariants: true,
        variants: updatedVariants,
      }));

      setExpandedVariantIds((prev) => ({
        ...prev,
        ...newlyExpanded,
      }));

      setMagicNotice({
        title: isAr
          ? `✨ تم الفرز الذكي بنجاح: اكتشاف ${groupedClusters.length} درجات ألوان`
          : `✨ Magic Upload Complete: Identified ${groupedClusters.length} Colorways`,
        subtitle: isAr
          ? `تم تصنيف وفرز ${fileList.length} صورة بنجاح وتوليد بطاقات المتغيرات الملكية الجاهزة للتعديل.`
          : `Sorted ${fileList.length} images into discrete luxury variants with ready-to-publish color names.`,
        swatches: generatedSwatches,
        count: fileList.length,
      });

      // Clear notice after 7 seconds
      setTimeout(() => {
        setMagicNotice(null);
      }, 7000);
    } catch (err) {
      console.error('Magic upload error:', err);
    } finally {
      setIsAnalyzingColors(false);
    }
  };

  // Helper to re-detect color from a variant's first image
  const handleAutoDetectVariantColor = async (variantId: string) => {
    const targetVariant = formData.variants.find((v) => v.id === variantId);
    if (!targetVariant || !targetVariant.images || targetVariant.images.length === 0) return;

    try {
      const firstImgUrl = targetVariant.images[0];
      // Fetch or convert to blob
      const res = await fetch(firstImgUrl);
      const blob = await res.blob();
      const file = new File([blob], 'variant_image.jpg', { type: blob.type || 'image/jpeg' });
      const detectedHex = await extractDominantColor(file);
      const luxuryName = getClosestLuxuryColorName(detectedHex);

      updateVariant(variantId, {
        colorHex: detectedHex,
        colorNameAr: luxuryName.ar,
        colorNameEn: luxuryName.en,
      });
    } catch (err) {
      console.error('Error auto-detecting variant color:', err);
    }
  };

  // ========================================================
  // Phase 9: Magic Translation without Paid API Keys
  // ========================================================
  const handleMagicTranslate = async (
    sourceText: string,
    targetField: 'nameEn' | 'descriptionEn' | 'materialDetails' | string,
    isVariant = false,
    variantId?: string
  ) => {
    const trimmed = sourceText?.trim();
    if (!trimmed) {
      setTranslateNotice(
        isAr
          ? 'يرجى كتابة الحقل باللغة العربية أولاً لترجمته تلقائياً'
          : 'Please write the Arabic text first to auto-translate.'
      );
      setTimeout(() => setTranslateNotice(null), 3500);
      return;
    }

    setTranslatingField(targetField);
    setTranslateNotice(null);

    try {
      const isTitle = targetField === 'nameEn' || isVariant;
      const translated = await translateArabicToEnglish(trimmed, isTitle);

      if (isVariant && variantId) {
        updateVariant(variantId, { colorNameEn: translated });
      } else if (targetField === 'nameEn') {
        setFormData((prev) => ({ ...prev, nameEn: translated }));
      } else if (targetField === 'descriptionEn') {
        setFormData((prev) => ({ ...prev, descriptionEn: translated }));
      } else if (targetField === 'materialDetails') {
        setFormData((prev) => ({ ...prev, materialDetails: translated }));
      }
    } catch (err) {
      console.error('Magic translation error:', err);
    } finally {
      setTranslatingField(null);
    }
  };

  // ========================================================
  // Fully Automatic Shirt Color Reading & Variant Splitting on Drop
  // ========================================================
  const handleVariantImageDrop = async (variantId: string, files: File[]) => {
    if (!files || files.length === 0) return;

    try {
      const clusters = await groupImagesByColor(files, 9.2);
      if (clusters.length === 0) return;

      const baseP = parseFloat(formData.price) || 0;
      const baseSp = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
      const baseSizes = formData.sizes.length > 0 ? formData.sizes : ['M', 'L', 'XL'];

      // Target current variant
      const currentVariant = formData.variants.find((v) => v.id === variantId);
      if (!currentVariant) return;

      const currentRgb = hexToRgb(currentVariant.colorHex || '#000000');

      // Determine which cluster matches current variant best
      let matchedClusterIdx = 0;
      let minClusterDist = Infinity;
      clusters.forEach((c, idx) => {
        const dist = colorDistance(hexToRgb(c.hex), currentRgb);
        if (dist < minClusterDist) {
          minClusterDist = dist;
          matchedClusterIdx = idx;
        }
      });

      const primaryCluster = clusters[matchedClusterIdx];
      const otherClusters = clusters.filter((_, idx) => idx !== matchedClusterIdx);

      const mergedCurrentImages = [...currentVariant.images, ...primaryCluster.images].slice(0, 10);
      const isCurrentFresh = currentVariant.images.length === 0;

      let updatedList = formData.variants.map((v) => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          colorHex: isCurrentFresh ? primaryCluster.hex : v.colorHex,
          colorNameAr: isCurrentFresh ? primaryCluster.colorNameAr : v.colorNameAr,
          colorNameEn: isCurrentFresh ? primaryCluster.colorNameEn : v.colorNameEn,
          images: mergedCurrentImages,
        };
      });

      const newlyExpanded: Record<string, boolean> = {
        ...expandedVariantIds,
        [variantId]: true,
      };

      // For every other distinct color detected among the dropped shirts:
      // Merge with an existing variant if color matches (Double-Check: CIELAB ΔE <= 9.2 AND same category), or AUTO-SPAWN A NEW VARIANT CARD!
      for (const extraCluster of otherClusters) {
        const clusterRgb = hexToRgb(extraCluster.hex);
        let existingMatchIdx = -1;
        let bestDist = Infinity;

        updatedList.forEach((v, idx) => {
          const vRgb = hexToRgb(v.colorHex || '#000000');
          const dist = colorDistance(clusterRgb, vRgb);
          const sameCategory = extraCluster.colorNameAr === v.colorNameAr;
          if (sameCategory && dist < bestDist && dist <= 9.2) {
            bestDist = dist;
            existingMatchIdx = idx;
          }
        });

        if (existingMatchIdx !== -1) {
          const existing = updatedList[existingMatchIdx];
          updatedList[existingMatchIdx] = {
            ...existing,
            images: [...existing.images, ...extraCluster.images].slice(0, 10),
          };
          newlyExpanded[existing.id] = true;
        } else {
          // Auto-spawn brand new variant card for this detected shirt color!
          const newVar: ProductVariant = {
            id: extraCluster.id,
            colorNameAr: extraCluster.colorNameAr,
            colorNameEn: extraCluster.colorNameEn,
            colorHex: extraCluster.hex,
            price: baseP > 0 ? baseP : undefined,
            salePrice: baseSp,
            stock: 0,
            sizes: [...baseSizes],
            images: extraCluster.images,
          };
          updatedList.push(newVar);
          newlyExpanded[newVar.id] = true;
        }
      }

      setFormData((prev) => ({
        ...prev,
        variants: updatedList,
        hasVariants: true,
      }));
      setExpandedVariantIds(newlyExpanded);

      if (otherClusters.length > 0) {
        setMagicNotice({
          title: isAr
            ? `✨ تم فحص القمصان بدبل تشيك: تقسيمها إلى ${clusters.length} ألوان دقيقة!`
            : `✨ Double-Checked: Split shirts into ${clusters.length} discrete colorways!`,
          subtitle: isAr
            ? `تم التحقق المزدوج من كل قميص وتوليد كروت منفصلة لجميع الألوان بدقة 100% وبدون دمج.`
            : `Verified every shirt via pairwise double-check and generated separate cards for all colors.`,
          swatches: clusters.map((c) => c.hex),
          count: files.length,
        });
      } else {
        setMagicNotice({
          title: isAr
            ? `✨ تم التعرف التلقائي على لون القميص: "${primaryCluster.colorNameAr}"`
            : `✨ Auto-Detected Shirt: "${primaryCluster.colorNameEn}"`,
          subtitle: isAr
            ? `تم تحديث كود اللون (${primaryCluster.hex}) وإضافة الصور فورياً.`
            : `Assigned hex code (${primaryCluster.hex}) and loaded images instantly.`,
          swatches: [primaryCluster.hex],
          count: files.length,
        });
      }

      setTimeout(() => setMagicNotice(null), 6000);
    } catch (err) {
      console.error('Error auto-sorting dropped variant images:', err);
    }
  };

  const handleBaseImageDrop = async (files: File[]) => {
    if (!files || files.length === 0) return;

    try {
      const clusters = await groupImagesByColor(files, 9.2);
      if (clusters.length === 0) return;

      const baseP = parseFloat(formData.price) || 0;
      const baseSp = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
      const baseSizes = formData.sizes.length > 0 ? formData.sizes : ['M', 'L', 'XL'];

      // If 2 or more colors detected, automatically toggle hasVariants = true and build variants!
      if (clusters.length > 1) {
        const generatedVariants: ProductVariant[] = clusters.map((c) => ({
          id: c.id,
          colorNameAr: c.colorNameAr,
          colorNameEn: c.colorNameEn,
          colorHex: c.hex,
          price: baseP > 0 ? baseP : undefined,
          salePrice: baseSp,
          stock: 0,
          sizes: [...baseSizes],
          images: c.images,
        }));

        const expandedMap: Record<string, boolean> = {};
        generatedVariants.forEach((v) => {
          expandedMap[v.id] = true;
        });

        setFormData((prev) => ({
          ...prev,
          hasVariants: true,
          variants: generatedVariants,
        }));
        setExpandedVariantIds(expandedMap);

        setMagicNotice({
          title: isAr
            ? `✨ تم قراءة القمصان وتقسيمها إلى ${clusters.length} ألوان تلقائياً!`
            : `✨ Auto-Read Shirts & Split into ${clusters.length} Colorways!`,
          subtitle: isAr
            ? `تم تفعيل خيارات الألوان وتوزيع الصور وتوليد الكروت فورياً بدون أي تدخل يدوي.`
            : `Enabled variants, sorted images by fabric color, and synthesized variant cards.`,
          swatches: clusters.map((c) => c.hex),
          count: files.length,
        });
        setTimeout(() => setMagicNotice(null), 6000);
      } else {
        // Single color detected: add images to base product, and notify user
        const singleCluster = clusters[0];
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...singleCluster.images].slice(0, 10),
        }));

        setMagicNotice({
          title: isAr
            ? `✨ تم قراءة القميص وتحديد لونه: "${singleCluster.colorNameAr}"`
            : `✨ Auto-Detected Shirt Color: "${singleCluster.colorNameEn}"`,
          subtitle: isAr
            ? `تم التعرف على كود اللون (${singleCluster.hex}) وإضافة الصور. عند إضافة ألوان أخرى سيتم التقسيم تلقائياً.`
            : `Identified color (${singleCluster.hex}). Uploading additional colors will automatically split them.`,
          swatches: [singleCluster.hex],
          count: files.length,
        });
        setTimeout(() => setMagicNotice(null), 6000);
      }
    } catch (err) {
      console.error('Error auto-sorting base images:', err);
    }
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setFormError('');
    if (!formData.name.trim()) { setFormError(isAr ? 'اكتب اسم المنتج.' : 'Enter a product name.'); return; }

    try { validateProductNumbers(formData.price, formData.salePrice, formData.stock); } catch { setFormError(isAr ? 'راجع السعر والخصم والمخزون: السعر موجب، الخصم أقل من السعر، والمخزون عدد صحيح غير سالب.' : 'Check price, sale price and stock: positive price, a lower sale price, and non-negative whole stock.'); return; }
    if (!formData.images.some(image => image.trim()) && !formData.variants.some(variant => variant.images?.some(image => image.trim()))) { setFormError(isAr ? 'أضف صورة للمنتج قبل الحفظ.' : 'Add a product image before saving.'); return; }
    try { if (formData.hasVariants) for (const variant of formData.variants) validateProductNumbers(String(variant.price ?? formData.price), variant.salePrice === undefined ? '' : String(variant.salePrice), String(variant.stock)); }
    catch { setFormError(isAr ? 'راجع أسعار ومخزون الألوان.' : 'Check variant prices and stock.'); return; }
    setIsSubmitting(true);
    try {
      const priceNum = parseFloat(formData.price) || 0;
      const salePriceNum = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
      let stockNum = parseInt(formData.stock, 10) || 0;

      // 1. Process and upload any remaining data URLs in formData.images to Supabase Storage
      const processedImages: string[] = [];
      for (const img of formData.images) {
        if (img && img.startsWith('data:')) {
          const permUrl = await uploadDataUrlToSupabase(img, 'catalog', 'shirt');
          processedImages.push(permUrl);
        } else if (img && img.trim()) {
          processedImages.push(img.trim());
        }
      }

      // 2. Process and upload any remaining data URLs in variants to Supabase Storage
      let variantsPayload: ProductVariant[] | undefined = undefined;
      const hasVariantsEnabled = formData.hasVariants && formData.variants.length > 0;

      if (hasVariantsEnabled) {
        const tempVariants: ProductVariant[] = [];
        for (const v of formData.variants) {
          const vImages: string[] = [];
          for (const img of v.images) {
            if (img && img.startsWith('data:')) {
              const permUrl = await uploadDataUrlToSupabase(img, 'catalog', `shirt_${v.colorNameEn || 'color'}`);
              vImages.push(permUrl);
            } else if (img && img.trim()) {
              vImages.push(img.trim());
            }
          }
          tempVariants.push({ ...v, images: vImages });
        }
        variantsPayload = tempVariants;
        stockNum = variantsPayload.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      }

      // Ensure all variant images are aggregated so they appear in galleries and database
      const allVariantImages = variantsPayload ? variantsPayload.flatMap((v) => v.images) : [];
      const combinedAllImages = Array.from(new Set([...processedImages, ...allVariantImages])).filter(Boolean);

      // Auto compute stock status
      let status = formData.status;
      if ((formData.stock.trim() && stockNum === 0) || formData.availabilityStatus === 'sold_out') {
        status = 'outOfStock';
      } else if ((formData.stock.trim() && stockNum <= 5) || formData.availabilityStatus === 'limited') {
        status = 'lowStock';
      }

      // Determine primary image
      let primaryImage =
        combinedAllImages.length > 0
          ? combinedAllImages[0]
          : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80';

      if (hasVariantsEnabled && variantsPayload && variantsPayload[0]?.images?.length > 0) {
        primaryImage = variantsPayload[0].images[0];
      }

      const productPayload = {
        name: formData.name,
        nameEn: formData.nameEn || formData.name,
        sku: formData.sku,
        category: formData.category,
        price: priceNum,
        salePrice: salePriceNum,
        stock: stockNum,
        stockKnown: hasVariantsEnabled || !!formData.stock.trim(),
        status,
        imageUrl: primaryImage,
        images: combinedAllImages.length > 0 ? combinedAllImages : [primaryImage],
        sizes: formData.sizes,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        materialDetails: formData.materialDetails,
        availabilityStatus: stockAvailability(hasVariantsEnabled || formData.stock.trim() ? stockNum : null, formData.availabilityStatus),
        isOnOffer: !!salePriceNum,
        hasVariants: hasVariantsEnabled,
        variants: variantsPayload,
      };

      if (editingProduct) {
        updateProduct(editingProduct.id, productPayload);
      } else {
        addProduct(productPayload);
      }

      onClose();
    } catch (err) {
      console.error('Error during product form submission:', err);
      setFormError(isAr ? 'تعذر إكمال الحفظ. راجع البيانات وحاول ثانية.' : 'Could not complete saving. Check the data and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const regularPriceNum = parseFloat(formData.price) || 0;
  const salePriceNum = parseFloat(formData.salePrice) || 0;
  const hasDiscount = regularPriceNum > 0 && salePriceNum > 0 && salePriceNum < regularPriceNum;
  const computedDiscountPercent = hasDiscount
    ? Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100)
    : 0;
  const computedSavings = hasDiscount ? regularPriceNum - salePriceNum : 0;

  // Aggregate variant metrics for live status display
  const totalVariantsStock = formData.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
      title={
        editingProduct
          ? isAr
            ? 'تعديل بيانات المنتج وخيارات الألوان'
            : 'Edit Product & Color Variants'
          : isAr
          ? 'إضافة منتج للكتالوج'
          : 'Add New Catalog Product (PIM)'
      }
      description={
        isAr
          ? 'إدارة متكاملة لخيارات الألوان المستقلة، والمخزون، ومعارض الصور، والمقاسات بالدينار العراقي.'
          : 'Advanced Product Information Management (PIM) with isolated color variants, inventory, and media galleries in IQD.'
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
            {formData.hasVariants && (
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Palette className="w-3.5 h-3.5" />
                {formData.variants.length} {isAr ? 'ألوان مفعلة' : 'Color variants'} • {totalVariantsStock} {isAr ? 'قطعة' : 'units'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => handleSubmit()}
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-md shadow-indigo-600/30"
            >
              {editingProduct
                ? isAr
                  ? 'حفظ التعديلات'
                  : 'Save Changes'
                : isAr
                ? 'نشر المنتج الآن'
                : 'Publish Product'}
            </Button>
          </div>
        </div>
      }
    >
      {formError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{formError}</p>}<form onSubmit={handleSubmit} className="space-y-5 text-start pb-6">
        {/* Magic Color Sorting & Dropzone */}
        <ProductMagicColorDropzone
          isAr={isAr}
          isAnalyzingColors={isAnalyzingColors}
          analyzingStatus={analyzingStatus}
          isDraggingMagic={isDraggingMagic}
          magicNotice={magicNotice}
          onDropFiles={handleBulkMagicUpload}
          onClearNotice={() => setMagicNotice(null)}
          setIsDraggingMagic={setIsDraggingMagic}
        />

        {/* Basic Product Info & Pricing */}
        <ProductBasicInfoSection
          formData={formData}
          setFormData={setFormData}
          isAr={isAr}
          translateNotice={translateNotice}
          translatingField={translatingField}
          onMagicTranslate={handleMagicTranslate}
          hasDiscount={hasDiscount}
          computedDiscountPercent={computedDiscountPercent}
          computedSavings={computedSavings}
        />

        {/* Color Variants Builder (when enabled) */}
        <ProductColorVariantsSection
          formData={formData}
          setFormData={setFormData}
          isAr={isAr}
          totalVariantsStock={totalVariantsStock}
          expandedVariantIds={expandedVariantIds}
          toggleVariantExpand={toggleVariantExpand}
          handleAddNewVariant={handleAddNewVariant}
          handleDeleteVariant={handleDeleteVariant}
          updateVariant={updateVariant}
          translatingField={translatingField}
          handleMagicTranslate={handleMagicTranslate}
          handleAutoDetectVariantColor={handleAutoDetectVariantColor}
          toggleVariantSize={toggleVariantSize}
          removeVariantSize={removeVariantSize}
          variantShowCustom={variantShowCustom}
          variantCustomSizeInputs={variantCustomSizeInputs}
          setVariantCustomSizeInputs={setVariantCustomSizeInputs}
          addVariantCustomSize={addVariantCustomSize}
          handleVariantImageDrop={handleVariantImageDrop}
        />

        {/* Standard Single Product Media & Sizes (when variants not enabled) */}
        {!formData.hasVariants && (
          <ProductSingleMediaSection
            formData={formData}
            setFormData={setFormData}
            isAr={isAr}
            onBaseImageDrop={handleBaseImageDrop}
            toggleSize={toggleSize}
            addCustomSize={addCustomSize}
            removeSize={removeSize}
            customSizeInput={customSizeInput}
            setCustomSizeInput={setCustomSizeInput}
            showCustomInput={showCustomInput}
            setShowCustomInput={setShowCustomInput}
          />
        )}

        {/* Details, Materials & Descriptions */}
        <ProductDetailsSection
          formData={formData}
          setFormData={setFormData}
          isAr={isAr}
          totalVariantsStock={totalVariantsStock}
          translatingField={translatingField}
          onMagicTranslate={handleMagicTranslate}
        />
      </form>
    </Sheet>
  );
};

export default ProductFormSheet;
