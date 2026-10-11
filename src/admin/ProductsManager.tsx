import React, { useState } from 'react';
import { useAdminBridge, Product } from './useAdminBridge';
import { ProductFormSheet } from './ProductFormSheet';
import { ProductOfferModal } from './ProductOfferModal';
import { ProductsManagerHeader } from './products_manager/ProductsManagerHeader';
import { ProductsTableView } from './products_manager/ProductsTableView';
import { ProductsGridView } from './products_manager/ProductsGridView';
import { DeleteProductModal } from './products_manager/DeleteProductModal';
import ToastNotification from '../components/ToastNotification';

export const ProductsManager: React.FC = () => {
  const { products, deleteProduct, addProduct, updateProduct, offers, addOffer, lang } = useAdminBridge();
  const isAr = lang === 'ar';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'sales' | 'stock'>('default');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Sheet & Modal state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Offer Customization Modal State
  const [selectedProductForOffer, setSelectedProductForOffer] = useState<Product | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Quick Action Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Show temporary toast notification
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Filter products
  const filteredProducts = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(search.toLowerCase())) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'sales') return b.salesCount - a.salesCount;
      if (sortBy === 'stock') return a.stock - b.stock;
      return 0;
    });

  // Open Offer Modal
  const handleOpenOfferModal = (p: Product) => {
    setSelectedProductForOffer(p);
    setIsOfferModalOpen(true);
  };

  // Apply Offer
  const handleApplyOffer = (
    productId: string,
    updates: {
      isOnOffer: boolean;
      salePrice?: number;
      offerCampaign?: string;
      offerBadgeText?: string;
      discountPercent?: number;
    },
    applyToAllInCategory?: boolean
  ) => {
    const prod = products.find((item) => item.id === productId);
    const prodName = isAr ? prod?.name : prod?.nameEn || prod?.name;

    if (applyToAllInCategory && prod?.category) {
      const categoryProducts = products.filter((p) => p.category === prod.category);
      categoryProducts.forEach((p) => {
        let finalSalePrice = updates.salePrice;
        if (updates.discountPercent && updates.discountPercent > 0) {
          finalSalePrice = Math.round((p.price * (1 - updates.discountPercent / 100)) / 250) * 250;
        } else if (updates.offerCampaign) {
          const camp = offers.find((o) => o.title === updates.offerCampaign || o.titleEn === updates.offerCampaign);
          if (camp) {
            if (camp.discountType === 'percentage') {
              finalSalePrice = Math.round((p.price * (1 - camp.discountValue / 100)) / 250) * 250;
            } else {
              finalSalePrice = Math.max(0, p.price - camp.discountValue);
            }
          }
        }
        updateProduct(p.id, {
          isOnOffer: true,
          salePrice: finalSalePrice || updates.salePrice,
          offerCampaign: updates.offerCampaign,
          offerBadgeText: updates.offerBadgeText,
        });
      });

      showToast(
        isAr
          ? `تم تطبيق العرض بنجاح على جميع منتجات فئة "${prod.category}" (${categoryProducts.length} منتجات)!`
          : `Offer successfully applied to all ${categoryProducts.length} products in "${prod.category}"!`,
        'success'
      );
    } else {
      updateProduct(productId, updates);
      if (updates.offerCampaign) {
        showToast(
          isAr
            ? `تم ربط "${prodName}" بقائمة "${updates.offerCampaign}" وتطبيق الخصم بنجاح!`
            : `Product "${prodName}" assigned to campaign "${updates.offerCampaign}"!`,
          'success'
        );
      } else {
        showToast(
          isAr
            ? `تم تفعيل عرض خاص ومخصص لـ "${prodName}" بنجاح!`
            : `Custom promo offer applied to "${prodName}"!`,
          'success'
        );
      }
    }
  };

  // Remove Offer
  const handleRemoveOffer = (productId: string, removeFromAllInCategory?: boolean) => {
    const prod = products.find((item) => item.id === productId);
    const prodName = isAr ? prod?.name : prod?.nameEn || prod?.name;

    if (removeFromAllInCategory && prod?.category) {
      const categoryProducts = products.filter((p) => p.category === prod.category && (p.isOnOffer || !!p.salePrice));
      categoryProducts.forEach((p) => {
        updateProduct(p.id, {
          isOnOffer: false,
          salePrice: undefined,
          offerCampaign: undefined,
          offerBadgeText: undefined,
        });
      });
      showToast(
        isAr
          ? `تم إلغاء العروض من جميع منتجات فئة "${prod.category}" (${categoryProducts.length} منتجات).`
          : `Promo removed from all products in category "${prod.category}".`,
        'info'
      );
    } else {
      updateProduct(productId, {
        isOnOffer: false,
        salePrice: undefined,
        offerCampaign: undefined,
        offerBadgeText: undefined,
      });
      showToast(
        isAr
          ? `تم إلغاء العرض الترويجي وإعادة السعر الأصلي لـ "${prodName}".`
          : `Promo removed and original price restored for "${prodName}".`,
        'info'
      );
    }
  };

  // Quick Edit
  const handleQuickEdit = (p: Product) => {
    setEditingProduct(p);
    setIsSheetOpen(true);
  };

  // Copy Link
  const handleCopyLink = async (p: Product) => {
    const storeOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://store.iraq';
    const productLink = `${storeOrigin}/products/${encodeURIComponent(p.sku || p.id)}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productLink);
      }
    } catch {
      // Fallback
    }

    setCopiedId(p.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === p.id ? null : prev));
    }, 2500);

    showToast(
      isAr
        ? `تم نسخ رابط المنتج بنجاح: ${productLink}`
        : `Product link copied to clipboard: ${productLink}`,
      'success'
    );
  };

  const handleDuplicate = (p: Product) => {
    addProduct({
      name: `${p.name} (${isAr ? 'نسخة' : 'Copy'})`,
      nameEn: `${p.nameEn || p.name} (Copy)`,
      sku: `${p.sku}-CP`,
      category: p.category,
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      status: 'draft',
      imageUrl: p.imageUrl,
      images: p.images,
      sizes: p.sizes,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      materialDetails: p.materialDetails,
      availabilityStatus: p.availabilityStatus,
      isOnOffer: p.isOnOffer,
    });
    showToast(
      isAr ? `تم نسخ المنتج "${p.name}" بنجاح!` : `Product "${p.nameEn || p.name}" duplicated!`,
      'info'
    );
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
      showToast(isAr ? 'تم حذف المنتج من الكتالوج.' : 'Product removed from catalog.', 'info');
    }
  };

  const totalUnits = filteredProducts.reduce((sum, p) => sum + p.stock, 0);
  const activeOffersCount = products.filter((p) => p.isOnOffer || !!p.salePrice).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6 pb-12 relative w-full">
      {/* Toast Notification Banner */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        position="bottom-start"
      />

      {/* Header and Filter Controls */}
      <ProductsManagerHeader
        isAr={isAr}
        productsCount={products.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onNewProduct={() => {
          setEditingProduct(null);
          setIsSheetOpen(true);
        }}
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filteredCount={filteredProducts.length}
        totalUnits={totalUnits}
        activeOffersCount={activeOffersCount}
        outOfStockCount={outOfStockCount}
      />

      {/* Main View Mode: Table or Grid */}
      {viewMode === 'table' ? (
        <ProductsTableView
          isAr={isAr}
          filteredProducts={filteredProducts}
          totalCatalogCount={products.length}
          activeOffersCount={activeOffersCount}
          copiedId={copiedId}
          onQuickEdit={handleQuickEdit}
          onOpenOfferModal={handleOpenOfferModal}
          onCopyLink={handleCopyLink}
          onDuplicate={handleDuplicate}
          onDeleteConfirm={(id) => setDeleteConfirmId(id)}
        />
      ) : (
        <ProductsGridView
          isAr={isAr}
          filteredProducts={filteredProducts}
          copiedId={copiedId}
          onQuickEdit={handleQuickEdit}
          onOpenOfferModal={handleOpenOfferModal}
          onCopyLink={handleCopyLink}
          onDeleteConfirm={(id) => setDeleteConfirmId(id)}
        />
      )}

      {/* Product Form Slide-over Sheet */}
      <ProductFormSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        editingProduct={editingProduct}
      />

      {/* Product Offer Assignment / Customization Modal */}
      {isOfferModalOpen && selectedProductForOffer && (
        <ProductOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedProductForOffer(null);
          }}
          product={selectedProductForOffer}
          products={products}
          offers={offers}
          onApplyOffer={handleApplyOffer}
          onRemoveOffer={handleRemoveOffer}
          onAddNewOfferCampaign={addOffer}
          isAr={isAr}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        isAr={isAr}
      />
    </div>
  );
};

export default ProductsManager;
