import React from 'react';
import { createRoot } from 'react-dom/client';
import CartCheckout from '../../../src/components/CartCheckout';
import '../../../src/index.css';

// Test this fixture on an isolated localhost port, never against a customer session.
localStorage.setItem('vant_offers_v1', JSON.stringify([{ id: 'local-ui-test', title: 'اختبار', titleEn: 'Test', code: 'SAVE10', discountType: 'percentage', discountValue: 10, status: 'active', usedCount: 0, startDate: '2020-01-01', endDate: '2099-12-31' }]));
document.documentElement.classList.add('dark');
createRoot(document.getElementById('root')!).render(<main className="mx-auto max-w-md p-5 space-y-4 dark:text-white"><h1>معاينة اختبار محلية — لا ترسل الطلب</h1><CartCheckout items={[{ id: 'local-test', title: 'تيشيرت اختبار', image: '', size: 'M', color: 'أسود', price: 25000, quantity: 2 }]} lang="ar" phone="0000000000" enabled label="فتح واتساب" format={value => `${value.toLocaleString('en')} د.ع`} /></main>);
