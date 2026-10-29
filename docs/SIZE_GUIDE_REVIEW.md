# Size guide and calculator review — 2026-10-29

## Changes

- Replaced the oversized manager with a compact responsive view: enabled/hidden totals, trimmed search across ranges and bilingual notes, optional customer chart preview, a local calculator check, labelled touch actions, and shared accessible sheets for add/edit/delete/reset.
- Height/weight range text is generated from numeric bounds in administration and the storefront. Invalid numeric ranges, blank labels and case-insensitive duplicates are rejected before applying changes. Sorting accurately sorts by minimum weight then minimum height; manual order no longer affects recommendations.
- The recommender requires both dimensions to be within an enabled, valid row. Overlapping matches use the sum of normalized distances to both range centers, with a stable label/ID tie-break. This is a transparent heuristic, not a trained or calibrated fit model. Empty/all-disabled guides return no match instead of crashing or silently restoring defaults. Cloud hydration now honors an explicitly empty size guide.
- Removed BMI-based decisions, extrapolation and unverified claims that a customer requires bespoke tailoring. No match means compare garment measurements or ask the store, never an invented size. A match only means the configured ranges contain both numbers.
- Calculator text accepts Arabic, Persian and English digits, a dot or Arabic decimal separator, and up to two decimal places. It rejects exponent notation, signs, units, mixed junk, nonfinite values and inputs outside the existing 120–220 cm / 30–200 kg domain. It never silently strips letters into a different number. Plausible numbers cannot reveal whether a person entered truthful measurements.
- Storefront recommendation and chart selection respect the selected product/color's available sizes and sold-out state. Keyboard-accessible size buttons replace pointer-only table rows. Chart ranges explicitly use LTR numeric direction in Arabic. The measurements inquiry link asks for garment dimensions and no longer embeds the customer's height/weight or presumes a bespoke request.

## Verification

Eight regression tests cover matching boundaries, missing/disabled/malformed rows, invalid inputs, overlap resolution, display-order independence, validation, generated range text, custom sizes and localized decimal parsing. Full suite: 60 tests, type check and production build pass; existing bundle-size and storage import warnings remain.

Browser checks: search with surrounding spaces, empty results, preview on/off, matching 175/70 and nonmatching 175/80, Arabic digits, invalid text, add form rejection of blank/duplicate labels and inverted bounds, edit prefilling/cancellation, and delete/reset confirmation cancellation. Manager and editor were checked at widths 320/375/768/1101/1440; no horizontal overflow. The storefront rejected `17x5`, accepted Arabic 175/70, disabled an XS recommendation absent from the product, and disabled unavailable rows in the chart. 150/150 produced no match with a measurements inquiry. No message was sent and no valid save, reorder, visibility change, reset, deletion, stock change or order was performed. The six configured sizes remained intact. Actual hardware and other browser engines were not exercised.

## Limits and recommended next work

This remains a general store-wide reference. Default height/weight bands are not garment measurements and are not calibrated to real customers; many valid body profiles can fall outside their joint ranges. Add product/category-specific chest, waist, shoulder and garment-length measurements, define the garment cut and measurement method, and calibrate using actual fit/return feedback before claiming fit accuracy. No medical/body-proportion conclusions are made.

Existing settings persistence applies locally and syncs cloud storage in the background; this view does not promise a cloud save acknowledgement or resolve concurrent administrators. Verified cloud save/error recovery and version conflict handling are separate backend work. Hiding a guide row is not an inventory operation. No new external service or dependency was introduced.
