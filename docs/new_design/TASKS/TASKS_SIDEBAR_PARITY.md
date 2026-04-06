# Tasks: Left sidebar & navigation parity (`SIDE-*`)

**Sweep (P2/P3):** SIDE-002 catalog note, SIDE-009 close + styles, SIDE-011 roving toolbar, SIDE-012 distinct labels, SIDE-015 e2e, SIDE-005/017 rail SVG set + `GameLeftToolbar` img migration shipped.

**Research summary:** The left rail is inline in `GameScreen.tsx` (`<aside aria-label="Game actions">`). Icons are stroke SVGs from `src/renderer/ui/gameplayIcons.tsx` on squarish `.iconAction` buttons. **Inventory** and **Codex** only appear inside the **hamburger utility flyout**; **Settings** is duplicated (toolbar + flyout). **No** toolbar `goToMenu` / X — menu exit is modal flows. **`src/renderer/assets/ui/icons/`** does not exist.

**Primary code:** `GameScreen.tsx`, `GameScreen.module.css`, `useAppStore.ts` (`openInventoryFromPlaying`, `openCodexFromPlaying`)  
**E2e:** `e2e/mobile-layout.spec.ts` (`aside[aria-label="Game actions"]`, Fit board)

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| SIDE-001 | P0 | Extract `GameLeftToolbar` | Presentational component + props for flyout state, run, handlers. | `GameScreen` thinner; same behavior; tests pass. | — |
| SIDE-002 | P0 | IA doc | Primary rail vs flyout vs modal-only actions documented. | Short section in `COMPONENT_CATALOG` or README link. | SIDE-001 opt |
| SIDE-003 | P0 | Exit / menu affordance | User-visible path to main menu from rail or flyout (product: confirm if run active). | Wired to `goToMenu`; no stranded subscreens (`SIDE-014`). | SIDE-002 |
| SIDE-004 | P1 | Circular gold buttons | True circular hit targets + rim tokens (CSS vars). | Matches VISUAL_SYSTEM_SPEC materials; contrast AA. | Design tokens |
| SIDE-005 | P1 | Illustrated icons | Book (codex), pouch/bag (inventory), distinct peek/shuffle/etc. per mockup. | New SVG or PNG under `assets/ui/icons/` + manifest. | SIDE-004 |
| SIDE-006 | P1 | Promote codex + inventory | Always-visible icon buttons on rail; optional collapse under breakpoint. | One tap to open; same store freeze behavior as flyout (`SIDE-013`). | SIDE-001, SIDE-005 |
| SIDE-007 | P2 | Dedupe Settings | Remove redundant flyout row if toolbar settings remains. | Single obvious Settings entry; a11y reviewed. | SIDE-006 |
| SIDE-008 | P1 | Flyout dismiss UX | Outside click, Escape, optional scrim; focus return to menu button. | `aria-expanded` synced; keyboard usable. | SIDE-001 |
| SIDE-009 | P2 | Flyout close control | Visible X / Close in panel. | Touch-friendly target size. | SIDE-008 |
| SIDE-010 | P1 | Positioning audit | RTL, narrow `100vw`, overlap with HUD. | No clipped flyout; z-index documented. | — |
| SIDE-011 | P2 | Toolbar keyboard nav | Roving tabindex / arrows across toolbars. | WAI-ARIA toolbar pattern. | SIDE-001 |
| SIDE-012 | P2 | SR labels | Duplicate Pause/Settings don’t confuse screen readers. | Unique accessible names where shown twice. | SIDE-007, SIDE-008 |
| SIDE-013 | P2 | Freeze path parity | Opening inventory/codex from new buttons uses same `freezeRun` / view stack. | Manual test: playing → inventory → back. | SIDE-006 |
| SIDE-014 | P2 | Exit + subscreens | Exit while inventory open returns safely. | State machine documented; no blank screen. | SIDE-003 |
| SIDE-015 | P2 | E2e coverage | Flyout + new buttons if any. | New or extended spec; CI stable. | SIDE-006, SIDE-008 |
| SIDE-016 | P2 | `data-testid`s | utility toggle, flyout, codex, inventory buttons. | Stable selectors for Playwright. | SIDE-006 |
| SIDE-017 | P2 | Icons manifest | `src/renderer/assets/ui/icons/` + barrel `index.ts` + `ASSET_SOURCES.md` rows. | Import path convention documented. | SIDE-005 |
| SIDE-018 | P2 | Power row harmony | Shuffle/pin/destroy/peek/stray match circular style + badges. | Disabled/charged readable. | SIDE-004 |

---

## Refinement notes

- **SIDE-003** needs explicit **product** approval (abandon run vs pause-first).
- **SIDE-006** materially changes **chromeReserveX** in `GameScreen.tsx` if rail width changes — recalc board fit.
- Pair **SIDE-016** with **HUD-018** for e2e stability.
