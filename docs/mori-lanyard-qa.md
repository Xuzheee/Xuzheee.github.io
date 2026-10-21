# About lanyard verification — 2026-10-19

Implemented the React Bits Lanyard interaction in the existing About photo area. Official source and license are retained in `src/scripts/vendor`.

Reference fidelity: retained the suspended portrait badge, physical strap and metal connector, large upper-left name, circular portrait on the right, and small contact details below. Intentionally adapted the black strap to site red, the text to cream, and the identity to Mori. The latest user-supplied portrait is used without generative alteration. The back uses the existing hiking photograph. Surrounding biography remains unchanged.

Latest user adjustment: removed all visible controls and explanatory copy below the badge. Direct drag/click interaction remains; Enter/Space also flips the focused badge.

Verified in the local browser: new portrait renders in the 3D face; direct click flips; Enter flips back. Earlier drag/release verification retained. Desktop screenshot shows the settled badge; 390px viewport has no horizontal overflow and the biography, badge and education flow vertically. This is viewport verification, not physical phone touch testing.

Build and content checks pass. Three.js is loaded dynamically for this component; build reports the approximately 580 kB chunk warning (150 kB gzip). Latest browser error/warning check returned no entries. No deployment performed.

Evidence: `output/lanyard/about-desktop.jpg`, `output/lanyard/about-mobile.jpg`.

Follow-up: moved the renderer into a fixed, transparent body-level canvas at z-index 1000. Camera view offsets preserve the layout anchor and badge scale while extending rendering across the viewport. Pointer raycasts capture only badge hits, so transparent areas leave normal page controls accessible. Scroll/resize update the projection; listeners and canvas are removed on disposal. Browser drag from the badge into the biography visibly overlaps text without the old container clipping (`output/lanyard/about-overlay.jpg`). Build passed and browser error log was empty.
