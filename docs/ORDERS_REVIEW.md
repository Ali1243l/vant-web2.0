# Orders review — 2026-10-28

## Implemented behavior

- Both stages and table include cancelled orders. Filters cover status, type, search and inclusive creation dates; sorting and pagination reset predictably after filtering.
- Metrics follow the filtered records. Revenue counts delivered order totals only and does not claim payment has been collected. Delivery/discount breakdowns remain unknown when the source does not supply them.
- Shared normalization handles SQL/local aliases and serialized item/history arrays. Missing IDs, invalid amounts and unknown statuses are excluded; missing dates remain unknown rather than becoming today. Valid empty SQL responses do not resurrect old fallback files.
- Details follow the current order by ID, so status, notes and history update together. Terminal statuses cannot move backwards; cancellation needs a reason.
- Removed unsupported royal/atelier/version marketing, unrelated store branding, invented contact/address details and free-delivery claims. Summaries escape source text and preview inside the panel before manual printing.
- The details panel supports scrolling, keyboard focus containment, Escape and focus restoration.

## Current save behavior

The isolated demo button, data, banners and print wording were removed from the shipped order interface. Fictional fixtures now exist only under tests/ and are not bundled into the app.

Status and note controls await confirmed persistence. Without a configured cloud client, local storage must succeed before React state changes. With a configured cloud client, saves target one SQL row: read the latest row, reject changed status, conditionally update against the observed status plus history/details snapshot, and require a returned row confirming the requested value. Failed, denied or conflicting writes do not show success. Unknown server fields in bespoke details are preserved. Buttons block repeat submissions and feedback remains visible in the footer. Order updates no longer bulk-save the whole list or upload the public Storage file.

No actual order was created or modified during verification. Legacy order creation and fallback readers remain outside this save path and need a separate production review.
## Validation

Six order regression tests cover normalization, invalid data, date boundaries, combined filters, delivered revenue, state transitions, fixture isolation and print escaping. Full type checking, 45 tests and production build pass. Existing large-bundle/import warnings remain.

Browser checks exercised demo status and note changes, cancellation validation, terminal states, copy feedback, Escape/focus cycling, table pagination, Arabic-digit search and filter clearing. Widths 320, 375, 768, 1101 and 1440 had no document/header horizontal overflow. Embedded print preview was opened and its VANT heading verified; physical printing was not performed. Real devices and production persistence were not tested.

## Required before live order operations

1. Verify production authentication/RLS and add a server-authored actor/timestamp audit trail. Current conditional SQL saves guard conflicts, but the real schema, policies and database triggers were not exercised; their failures will be shown to the administrator.
2. Keep customer/order information in private storage with tested access rules. Review the existing legacy public Storage fallback before putting real customer data into it.
3. Store payment collection, delivery fees, discounts, refunds and carrier tracking separately. A delivered status alone cannot establish paid revenue or a courier integration.
4. Add server pagination and an audit trail before large datasets or multiple administrators. Automated delivery and customer messages require a separately configured and tested integration.

Final recheck: Arabic/English labels, display switching, status/type/sort/search controls, date application and clear filters were exercised without creating records. Widths 320/375/768/1101/1440 had no document overflow and no demo wording. Mocked save tests cover read denial, write denial, unchanged responses, concurrent changes and preservation of source fields. Physical printing and live SQL writes remain untested.
