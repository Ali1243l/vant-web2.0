import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cartItemId, changeCartQuantity, resolveWhatsAppPhone, type CartItem } from '../src/lib/cart.ts';

const medium: CartItem = { id: cartItemId(1, 'M', 'Black'), title: 'Shirt', image: '', price: 35000, quantity: 0, size: 'M', color: 'Black' };

test('cart preserves the selected price, size and color and computes quantity totals', () => {
  const added = changeCartQuantity([], medium, 1);
  assert.equal(added[0].price, 35000);
  assert.equal(added[0].size, 'M');
  assert.equal(added[0].color, 'Black');
  const doubled = changeCartQuantity(added, medium, 1);
  assert.equal(doubled[0].quantity * doubled[0].price, 70000);
  assert.deepEqual(changeCartQuantity(doubled, medium, -2), []);
});

test('different sizes, colors and products remain separate cart items', () => {
  const added = changeCartQuantity([], medium, 1);
  for (const id of [cartItemId(1, 'L', 'Black'), cartItemId(1, 'M', 'White'), cartItemId(2, 'M', 'Black')]) {
    assert.equal(changeCartQuantity(added, { ...medium, id }, 1).length, 2);
  }
});

test('WhatsApp routing uses configured digits or the store default', () => {
  assert.equal(resolveWhatsAppPhone('Sales WhatsApp Phone', '9647000000000'), '9647000000000');
  assert.equal(resolveWhatsAppPhone('+964 770 123 4567', '9647000000000'), '9647701234567');
});
