# Banner and welcome editor review — 2026-10-29

## Changes

- Banner editing now has three sections: copy/visibility, image/appearance, and existing seasonal cards. Arabic/English content selection is separate from the admin interface language.
- Edits remain local React drafts until explicit Save. Discard restores saved content. Sidebar/page-tab navigation asks before discarding a draft; browser unload also warns. Closing the entire admin overlay was not verified.
- Image selection validates type, size and decoded dimensions, then optimizes locally. Upload occurs only on Save. Existing shared hero rendering and fade settings remain available with phone/desktop and light/dark previews. Device opacity presets affect the selected preview device only.
- Banner save validates the allowed control/card fields and sends one configuration update after image uploads. Local-only storage attempts rollback on a partial write failure. Unrelated controls, card category mappings and card order are preserved.
- Welcome editing is dedicated to popup visibility, bilingual copy and displayed coupon values. It no longer embeds campaign/email tools. The page describes the actual after-newsletter-signup trigger and makes clear that displayed coupon values do not create a discount campaign.
- Welcome delivery settings are excluded from the patch. Its existing updater applies optimistically and syncs in the background; the UI does not claim cloud confirmation.
- Context identity is retained during development hot reload to avoid provider mismatch errors.

## Verification

- `npm run check`: type check, 76 tests and production build passed. Seven new tests cover scoped patches, unsafe images, text validation, fade normalization, upload admission, welcome validation and partial local-storage failure.
- Browser checks at 320, 375, 768, 1101 and 1440 pixels found no editor horizontal overflow. Checked Arabic/English content selection, local title preview, unchanged live storefront while drafting, discard, pristine disabled Save, invalid empty banner title and invalid welcome percentage.
- Verified light preview, mobile-only opacity preset changes without desktop changes, fade detail expansion, and navigation confirmation preserving draft text when choosing Keep editing.
- No successful live settings save, cloud upload, email send or order action was performed during QA. Seasonal cards were empty in the current configuration; card merge behavior was tested with fixtures.

## Limits and follow-up

- Cloud persistence/upload failure integration and physical devices were not exercised. An uploaded image may remain unused if the later configuration save fails; automatic media cleanup is not implemented.
- Existing welcome synchronization remains optimistic, and concurrent administrator edits are not conflict-resolved.
- A fresh preview was restarted after the continuation found localhost stopped. Earlier responsive checks remain the evidence for the unlocked editor; a fresh unlocked-admin visual pass was not repeated after restart.
- Existing bundle-size and storage dynamic-import build warnings remain.
- Coupon/order/WhatsApp integration is deferred by the user's explicit choice to finish banner and welcome first.
