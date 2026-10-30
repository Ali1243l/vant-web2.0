# Export, security and splash review

## Fixed
- Print closes the export panel synchronously before opening the browser print dialog.
- Replaced the clipped, RTL-anchored export dropdown with the existing accessible Sheet. It shows the filtered subscriber count, keeps all six export actions and supports scrolling, Escape, focus trapping and return to the trigger.
- Reworked the security form with the store palette, associated labels, correct password autocomplete, visible feedback, empty-submit prevention and a clear local-lock description. Removed the false encryption claim and duplicate credential write.
- New access codes are bounded to 4–64 characters and checked against current value and confirmation; leading/trailing whitespace, control characters and unchanged codes are rejected. Existing credential values and login compatibility were not migrated or changed.
- Local credential persistence now throws storage errors instead of reporting false success; the current and legacy security forms handle that failure.
- Settings tabs use a responsive grid so the active security tab is not clipped on a narrow screen.
- Rebuilt SplashLoader with a stable bilingual brand composition, restrained motif, clear status, responsive controls, safe-area spacing, light/dark appearances and compact landscape layout. Settings preview can toggle appearance without changing store settings.
- Loading is indeterminate; removed the timer-generated percentage and tap-to-dismiss behavior. Real loading waits for isLoading=false and the short minimum display period. Preview playback stays open after completion and replays without firing the finished callback.
- Preview is portaled outside admin containers, supports Escape and trapped keyboard focus, restores focus/overflow, and honors reduced motion with a static mark. No animation tick timers or automatic brand swapping remain.

## Verification
- 106 tests passed, with new tests for real-data loading exit conditions and access-code validation. TypeScript and production build passed.
- Browser: export panel was fully visible at 1101px and 320px; Escape closed it and returned focus to Export.
- Preview: loading/complete/replay states, keyboard Tab wrap, Escape, light/dark at 320×740, and landscape 740×360. Measured preview content exactly fit each tested viewport without horizontal overflow.
- Security: associated fields, empty save disabled, reveal/hide of empty fields, Arabic and English at 320px; no horizontal overflow. All four settings tabs remain visible.
- Separate real storefront visit: loader exited, seven product cards were present, and body overflow was restored. Temporary test tab was closed.
- No credential was entered or changed, no live form was saved, and no email/order operation was performed.

## Limits
- Credential change itself was not submitted; that remains a user-operated action. The lock remains local to the browser and is not server authentication or database authorization.
- Physical devices, all browser engines and the operating system reduced-motion preference were not directly exercised. Reduced-motion support is implemented but not emulated in this browser run.
- Existing large bundle and mixed import warnings remain outside this focused fix.
