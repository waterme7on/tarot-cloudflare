# Tarot Tools — Game Skills UX + SEO review

## Existing skill sources consulted (source, not vendored)
- `Donchitos/Claude-Code-Game-Studios` → `.claude/skills/ux-review/SKILL.md`: review arrival context, interaction map, accessibility, acceptance criteria.
- `gamedev-skills/awesome-gamedev-agent-skills` → `skills/disciplines/game-ui-ux/SKILL.md`, `game-feel/SKILL.md`, and `skills/genres/card-game/SKILL.md`: anchored mobile HUD, safe areas, layered but restrained feedback, valid card positions and unique selections.
- `majidmanzarpour/threejs-game-skills` → `threejs-game-ui-designer`, `threejs-debug-profiler`, `threejs-qa-release`: mobile frame budget, readable game states, touch controls and release verification.

No third-party game-studio template, hooks, build workflows, GitHub Actions or extra runtime dependencies are imported. The existing Astro + React + Cloudflare Workers architecture stays authoritative.

## Source-level SEO baseline (2026-11-09)

| Area | Finding |
| --- | --- |
| Main entry | `src/pages/index.astro` has a server-rendered H1, descriptive content, card links, FAQ and WebApplication structured data. |
| Free reading | `src/pages/free-tarot-reading.astro` retains its server-rendered H1, prose, FAQ and BreadcrumbList. |
| Metadata | `src/layouts/Base.astro` emits `title`, description, canonical, hreflang, OG/Twitter and per-page robots. |
| Sitemap | `src/pages/sitemap-index.xml.ts` emits the index for pages, cards, spreads, questions and guides. |
| Robots | `public/robots.txt` permits public routes and blocks private readings/reports/admin/API. |
| Content | `/cards/...` uses prerendered articles, metadata, links and structured data. |
| **Regression to fix** | The v2 CSS applies an initial full-viewport overlay on `.ritual-prepare` and `body{overflow:hidden}`; on mobile, visitors cannot scroll to SEO content until leaving the game. |

These are source inspections, not a claim of live indexing, crawl metrics or Google Search Console validation.

## Design decision
1. **On arrival**: prepare stage stays inline in the normal `main` document; title, semantic reading copy and supporting content remain scrollable on mobile. No forced scroll lock or full screen.
2. **On intention** (Continue): deck / shuffle / fan are full-screen scenes with proper accessible title, a close route and a keyboard escape/back path. Returning to prepare restores the underlying page.
3. **Card navigation**: never focus a previously chosen deck position using arrows/swipe; use a pure position algorithm to move across remaining slots, with tests for wrap-around/uniqueness.
4. **Feedback**: keep short distinct shuffle → fan → lift → flip beats; a predictable focus cue and disabled states; reduced motion preserved.
5. **HoloCard**: one GPU instance at most, cap pixel ratio and frame budget on non-interactive reveal while retaining full quality for interactive card pages.
6. **Scope**: preserve semantic HTML, URL routes, canonical and JSON-LD, server-side cryptographic shuffle, Turnstile, private reading pages, paid report.
7. **Verification**: source-level SEO assertions + deterministic navigation tests + QA matrix for 320/375/390/430 width, short heights, keyboard/reduced motion/Turnstile.

## Limits of this pass
No GitHub Actions will be added. The GitHub connection can review and commit source, but cannot execute a Node toolchain or physical iOS browser. If Cloudflare provides checks they may be inspected; otherwise build and live rendering remain unverified and must not be represented as passing.
