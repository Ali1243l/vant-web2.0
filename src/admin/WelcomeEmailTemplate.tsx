import { escapeHtml, httpUrl } from '../lib/adminAudience';
import { normalizeEmailImageUrl } from '../lib/emailImage';
import React from 'react';

export interface EmailCampaignData {
  id?: string;
  templateType: 'welcome' | 'flash_sale' | 'launch' | 'clearance' | 'newsletter';
  subject: string;
  preheader: string;
  headline: string;
  bodyText: string;
  discountCode?: string;
  discountPercent?: string;
  heroImage: string;
  ctaText: string;
  ctaUrl: string;
  audience: string;
  storeName?: string;
  senderEmail?: string;
  expireDate?: string;
  items?: Array<{
    name: string;
    price: number | string;
    originalPrice?: number | string;
    image: string;
    badge?: string;
  }>;
}

export const defaultCampaignData: EmailCampaignData = {
  templateType: 'welcome',
  subject: '🎉 مرحباً بك في فانت للأزياء الرفيعة! خصم 20% على طلبك الأول',
  preheader: 'استخدم الكود WELCOME20 واستمتع بأرقى تشكيلات الكشمير والبدلات مع توصيل كونسيرج سريع.',
  headline: 'أهلاً بك في فانت (VANT)',
  bodyText: 'يسعدنا جداً انضمامك إلى مجتمعنا الحصري. لتجربة تسوق لا تُنسى، نقدم لك هدية ترحيبية خاصة صالحة على جميع تشكيلات الأزياء الرفيعة والكشمير والأحذية الكلاسيكية.',
  discountCode: 'WELCOME20',
  discountPercent: '20% خصم فوري ترحيبي',
  heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
  ctaText: 'تسوق التشكيلة الملكية الآن',
  ctaUrl: '',
  audience: 'active',
  storeName: 'فانت للأزياء الرفيعة (VANT)',
  senderEmail: '',
  expireDate: 'خلال 7 أيام من التسجيل',
  items: [],
};

/**
 * Generate standard HTML string compatible with email clients (Resend, SendGrid, etc.)
 */
