# Maintenance editor and preview refinement

## Changes
- Added a dedicated full-screen maintenance preview in General Settings. It renders the current draft messages even with maintenance switched off and never saves or activates maintenance.
- Redesigned the editor with multiline bilingual fields, character counts, an explicit post-save state and a prominent preview action. Existing published state, draft cancellation, validation and save acknowledgment remain unchanged.
- Rebuilt the actual MaintenanceScreen and reuse it in preview: restrained VANT identity, responsive editorial layout, static brand artwork, light/dark appearances and configured messages. Removed unsupported 24-hour service, location and product claims.
- Maintenance contact follows the WhatsApp master switch and a valid configured phone; there is no invented fallback. Preview contact cannot send or open a message. Staff login is only available in actual maintenance mode and keeps the existing unlock/bypass callbacks.
- Preview uses a portal, Escape and keyboard focus trapping/return. Long notices scroll within the preview; its close controls stay visible. Preview uses no authentication actions.
- Refined splash layout into a single balanced brand panel with integrated motif and indeterminate progress. Preserved actual-data readiness, replay, reduced-motion support and focus/scroll cleanup. Preview controls remain accessible on narrow or short screens.

## Verification
- 108 automated tests passed, including missing/invalid maintenance phone and disabled WhatsApp cases. TypeScript and production build passed.
- Browser: verified current draft text appears before saving, maintenance toggle remains a draft, cancellation restores original messages and the final save button is disabled.
- Preview checked at 320×740, 768×1024, 740×360 and default 1101×892; no horizontal overflow in measured previews. Tested light/dark, Escape, focus return and loader presentation.
- A 600-character notice produced a vertically scrollable phone preview. PageDown moved the preview to scrollTop 353; close header stayed at top 0. No content was cut off.
- Test drafts cancelled; no valid settings saves, live maintenance activation, credential submissions or contact messages performed.

## Limits
- Actual maintenance activation and staff sign-in were not exercised on the live store. Their existing callbacks remain connected.
- Physical devices and all browser engines were not tested. Existing production bundle/import warnings remain outside this change.
