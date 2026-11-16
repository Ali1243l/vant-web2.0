# Shared shopping state — 2026-11-16

Implemented on main; cloud activation is pending Supabase recovery. The owner confirmed the project remains stopped. No production migration or customer data changes were made.

## Behaviour

- One shared cart/wishlist/coupon store. Product + size + variant form one cart line; quantity changes keep its position. Existing local cart/wishlist are imported once.
- Local durable outbox, 500 ms batching, serial requests, immutable operation IDs, retries with backoff and explicit save/offline/failure status. Five clicks produce one sync batch, containing five individually deduplicated changes.
- Verified email magic-link sign-in merges a guest list once. Existing account items remain; quantities add up to 99. Guest additions made while login is in flight remain locally. If the account already has a coupon, it wins; otherwise the guest code is carried over and revalidated.
- Account ownership changes isolate caches; late responses from an old account are ignored. Same-browser storage events reconcile pending operations. Visible signed-in clients poll every 30 seconds and refresh on focus/reconnect. No constant guest polling.
- A cached account list can be displayed after an offline reload; this does not authenticate the user. The server still verifies each authenticated request. A successful sign-out switches back to the guest cache.
- Deletion wins over an older increment. Deliberately adding a removed item can restore it. Conflicts and quantity caps are visible.
- Latest server product data validates price, variant, size and stock. Changed prices require acceptance; missing/sold-out items block checkout until removed/corrected. Coupons are checked against current rules. Failed verification blocks final review and retains the list.
- WhatsApp remains a manual confirmation flow: a saved draft or opened link neither reserves inventory nor redeems a coupon. Atomic redemption/reservations require a real confirmed-order transaction; they are not represented as completed here.

## Security

- Customer SDK is separate from admin SDK and does not persist its tokens. The same-origin customer endpoint exchanges the verified login for HttpOnly, SameSite=Lax cookies (Secure in production). Responses never include credentials. POST checks Origin; all responses use no-store.
- Private shopper tables have RLS, no direct visitor/customer table grants, and an ownership-checked function for verified customers. Server row locking serializes batches; receipts prevent duplicate application after retries. Cached prices are never authoritative.
- No service-role key is needed in the browser or endpoint. Link requests first check migration readiness; stopped/unmigrated projects do not trigger sign-in mail. Marketing consent is independent.
- Handled storage/network failures feed the existing diagnostics with operation context. Diagnostics have a recursion guard; malformed JSON reporting omits raw cached content.

## Limits and cost

- Cart: 200 distinct lines; quantity: 99 per line; wishlist: 2,000; pending operations: 2,000; request batches: 200. Oversized combined account/guest lists remain unconfirmed, rather than silently discarding items. These are bounded-list guarantees, not an unrestricted collaborative document protocol.
- Catalog merging uses Map in O(n+m), including duplicate incoming IDs; membership uses Set average O(1). Keyset pagination avoids growing offsets. Filtering is O(n), sorting O(n log n); snapshot creation and JSON persistence cost O(cart + wishlist + pending), not O(1). Clearing the cart persists once instead of once per line.
- Receipts and deletion markers are intentionally retained to protect long-offline retries. Before large-scale operation, define retention together with a client epoch/expiry protocol; blindly deleting receipts would re-enable duplicate replay.
- Browser caches are device-local data. A fully uncached offline visit cannot fetch unseen images/products. No claim of identical wall-clock speed across hardware or browsers is made.

## Evidence

- Full TypeScript/test/build check; shopper tests cover batching, retry/restart, separate devices, merge, old-account responses, stale deletion, storage failure, offline cache restoration, simultaneous guest additions and one-write cart clearing.
- Catalog ID-read counts checked equally at 10 / 1,000 / 10,000 rows: one existing-row ID read each. This is a deterministic work-count comparison, not a fabricated timing benchmark.
- Private schema/function tested against disposable local PostgreSQL (PGlite), including ownership, direct-table denial, retry receipts and conflict behaviour. No live database migration was attempted after the owner confirmed the outage.
- Isolated Edge browser UI at 320 / 390 / 1440 px: no horizontal overflow, price/stock changes block correctly, unavailable service is explicit, account form fails safely, zero page errors. Quote responses use local fixtures; no real mail or order was sent.
- Production dependency audit returned zero reported vulnerabilities. Build retains its existing large-chunk warning.

## Activate after Supabase returns

1. Apply `supabase/migrations/20261116_shopper_state.sql` using the administrative connection. Review it first; it creates only the two private shopper tables and related functions.
2. Add `https://vant-web.vercel.app/?shopper=1` to Authentication redirect URLs. Keep the existing recovery redirect.
3. Verify magic-link delivery and both deployed endpoints, then test the same verified customer on two real devices, including interrupted responses, logout, price changes, stock and coupon rules. Check activity/error records with the real RLS environment.
4. Confirm the deployment has the existing Supabase URL/anonymous key available to server functions (VITE_ fallbacks are supported); never use a service-role browser key.

Not checked: live cloud round trip while paused, physical iOS/Safari, sustained concurrent production load. Do not call cross-device sync live until these activation checks pass.
