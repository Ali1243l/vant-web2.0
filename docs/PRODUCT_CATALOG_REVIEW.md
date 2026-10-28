# Product catalog review — 2026-10-28

## Changes

- Reworked the header, compact metrics, labelled filters, collapsible selling-price filter, table and cards. The same preview/edit/offer/copy/duplicate/delete controls are available in both views with touch targets and accessible names. Removal names the selected product.
- Search trims whitespace and covers Arabic/English names, SKU and ID. Price filtering/sorting uses a valid active sale price. The price ceiling follows loaded products rather than silently excluding prices over 500,000 IQD. Changing filters resets pagination.
- Metrics follow filtered results. Missing stock is unknown, not an invented 25 units; partial/malformed color stock is not a trustworthy total. Recorded zero stock maps to sold-out availability; coming-soon intent is preserved. Sales ranking counts delivered item quantities.
- Offer removal restores the regular price and clears obsolete badges. Category plans validate every target price before applying and honor fixed campaign discounts. Category-wide actions are blocked until the whole catalog is loaded; a load-more control identifies partial coverage.
- Product links use the real `?item=` route and open the selected storefront drawer. Clipboard failure is no longer reported as success.
- Duplicate opens a new form with copied images, variants and sizes and a new SKU; no product is created until the user saves. New products start without fictional stock or sample images. Invalid prices, discounts and stock quantities are rejected before uploads; missing-name errors are visible.
- SKU, stock and Arabic description are retained through the existing enhancement metadata. Partial metadata edits preserve unrelated fields. Arabic and English product titles remain separate. Unsupported draft publishing controls and sample-photo buttons were removed. Color grouping is described as an approximate suggestion requiring review, not calibrated AI/background isolation.

## Validation and limits

Seven new regression tests cover selling-price filters, offer removal, unknown stock, numeric validation, availability, category offer planning, links and partial metadata preservation. The full suite has 52 passing tests; type checking and production build pass. Existing bundle-size/import warnings remain.

Browser checks exercised search, availability filter, clear filters, table/cards, copy feedback, duplicate-form prefilling, opening/cancelling edit/offer/delete dialogs, empty-form validation and Arabic/English rendering. The copied preview URL was opened and the expected product drawer appeared. Widths 320/375/768/1101/1440 showed no document/header overflow. No product was saved, discounted, deleted or uploaded during verification. Physical devices, real uploads, translations and production CRUD were not exercised.

## Backend follow-up

The existing catalog writer updates local state and syncs SQL/media in the background. This review does not certify transactional cloud persistence, deletion rollback, multi-admin concurrency or access policies. Stock/SKU enhancement metadata is not a server inventory ledger. Before operational use, add authoritative SKU/stock fields, per-size/color stock movements, verified save acknowledgements and transactional media/order dependencies. Bulk offer prevalidation is not a database transaction. Historical partial metadata already lost before this fix cannot be reconstructed automatically.
