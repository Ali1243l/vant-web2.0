import { getAggregatedAnalytics } from './aggregator';

/**
 * 1. Export as UTF-8 BOM CSV (Optimized for Arabic Excel)
 */
export function generateAnalyticsCSV(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const dateStr = new Date().toLocaleString('en-GB');

  let csv = '\uFEFF'; // UTF-8 BOM
  csv += `MAISON VANT - Real-Time Enterprise Telemetry Report,Generated: ${dateStr}\n\n`;

  // Section 1: KPIs
  csv += `Key Performance Indicators (KPIs)\n`;
  csv += `Metric,Value,Note\n`;
  csv += `Catalog Total Views,${stats.totalPageViews},Main landing and category views\n`;
  csv += `Product Detail Views,${stats.totalProductViews},Drawer inspection count\n`;
  csv += `Wishlist Saved Items,${stats.totalWishlistAdds},Saved by active visitors\n`;
  csv += `WhatsApp Direct Orders,${stats.totalWhatsAppClicks},Direct purchase button triggers\n`;
  csv += `Unique Visitors,${stats.uniqueVisitors},Distinct session identifiers\n`;
  csv += `Average Session Duration (s),${stats.avgSessionSeconds},Average user dwell time\n`;
  csv += `Overall Conversion Rate (CTR),${stats.conversionRate}%,WhatsApp clicks / Product views\n\n`;

  // Section 2: Products Performance
  csv += `Product Performance Matrix\n`;
  csv += `Product ID,Title,Views,Wishlist Adds,WhatsApp Orders,CTR %\n`;
  stats.topProducts.forEach((p) => {
    const cleanTitle = `"${(p.title || '').replace(/"/g, '""')}"`;
    csv += `${p.id},${cleanTitle},${p.views},${p.wishlistAdds},${p.whatsappClicks},${p.conversionPct}%\n`;
  });
  csv += `\n`;

  // Section 3: Customer Sessions Intelligence
  csv += `Customer Sessions & Lead Intelligence\n`;
  csv += `Session ID,Device,Governorate,Duration (s),Lead Score (0-100),Intent Tier,Viewed Products Count,WhatsApp Orders Count\n`;
  stats.customerSessions.forEach((s) => {
    const cleanGov = `"${(s.governorate || '').replace(/"/g, '""')}"`;
    csv += `${s.sessionId},${s.device},${cleanGov},${s.durationSeconds},${s.leadScore},${s.intentTier},${s.productsViewed.length},${s.whatsappOrders.length}\n`;
  });

  return csv;
}

