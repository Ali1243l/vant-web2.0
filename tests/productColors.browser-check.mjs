// Run against /tests/fixtures/product-colors/index.html using a CUA tab at the viewport being checked.
import assert from 'node:assert/strict';

export async function checkColorRailNavigation(tab, lang = 'ar') {
  const before = await tab.playwright.evaluate(() => ({
    scroll: document.querySelector('.product-color-options').scrollLeft,
    top: document.querySelector('[data-product-scroll]').scrollTop,
    photo: document.querySelector('.product-gallery-track').getBoundingClientRect().top,
  }));
  const previousName = lang === 'ar' ? 'الألوان السابقة' : 'Previous colors';
  const nextName = lang === 'ar' ? 'الألوان التالية' : 'Next colors';
  await tab.playwright.getByRole('button', { name: nextName, exact: true }).click();
  await tab.playwright.locator(`button[aria-label="${previousName}"]:not(:disabled)`).waitFor({ state: 'visible' });
  const after = await tab.playwright.evaluate(() => ({
    scroll: document.querySelector('.product-color-options').scrollLeft,
    top: document.querySelector('[data-product-scroll]').scrollTop,
    photo: document.querySelector('.product-gallery-track').getBoundingClientRect().top,
  }));
  assert.notEqual(after.scroll, before.scroll, 'next arrow must scroll the rail');
  assert.equal(after.top, before.top, 'color navigation must not move product details');
  assert.ok(Math.abs(after.photo - before.photo) < 1, 'the photo must remain stationary');
  const last = tab.playwright.locator('.product-color-option').last();
  await last.click();
  assert.equal(await last.getAttribute('aria-pressed'), 'true');
  await tab.playwright.locator(`button[aria-label="${nextName}"]:disabled`).waitFor({ state: 'visible' });
  const visible = await tab.playwright.evaluate(() => {
    const rail = document.querySelector('.product-color-options').getBoundingClientRect();
    const selected = document.querySelector('.product-color-option[aria-pressed="true"]').getBoundingClientRect();
    return selected.left >= rail.left - 1 && selected.right <= rail.right + 1;
  });
  assert.equal(visible, true, 'selected color must be fully visible');
  await tab.playwright.getByRole('button', { name: previousName, exact: true }).click();
  await tab.playwright.locator(`button[aria-label="${nextName}"]:not(:disabled)`).waitFor({ state: 'visible' });
  return { arrowsScroll: true, selectedVisible: visible, photoStationary: true };
}

export async function checkSheetLayout(tab) {
  const bounds = await tab.playwright.evaluate(() => {
    const sheet = document.querySelector('.product-sheet');
    const scroll = document.querySelector('[data-product-scroll]');
    const colors = document.querySelector('.product-color-options').getBoundingClientRect();
    const image = document.querySelector('.product-gallery-track').getBoundingClientRect();
    const owner = scroll.getBoundingClientRect();
    const footer = document.querySelector('.product-sheet-footer').getBoundingClientRect();
    return {
      width: innerWidth, height: innerHeight,
      noOverflow: sheet.scrollWidth <= sheet.clientWidth + 1 && scroll.scrollWidth <= scroll.clientWidth + 1,
      colorsVisible: colors.top >= owner.top - 1 && colors.bottom <= owner.bottom + 1,
      photoVisible: image.top >= owner.top - 1 && image.bottom <= owner.bottom + 1,
      footerVisible: footer.top >= 0 && footer.bottom <= innerHeight + 1,
      touchHeight: document.querySelector('.product-color-option').getBoundingClientRect().height,
    };
  });
  assert.equal(bounds.noOverflow, true);
  assert.equal(bounds.colorsVisible, true);
  assert.equal(bounds.photoVisible, true);
  assert.equal(bounds.footerVisible, true);
  assert.ok(bounds.touchHeight >= 44);
  return bounds;
}

