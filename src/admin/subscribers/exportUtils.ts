import type { Subscriber } from '../useAdminBridge';

export function exportSubscribersCSV(
  filteredSubscribers: Subscriber[],
  showToast: (msg: string) => void,
  isAr: boolean
) {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Status',
    'OrdersCount',
    'TotalSpentIQD',
    'JoinedDate',
    'Tags',
  ];

  const rows = filteredSubscribers.map((s) => [
    s.id,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.email}"`,
    `"${s.phone}"`,
    s.status,
    s.totalOrders,
    s.totalSpent,
    `"${s.joinedDate}"`,
    `"${s.tags.join('; ')}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `subscribers_directory_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(isAr ? 'تم استخراج ملف CSV بنجاح (UTF-8)' : 'CSV exported successfully!');
}

export function exportSubscribersExcel(
  filteredSubscribers: Subscriber[],
  showToast: (msg: string) => void,
  isAr: boolean
) {
  const tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8"/>
      <title>دليل المشتركين والعملاء</title>
      <style>
        body { font-family: Segoe UI, Tahoma, sans-serif; direction: rtl; text-align: right; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #4338ca; color: #ffffff; padding: 12px; font-weight: bold; border: 1px solid #cbd5e1; }
        td { padding: 9px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
        .money { font-weight: bold; color: #059669; }
        .tag { background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
      </style>
    </head>
    <body>
      <h2 style="color: #1e1b4b;">سجل ودليل المشتركين والعملاء - متجر الرافدين الفاخر</h2>
      <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')} | إجمالي العملاء: ${filteredSubscribers.length}</p>
      <table border="1">
        <thead>
          <tr>
            <th>#</th>
            <th>الاسم الكامل</th>
            <th>البريد الإلكتروني</th>
            <th>رقم الهاتف</th>
            <th>الحالة</th>
            <th>عدد الطلبات</th>
            <th>إجمالي المشتريات (دينار عراقي)</th>
            <th>تاريخ الانضمام</th>
            <th>الوسوم</th>
          </tr>
        </thead>
        <tbody>
          ${filteredSubscribers
            .map(
              (s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${s.name}</strong></td>
              <td>${s.email}</td>
              <td>${s.phone}</td>
              <td>${s.status === 'active' ? 'نشط' : 'ملغي الاشتراك'}</td>
              <td>${s.totalOrders}</td>
              <td class="money">${s.totalSpent.toLocaleString('en-US')} IQD</td>
              <td>${s.joinedDate}</td>
              <td><span class="tag">${s.tags.join(', ')}</span></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `subscribers_directory_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(isAr ? 'تم استخراج جدول Excel (.xls) المنسق بنجاح!' : 'Excel file exported successfully!');
}

export function exportSubscribersJSON(
  filteredSubscribers: Subscriber[],
  showToast: (msg: string) => void,
  isAr: boolean
) {
  const payload = {
    exportedAt: new Date().toISOString(),
    currency: 'IQD',
    totalCount: filteredSubscribers.length,
    subscribers: filteredSubscribers,
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `subscribers_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(isAr ? 'تم استخراج ملف JSON البرمجي بنجاح' : 'JSON file exported successfully!');
}

export function exportSubscribersMarkdown(
  filteredSubscribers: Subscriber[],
  totalSpentAll: number,
  showToast: (msg: string) => void,
  isAr: boolean
) {
  const headerLine =
    '| # | العميل | البريد الإلكتروني | الهاتف | الحالة | الطلبات | إجمالي المشتريات (IQD) | الانضمام | الوسوم |';
  const separator =
    '| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |';
  const rows = filteredSubscribers.map(
    (s, i) =>
      `| ${i + 1} | **${s.name}** | \`${s.email}\` | ${s.phone} | ${
        s.status === 'active' ? '✅ نشط' : '❌ ملغي'
      } | ${s.totalOrders} | ${s.totalSpent.toLocaleString('en-US')} IQD | ${s.joinedDate} | ${s.tags.join(', ')} |`
  );

  const mdContent = `# 📋 دليل المشتركين والعملاء - متجر الرافدين الفاخر\n\n- **تاريخ الاستخراج:** ${new Date().toLocaleDateString(
    'en-US'
  )}\n- **إجمالي المشتركين:** ${filteredSubscribers.length}\n- **إجمالي القيمة المالية:** ${totalSpentAll.toLocaleString(
    'en-US'
  )} IQD\n\n${headerLine}\n${separator}\n${rows.join('\n')}\n`;

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `subscribers_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(isAr ? 'تم استخراج جدول Markdown (.md) بنجاح!' : 'Markdown table exported successfully!');
}

export function copySubscribersClipboard(
  filteredSubscribers: Subscriber[],
  showToast: (msg: string) => void,
  isAr: boolean
) {
  const headers = ['الاسم\tالبريد الإلكتروني\tالهاتف\tالحالة\tالطلبات\tالمشتريات (IQD)\tتاريخ الانضمام\tالوسوم'];
  const rows = filteredSubscribers.map(
    (s) =>
      `${s.name}\t${s.email}\t${s.phone}\t${s.status === 'active' ? 'نشط' : 'ملغي الاشتراك'}\t${s.totalOrders}\t${s.totalSpent}\t${s.joinedDate}\t${s.tags.join(', ')}`
  );
  const fullText = [headers, ...rows].join('\n');
  navigator.clipboard?.writeText(fullText);
  showToast(isAr ? 'تم نسخ بيانات الجدول للحافظة (TSV جاهز للّصق في Sheets)!' : 'Copied TSV to clipboard!');
}

export function printSubscribersPDF() {
  window.print();
}
