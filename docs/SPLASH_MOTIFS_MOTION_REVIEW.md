# Loading motifs and maintenance motion

- Preserved the existing selected `tshirt_print` branch exactly, including drawing, colors and animation. A SHA-256 regression assertion protects this explicit user requirement.
- Rebuilt the other seven motif illustrations and their individual motions: printing press, embroidered signature, balanced hanger, needle/thread, measuring ribbon, scissors, and orbiting monogram. Kept all existing IDs, settings format and the published selection.
- Replaced the long dropdown with a labeled native radio-card library, static thumbnails, descriptions and a currently-published marker. Keyboard arrows select a draft; preview/save/cancel keep their existing roles. Thumbnails have no running animation.
- Added maintenance entrance sequencing, a slow decorative orbit, a restrained tool float and a soft status pulse. Motions do not move the text layout or interfere with close controls. OS reduced-motion rules disable them.
- Scoped new artwork styles and reduced-motion rules so the selected T-shirt animation is untouched. Invalid stored motif names safely fall back to the monogram, including prototype-property names.

## Verification
- TypeScript, 110 automated tests and production build passed. Server-render checks cover all eight motifs in dark/light, all seven distinct new drawings, paused thumbnails and invalid stored IDs.
- Browser checked all seven new motifs individually after waiting for each preview to close; the displayed ID and running animation matched each selection.
- Verified every thumbnail is 46×46 and contained by its card, with animations paused. Verified native keyboard selection and cancellation back to `tshirt_print`.
- Checked the library at 320px, 768px and default 1101px; no horizontal overflow. Checked scissors at 320×740 and monogram at 740×360; artwork remains inside its frame.
- Maintenance decorative orbit and tool transform were observed running; entrance opacity settled at 1. Existing preview and published settings remained separate.
- Cancelled all QA drafts. No settings saves, maintenance activation, credential changes, messages or orders were performed.

Physical devices and OS reduced-motion emulation were not tested. Reduced-motion support is implemented in CSS; existing build bundle/import warnings remain.