export async function checkConfiguredProduct(tab) {
  await tab.playwright.getByRole('button', { name: 'أبيض', exact: true }).click();
  assert.match(await tab.playwright.locator('.product-detail-info').innerText(), /28,000/);
  assert.equal(await tab.playwright.getByRole('button', { name: 'L available', exact: true }).count(), 0);
  await tab.playwright.getByRole('button', { name: 'إغلاق', exact: true }).click();
  await tab.playwright.locator('.product-sheet').waitFor({ state: 'detached' });
  await tab.playwright.locator('h3').filter({ hasText: 'تجربة ألوان محلية — غير معروضة للبيع' }).click();
  await tab.playwright.getByRole('button', { name: 'أبيض', exact: true }).click();
  assert.match(await tab.playwright.locator('.product-detail-info').innerText(), /28,000/);
  assert.equal(await tab.playwright.getByRole('button', { name: 'L available', exact: true }).count(), 0);
}

// Run after opening the demo card in the main development storefront.
export async function checkDemoColorProduct(tab) {
  const photos = new Set();
  for (const color of ['أسود', 'أبيض', 'رصاصي', 'بني / جوزي', 'كحلي', 'زيتي']) {
    const button = tab.playwright.getByRole('button', { name: color, exact: true });
    await button.click();
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    photos.add(await tab.playwright.locator('.product-gallery-slide[aria-hidden="false"] img').getAttribute('src'));
  }
  assert.equal(photos.size, 6, 'each demo color must have its own photo');
  const state = await tab.playwright.evaluate(() => ({
    demoNotice: document.querySelector('.product-purchase-row')?.textContent,
    orderActions: document.querySelectorAll('.product-purchase-row button, .product-sheet a[href*="wa.me"]').length,
    loaded: Array.from(document.querySelectorAll('.product-gallery-slide img')).every(img => img.complete && img.naturalWidth > 0),
  }));
  assert.match(state.demoNotice, /للتجربة فقط/);
  assert.equal(state.orderActions, 0, 'the demo must not expose ordering or WhatsApp actions');
  assert.equal(state.loaded, true);
  return { colors: photos.size, orderActions: state.orderActions, loaded: state.loaded };
}

export async function checkProductColors(tab) {
  const black = tab.playwright.getByRole('button', { name: 'أسود', exact: true });
  const white = tab.playwright.getByRole('button', { name: 'أبيض', exact: true });
  const activeImage = tab.playwright.locator('.product-gallery-slide[aria-hidden="false"] img');
  await black.click();
  const firstImage = await activeImage.getAttribute('src');
  await white.click();
  assert.equal(await white.getAttribute('aria-pressed'), 'true');
  assert.notEqual(await activeImage.getAttribute('src'), firstImage);
  const bounds = await tab.playwright.evaluate(() => {
    const owner = document.querySelector('[data-product-scroll]').getBoundingClientRect();
    const colors = document.querySelector('.product-color-options').getBoundingClientRect();
    const image = document.querySelector('.product-gallery-track').getBoundingClientRect();
    return { controlsVisible: colors.top >= owner.top && colors.bottom <= owner.bottom, photoVisible: image.top >= owner.top && image.bottom <= owner.bottom, touchHeight: document.querySelector('.product-color-option').getBoundingClientRect().height };
  });
  assert.equal(bounds.controlsVisible, true, 'colors must remain visible with the photo');
  assert.equal(bounds.photoVisible, true, 'the full photo must be visible when choosing a color');
  assert.ok(bounds.touchHeight >= 44, 'color controls need comfortable touch targets');
  await tab.playwright.getByRole('button', { name: 'M available', exact: true }).click();
  assert.equal(await tab.playwright.getByRole('button', { name: 'M available', exact: true }).getAttribute('aria-pressed'), 'true');
  await white.click();
  assert.equal(await tab.playwright.getByRole('button', { name: 'M available', exact: true }).getAttribute('aria-pressed'), 'true', 'selecting the same color must keep its size');
  await black.click();
  assert.equal(await tab.playwright.getByRole('button', { name: 'M available', exact: true }).getAttribute('aria-pressed'), 'false');
  assert.equal(await tab.playwright.getByRole('button', { name: 'أضف للسلة', exact: true }).isEnabled(), false, 'changing color must require a new size selection');
  return bounds;
}
