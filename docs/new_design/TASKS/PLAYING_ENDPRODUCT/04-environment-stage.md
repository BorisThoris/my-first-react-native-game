# 04 — Environment and stage (`PLAY-006`)

**`PLAY-*` ID:** **PLAY-006** (P1)

## Current delta vs `ENDPRODUCTIMAGE.png`

From [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) **§4** — **Board framing:**

- Reference: cards on a **circular stone dais** with strong floor graphic; torch warmth and spotlight.
- Live **`main-game-screen.png`**: board still reads **grid-first / flatter** over vignette vs **raised stone arena**; spotlight and torch warmth softer than mock.

## Required end state

- Board stage reads as an **arena** without shrinking the playfield.
- Capture shows stronger **dais / spotlight / torch** warmth toward the mock.

## Dependencies

- **PLAY-010**.
- Illustrated hero layers: **[`TASK-009`](../TASK-009-final-menu-and-gameplay-illustrations.md)** (`bg-gameplay-dungeon-ring-v1.png`, scene layering in [`DROP_IN_ASSET_CHECKLIST.md`](../../DROP_IN_ASSET_CHECKLIST.md)).

## Primary runtime files

- [`GameScreen.tsx`](../../../../src/renderer/components/GameScreen.tsx)
- [`GameScreen.module.css`](../../../../src/renderer/components/GameScreen.module.css)
- [`MainMenuBackground.tsx`](../../../../src/renderer/components/MainMenuBackground.tsx) (if shared atmosphere patterns apply)

## Evidence artifacts

- `main-game-screen.png`; legacy `tile-board-*.png` where used for board parity.

## Cross-links

- Asset drop-ins: [`../../DROP_IN_ASSET_CHECKLIST.md`](../../DROP_IN_ASSET_CHECKLIST.md) — menu/gameplay scenes
- [`../../ASSET_AND_ART_PIPELINE.md`](../../ASSET_AND_ART_PIPELINE.md)
