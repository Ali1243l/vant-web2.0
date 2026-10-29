# Store controls review — 2026-10-30

## Scope and behavior

The old controls screen published on each keystroke/toggle, conflated visibility with enablement, included simulated button previews and exposed structured banner settings as generic values. The replacement uses a searchable registry, eight functional groups, state filters, a selected-element editor and an explicit before/after review before publishing. Bulk actions apply only to matching switchable elements; phone numbers and dedicated theme/image settings are excluded. Returning a value to its saved state removes its draft patch. Single-element reset is also staged; there is no blanket reset that erases custom themes.

The shared control model validates field ownership, booleans, text limits, international phone syntax and registered IDs. It rejects metadata changes, prototype keys and arbitrary structured-config edits. New controls can save using default metadata in older sessions. State-only newsletter changes preserve legacy settings copy; an explicit copy edit records a label override.

Actions remain visible but inactive when disabled, using native disabled buttons or disabled links without destinations. Non-interactive features/content stop rendering through the shared resolver. Existing readers for hero content, card data, animations, newsletters, brand/footer output and badges now observe both flags. Header/search/wishlist/cart, category/availability/offer controls, product utility actions, fit guide, gallery arrows, WhatsApp links and back-to-top received corresponding interaction guards. Active search/cart/fit/share interfaces close when their controlling function is turned off. Gallery swiping and basic close/back navigation remain available; this avoids trapping visitors.

Added controls cover cart WhatsApp confirmation, newsletter signup and a WhatsApp master switch. The master inhibits product inquiry, cart confirmation and bespoke links across groups without overwriting per-button states or stored phone numbers. Dependency notices identify cart/favorites access conflicts. Configured copy now reaches previously hardcoded labels, including product cart/inquiry, bespoke inquiry, header accessibility labels, availability and gallery navigation. Long labels are bounded/wrapped/truncated in constrained slots. Preview controls explicitly describe themselves as copy/state illustrations and never send messages or execute store actions.

`saveControlEdits` sends one validated changed-control patch, waits for cloud acknowledgment, or writes local storage before applying local state. Failures retain the draft. Other configuration remains unchanged; the provider merges changed controls into current state. Navigation and browser-unload draft protection also cover this screen.

## Verification

- `npm run check`: type check, 95 tests and production build passed. Eight new tests cover registered-control state matrices, narrow save scope, unsafe IDs/fields, phone normalization, group operations and undo, search/state filters, dependencies, newsletter compatibility and WhatsApp master inheritance.
- Browser QA verified a disabled cart-button draft left the published cart button enabled; its illustration was disabled and a dependency notice appeared. The review sheet displayed before/after enablement without publishing.
- Verified master-off inheritance in a cart-confirmation illustration, pristine undo, four-element cart bulk disable/re-enable, empty-copy rejection, invalid phone rejection, English admin UI, and mobile navigation confirmation preserving draft copy.
- At 320, 768, 1024 and 1440 pixels, the editor had equal client/scroll widths. An 80-character unbroken test label initially revealed a mobile preview overflow; the preview and constrained storefront labels were corrected and the 320-pixel check passed.
- Final drafts were discarded; no valid configuration save, cart mutation, email, WhatsApp message or order was performed during browser QA. Screenshots are stored outside the repository.

## Limits

Cloud persistence and actual published disable/enable flows were not exercised against live settings during QA. Shared control behavior is covered by pure tests plus source/interaction review; physical devices and every browser engine were not tested. These controls configure the storefront UI and are not a replacement for backend authorization. Existing configuration concurrency behavior and build chunk/import warnings remain.
