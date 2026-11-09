# Mobile ritual — screenshot-led polish

Source: November 9 iPhone Safari screenshots (selection + reversed-card reveal).

## Issues
- The fan nearly touches the toolbar and bleeds visually into the sides. The heading and instruction are effectively outside the visible region when a user scrolls to the cards.
- The fixed navbar, the reading action bar and the browser chrome compete for the same vertical space. The revealed meaning is hidden under the primary CTA.
- Deck opening is a static swap after an 850ms loop; it lacks a readable sequence of shuffle → gather → spread. Choosing a card doesn't visibly extract it before revealing.
- The reading uses a page layout with fixed bottom navigation rather than a dedicated mobile game surface.

## Mobile-first solution
- On `<=760px`, make the interactive game and each reveal an **inset viewport scene** (100dvh) above the global navigation; keep the global header, SEO content and existing shared-reading view in the underlying document. The scene toolbar includes a clear exit/back path. The reading summary becomes a scrollable viewport scene with its own close link.
- All states use a layout grid: top navigation (safe-area aware), scrollable middle, bottom CTA (safe-area aware). No sticky CTA over meaning text.
- Move selection heading above a **smaller card fan** with consistent focal card, compact progress and arrow controls. Keep card backs fully visible on 320px devices; no horizontal document scrolling.
- Animate the deck as discrete stages: (1) spread the stacked cards to shuffle, (2) gather, (3) animate the 7-card fan into position. **Reduced-motion skips all phases**.
- On picking a card, lift the focused card out of the fan before changing progress; avoid accidental tap-after-swipe. Only then issue the existing server-secure card draw call.
- Reveal with one face-down card → 3D flip → compact readable card meaning. Use adaptive card sizing and scrollable text. Keep HoloCard single-instance.
- 1, 3 and 10-card spreads, pending verification, retry and existing paid report flow must still work.

## QA
- Verify 320, 375, 390 and 430 CSS-pixel widths; 568/667/844px available heights; iOS Safari dynamic URL bar and standalone safe-areas.
- At every stage check top heading, focused card, CTA and exit controls remain accessible; large meaning paragraphs scroll without being covered.
- Swipe should never select incidentally, keyboard arrow buttons must work, no card repeated, no new card identity generated on retry.
- Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build` before merge. Add CI to block future regressions when available.
