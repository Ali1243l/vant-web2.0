import {
  AnalyticsEvent,
  HesitationSignal,
  CustomerPersonaType,
  CustomerTasteFingerprint,
  CustomerSessionProfile,
  DemandVelocityItem,
  UnmetSearchInsight,
  SizeDemandComparison,
  FunnelDropOffDiagnosis,
  SystemErrorLog,
  UserBehaviorStats,
} from './types';
import { getStoredEvents } from './tracker';

// Extract real recorded customer location (if tracked from order/checkout or IP)
function extractSessionGovernorate(sEvents: AnalyticsEvent[]): string {
  for (const ev of sEvents) {
    if (ev.data?.governorate) return String(ev.data.governorate);
    if (ev.data?.city) return String(ev.data.city);
    if (ev.data?.location) return String(ev.data.location);
  }
  return 'غير محدد (Undetermined)';
}

// Compute 100% Real Aggregated Business Intelligence & Customer Session Journey
export function getAggregatedAnalytics(productsList: any[] = []): UserBehaviorStats {
  const rawEvents = getStoredEvents();
  // Filter out dev simulation events
  const events = rawEvents.filter((e) => !e.data?.isSimulation && !e.data?.isDev);

  const totalPageViews = events.filter((e) => e.type === 'page_view').length;
  const productViewEvents = events.filter((e) => e.type === 'product_view');
  const totalProductViews = productViewEvents.length;
  const wishlistEvents = events.filter((e) => e.type === 'wishlist_toggle' && (e.data?.isAdded ?? true));
  const totalWishlistAdds = wishlistEvents.length;
  const whatsappEvents = events.filter((e) => e.type === 'whatsapp_order');
  const totalWhatsAppClicks = whatsappEvents.length;
  const sizeSelectEvents = events.filter((e) => e.type === 'size_select');

  // Group events by session for deep Customer Intelligence
  const sessionEventsMap = new Map<string, AnalyticsEvent[]>();
  events.forEach((e) => {
    const sId = e.sessionId || 'sess_default';
    const list = sessionEventsMap.get(sId) || [];
    list.push(e);
    sessionEventsMap.set(sId, list);
  });

  const customerSessions: CustomerSessionProfile[] = [];

  sessionEventsMap.forEach((sEvents, sId) => {
    const sorted = [...sEvents].sort((a, b) => a.timestamp - b.timestamp);
    const firstSeen = sorted[0]?.timestamp || Date.now();
    const lastSeen = sorted[sorted.length - 1]?.timestamp || Date.now();
    const durationSeconds = Math.max(0, Math.round((lastSeen - firstSeen) / 1000));
    const device = sorted[0]?.device || 'mobile';
    const governorate = extractSessionGovernorate(sorted);

    const viewedMap = new Map<string, { title: string; count: number; lastTime: number }>();
    const wishlistSet = new Map<string, string>();
    const orders: Array<{ id: string; title: string; size?: string; price?: number; time: number }> = [];
    const sizesSet = new Set<string>();
    const searchSet = new Set<string>();
    const categoriesSet = new Set<string>();
    let imageSlideCount = 0;
    let fitCalculatorUsed = false;
    let sizeGuideOpened = false;
    let couponInteractions = 0;
    const viewedPrices: number[] = [];
    const lastTargetedProduct: { id?: string; title?: string; size?: string; price?: number } = {};

    const journeyTimeline: Array<{
      id: string;
      type: string;
      label: string;
      timestamp: number;
      elapsedFormatted: string;
      details?: string;
    }> = [];

    sorted.forEach((ev) => {
      let label = '';
      let details = '';
      const elapsedSec = Math.max(0, Math.round((ev.timestamp - firstSeen) / 1000));
      const elapsedFormatted = `+${Math.floor(elapsedSec / 60)}m ${String(elapsedSec % 60).padStart(2, '0')}s`;

      switch (ev.type) {
        case 'page_view':
          label = 'فتح الكتالوج الرئيسي';
          details = 'بدء تصفح تشكيلة المتجر';
          break;
        case 'category_filter':
          label = `تصفية حسب القسم: ${ev.data?.category || 'الكل'}`;
          if (ev.data?.category) categoriesSet.add(ev.data.category);
          break;
        case 'availability_filter':
          label = `تصفية حسب التوفر: ${ev.data?.availability || ''}`;
          break;
        case 'search_query':
          label = `بحث عن: "${ev.data?.query}"`;
          if (ev.data?.query) searchSet.add(ev.data.query);
          break;
        case 'product_view': {
          const pId = String(ev.data?.productId || '0');
          const pTitle = ev.data?.productTitle || `قطعة #${pId}`;
          label = `معاينة القطعة: ${pTitle}`;
          const curr = viewedMap.get(pId) || { title: pTitle, count: 0, lastTime: ev.timestamp };
          curr.count += 1;
          curr.lastTime = ev.timestamp;
          viewedMap.set(pId, curr);

          // Find price from catalog
          const matchedProd = productsList.find((p) => String(p.id) === pId);
          if (matchedProd && typeof matchedProd.price === 'number') {
            viewedPrices.push(matchedProd.price);
          }
          lastTargetedProduct.id = pId;
          lastTargetedProduct.title = pTitle;
          lastTargetedProduct.price = matchedProd?.price;
          break;
        }
        case 'image_slide':
          imageSlideCount += 1;
          label = 'تقليب معرض صور القطعة';
          details = `الاطلاع على زوايا إضافية لـ ${ev.data?.title || ''}`;
          break;
        case 'size_guide_open':
          sizeGuideOpened = true;
          label = 'استشارة دليل القياسات والأبعاد';
          details = `فحص محيط الصدر والخصر لـ ${ev.data?.title || ''}`;
          break;
        case 'fit_calculator':
          fitCalculatorUsed = true;
          label = 'استخدام حاسبة المقاس الفاخرة Fit Finder';
          details = ev.data?.recommendedSize ? `المقاس المقترح: [${ev.data.recommendedSize}]` : '';
          break;
        case 'size_select':
          label = `اختيار المقاس [${ev.data?.size}]`;
          details = `للقطعة: ${ev.data?.productTitle || ''}`;
          if (ev.data?.size) sizesSet.add(ev.data.size);
          if (lastTargetedProduct) {
            lastTargetedProduct.size = ev.data?.size;
          }
          break;
        case 'wishlist_toggle': {
          const pId = String(ev.data?.productId || '0');
          const pTitle = ev.data?.productTitle || `قطعة #${pId}`;
          const isAdded = ev.data?.isAdded ?? true;
          label = isAdded ? `حفظ بالمفضلة: ${pTitle}` : `إزالة من المفضلة: ${pTitle}`;
          if (isAdded) wishlistSet.set(pId, pTitle);
          else wishlistSet.delete(pId);
          break;
        }
        case 'whatsapp_order': {
          const pId = String(ev.data?.productId || '0');
          const pTitle = ev.data?.productTitle || `قطعة #${pId}`;
          label = `طلب عبر الواتساب: ${pTitle}`;
          details = ev.data?.size ? `المقاس: [${ev.data.size}]` : '';
          orders.push({
            id: pId,
            title: pTitle,
            size: ev.data?.size,
            price: ev.data?.price,
            time: ev.timestamp,
          });
          break;
        }
        case 'coupon_copied':
          couponInteractions += 1;
          label = 'نسخ كود الخصم الترويجي';
          details = `الكود: ${ev.data?.code || ''}`;
          break;
        default:
          label = `إجراء: ${ev.type}`;
      }

      journeyTimeline.push({
        id: ev.id,
        type: ev.type,
        label,
        timestamp: ev.timestamp,
        elapsedFormatted,
        details,
      });
    });

    // Compute Lead Score (0 - 100)
    let leadScore = 0;
    if (orders.length > 0) leadScore += 60;
    if (sizesSet.size > 0) leadScore += 15;
    if (wishlistSet.size > 0) leadScore += 10;
    if (fitCalculatorUsed) leadScore += 10;
    if (imageSlideCount >= 3) leadScore += 5;
    leadScore += Math.min(10, Math.floor(durationSeconds / 20));
    leadScore = Math.min(100, leadScore);

    // Intent Tier
    let intentTier: CustomerSessionProfile['intentTier'] = 'browser';
    if (orders.length > 0 || leadScore >= 75) intentTier = 'vip';
    else if (sizesSet.size > 0 || leadScore >= 50) intentTier = 'high_intent';
    else if (wishlistSet.size > 0 || fitCalculatorUsed || leadScore >= 35) intentTier = 'enthusiast';
    else if (viewedMap.size >= 2 || searchSet.size > 0) intentTier = 'explorer';

    // Persona Classification Engine
    let persona: CustomerPersonaType = 'window_shopper';
    let personaLabel = '👀 زائر تصفح عادي (Window Shopper)';
    let personaBadgeColor = 'bg-gray-500/20 text-gray-300 border-gray-500/30';

    if (orders.length > 0) {
      persona = 'vip';
      personaLabel = '👑 عميل ذهبي مؤكد (VIP Purchaser)';
      personaBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    } else if (sizesSet.size > 0 || fitCalculatorUsed) {
      persona = 'high_intent';
      personaLabel = '🔥 نية شراء عالية (High Intent)';
      personaBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    } else if (wishlistSet.size > 0) {
      persona = 'hesitant_buyer';
      personaLabel = '⏳ مهتم مالي ومحترس (Hesitant Buyer)';
      personaBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    } else if (couponInteractions > 0 || categoriesSet.has('offers')) {
      persona = 'deal_hunter';
      personaLabel = '🏷️ باحث عن العروض والخصومات (Deal Hunter)';
      personaBadgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    } else if (viewedMap.size >= 3 || imageSlideCount >= 4) {
      persona = 'fashion_enthusiast';
      personaLabel = '👗 متذوق أزياء ومستكشف تشكيلات (Fashion Enthusiast)';
      personaBadgeColor = 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30';
    } else if (searchSet.size > 0 || categoriesSet.size >= 2) {
      persona = 'trend_explorer';
      personaLabel = '🔍 مستكشف صيحات وتصنيفات (Trend Explorer)';
      personaBadgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }

    // Taste Fingerprint
    const avgPrice =
      viewedPrices.length > 0
        ? Math.round(viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length)
        : 0;

    const tasteFingerprint: CustomerTasteFingerprint = {
      primaryCategory: Array.from(categoriesSet)[0] || 'الكل',
      preferredSize: Array.from(sizesSet)[0] || undefined,
      avgViewedPrice: avgPrice,
      imageInteractionCount: imageSlideCount,
      fitCalculatorUsed,
      couponInteractions,
    };

    // ALGORITHM 1 IMPLEMENTATION: HESITATION DETECTION & 1-CLICK RECOVERY
    const hasIntentSignals = sizesSet.size > 0 || wishlistSet.size > 0;
    const hasNotOrdered = orders.length === 0;
    const hasDwellTime = durationSeconds >= 25;
    const isHesitantBuyer = (hasIntentSignals || hasDwellTime) && hasNotOrdered;
    let hesitationReason = '';
    let hesitationSignal: HesitationSignal | undefined = undefined;

    const targetProductTitle =
      lastTargetedProduct?.title || Array.from(viewedMap.values())[0]?.title || 'القطعة المختارة';
    const targetSize = lastTargetedProduct?.size || Array.from(sizesSet)[0] || 'المقاس المفضل';

    if (orders.length === 0) {
      if (sizesSet.size > 0) {
        hesitationReason = 'حدّد المقاس وتوقف قبل بدء محادثة الواتساب';
        hesitationSignal = {
          id: `hes_${sId}_checkout`,
          sessionId: sId,
          type: 'checkout_stalled',
          title: 'تردد اللحظة الأخيرة عند زر الطلب',
          details: `اختار المقاس [${targetSize}] لقطعة (${targetProductTitle}) لكنه لم يفتح محادثة الواتساب.`,
          targetProductId: lastTargetedProduct?.id,
          targetProductTitle,
          targetSize,
          targetProductPrice: lastTargetedProduct?.price,
          dwellSeconds: durationSeconds,
          hesitationScore: 92,
          urgency: 'critical',
          suggestedAction: 'متابعة فورية لتأكيد المقاس وتجهيز القطعة للشحن السريع',
          recoveryWhatsAppMessage: `مرحباً عزيزتي ✨ لاحظنا اختياركِ لقطعة (${targetProductTitle}) بمقاس [${targetSize}]. هل تحبين تأكيد طلبكِ الآن مع فحص تفصيلي للقياس والشحن الفوري؟ يسعدنا خدمتكِ في دار VANT.`,
          suggestedPromoCode: 'VANT-VIP',
          timestamp: lastSeen,
        };
      } else if (fitCalculatorUsed || sizeGuideOpened) {
        hesitationReason = 'استشار دليل القياسات أو الحاسبة وتوقف قبل تحديد المقاس';
        hesitationSignal = {
          id: `hes_${sId}_sizing`,
          sessionId: sId,
          type: 'sizing_hesitation',
          title: 'حيرة في اختيار المقاس المناسب',
          details: `استخدم حاسبة أو دليل القياسات لـ (${targetProductTitle}) وتوقف دون حسم المقاس.`,
          targetProductId: lastTargetedProduct?.id,
          targetProductTitle,
          targetSize,
          dwellSeconds: durationSeconds,
          hesitationScore: 78,
          urgency: 'high',
          suggestedAction: 'تقديم استشارة قياس وتفصيل مخصصة من خبيرات الأزياء بالمتجر',
          recoveryWhatsAppMessage: `أهلاً بكِ في دار VANT 🌸 لاحظنا استفساركِ عن مقاسات قطعة (${targetProductTitle}). خبيرات الأزياء لدينا جاهزات لمساعدتكِ فوراً باختيار المقاس الدقيق لطولكِ وقوامكِ.`,
          suggestedPromoCode: 'FIT-CARE',
          timestamp: lastSeen,
        };
      } else if (durationSeconds >= 30 && (wishlistSet.size > 0 || viewedMap.size >= 2)) {
        hesitationReason = 'أضاف قطعاً للمفضلة وتصفح طويلاً دون طلب';
        hesitationSignal = {
          id: `hes_${sId}_price`,
          sessionId: sId,
          type: 'price_hesitation',
          title: 'تردد في السعر أو مقارنة القيمة',
          details: `تصفح تفصيلي لعدة قطع أو حفظ بالمفضلة لمدة ${durationSeconds} ثانية دون طلب.`,
          targetProductId: lastTargetedProduct?.id,
          targetProductTitle,
          dwellSeconds: durationSeconds,
          hesitationScore: 68,
          urgency: 'high',
          suggestedAction: 'تقديم كود خصم حصري أو حافز شحن مجاني لحسم قرار الشراء',
          recoveryWhatsAppMessage: `مرحباً بكِ في دار VANT 💎 تقديراً لاهتمامكِ بقطعنا المميزة، يسعدنا إهداؤكِ كود خصم حصري [VANT10] وتوصيل مجاني لطلبكِ القادم لقطعة (${targetProductTitle}).`,
          suggestedPromoCode: 'VANT10',
          timestamp: lastSeen,
        };
      } else if (durationSeconds >= 15 && (searchSet.size > 0 || categoriesSet.size > 0)) {
        hesitationReason = 'تصفح التصنيفات والبحث دون فتح تفاصيل القطع';
        hesitationSignal = {
          id: `hes_${sId}_bounce`,
          sessionId: sId,
          type: 'catalog_bounce',
          title: 'استكشاف أولي دون الوصول للقطعة المطلوبة',
          details: `بحث وتصفية أقسام دون الانتقال لمعاينة تفاصيل قطعة بعينها.`,
          dwellSeconds: durationSeconds,
          hesitationScore: 42,
          urgency: 'medium',
          suggestedAction: 'توجيه الزائر نحو أكثر القطع رواجاً أو التشكيلة الأحدث',
          recoveryWhatsAppMessage: `أهلاً بكِ في دار VANT! دعينا نساعدكِ في استكشاف أحدث قطع التشكيلة الفاخرة المناسبة لذوقكِ وااحتياجكِ.`,
          timestamp: lastSeen,
        };
      } else if (durationSeconds >= 25) {
        hesitationReason = 'إطالة النظر في تفاصيل قطعة محددة دون اتخاذ إجراء';
        hesitationSignal = {
          id: `hes_${sId}_contemplation`,
          sessionId: sId,
          type: 'price_hesitation',
          title: 'تأمل وإطالة النظر في القطعة',
          details: `توقف عند قطعة (${targetProductTitle}) لمدة ${durationSeconds} ثانية دون اختيار مقاس أو طلب.`,
          targetProductId: lastTargetedProduct?.id,
          targetProductTitle,
          dwellSeconds: durationSeconds,
          hesitationScore: 60,
          urgency: 'high',
          suggestedAction: 'تقديم المساعدة في تفاصيل القطعة أو عرض خيارات مشابهة',
          recoveryWhatsAppMessage: `مرحباً بكِ في دار VANT ✨ لاحظنا إعجابكِ بقطعة (${targetProductTitle}). هل تحتاجين مساعدة في معرفة تفاصيل الخامة أو المقاسات المتوفرة؟ خبيراتنا في خدمتكِ.`,
          timestamp: lastSeen,
        };
      }
    }

    const isFromCloud = sEvents.some((ev) => Boolean(ev.isCloudLog));
    if (hesitationSignal) {
      hesitationSignal.isFromCloud = isFromCloud;
    }

    customerSessions.push({
      sessionId: sId,
      device,
      governorate,
      firstSeen,
      lastSeen,
      durationSeconds,
      eventsCount: sorted.length,
      productsViewed: Array.from(viewedMap.entries()).map(([id, v]) => ({
        id,
        title: v.title,
        views: v.count,
        lastTime: v.lastTime,
      })),
      wishlistItems: Array.from(wishlistSet.entries()).map(([id, title]) => ({ id, title })),
      whatsappOrders: orders,
      sizesSelected: Array.from(sizesSet),
      searchQueries: Array.from(searchSet),
      categoriesExplored: Array.from(categoriesSet),
      leadScore,
      intentTier,
      isHesitantBuyer,
      hesitationReason,
      isFromCloud,
      persona,
      personaLabel,
      personaBadgeColor,
      tasteFingerprint,
      hesitationSignal,
      journeyTimeline: journeyTimeline.reverse(),
    });
  });

  // Sort customer sessions: Most active & recent first
  customerSessions.sort((a, b) => b.lastSeen - a.lastSeen);

  // 1. STRICT UNIQUE VISITORS
  const uniqueVisitorSet = new Set(
    events
      .map((e) => e.data?.visitorId || e.sessionId)
      .filter(
        (id) =>
          Boolean(id) &&
          id !== 'null' &&
          id !== 'undefined' &&
          id !== 'pvid_anon' &&
          id !== 'v_server' &&
          id !== 'sess_anon' &&
          id !== 'sess_cloud' &&
          id !== 'sess_default'
      )
  );
  const uniqueVisitors = uniqueVisitorSet.size > 0 ? uniqueVisitorSet.size : customerSessions.length;
  const uniquePersistentVisitors = uniqueVisitors;

  // 2. STRICT TOTAL VISITS / SESSIONS
  const uniqueSessionSet = new Set(
    events
      .map((e) => e.sessionId || e.data?.sessionId)
      .filter((sId) => Boolean(sId) && sId !== 'sess_anon' && sId !== 'v_server')
  );
  const totalVisits = Math.max(uniqueSessionSet.size, customerSessions.length);

  // Active online now (sessions in the last 15 minutes)
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const activeOnlineNow = customerSessions.filter((s) => s.lastSeen >= fifteenMinutesAgo).length;

  // Average session duration
  const totalSessionSeconds = customerSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const avgSessionSeconds = uniqueVisitors > 0 ? Math.round(totalSessionSeconds / uniqueVisitors) : 0;

  // Real Conversion Rate
  const conversionRate =
    totalProductViews > 0
      ? parseFloat(((totalWhatsAppClicks / totalProductViews) * 100).toFixed(1))
      : 0;

  // Collect all real Hesitation Signals sorted by urgency
  const hesitationSignals: HesitationSignal[] = [];
  customerSessions.forEach((s) => {
    if (s.hesitationSignal) hesitationSignals.push(s.hesitationSignal);
  });
  hesitationSignals.sort((a, b) => {
    const urgencyWeight = { critical: 3, high: 2, medium: 1 };
    return urgencyWeight[b.urgency] - urgencyWeight[a.urgency] || b.hesitationScore - a.hesitationScore;
  });

  // Persona Distribution Calculation
  const personaDistribution: Record<CustomerPersonaType, number> = {
    vip: 0,
    high_intent: 0,
    hesitant_buyer: 0,
    deal_hunter: 0,
    fashion_enthusiast: 0,
    trend_explorer: 0,
    window_shopper: 0,
  };
  customerSessions.forEach((s) => {
    if (personaDistribution[s.persona] !== undefined) {
      personaDistribution[s.persona] += 1;
    }
  });

  // Product metrics calculation
  const productMetrics: Record<string, { views: number; wishlist: number; whatsapp: number; title: string }> = {};
  productsList.forEach((p) => {
    const key = String(p.id);
    productMetrics[key] = {
      views: 0,
      wishlist: 0,
      whatsapp: 0,
      title: p.title_ar || p.title || 'قطعة أرشيفية',
    };
  });

  events.forEach((e) => {
    const pid = e.data?.productId ? String(e.data.productId) : null;
    if (pid) {
      if (!productMetrics[pid]) {
        productMetrics[pid] = {
          views: 0,
          wishlist: 0,
          whatsapp: 0,
          title: e.data?.productTitle || `Piece #${pid}`,
        };
      }
      if (e.type === 'product_view') productMetrics[pid].views += 1;
      if (e.type === 'wishlist_toggle' && (e.data?.isAdded ?? true)) productMetrics[pid].wishlist += 1;
      if (e.type === 'whatsapp_order') productMetrics[pid].whatsapp += 1;
    }
  });

  const topProducts = Object.entries(productMetrics)
    .map(([id, metrics]) => {
      const conversionPct =
        metrics.views > 0 ? parseFloat(((metrics.whatsapp / metrics.views) * 100).toFixed(1)) : 0;
      return {
        id,
        title: metrics.title,
        views: metrics.views,
        wishlistAdds: metrics.wishlist,
        whatsappClicks: metrics.whatsapp,
        conversionPct,
      };
    })
    .sort((a, b) => b.views - a.views || b.whatsappClicks - a.whatsappClicks);

  // ALGORITHM 3: PREDICTIVE DEMAND VELOCITY, SIZING & SEARCH
  const demandVelocity: DemandVelocityItem[] = Object.entries(productMetrics)
    .map(([id, m]) => {
      const velocityScore = Number((m.views * 1.0 + m.wishlist * 3.5 + m.whatsapp * 10.0).toFixed(1));
      let demandStatus: DemandVelocityItem['demandStatus'] = 'cold_dormant';
      let statusLabelAr = '❄️ نشاط منخفض';
      let statusLabelEn = 'Cold / Dormant';
      let recommendedAction = 'يوصى بعرض القطعة في البانر أو تنشيط سعرها لتحفيز الاهتمام.';

      if (velocityScore >= 16 || m.whatsapp >= 2) {
        demandStatus = 'hot_trending';
        statusLabelAr = '🔥 إقبال مرتفع جداً';
        statusLabelEn = 'Hot Trending';
        recommendedAction = 'تأمين قطع إضافية فوراً لتجنب نفاد المخزون نتيجة الطلب المتصاعد.';
      } else if (velocityScore >= 4 || m.views >= 3) {
        demandStatus = 'steady_interest';
        statusLabelAr = '⚡ اهتمام مستقر';
        statusLabelEn = 'Steady Interest';
        recommendedAction = 'إبراز تفاصيل المقاسات والخامة للمساعدة في تحويل الزوار إلى طلبات واتساب.';
      }

      return {
        id,
        title: m.title,
        views: m.views,
        wishlistAdds: m.wishlist,
        whatsappClicks: m.whatsapp,
        velocityScore,
        demandStatus,
        statusLabelAr,
        statusLabelEn,
        recommendedAction,
      };
    })
    .sort((a, b) => b.velocityScore - a.velocityScore);

  // Popular searches & Unmet Search Intelligence
  const searchCounts: Record<string, number> = {};
  events
    .filter((e) => e.type === 'search_query')
    .forEach((e) => {
      const q = (e.data?.query || '').trim().toLowerCase();
      if (q.length > 1) {
        searchCounts[q] = (searchCounts[q] || 0) + 1;
      }
    });

  const popularSearches = Object.entries(searchCounts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Unmet Search Intelligence
  const unmetSearches: UnmetSearchInsight[] = popularSearches.map(({ term, count }) => {
    const termLower = term.toLowerCase();
    const matchedProducts = productsList.filter((p) => {
      const matchTitle = (p.title || '').toLowerCase().includes(termLower);
      const matchTitleAr = (p.title_ar || '').toLowerCase().includes(termLower);
      const matchCat = (p.category || '').toLowerCase().includes(termLower);
      const matchCatAr = (p.category_ar || '').toLowerCase().includes(termLower);
      const matchDesc = (p.description || '').toLowerCase().includes(termLower);
      const matchDescAr = (p.description_ar || '').toLowerCase().includes(termLower);
      const matchTags = Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(termLower));
      return matchTitle || matchTitleAr || matchCat || matchCatAr || matchDesc || matchDescAr || matchTags;
    });

    const matchedResultsCount = matchedProducts.length;
    const status: UnmetSearchInsight['status'] = matchedResultsCount > 0 ? 'found' : 'zero_results';
    const suggestedAction =
      matchedResultsCount === 0
        ? `طلب مفقود: الزوار يبحثون عن "${term}" ولا توجد نتائج مطابقة! يوصى بتوفير قطع مطابقة أو تضمين الكلمة في الأوصاف.`
        : `متوفر: توجد ${matchedResultsCount} قطعة مطابقة في الكتالوج الحالي.`;

    return {
      term,
      count,
      matchedResultsCount,
      status,
      suggestedAction,
    };
  });

  // Category distribution
  const categoryDistribution: Record<string, number> = {};
  events
    .filter((e) => e.type === 'category_filter')
    .forEach((e) => {
      const cat = e.data?.category || 'All';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

  // Device Breakdown
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  events.forEach((e) => {
    if (e.device === 'mobile') mobileCount += 1;
    else if (e.device === 'tablet') tabletCount += 1;
    else desktopCount += 1;
  });

  const totalDevices = mobileCount + desktopCount + tabletCount || 1;
  const deviceBreakdown = {
    mobile: Math.round((mobileCount / totalDevices) * 100),
    desktop: Math.round((desktopCount / totalDevices) * 100),
    tablet: Math.round((tabletCount / totalDevices) * 100),
  };

  // Governorates distribution
  const govCounts: Record<string, number> = {};
  customerSessions.forEach((s) => {
    const gov = s.governorate || 'بغداد (Baghdad)';
    govCounts[gov] = (govCounts[gov] || 0) + 1;
  });

  const governoratesDistribution = Object.entries(govCounts)
    .map(([name_ar, count]) => ({
      name_ar,
      name_en: name_ar,
      count,
      percentage: customerSessions.length > 0 ? Math.round((count / customerSessions.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Size Demand Breakdown vs Live Stock Matrix
  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sizeCounts: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  let totalSizeSelects = 0;

  sizeSelectEvents.forEach((e) => {
    const sz = (e.data?.size || '').toUpperCase();
    if (sizeCounts[sz] !== undefined) {
      sizeCounts[sz] += 1;
      totalSizeSelects += 1;
    }
  });

  const sizeDemandBreakdown = Object.entries(sizeCounts).map(([size, count]) => ({
    size,
    count,
    percentage: totalSizeSelects > 0 ? Math.round((count / totalSizeSelects) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  // Live Stock Count per size
  const stockSizeCounts: Record<string, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  let totalAvailableStockUnits = 0;

  productsList.forEach((p) => {
    if (Array.isArray(p.sizes) && p.availability !== 'sold_out') {
      p.sizes.forEach((sz: string) => {
        const upper = (sz || '').toUpperCase();
        if (stockSizeCounts[upper] !== undefined) {
          stockSizeCounts[upper] += 1;
          totalAvailableStockUnits += 1;
        }
      });
    }
  });

  const sizeStockMatrix: SizeDemandComparison[] = standardSizes.map((size) => {
    const demandCount = sizeCounts[size] || 0;
    const demandPercentage = totalSizeSelects > 0 ? Math.round((demandCount / totalSizeSelects) * 100) : 0;
    const stockCount = stockSizeCounts[size] || 0;
    const stockPercentage = totalAvailableStockUnits > 0 ? Math.round((stockCount / totalAvailableStockUnits) * 100) : 0;
    let status: SizeDemandComparison['status'] = 'balanced';
    let statusLabelAr = '✅ متوازن ومستقر';
    let recommendation = 'نسبة التوفر تتوافق مع معدل طلبات الزبائن.';

    if (totalSizeSelects > 0 && demandPercentage > stockPercentage + 12) {
      status = 'deficit_warning';
      statusLabelAr = '🚨 تحذير عجز محتمل';
      recommendation = `الطلب (${demandPercentage}%) أعلى بكثير من المعروض (${stockPercentage}%). يوصى بتجهيز كميات إضافية فوراً.`;
    } else if (totalAvailableStockUnits > 0 && stockPercentage > demandPercentage + 18) {
      status = 'surplus';
      statusLabelAr = '📦 فائض معروض';
      recommendation = `المعروض (${stockPercentage}%) يفوق الطلب (${demandPercentage}%). يوصى بتنشيط ترويجي لهذا المقاس.`;
    }

    return {
      size,
      demandCount,
      demandPercentage,
      stockCount,
      stockPercentage,
      status,
      statusLabelAr,
      recommendation,
    };
  });

  // Conversion Funnel & Drop-off Detection
  const catalogViews = totalPageViews;
  const productSheetOpens = totalProductViews;
  const sizeSelections = sizeSelectEvents.length;
  const whatsappConversions = totalWhatsAppClicks;

  const dropOffCatalogToProduct = catalogViews > productSheetOpens ? catalogViews - productSheetOpens : 0;
  const dropOffProductToSize = productSheetOpens > sizeSelections ? productSheetOpens - sizeSelections : 0;
  const dropOffSizeToOrder = sizeSelections > whatsappConversions ? sizeSelections - whatsappConversions : 0;

  const step1ConversionRate = catalogViews > 0 ? Math.round((productSheetOpens / catalogViews) * 100) : 0;
  const step2ConversionRate = productSheetOpens > 0 ? Math.round((sizeSelections / productSheetOpens) * 100) : 0;
  const step3ConversionRate = sizeSelections > 0 ? Math.round((whatsappConversions / sizeSelections) * 100) : 0;
  const overallConversionRate = catalogViews > 0 ? parseFloat(((whatsappConversions / catalogViews) * 100).toFixed(1)) : 0;

  let primaryDropOffStage: 'inspection' | 'sizing' | 'whatsapp' | 'healthy' = 'healthy';
  let diagnosisMessage = '';

  if (catalogViews === 0) {
    diagnosisMessage = 'بانتظار تسجيل أولى زيارات الكتالوج لحساب نقاط التسرب في القمع بدقة.';
  } else if (productSheetOpens === 0) {
    primaryDropOffStage = 'inspection';
    diagnosisMessage = 'أعلى تسرب في الخطوة 1: الزوار يتصفحون الواجهة دون فتح القطع. يوصى بزيادة جاذبية صور الغلاف والبانرات.';
  } else if (step1ConversionRate < 30) {
    primaryDropOffStage = 'inspection';
    diagnosisMessage = 'تسرب ملحوظ عند تصفح الكتالوج: نسبة فتح القطع منخفضة نسبياً مقارنة بإجمالي الزوار.';
  } else if (step2ConversionRate < 35) {
    primaryDropOffStage = 'sizing';
    diagnosisMessage = 'نقطة الهدر الرئيسية هي اختيار المقاس: الزوار يفحصون القطع ولكن يترددون عند تحديد المقاس. تأكد من إبراز دليل القياسات.';
  } else if (step3ConversionRate < 45) {
    primaryDropOffStage = 'whatsapp';
    diagnosisMessage = 'نقطة التسرب الحرجة تقع عند زر الواتساب: تم اختيار المقاس لكن لم يتم إرسال الرسالة. قد يفيد تفعيل كود الخصم الترحيبي أو التوصيل المجاني.';
  } else {
    diagnosisMessage = 'مسار تحويل ممتاز: نسبة الانتقال بين فحص القطع واختيار المقاس والطلب سلسة وصحية.';
  }

  const funnel = {
    catalogViews,
    productSheetOpens,
    sizeSelections,
    whatsappConversions,
  };

  const funnelDiagnosis: FunnelDropOffDiagnosis = {
    catalogViews,
    productSheetOpens,
    sizeSelections,
    whatsappConversions,
    dropOffCatalogToProduct,
    dropOffProductToSize,
    dropOffSizeToOrder,
    step1ConversionRate,
    step2ConversionRate,
    step3ConversionRate,
    overallConversionRate,
    primaryDropOffStage,
    diagnosisMessage,
  };

  const hesitantBuyersCount = customerSessions.filter((s) => s.isHesitantBuyer).length;

  // Hourly Traffic (24 hours)
  const hourlyBuckets: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyBuckets[i] = 0;

  events.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
  });

  const hourlyTraffic = Array.from({ length: 24 }, (_, h) => {
    const hourFormatted = `${h.toString().padStart(2, '0')}:00`;
    return {
      hour: hourFormatted,
      visitors: hourlyBuckets[h] || 0,
    };
  });

  const lastEventTime = events.length > 0 ? events[0].timestamp : null;

  // System Error Logs processing with error fingerprinting & regression tracking
  const systemErrorEvents = rawEvents.filter((e) => e.type === 'system_error');
  const sortedSystemErrors = [...systemErrorEvents].sort((a, b) => a.timestamp - b.timestamp);
  const resolvedSignatures = new Set<string>();

  const systemErrors: SystemErrorLog[] = sortedSystemErrors.map((ev) => {
    const data = ev.data || {};
    const cleanMsg = String(data.errorMessage || 'Unknown Error').trim();
    const stackLines = String(data.errorStack || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const firstStackLine = stackLines[0] || '';
    const errorSignature = data.errorSignature || (firstStackLine ? `${cleanMsg}::${firstStackLine}` : cleanMsg);
    const status: 'open' | 'investigating' | 'resolved' = (data.status as any) || 'open';
    let isRegression = false;

    if (status === 'resolved') {
      resolvedSignatures.add(errorSignature);
    } else if (status === 'open' && resolvedSignatures.has(errorSignature)) {
      isRegression = true;
    }

    return {
      id: String(ev.id),
      errorMessage: cleanMsg,
      errorStack: data.errorStack || '',
      errorSignature,
      status,
      isRegression,
      timestamp: ev.timestamp,
      formattedTime: new Date(ev.timestamp).toLocaleString('en-GB'),
      url: data.url || '',
      userAgent: data.userAgent || '',
      device: ev.device || 'desktop',
      sessionId: ev.sessionId || 'sess_unknown',
      visitorId: data.visitorId || 'pvid_unknown',
      visitCount: data.visitCount || 1,
    };
  });

  systemErrors.reverse();

  return {
    totalPageViews,
    totalProductViews,
    totalWishlistAdds,
    totalWhatsAppClicks,
    uniqueVisitors,
    uniquePersistentVisitors,
    totalVisits,
    activeOnlineNow,
    avgSessionSeconds,
    conversionRate,
    topProducts,
    popularSearches,
    categoryDistribution,
    deviceBreakdown,
    governoratesDistribution,
    sizeDemandBreakdown,
    customerSessions,
    hesitantBuyersCount,
    hesitationSignals,
    demandVelocity,
    unmetSearches,
    sizeStockMatrix,
    personaDistribution,
    systemErrors,
    funnel,
    funnelDiagnosis,
    hourlyTraffic,
    lastEventTime,
  };
}
