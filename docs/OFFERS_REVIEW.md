# Offers and fit-result review — 2026-10-29

## Scope and behavior

- Fit-result cards use VANT blue accents and neutral surfaces for both matches and no-match guidance, with a separate result label, readable explanation and touch-sized action. Size recommendation rules are unchanged.
- Rebuilt campaign administration with title/code search, effective-state filtering, an empty state, edit/create sheets, separate pause/resume and delete confirmation, optional start dates, minimum spend and planned usage limits, and an IQD arithmetic preview. The old fixed expiry and false free-shipping template were removed. Errors clear when fields change, and input/actions lock during a save. Only the explicit footer Save action persists; Enter/date-picker submission does not save.
- Effective state derives from validated dates, discount rules, reported use counts and pause intent: active, scheduled, paused, expired, exhausted or invalid. Date-only expiry includes the full day in Baghdad. Invalid dates, duplicate codes, malformed amounts, percentages outside (0,100), fractional fixed IQD/limits and reversed periods are rejected.
- Preview enforces the recorded minimum and validity, caps fixed discounts at the subtotal and never produces a negative total. Product campaign pricing rechecks eligibility, uses the existing 250-IQD percentage-price rounding, rejects free/non-discounted results, and refuses campaigns with cart minimum/usage conditions that product prices cannot enforce. New campaign references use the unique code; legacy titles and badges remain readable.
- Coupon links no longer store an unverified applied coupon or claim a cart discount. Their notice explicitly identifies a code supplied by the link, without asserting validity or changing totals. Email sending, checkout and order handling were not changed.

## Persistence decision

The complete existing `config/offers.json` snapshot is now authoritative for this application's campaign records. The SQL reader previously discarded optional rules and could resurrect deleted records because saves only upserted existing rows. Saves now retain the whole record/list, including an empty list; a successful upload is required before local state changes when Supabase is configured. Errors keep the form open and data unchanged. With no cloud configuration, the UI explicitly reports local-only persistence. Same-session writes are serialized; a late initial load cannot overwrite a completed local edit.

The legacy SQL table is read only when the canonical snapshot is absent (404). A failed, malformed or temporarily unavailable snapshot does not fall back to stale SQL data. No SQL migration, SQL deletion or live cloud write was performed during this review. Other external consumers reading the old SQL table will not receive new campaign edits from this client; they must migrate to the canonical source or a future transactional campaign API.

## Validation

Nine new regression tests cover Baghdad boundaries, effective states, validation, duplicate codes, minimum spend, fixed-discount capping, product campaign eligibility, numeric parsing, metadata preservation and cloud save/read failure paths. Full suite: 69 passing tests; type check and production build pass. Existing large-bundle and storage dynamic-import warnings remain.

Browser checks covered blank/invalid percentage/limit/date rejection, error clearing, Arabic numeric input, percentage/fixed/minimum preview, filters/reset, English rendering, and layout at widths 320/375/768/1101/1440. Keyboard changing the end date to before the start was rejected. Enter with otherwise valid fields and interacting with the date field no longer creates a record. Fit no-match cards showed no horizontal overflow at widths 320/375/768/1101; the active local preview remained dark despite the theme toggle, so actual light-theme rendering was not established. Coupon-link text was verified to say that no cart discount was applied.

One LOCAL-CHECK record was inadvertently saved locally while testing a date field before implicit form submission was removed. It was deleted through the normal confirmation UI after explicit user approval; the list returned to zero and remained empty after reopening administration. No product price, order, email or cloud record was changed. Actual cloud writes, other browser engines and physical devices were not exercised. Campaign card actions were available on the short-lived local record, but real multi-record campaign operation was not comprehensively exercised.

## Next work before operational redemption

Coupon codes and usage limits are campaign metadata, not server-enforced checkout rules. Recorded use counts are not a verified redemption ledger. Product discounts applied earlier remain independent prices and are not automatically undone when a campaign expires, pauses or is deleted; this is stated in the UI.

A production coupon service should validate totals on the server, enforce unique codes and usage atomically, record order-linked redemptions and reversals, and define stacking rules. For product campaigns, persist a campaign ID and explicit expiry/application policy. Snapshot writes still have last-writer-wins behavior across different administrators; transactional/versioned persistence and access-policy verification are separate backend work. No automated expiry job or live checkout integration was enabled.
