# Parity task archive (`HUD-*` / `SIDE-*`)

Rows removed from the active tables in [`TASKS_HUD_PARITY.md`](./TASKS_HUD_PARITY.md) and [`TASKS_SIDEBAR_PARITY.md`](./TASKS_SIDEBAR_PARITY.md) after verification in the renderer. Use this file to grep historical IDs.

| ID | Closed (approx.) | Reason | Superseded by / notes |
|----|------------------|--------|------------------------|
| SIDE-001 | 2026-04 | `GameLeftToolbar` extracted; presentational rail + flyout in [`GameLeftToolbar.tsx`](../../../src/renderer/components/GameLeftToolbar.tsx). | — |
| SIDE-005 | 2026-04 | Illustrated gameplay icons + [`src/renderer/assets/ui/icons/`](../../../src/renderer/assets/ui/icons/) barrel. | [`GAMEPLAY_TOOLBAR_ICONS`](../../../src/renderer/assets/ui/icons/index.ts) |
| SIDE-009 | 2026-04 | Flyout close control (`flyoutClose` ×). | [`GameScreen.module.css`](../../../src/renderer/components/GameScreen.module.css) |
| SIDE-011 | 2026-04 | Roving tabindex on vertical toolbars. | `toolbarRoving` + `GameLeftToolbar` |
| SIDE-012 | 2026-04 | Distinct SR labels / flyout vs rail. | Implemented in toolbar + flyout copy |
| SIDE-015 | 2026-04 | E2e coverage for flyout / rail. | `e2e/mobile-layout.spec.ts`, parity specs |
| SIDE-016 | 2026-04 | `data-testid` on utility toggle, flyout, codex, inventory. | `GameLeftToolbar` |
| SIDE-017 | 2026-04 | Icons manifest under `assets/ui/icons`. | `index.ts` + imports |
| HUD-006 | 2026-04 | Score parasite HUD binds `parasiteFloors` with crystal + track in playing shell. | [`GameScreen.tsx`](../../../src/renderer/components/GameScreen.tsx) `hudParasiteSegment` |
| HUD-002 | 2026-04 | HUD deck centered in column (`margin-inline: auto` on `.hudDeck` + centered `hudRow`). | [`GameScreen.module.css`](../../../src/renderer/components/GameScreen.module.css) |
| HUD-005 | 2026-04 | Gauntlet countdown only on `statRail` Time pill; Mode line shows static **Gauntlet** (no duplicate ticking seconds). | [`GameScreen.tsx`](../../../src/renderer/components/GameScreen.tsx) `hudModeLabel` |
| SIDE-002 | 2026-04 | Gameplay toolbar IA (rail vs flyout vs modals) in [`COMPONENT_CATALOG.md`](../COMPONENT_CATALOG.md). | § Gameplay left toolbar IA |
| SIDE-003 | 2026-04 | Main menu / exit from rail opens abandon confirm when run active; `goToMenu` after confirm. | [`GameScreen.tsx`](../../../src/renderer/components/GameScreen.tsx) `abandonRunConfirmOpen`; decision log in [`TASKS_CROSSCUTTING.md`](./TASKS_CROSSCUTTING.md) |
| SIDE-004 | 2026-04 | Circular icon hit targets (`border-radius: 50%` on `.iconAction`) + gold hover lift. | [`GameScreen.module.css`](../../../src/renderer/components/GameScreen.module.css) |
| SIDE-006 | 2026-04 | Primary rail order aligned with mock (pause → settings → codex → inventory → main menu after utility/fit). | [`GameLeftToolbar.tsx`](../../../src/renderer/components/GameLeftToolbar.tsx) |
| SIDE-007 | 2026-04 | Flyout deduped: pause removed from flyout (duplicate of rail). | `GameLeftToolbar.tsx` flyout |
| HUD-003 | 2026-04 | `GameplayHudBar` extracted from `GameScreen`. | [`GameplayHudBar.tsx`](../../../src/renderer/components/GameplayHudBar.tsx) |
| HUD-004 | 2026-04 | Daily id segment when `gameMode === 'daily'`. | `GameplayHudBar.tsx` `hudDailySegment` |

**Active backlog** for `docs/ENDPRODUCTIMAGE.png` (playing, top-left) gaps: [`TASKS_PLAYING_ENDPRODUCT.md`](./TASKS_PLAYING_ENDPRODUCT.md) (`PLAY-*`).
