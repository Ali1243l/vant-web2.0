# Admin analytics review — 2026-10-28

## Definitions implemented

- Revenue and average order value use delivered orders only. Dates use the recorded order date; the schema does not supply a delivery timestamp.
- All sections use the same selected calendar window, including custom ranges. Invalid/future order dates, duplicate IDs, cancellations and marked test orders are excluded.
- Best sellers use delivered line-item quantities. Category shares use delivered line-item values, which can differ from order totals with shipping or discounts.
- Engagement uses explicit capped weights: views 20, sizes 20, cart additions 30, inquiries 15, wishlist 10, fit guidance 5. It is not a purchase probability.
- RFM ranks identified customers by delivered purchase recency, frequency and monetary value within the selected period. Ties receive the same score. This is a relative rule-based ranking, not a calibrated forecast.
- Hesitation requires at least five idle minutes, 30 seconds between observed events, recorded intent and no observed inquiry or linked delivered purchase. It is a signal, not confirmed abandonment. Anonymous visitors cannot be contacted.
- Conversion counts observed visit sessions explicitly linked to delivered orders, once per session. Without usable linkage, it is unavailable. This is observed attribution, not store-wide conversion.
- Size demand counts valid recorded quantities. Product-wide stock is never copied into every size. Missing size-level stock is shown as unknown.
- Unmet searches require a recorded zero-result count. Old events without counts and incomplete pagination cannot establish zero results. No monetary loss is invented.
- Error logs cannot prove uptime or availability; those remain unknown without a monitor.

## Scope and next priorities

The current admin dashboard and storefront event collection were updated. The separate legacy analytics component was not rewritten. No live order, email, WhatsApp message or reset was executed.

1. Add server-side order/session correlation and documented identity, consent and retention rules before relying on conversion across devices.
2. Store inventory by color and size, plus stock movement history, before forecasting shortages.
3. Add independent server uptime/error monitoring; remove the legacy duplicate dashboard after confirming no callers need it.
4. Consider forecasts only after enough labelled purchase history exists and accuracy can be measured against a baseline.

## Validation

Eight analytics regression tests cover revenue, dates/bucket totals, deduplication, observed conversion, RFM, size stock, inactivity and zero-result search. The full suite contains 33 passing tests. Type checking and production build pass. Existing bundle/import warnings remain; production database permissions and delivery integrations were not exercised.

Browser checks covered widths 320, 375, 768, 1101 and 1440 with no document/header horizontal overflow. Admin search returned matching products; Ctrl+K focused search. Period selection, visitor/RFM, demand, error-log tabs and mobile menu were exercised. No browser console errors were captured in the fresh preview. Real-device Safari/Android testing and populated production dashboards remain unchecked.