export function generateEmailHtml(input: EmailCampaignData): string {
  const data = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, typeof value === 'string' ? escapeHtml(value) : value])) as unknown as EmailCampaignData;
  data.ctaUrl = escapeHtml(httpUrl(input.ctaUrl));
  data.heroImage = escapeHtml(normalizeEmailImageUrl(input.heroImage));
  data.items = input.items?.map(item => ({ ...item, name: escapeHtml(item.name), price: escapeHtml(item.price), originalPrice: escapeHtml(item.originalPrice), badge: escapeHtml(item.badge), image: escapeHtml(normalizeEmailImageUrl(item.image)) }));
  const isFlash = data.templateType === 'flash_sale';
  const isLaunch = data.templateType === 'launch';
  const isClearance = data.templateType === 'clearance';
  const isNewsletter = data.templateType === 'newsletter';

  const themeColor = isFlash ? '#ef4444' : isLaunch ? '#8b5cf6' : isClearance ? '#f59e0b' : isNewsletter ? '#06b6d4' : '#4f46e5';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; direction: rtl; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; }
    img { border: 0; max-width: 100%; height: auto; }
    .wrapper { box-sizing: border-box; width: 100%; table-layout: fixed; background-color: #0f172a; padding: 30px 10px; }
    .main { table-layout: fixed; overflow-wrap: break-word; background-color: #1e293b; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
    .header { padding: 24px 30px; text-align: center; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155; }
    .hero-img { width: 100%; height: auto; display: block; }
    .content { padding: 32px 30px; }
    .badge { display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: bold; border-radius: 9999px; text-transform: uppercase; background-color: ${themeColor}22; color: ${themeColor}; border: 1px solid ${themeColor}44; margin-bottom: 14px; }
    .headline { font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3; margin: 0 0 16px 0; }
    .body-p { font-size: 15px; line-height: 1.7; color: #94a3b8; margin: 0 0 24px 0; }
    .coupon-box { background: #0f172a; border: 2px dashed ${themeColor}; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .coupon-code { overflow-wrap: anywhere; word-break: break-word; font-family: monospace; font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #ffffff; margin: 8px 0; }
    .btn-cta { display: inline-block; background-color: ${themeColor}; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 36px; border-radius: 10px; box-shadow: 0 4px 14px ${themeColor}66; }
    .items-grid { margin-top: 30px; padding-top: 24px; border-top: 1px solid #334155; }
    .footer { padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; background-color: #0f172a; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Preheader (Hidden Preview Text) -->
      <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        ${data.preheader}
      </div>
    <table class="main" align="center">
      <!-- Header / Store Brand -->
      <tr>
        <td class="header">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
            ${data.storeName || 'متجر الرافدين الفاخر'}
          </h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">${data.senderEmail || 'عروض وتحديثات حصرية'}</p>
        </td>
      </tr>

      <!-- Hero Banner -->
      ${
        data.heroImage
          ? `<tr>
        <td>
          <img src="${data.heroImage}" alt="${data.headline}" class="hero-img" style="width:100%;height:auto;display:block;">
        </td>
      </tr>`
          : ''
      }

      <!-- Main Body -->
      <tr>
        <td class="content">
          <span class="badge">
            ${
              isFlash
                ? '⚡ عرض عاجل ومؤقت'
                : isLaunch
                ? '✨ إطلاق منتج جديد'
                : isClearance
                ? '🔥 تصفية موسمية كبرى'
                : isNewsletter
                ? '📰 النشرة البريدية الأسبوعية'
                : '🎁 هدية ترحيبية حصرية'
            }
          </span>

          <h2 class="headline">${data.headline}</h2>
          <p class="body-p">${data.bodyText}</p>

          ${
            data.discountCode
              ? `<div class="coupon-box">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">${data.discountPercent || 'كود الخصم الحصري'}</div>
            <div class="coupon-code">${data.discountCode}</div>
            <div style="font-size: 11px; color: #64748b;">${data.expireDate ? `صالح ${data.expireDate}` : 'يطبق عند إتمام الطلب في سلة التسوق'}</div>
          </div>`
              : ''
          }

          <div style="text-align: center; margin: 28px 0 16px;">
            <a href="${data.ctaUrl || '#'}" class="btn-cta" target="_blank">
              ${data.ctaText || 'تسوق الآن'}
            </a>
          </div>

          ${
            data.items && data.items.length > 0
              ? `
          <div class="items-grid">
            <h4 style="margin: 0 0 16px; font-size: 14px; font-weight: 700; color: #cbd5e1; text-align: center;">تشكيلات مميزة ننصحك بها</h4>
            <table width="100%">
              <tr>
                ${data.items
                  .map(
                    (it) => `
                <td style="width: 50%; padding: 8px; vertical-align: top;">
                  <div style="background: #0f172a; border: 1px solid #334155; border-radius: 12px; overflow: hidden; padding: 10px; text-align: center;">
                    <img src="${it.image}" alt="${it.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
                    <div style="font-size: 13px; font-weight: 700; color: #f8fafc; margin-bottom: 4px;">${it.name}</div>
                    <div style="font-size: 13px; font-weight: 800; color: #10b981;">${it.price}</div>
                    ${it.originalPrice ? `<div style="font-size: 11px; text-decoration: line-through; color: #64748b;">${it.originalPrice}</div>` : ''}
                  </div>
                </td>`
                  )
                  .join('')}
              </tr>
            </table>
          </div>`
              : ''
          }
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer">
          <p style="margin: 0 0 8px;">وصلك هذا البريد لأنك مسجل في القائمة البريدية لـ ${data.storeName || 'متجرنا'}.</p>
          <p style="margin: 0;">
            <a href="#" style="color: #94a3b8; text-decoration: underline;">إلغاء الاشتراك</a> • 
            <a href="#" style="color: #94a3b8; text-decoration: underline;">سياسة الخصوصية</a>
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

interface WelcomeEmailTemplateProps {
  data: EmailCampaignData;
  previewDevice?: 'desktop' | 'mobile';
}

export const WelcomeEmailTemplate: React.FC<WelcomeEmailTemplateProps> = ({
  data,
  previewDevice = 'desktop',
}) => {
  return (
    <div className={`mx-auto w-full min-w-0 ${previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-[620px]'}`}>
      <iframe
        title="معاينة محتوى البريد"
        srcDoc={generateEmailHtml(data)}
        sandbox=""
        referrerPolicy="no-referrer"
        className="block h-[640px] w-full rounded-2xl border border-slate-800 bg-slate-900"
      />
    </div>
  );
};

export default WelcomeEmailTemplate;
