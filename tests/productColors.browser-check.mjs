// Run against /tests/fixtures/product-colors/index.html using a CUA tab at the viewport being checked.
import assert from 'node:assert/strict';

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

