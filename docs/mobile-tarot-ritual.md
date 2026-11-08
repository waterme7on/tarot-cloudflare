# Mobile Tarot Ritual — design before build

## Goal
Replace the multi-screen immersive flow on the homepage and free reading route with a focused, touch-first tarot ritual. Keep the non-immersive embed and shared reading pages compatible.

## Journey
1. **Prepare**: one calm screen, topic chips (five), spread choices (1/3/10), optional question. One obvious primary action.
2. **Shuffle**: large tappable deck, 850 ms tactile shuffle (immediately complete if reduced motion). Tap to fan the cards.
3. **Choose**: seven visible cards in a central curved carousel represent positions from a **full 78-card deck**. Swipe horizontally or use Previous/Next arrows to move the focused position; tap the center card or use the pinned CTA to keep it. Three-card and Celtic Cross require distinct choices, tracked with Past/Present/Future or numbered positions.
4. **Reveal**: after all choices are locked, send their deck indices to the draw endpoint; map selections into a server-side securely shuffled 78-card deck. Flip each chosen card in order; one WebGL card maximum. Show a short meaning and a clear next action.
5. **Summary**: preserve full interpretations, sharing, pricing and deep-report checkout as they currently work.

## Interaction and visual system
- Deep ink background (#0c1422), restrained brass (#d8c28d), warm ivory copy, no stars/extra gradients competing with cards.
- Use existing SVG card back; fan/cards rendered with CSS 3D transforms, GPU card reserved for reveal.
- One thumb-reachable primary CTA, min 48px target; keyboard focus and arrow controls as swipe alternatives.
- Honor safe-area insets and bottom navigation dock. Stage must fit 320–430px widths without horizontal page overflow.
- On mobile the homepage hero collapses into an accessible one-line heading: the ritual itself is visible on entry.
- Motion duration targets: 850ms shuffle, 250ms select, 450ms flip; use prefers-reduced-motion and a skip path.
- Keep WCAG semantics (focus, button labels, live state, error recovery).

## Integrity and API
- Extend optional POST /api/v1/draw body with `slots: number[]` where length must match spread (1,3,10), each integer 0–77, distinct.
- Server uses CSPRNG Fisher–Yates to shuffle a full 78-card deck, then selects exactly the nominated deck indices; orientation remains random server-side.
- Backward compatible when `slots` omitted. Never let clients specify card identities or orientation.
- Preserve idempotency, Turnstile, rate limits, public reading links and checkout. A network retry must not roll a new set of cards.

## Acceptance
- 320 / 375 / 390 / 430px and desktop layout: no clipped CTA or unintentional side scroll; dock is not overlapped.
- Thumb swipe, tap center, Previous/Next and the CTA all work. Repeated card indices rejected server-side.
- Cards revealed only after selection; summary stable and shareable; each step accessible to keyboard/reduced-motion users.
- Unit tests for slot validation, deterministic slot mapping with injected RNG, SSR instructions; project typecheck and build before merge.
