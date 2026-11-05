export const policyIds = ['about', 'orders', 'returns', 'privacy'] as const;
export type PolicyId = typeof policyIds[number];
export interface PolicyPage { ar: { title: string; body: string; label?: string }; en: { title: string; body: string; label?: string }; updated: string }
export type PolicyPages = Record<PolicyId, PolicyPage>;

export const defaultPolicies: PolicyPages = {
  "about": {
    "ar": {
      "title": "عن فانت والتواصل",
      "body": "إحنا فانت | VANT، متجر ملابس أونلاين نوصل لكل العراق. عدنا قطع جاهزة وطلبات طباعة وتفصيل حسب الاتفاق.\n\nللطلب أو الاستفسار، تواصل ويانا من حسابات المتجر الموجودة بالموقع. رقم واتساب المتجر وبريد خدمة الزبائن نضيفهن هنا من يصيرن جاهزات؛ الأرقام اللي بيها X مو أرقام فعّالة."
    },
    "en": {
      "title": "About VANT & contact",
      "body": "We are VANT, an online clothing store delivering across Iraq. We offer ready-made pieces and custom printing or tailoring by agreement.\n\nFor orders and enquiries, use the store accounts shown on the website. Our dedicated WhatsApp number and support email will be added once ready. Numbers containing X are placeholders, not active contacts."
    },
    "updated": "2026-11-05"
  },
  "orders": {
    "ar": {
      "title": "الطلب والدفع والتوصيل",
      "body": "شلون تثبّت طلبك؟\nاتفق ويانا على واتساب على القطعة واللون والمقاس والسعر والتوصيل. إضافة القطعة للسلة وحدها ما تثبّت الطلب. إذا اتفقنا على عربون، ينخصم من السعر وتدفع الباقي عند الاستلام. تكدر تفحص القطعة بوجود المندوب قبل الدفع.\n\nالدفع والعربون\nالأسعار بالدينار العراقي، والدفع الإلكتروني داخل الموقع مو متوفر حالياً. العربون ممكن تدفعه بماستر كارد أو زين كاش أو FIB أو رصيد آسيا، حسب الاتفاق. لا ترسل رمز البطاقة أو رمز التحقق بالمحادثة.\n\nإذا تدفع رصيد آسيا، كلفة التحويل 20% فوق العربون وتروح لمزوّد الخدمة. يعني عربون 10,000 يحتاج رصيد 12,000؛ نحسب لك 10,000 عربون و2,000 كلفة تحويل. نوضح المبلغ قبل الدفع، وهالكلفة ما تنضاف لطرق الدفع الثانية.\n\nالتوصيل\nنوصل لكل العراق. المدة المتوقعة 2–6 أيام من تثبيت الطلب، ومنها 2–3 أيام للتوصيل بعد جاهزية القطعة، مو مدة إضافية. نحسب كل أيام الأسبوع. الطلب الخاص ممكن يحتاج وقت أكثر نتفق عليه وياك قبل التجهيز.\n\nأجرة التوصيل عادةً 5,000 دينار، ونأكد الأجرة والموعد وياك قبل التثبيت. إذا صار ظرف خارج إرادتنا ممكن يتأخر التوصيل ونبلغك. أي تغيير عام بالأسعار أو الشروط ما يغيّر اتفاق طلبك المثبّت."
    },
    "en": {
      "title": "Ordering, payment & delivery",
      "body": "Confirming your order\nAgree with us on WhatsApp on the item, colour, size, price and delivery. Adding an item to the basket does not confirm it. Any agreed deposit counts towards the total; pay the balance on delivery. You may inspect the item with the courier before paying.\n\nPayment and deposits\nPrices are in Iraqi dinars. The website does not process online payments. Deposits can be paid through Mastercard, ZainCash, FIB or Asia credit, by agreement. Never send card security codes or verification codes in chat.\n\nAsia credit has a 20% provider conversion charge on top of the deposit. An IQD 10,000 deposit requires IQD 12,000 credit: IQD 10,000 counts as your deposit and IQD 2,000 is the conversion charge. We confirm this before payment. It does not apply to the other payment methods.\n\nDelivery\nWe deliver throughout Iraq, usually within 2–6 calendar days from confirmation. Once ready, delivery usually takes 2–3 days within that total, not extra days. Custom orders may take longer; we agree the timing before starting.\n\nDelivery usually costs IQD 5,000. We confirm the charge and expected timing before your order is confirmed. Events outside our control may cause delays; we will let you know. Later changes to our prices or terms do not change your confirmed agreement."
    },
    "updated": "2026-11-05"
  },
  "returns": {
    "ar": {
      "title": "تعديل الطلب والاستبدال والضمان",
      "body": "قبل الطباعة والشحن\nتكدر تغيّر المقاس أو اللون أو التصميم وباقي تفاصيل طلبك ما دام ما طبعنا القطعة وما شحنّاها. تواصل ويانا بسرعة حتى نأكد لك وضع الطلب وأي فرق بالسعر.\n\nإلغاء الطلب والعربون\nإذا تريد تلغي وتسترجع العربون، بلغنا خلال 24 ساعة من التثبيت وقبل ما نبدي تجهيز أو طباعة القطعة. ممكن نبدي بنفس يوم التثبيت، فلا تعتبر الـ24 ساعة فترة انتظار قبل الطباعة. نأكد وياك وضع الطلب وطريقة وموعد رجوع العربون.\n\nبالإلغاء اللي يشمله الاسترجاع، نرجّع أصل العربون. كلفة تحويل رصيد آسيا اللي اندفعت فعلاً وما نكدر نسترجعها ما ترجع؛ مثلاً إذا دفعت رصيد 12,000 لعربون 10,000، يرجع لك 10,000. ما نخصم كلفة ما اندفعت أو قدرنا نسترجعها.\n\nبعد الطباعة\nما نبدّل أو نسترجع القطعة بسبب تغيير رأيك أو اختيارك مقاس أو طبعة ما ناسبتك بعد طباعتها. إذا أخطأنا بالمقاس أو اللون أو التصميم المتفق عليه، أو القطعة بيها عيب من عدنا، نتكفل بالمعالجة وأجور النقل كلها.\n\nضمان الطباعة\nنضمن عيوب الطباعة لمدة سنة من يوم تستلم القطعة، مع الاستعمال والغسل العادي. إذا الطبعة تشققت أو خربت بسبب عيب منها، تواصل ويانا بصور واضحة ونرتّب استلامها وفحصها. الضمان ما يشمل الضرر الناتج عن سوء الاستعمال، مثل تمزيق القطعة وتضرر الطبعة بسبب التمزيق.\n\nالمعالجة عادةً استبدال. إذا اتفقنا وياك على استرجاع مبلغ، أو كان من حقك حسب القانون، نرجّعه خلال أسبوع كحد أقصى من وصول القطعة إلنا من شركة التوصيل، والفحص ضمن هالأسبوع. طريقة رجوع الفلوس نتفق عليها حسب اللي يناسبك. إذا الخطأ من عدنا نتكفل بالنقل والأجور؛ هالشروط ما تلغي حقوقك القانونية."
    },
    "en": {
      "title": "Changes, exchanges & print warranty",
      "body": "Before printing and dispatch\nYou can change the size, colour, design and other details while your item has not been printed or dispatched. Contact us promptly so we can confirm its status and any price difference.\n\nCancellation and deposits\nTo cancel and request your deposit back, contact us within 24 hours of confirmation and before preparation or printing starts. We may start on the same day: the 24-hour window does not delay production. We confirm the status, refund method and timing with you.\n\nFor an eligible cancellation we return the original deposit. An Asia conversion charge already paid to the provider and not recoverable is excluded. For example, IQD 12,000 in Asia credit for an IQD 10,000 deposit means an IQD 10,000 refund. We do not deduct charges we never paid or could recover.\n\nAfter printing\nWe do not exchange or refund printed items for a change of mind or a size or design you chose that does not suit you. If we supply the wrong agreed size, colour or design, or an item has a defect caused by us, we cover the remedy and all related transport costs.\n\nPrint warranty\nPrinting defects are covered for one year from receipt with normal use and washing. If the print cracks or deteriorates because of a printing defect, send clear photos so we can arrange collection and inspection. Damage caused by misuse, such as tearing the garment and damaging the print in the process, is excluded.\n\nReplacement is our usual remedy. If we agree a refund, or it is legally required, it is paid within seven calendar days of VANT receiving the returned item from the courier, including inspection. We agree a suitable refund method with you. We cover all related costs when we are at fault. These terms do not remove your legal rights."
    },
    "updated": "2026-11-05"
  },
  "privacy": {
    "ar": {
      "title": "الخصوصية وبياناتك",
      "body": "شنو نستخدم من بياناتك؟\nنستخدم اسمك ورقمك وعنوان التوصيل وبريدك إذا تزودنا بيه، وتفاصيل طلباتك والقطع اللي تتفاعل وياها، حتى نجهّز الطلب ونتابع التوصيل والضمان ونحسّن المتجر. وممكن نعرف بلدك أو محافظتك بشكل تقريبي من اتصالك بالإنترنت؛ هذا مو عنوانك الدقيق وقد يكون غير صحيح.\n\nمنو يشوف البيانات؟\nنشارك المعلومات اللازمة فقط وي شركة التوصيل ومزوّدي تشغيل المتجر حتى يقدمون الخدمة. ما ننشر بياناتك الشخصية. نحتفظ باللي نحتاجه لمتابعة الطلبات والضمان والالتزامات القانونية فقط.\n\nالعروض والرسائل\nرسائل التسويق تحتاج موافقتك، والشراء وحده مو موافقة. تكدر تلغي الاشتراك أو تطلب تعديل أو حذف بياناتك بالتواصل ويانا. إذا احتجنا نبقي معلومات لطلب أو ضمان أو التزام قانوني نوضح لك السبب.\n\nالتخزين على جهازك\nالموقع يخزن بعض المعلومات حتى يتذكر اللغة والمظهر والسلة وتفضيلاتك ويحسّن السرعة. مسح بيانات الموقع من متصفحك ممكن يمسح هالاختيارات والسلة. نستخدم معلومات الزيارات والتفاعل لتحسين الموقع والعروض، ونطلب موافقتك لأي تسويق أو تتبع يحتاج موافقة."
    },
    "en": {
      "title": "Privacy & your data",
      "body": "What we use\nWe use your name, phone number, delivery address, email if provided, order details and interactions with products to fulfil orders, arrange delivery, handle warranties and improve the store. Your internet connection may show an approximate country or province. This is not your exact address and may be inaccurate.\n\nWho receives it\nWe share only the information needed by our courier and store service providers to provide their services. We do not publish your personal information. We retain what is needed for orders, warranties and legal obligations.\n\nOffers and messages\nMarketing messages require your permission; a purchase alone is not consent. Contact us to unsubscribe or request correction or deletion of your data. If some records must be kept for an order, warranty or legal obligation, we explain why.\n\nStorage on your device\nThe website stores information to remember language, appearance, basket and preferences, and to improve speed. Clearing website data in your browser may remove these choices and your basket. We use visit and interaction information to improve the site and offers, and ask permission for marketing or tracking that requires it."
    },
    "updated": "2026-11-05"
  }
};

