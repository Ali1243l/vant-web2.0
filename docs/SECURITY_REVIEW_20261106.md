# Security and diagnostics review — 2026-11-06

- Applied `diagnostic_access_hardening`: visitor telemetry types, dimensions, identifiers, time and JSON size are bounded. Anonymous execution of `is_admin` and email-only unsubscription is revoked; authenticated administration remains available.
- Applied `storage_activity`: acknowledged `product-images` object insert/update/delete events use the existing protected activity trigger. File history contains names and metadata, **not JSON file contents**. The eight public-table triggers retain real before/after row values with secret fields redacted.
- Ran `supabase/tests/diagnostic_access_hardening.sql` on the connected project. Successful audit capture, unchanged-update suppression, before/after data, timestamps and secret redaction passed. Valid anonymous telemetry was accepted; invalid types and oversized JSON were rejected. Everything was rolled back.
- Anonymous HTTP reads returned no logs, admins, orders or subscribers; activity access was denied. Catalog remained readable. No service-role key was found in the deployed entry script (not an exhaustive secret scan).
- Error capture now has one listener installation, React fallback, resource/rejection capture, sanitized paths/credentials, bounded breadcrumbs, device/browser/OS/viewport/release/context and an offline delivery queue. A hint is explicitly a hypothesis, not a proven cause. Status changes require a database acknowledgment.
- Removed new public telemetry snapshot writes. The two explicitly approved legacy objects were deleted through the authenticated Storage API; both metadata absence and two real DELETE activity entries were verified. No original database records or catalog images were deleted.
- Corrected `site_settings` saves to the actual `id/settings/updated_at` schema. Database and Storage mirror are separate writes, so a mirror failure is reported and may follow an already committed database change.
- Added a direct **سجل الأخطاء** navigation entry. **سجل النشاط** remains the separate change history. Cloud file records do not provide per-button/theme JSON diffs; local drafts, login attempts and failed writes are outside successful-change history.
- Local UI checked at 390/1440 widths; generic React failure checked at 320 without horizontal overflow or private sentinel exposure. This is browser emulation, not physical Safari/Android testing.
- 199 tests and TypeScript passed; production build passed after correcting mixed encoding in two navigation labels. Native production dependency audit reported zero known vulnerabilities.

## Published verification and follow-up — 2026-11-07 Baghdad

- Vercel successfully published `f7088e5`. All four configured security headers were present on the production response; anonymous access remained restricted.
- A safe diagnostic from the published admin UI arrived in `logs` with Chrome/Windows, viewport, timestamp and exact release. Setting only this diagnostic to resolved was acknowledged and verified in SQL.
- A maintenance-message punctuation change was saved while maintenance remained OFF, then the original text was restored. Both actual settings updates were audited. No storefront maintenance interruption occurred.
- File audit entries show the actual Storage service actor when no user JWT reaches the database; they must not attribute the operation to an invented administrator.
- Applied `storage_activity_filter` and executed the SQL self-check: access-timestamp-only writes create no audit event, but a metadata edit creates one. Both tests rolled back.
- Follow-up UI shows file names in activity cards and uses an inline two-step permanent-removal confirmation instead of a native browser confirm dialog that timed out during automation.

## Limits

Error collection begins after JavaScript initializes. Offline delivery is best effort and capped at 50 entries per device. Browser extensions, disabled storage, closed tabs, manipulated clocks, blocked requests and server failures need independent monitoring. Legacy public snapshots can remain in external caches until expiry. No real order or email was sent.
