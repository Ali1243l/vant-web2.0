# Seasonal banner themes — 2026-10-29

The banner editor now opens on a theme library grouped into Seasons, Occasions and Offers. It includes twelve bilingual presets: winter, spring, summer, autumn, New Year, Ramadan, Eid, holidays, back to study, weekend offers, White Friday and season finale.

Selecting a preset stages appearance changes and brings the admin to the preview. Choose another theme returns to the filtered library. Replacing bilingual headline, description, badge and button text is explicitly optional and off by default. Images, crop, visibility, products, prices, welcome settings and existing seasonal cards remain unchanged. Theme fade colors, stops and direction are intentional preset values; the admin can customize them afterward.

The existing validated appearance record stores a motif, accent color and bounded decoration opacity. Both storefront and admin preview render these through the same HeroBannerBackground component. Legacy configurations default to no motif. Decorations are static, aria-hidden, ignore pointer events, and use the installed icon library without extra image downloads or animation. Removing decoration is available alongside its color and opacity controls.

No automatic scheduling or discount generation is included. Presets contain no fabricated discount amounts or expiry dates. Publish explicitly through the existing banner Save action; discard and unsaved-navigation protection remain available.

## Verification

- `npm run check`: type check, 79 tests and production build. Three new tests exercise all twelve presets through the shared save validator, bilingual content completeness, style-only scope preservation, preset fade restoration, unknown motif rejection, unsafe color rejection and opacity bounds.
- Browser: style-only Winter retained existing copy; opting into copy switched Ramadan text in Arabic and English. Live storefront motif count remained zero during draft editing. Theme filters, Enter-key selection, preview navigation, no-decoration selection, and Home/End opacity changes worked.
- At 320, 768, 1024 and 1440 viewport widths, the banner editor's scroll width equaled its available width. Checked dark/light preview and mobile presentation. Saved mobile and desktop screenshots outside the repository.
- No successful configuration save, actual discount, upload or message send was used during QA. Cloud persistence and physical-device testing were not exercised. Existing build chunk warnings remain.
