# Orders review — 2026-10-28

## Implemented behavior

- Both stages and table include cancelled orders. Filters cover status, type, search and inclusive creation dates; sorting and pagination reset predictably after filtering.
- Metrics follow the filtered records. Revenue counts delivered order totals only and does not claim payment has been collected. Delivery/discount breakdowns remain unknown when the source does not supply them.
- Shared normalization handles SQL/local aliases and serialized item/history arrays. Missing IDs, invalid amounts and unknown statuses are excluded; missing dates remain unknown rather than becoming today. Valid empty SQL responses do not resurrect old fallback files.
- Details follow the current order by ID, so status, notes and history update together. Terminal statuses cannot move backwards; cancellation needs a reason.
- Removed unsupported royal/atelier/version marketing, unrelated store branding, invented contact/address details and free-delivery claims. Summaries escape source text and preview inside the panel before manual printing.
- The details panel supports scrolling, keyboard focus containment, Escape and focus restoration.

## Experimental boundary

Loaded orders are read-only in this interface. The isolated demo contains 12 fictional orders in component memory. It never calls add/update/persistence functions and never sends email or WhatsApp messages. Leaving the demo or reloading discards its changes. Existing provider write functions remain outside this UI and were not exercised or certified for production.

## Validation

Six order regression tests cover normalization, invalid data, date boundaries, combined filters, delivered revenue, state transitions, fixture isolation and print escaping. Full type checking, 41 tests and production build pass. Existing large-bundle/import warnings remain.

Browser checks exercised demo status and note changes, cancellation validation, terminal states, copy feedback, Escape/focus cycling, table pagination, Arabic-digit search and filter clearing. Widths 320, 375, 768, 1101 and 1440 had no document/header horizontal overflow. Embedded print preview was opened and its VANT heading verified; physical printing was not performed. Real devices and production persistence were not tested.

## Required before live order operations

1. Replace bulk order/file persistence with authenticated, per-order server writes that atomically record the transition, actor and timestamp; detect concurrent edits and report failures before confirming a save.
2. Keep customer/order information in private storage with tested access rules. Review the existing legacy public Storage fallback before putting real customer data into it.
3. Store payment collection, delivery fees, discounts, refunds and carrier tracking separately. A delivered status alone cannot establish paid revenue or a courier integration.
4. Add server pagination and an audit trail before large datasets or multiple administrators. Automated delivery and customer messages require a separately configured and tested integration.