export function downloadAnalyticsCSV(productsList: any[] = []) {
  const csvContent = generateAnalyticsCSV(productsList);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Analytics_Report_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 2. Export as Real Microsoft Excel Spreadsheet (.xls) with full formatting & worksheets
 */
export function generateAnalyticsExcelXML(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const nowStr = new Date().toLocaleString('en-GB');

  return `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" x:CharSet="1" ss:Size="11" ss:Color="#000000"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
      </Borders>
      <Font ss:FontName="Segoe UI" ss:Size="12" ss:Color="#FFFFFF" ss:Bold="1"/>
      <Interior ss:Color="#004AD7" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#004AD7" ss:Bold="1"/>
      <Interior ss:Color="#F0F4FF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="BoldCell">
      <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1"/>
    </Style>
    <Style ss:ID="CurrencyCell">
      <NumberFormat ss:Format="#,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
  </Styles>
  <!-- SHEET 1: KPIs & Summary -->
  <Worksheet ss:Name="KPIs Summary">
    <Table ss:DefaultColumnWidth="160">
      <Row ss:Height="28">
        <Cell ss:StyleID="Header" ss:MergeAcross="2"><Data ss:Type="String">تقرير تحليلات مايزون VANT الشامل - ${nowStr}</Data></Cell>
      </Row>
      <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
      <Row ss:Height="20">
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">المؤشر (Metric)</Data></Cell>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">القيمة (Value)</Data></Cell>
        <Cell ss:StyleID="SubHeader"><Data ss:Type="String">ملاحظات التحليل</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">إجمالي مشاهدات الكتالوج</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.totalPageViews}</Data></Cell>
        <Cell><Data ss:Type="String">مشاهدات الواجهة الرئيسية والمعرض</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">معاينات تفاصيل القطع</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.totalProductViews}</Data></Cell>
        <Cell><Data ss:Type="String">فتح نافذة درور تفاصيل القطعة</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">إضافات المفضلة</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.totalWishlistAdds}</Data></Cell>
        <Cell><Data ss:Type="String">إشارات رغبة شراء قوية</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">طلبات وتحويلات الواتساب</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.totalWhatsAppClicks}</Data></Cell>
        <Cell><Data ss:Type="String">ضغطات زر الشراء المباشر</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">الزوار الفريدين</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.uniqueVisitors}</Data></Cell>
        <Cell><Data ss:Type="String">إجمالي جلسات المستخدمين الفريدة</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">متوسط مدة الجلسة (ثواني)</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${stats.avgSessionSeconds}</Data></Cell>
        <Cell><Data ss:Type="String">معدل التفاعل ومكوث الزائر</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">معدل التحويل الإجمالي (CTR)</Data></Cell>
        <Cell><Data ss:Type="String">${stats.conversionRate}%</Data></Cell>
        <Cell><Data ss:Type="String">نسبة النقرات إلى المشاهدات</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
  <!-- SHEET 2: Piece Analytics -->
  <Worksheet ss:Name="Piece Performance">
    <Table ss:DefaultColumnWidth="140">
      <Row ss:Height="24">
        <Cell ss:StyleID="Header"><Data ss:Type="String">معرف القطعة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">اسم القطعة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">المشاهدات</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">إضافات المفضلة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">طلبات الواتساب</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">معدل CTR %</Data></Cell>
      </Row>
      ${stats.topProducts
        .map(
          (p) => `
      <Row>
        <Cell><Data ss:Type="String">${p.id}</Data></Cell>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${p.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${p.views}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${p.wishlistAdds}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${p.whatsappClicks}</Data></Cell>
        <Cell><Data ss:Type="String">${p.conversionPct}%</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>
  <!-- SHEET 3: Customer Intelligence -->
  <Worksheet ss:Name="Customer Intelligence">
    <Table ss:DefaultColumnWidth="150">
      <Row ss:Height="24">
        <Cell ss:StyleID="Header"><Data ss:Type="String">جلسة الزائر</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">الجهاز</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">المحافظة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">المدة (ثواني)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">نقاط العميل (Lead Score)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">مستوى العميل</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">القطع المشاهدة</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">الطلبات</Data></Cell>
      </Row>
      ${stats.customerSessions
        .map(
          (s) => `
      <Row>
        <Cell><Data ss:Type="String">${s.sessionId}</Data></Cell>
        <Cell><Data ss:Type="String">${s.device}</Data></Cell>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${s.governorate}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${s.durationSeconds}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${s.leadScore}</Data></Cell>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${s.intentTier.toUpperCase()}</Data></Cell>
        <Cell><Data ss:Type="String">${s.productsViewed.map((p) => p.title).join(' | ').replace(/&/g, '&amp;')}</Data></Cell>
        <Cell><Data ss:Type="String">${s.whatsappOrders.map((o) => o.title).join(' | ').replace(/&/g, '&amp;')}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>
</Workbook>`;
}

export function downloadAnalyticsExcel(productsList: any[] = []) {
  const xmlContent = generateAnalyticsExcelXML(productsList);
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Enterprise_Analytics_${Date.now()}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 3. Export as Structured JSON Dataset
 */
export function generateAnalyticsJSON(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const payload = {
    metadata: {
      brand: 'MAISON VANT',
      generatedAt: new Date().toISOString(),
      version: '3.5-Enterprise',
    },
    analytics: stats,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadAnalyticsJSON(productsList: any[] = []) {
  const jsonContent = generateAnalyticsJSON(productsList);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Raw_Telemetry_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 4. Export as Executive Printable HTML Report
 */
export function generateAnalyticsHTMLReport(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const dateStr = new Date().toLocaleString('ar-IQ');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>👑 MAISON VANT - التقرير التحليلي التنفيذي</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
    .container { max-width: 1100px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #334155; padding-bottom: 24px; margin-bottom: 32px; }
    h1 { margin: 0; font-size: 24px; color: #fbbf24; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .card { background: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #334155; text-align: center; }
    .val { font-size: 28px; font-weight: bold; color: #38bdf8; }
    .lbl { font-size: 13px; color: #94a3b8; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 12px 16px; text-align: right; border-bottom: 1px solid #334155; font-size: 14px; }
    th { background: #0f172a; color: #94a3b8; font-weight: 600; }
    .badge { background: #0284c7; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
    .badge-vip { background: #d97706; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
    .badge-live { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .section-title { font-size: 18px; font-weight: bold; margin-top: 40px; color: #f8fafc; border-right: 4px solid #38bdf8; padding-right: 12px; }
    .footer { margin-top: 48px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 24px; }
    @media print {
      body { background: white; color: black; padding: 0; }
      .container { border: none; background: white; padding: 0; }
      .card { background: #f8fafc; border: 1px solid #e2e8f0; }
      .val { color: #0284c7; }
      th { background: #f1f5f9; color: #000; border-bottom: 2px solid #cbd5e1; }
      td { color: #000; border-bottom: 1px solid #e2e8f0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>👑 MAISON VANT · التقرير التحليلي التنفيذي</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 4px 0 0 0;">تاريخ الإصدار: ${dateStr}</p>
      </div>
      <span class="badge-live">● نظام التحليلات المتصل المباشر</span>
    </div>
    <div class="grid">
      <div class="card"><div class="val">${stats.totalPageViews}</div><div class="lbl">مشاهدات الكتالوج</div></div>
      <div class="card"><div class="val">${stats.totalProductViews}</div><div class="lbl">معاينات تفاصيل القطع</div></div>
      <div class="card"><div class="val" style="color: #f43f5e;">${stats.totalWishlistAdds}</div><div class="lbl">إضافات المفضلة</div></div>
      <div class="card"><div class="val" style="color: #10b981;">${stats.totalWhatsAppClicks}</div><div class="lbl">طلبات الواتساب المباشرة</div></div>
    </div>
    <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="card"><div class="val">${stats.uniqueVisitors}</div><div class="lbl">الزوار الفريدين (Unique Visitors)</div></div>
      <div class="card"><div class="val" style="color: #10b981;">${Math.floor(stats.avgSessionSeconds / 60)}m ${stats.avgSessionSeconds % 60}s</div><div class="lbl">متوسط مدة الجلسة (Engagement)</div></div>
      <div class="card"><div class="val" style="color: #f59e0b;">${stats.conversionRate}%</div><div class="lbl">معدل التحويل الكلي (CTR)</div></div>
    </div>
    <div class="section-title">👥 سجل وتصنيف العملاء المتقدم (Customer Journeys & Leads)</div>
    <table>
      <thead>
        <tr>
          <th>جلسة الزائر</th>
          <th>المحافظة</th>
          <th>الجهاز</th>
          <th>المدة</th>
          <th>نقاط العميل</th>
          <th>التصنيف</th>
          <th>الطلبات / الواتساب</th>
        </tr>
      </thead>
      <tbody>
        ${stats.customerSessions
          .slice(0, 15)
          .map(
            (s) => `
          <tr>
            <td><code>${s.sessionId.substring(0, 14)}...</code></td>
            <td><strong>${s.governorate}</strong></td>
            <td>${s.device === 'mobile' ? '📱 هاتف' : '💻 كمبيوتر'}</td>
            <td>${s.durationSeconds} ثانية</td>
            <td><strong>${s.leadScore} / 100</strong></td>
            <td><span class="badge-vip">${s.intentTier.toUpperCase()}</span></td>
            <td>${s.whatsappOrders.length > 0 ? `<strong style="color:#10b981;">${s.whatsappOrders.map((o) => o.title).join(', ')}</strong>` : '<span style="color:#666;">-</span>'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    <div class="section-title">👗 أداء القطع ومعدل النقر (CTR) في المعرض</div>
    <table>
      <thead>
        <tr>
          <th>اسم القطعة</th>
          <th style="text-align:center;">المشاهدات</th>
          <th style="text-align:center;">المفضلة</th>
          <th style="text-align:center;">طلبات الواتساب</th>
          <th style="text-align:center;">نسبة النقر (CTR)</th>
        </tr>
      </thead>
      <tbody>
        ${stats.topProducts
          .map(
            (p) => `
          <tr>
            <td><strong>${p.title}</strong></td>
            <td style="text-align:center; font-family: monospace;">${p.views}</td>
            <td style="text-align:center; color:#f43f5e; font-family: monospace;">${p.wishlistAdds}</td>
            <td style="text-align:center; color:#10b981; font-weight:bold; font-family: monospace;">${p.whatsappClicks}</td>
            <td style="text-align:center;"><span class="badge">${p.conversionPct}%</span></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    <div class="footer">
      تم توليد هذا التقرير آلياً عبر محرك التحليلات الفوري لمايزون VANT وقاعدة بيانات Supabase · جميع الحقوق محفوظة
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;
}

export function downloadAnalyticsHTMLReport(productsList: any[] = []) {
  const htmlContent = generateAnalyticsHTMLReport(productsList);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (!printWindow) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `VANT_Executive_Report_${Date.now()}.html`;
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * 5. Export as Markdown Document (.md)
 */
export function generateAnalyticsMarkdown(productsList: any[] = []): string {
  const stats = getAggregatedAnalytics(productsList);
  const dateStr = new Date().toLocaleString('en-GB');

  let md = `# 👑 MAISON VANT · تقرير ذكاء الأعمال والتحليلات الشاملة\n\n`;
  md += `**تاريخ التصدير:** ${dateStr}  \n`;
  md += `**المنصة:** Maison VANT Atelier Live Intelligence  \n\n`;
  md += `## 📊 المؤشرات الرئيسية (Executive KPIs)\n\n`;
  md += `- **إجمالي مشاهدات الكتالوج:** ${stats.totalPageViews}\n`;
  md += `- **معاينات تفاصيل القطع:** ${stats.totalProductViews}\n`;
  md += `- **إضافات المفضلة:** ${stats.totalWishlistAdds}\n`;
  md += `- **نقرات طلب الواتساب المباشرة:** ${stats.totalWhatsAppClicks}\n`;
  md += `- **الزوار الفريدين:** ${stats.uniqueVisitors}\n`;
  md += `- **الزوار النشطون حالياً:** ${stats.activeOnlineNow}\n`;
  md += `- **متوسط مدة الجلسة:** ${Math.floor(stats.avgSessionSeconds / 60)} دقيقة و ${stats.avgSessionSeconds % 60} ثانية\n`;
  md += `- **معدل التحويل الكلي (CTR):** ${stats.conversionRate}%\n\n`;

  md += `## 👗 أداء القطع وتفاعل الزبائن\n\n`;
  md += `| القطعة | المشاهدات | المفضلة | طلبات الواتساب | نسبة النقر CTR % |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: |\n`;
  stats.topProducts.forEach((p) => {
    md += `| **${p.title}** | ${p.views} | ${p.wishlistAdds} | ${p.whatsappClicks} | ${p.conversionPct}% |\n`;
  });
  md += `\n`;

  md += `## 👥 تحليل شرائح الزوار والعملاء\n\n`;
  md += `| الجلسة | المحافظة | الجهاز | المدة | نقاط العميل | المستوى |\n`;
  md += `| :--- | :--- | :---: | :---: | :---: |\n`;
  stats.customerSessions.slice(0, 15).forEach((s) => {
    md += `| \`${s.sessionId.substring(0, 12)}\` | ${s.governorate} | ${s.device} | ${s.durationSeconds}s | ${s.leadScore}/100 | **${s.intentTier.toUpperCase()}** |\n`;
  });

  return md;
}

export function downloadAnalyticsMarkdown(productsList: any[] = []) {
  const mdContent = generateAnalyticsMarkdown(productsList);
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VANT_Analytics_Summary_${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
