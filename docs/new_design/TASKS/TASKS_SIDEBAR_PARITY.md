# Tasks: Left sidebar & navigation parity (`SIDE-*`)

**Active table:** remaining `SIDE-*` work vs [`docs/ENDPRODUCTIMAGE.png`](../../ENDPRODUCTIMAGE.png) and [`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md). **Shipped / archived IDs:** see [`TASKS_ARCHIVE_PARITY.md`](./TASKS_ARCHIVE_PARITY.md) (SIDE-001, 002, 003, 004, 005, 009, 011, 012, 015, 016, 017).

**Research summary:** The left rail is [`GameLeftToolbar`](../../../src/renderer/components/GameLeftToolbar.tsx) with illustrated SVGs from [`src/renderer/assets/ui/icons/`](../../../src/renderer/assets/ui/icons/). Primary rail order (**`PLAY-001`**) is **fit board** → **settings** → **codex** → **inventory** → **main menu (abandon)**; **pause/resume** is **P** (and the pause modal), not a rail icon. A second **powers** toolbar (shuffle, rows, pin, destroy, peek, …) appears when `showBoardPowerBar`. **ENDPRODUCT** mock shows a simpler six-icon column (close, pause, settings, book, bag, eye)—remaining gaps vs mock are exit affordance, circular chrome depth, and power-row harmony (**`PLAY-002`**, **`SIDE-018`**).

**Primary code:** `GameScreen.tsx`, `GameScreen.module.css`, `useAppStore.ts`  
**E2e:** `e2e/mobile-layout.spec.ts`, `e2e/hud-inspect.spec.ts`, `e2e/visual-endproduct-parity.spec.ts`

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| SIDE-008 | P1 | ~~Flyout dismiss UX~~ **superseded** | Utility flyout removed; inventory/codex are rail → overlay only. | N/A | — |
| SIDE-010 | P1 | ~~Flyout positioning~~ **superseded** | Rail/HUD z-index still documented under `HUD-013` / mobile camera rules. | Narrow-viewport rail tappable above HUD. | — |
| SIDE-013 | P2 | Freeze path parity | Opening inventory/codex uses same `freezeRun` / view stack as rail paths. | Manual test: playing → inventory → back. | — |
| SIDE-014 | P2 | Exit + subscreens | Exit while inventory open returns safely. | State machine documented; no blank screen. | SIDE-003 |
| SIDE-018 | P2 | Power row harmony | Shuffle/pin/destroy/peek/stray match circular style + badges vs primary rail. | Disabled/charged readable; aligns with **PLAY-002**. | SIDE-004 |

---

## Refinement notes

- **Utility flyout removed (2026-04):** Inventory/Codex are rail-only entry points into overlays; pause is **P** + pause modal. Archived `SIDE-008` / `SIDE-009` / `SIDE-010` behaviors that referred to the flyout are superseded.
- **SIDE-003** shipped: abandon confirm + `goToMenu` (see archive + [`TASKS_CROSSCUTTING.md`](./TASKS_CROSSCUTTING.md) decision log).
- **SIDE-006** pairs with **[`PLAY-001`](./TASKS_PLAYING_ENDPRODUCT.md)** for ENDPRODUCTIMAGE1 rail order.
- Stable e2e hooks shipped; extend specs when **PLAY-001** changes rail structure.
