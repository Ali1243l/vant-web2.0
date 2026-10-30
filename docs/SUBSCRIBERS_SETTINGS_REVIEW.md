# Subscribers and general settings review

## Changes
- Responsive subscriber directory: mobile contact cards, desktop table, accessible search/filter/delete controls, aligned navigation and touch targets.
- Campaign audience excludes unsubscribed and invalid addresses and deduplicates normalized emails, including VIP selection.
- Removed simulated dispatch, random open/click rates, fake test-send success, example product prices, and fictional sender address. Automated email remains disabled. BCC opens a manual draft only, validates an empty audience and URL length, and never creates a delivery record.
- CSV/Excel/clipboard neutralize spreadsheet formulas. HTML exports escape contacts and nested product values; campaign links reject non-web protocols. Clipboard success waits for completion.
- Admin subscriber mutations await database acknowledgment, keep name/phone in versioned notes metadata, preserve tags, reject duplicates, and update UI after success. No new public subscriber backup is written by these admin mutations. Offline mutations persist locally and report storage errors.
- Subscriber order count and spend derive from delivered orders matched by normalized email. Orders with no matching email are intentionally not attributed.
- General settings use the real settings schema and real splash renderer with eight supported motifs. Removed unwired domain/ETA/duration fields; identity remains in Store elements.
- Maintenance is staged until Save; published state is shown separately. Cancel, navigation protection, unload warning, validation and retained drafts on failure are present.
- Shared checkbox no longer invokes its toggle twice. Shared settings persistence checks database errors before publishing state; related save callers no longer display success when it returns false. Extended settings also require config storage acknowledgment.

## Verification
- TypeScript, 102 automated tests and production build passed.
- Browser checked at widths 320, 390, 768 and default 1101: main content does not overflow at tested mobile/tablet sizes.
- Checked settings preview/close, maintenance draft and keyboard toggle, cancel, leave-with-unsaved-draft dialog, whitespace validation without a write, subscriber form/cancel, campaign draft options, empty audience rejection, history unavailable telemetry, and real CSV download with an empty directory.
- Test drafts were cancelled. No customers were created/deleted, no valid settings saves were submitted, and no emails or WhatsApp messages were sent.

## Limits
- Physical iOS/Android devices and all browser engines were not tested.
- Live Supabase writes, schema compatibility and policies were not exercised during this read-only QA. Subscriber writes require newsletter_subscribers notes/tags fields and authorized access. Failed or denied writes remain visible as failures.
- Automated email delivery and delivery/open/click telemetry are intentionally not enabled by this change.
- Legacy storefront newsletter cloud-storage fallback remains outside this UI review; review its data-access policy before using real customer data.
- Existing large-chunk and mixed dynamic/static import build warnings remain.