export function validPolicyPage(value: unknown): value is PolicyPage {
  if (!value || typeof value !== 'object') return false;
  const page = value as PolicyPage;
  return ['ar', 'en'].every(lang => {
    const copy = page[lang as 'ar' | 'en'];
    return typeof copy?.title === 'string' && copy.title.trim().length > 0 && copy.title.length <= 140 && typeof copy.body === 'string' && copy.body.trim().length > 0 && copy.body.length <= 24000 && (copy.label === undefined || (typeof copy.label === 'string' && copy.label.length <= 64));
  }) && typeof page.updated === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(page.updated) && Number.isFinite(Date.parse(page.updated + 'T00:00:00Z')) && new Date(page.updated + 'T00:00:00Z').toISOString().slice(0, 10) === page.updated;
}

export function readPolicies(value: unknown): PolicyPages {
  const saved = value && typeof value === 'object' ? value as Partial<PolicyPages> : {};
  return Object.fromEntries(policyIds.map(id => [id, validPolicyPage(saved[id]) ? saved[id] : defaultPolicies[id]])) as PolicyPages;
}

export function policyFromSearch(search: string): PolicyId | null {
  const requested = new URLSearchParams(search).get('policy');
  const id = requested === 'delivery' ? 'orders' : requested === 'contact' ? 'about' : requested === 'storage' ? 'privacy' : requested;
  return policyIds.includes(id as PolicyId) ? id as PolicyId : null;
}

const footerLabels: Record<PolicyId, [string, string]> = {
  about: ['عن فانت', 'About'], orders: ['الطلب والتوصيل', 'Orders & delivery'],
  returns: ['الاستبدال', 'Returns'], privacy: ['الخصوصية', 'Privacy'],
};
export function policyFooterLabel(id: PolicyId, page: PolicyPage, lang: 'ar' | 'en'): string {
  return page[lang].label?.trim() || (page[lang].title === defaultPolicies[id][lang].title ? footerLabels[id][lang === 'ar' ? 0 : 1] : page[lang].title);
}
