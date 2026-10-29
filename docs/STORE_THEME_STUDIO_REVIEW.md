# Store identity, custom themes and banner destination — 2026-10-30

## Behavior

- The banner editor separates preset themes, store identity/custom themes, copy/visibility, image/appearance, banner destination and seasonal cards. All publish through the existing explicit Save action. Drafts remain local and Discard restores saved settings.
- Selecting a built-in theme now stages a coordinated light/dark store palette as well as the banner appearance. Global identity can be disabled independently. Existing installations default to the original store appearance until the admin enables identity or selects a preset.
- Palette controls cover page/panel backgrounds, primary/secondary text, accent and borders in both modes, plus card corners, catalog spacing and button shape. Text/background combinations must meet 4.5:1 contrast before publishing an enabled identity. Button text chooses black/white automatically; link/price text falls back to readable primary text when a pale accent lacks contrast.
- Store styles use explicit markers for the toolbar, category tabs, product cards, catalog spacing, main buttons, footer, newsletter, search, cart and product panels. Root variables also reach portaled product panels. Product photography and the admin UI are not recolored; semantic statuses and independent hero fade settings remain separate.
- Custom themes capture bilingual banner copy, image, fade/decorations and full store palette/layout settings. Up to twenty named themes can be staged, loaded, replaced or removed from the library. Removal is reversible with Discard until Save. The library does not capture banner destinations or unrelated configuration. Unsafe image sources, oversized registries and invalid theme records are rejected. Data images use the existing uploader when the library is explicitly saved.
- Banner destination supports all offers, selected offers or selected products (up to 200 IDs). Selected offers require the current catalog offer flag; selected products may include regular-price pieces. Coupon campaigns and prices are not edited by this selector.
- Customer navigation resets incompatible filters, shows a banner-selection indicator and provides a full-collection reset. General Offers/category navigation clears the banner-specific selection. Missing/deleted selections never broaden to unrelated offers.
- Empty selected results can advance catalog pages. Automatic attempts are keyed to the loaded set to avoid repeatedly retrying a failed page, with an explicit retry button. Normal pagination handles subsequent visible results. The admin selector also allows loading more catalog rows and removing missing IDs explicitly. Product search now includes SKU.
- Default control metadata is merged when drafting/saving newly introduced controls, including older open sessions. Theme names being edited survive navigation between banner-editor sections.

## Verification

- `npm run check`: type check, 87 tests and production build. Added coverage for palette validation, safe normalization, all preset palettes, mid-gray button contrast, destination scope/IDs, missing products, pagination request keys, custom-theme snapshots/limits, old-session controls and SKU search.
- Browser: selected a single offer and verified its count; an empty selected destination was rejected before persistence. Tested custom-theme draft creation, loading, replacement, removal, restoration of card radius from a saved snapshot and retaining its name across tabs.
- Identity and destination sections had equal client/scroll widths at 320, 768, 1024 and 1440 pixels. Checked light/dark palette previews and phone layout. Runtime error inspection found no captured uncaught/type/reference errors in the inspected entries.
- A summer preset staged global identity while the published document had no active global-theme attribute, confirming drafts did not publish. Final Discard disabled Save, preserved the live banner title and left no test theme. No successful configuration save, upload, message, order or price mutation was used in browser QA.

## Limits

Cloud persistence, real multi-page Supabase failures and physical devices were not exercised end to end. Palette contrast and destination filtering are tested as shared pure logic; the live store was not republished during QA. Concurrent admins remain subject to the existing configuration merge behavior. An uploaded asset may remain unused if a later configuration save fails. Existing bundle-size and storage-import warnings remain.

Themes intentionally use structured controls instead of arbitrary CSS/HTML. They do not schedule events, invent discounts, create coupon campaigns or send WhatsApp messages.
