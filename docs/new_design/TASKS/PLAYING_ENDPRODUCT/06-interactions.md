# 06 — Card faces and interactions (`PLAY-008`, `PLAY-009`)

**`PLAY-*` IDs:** **PLAY-008** (P1), **PLAY-009** (P2)

## Current delta vs `ENDPRODUCTIMAGE.png`

From [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) **§4**:

| §4 row | Summary |
|--------|---------|
| Hover | Reference: intense **gold bloom**, tight rim. Live **`card-hover.png`**: broader wash vs tight ornamental bloom. |
| Card faces | Reference: **3D relic**, gold serif name, effect line. Live **`card-flipped.png`**: symbol-centric face; weaker title/subtitle/relic hierarchy. |
| Flip | Reference: **page-turn / hinge** smear. Live **`interaction-flip.png`**: subtler transition. |
| Matched | Reference: green glow + **large checkmark**. Live **`card-matched.png`**: unambiguous but softer; less celebratory density. |
| Match interaction | Reference: green burst, particles, floating **+50**. Live **`interaction-match.png`**: halo weaker than mock framing. |
| Mismatch | Reference: red pulse / stress. Live **`interaction-mismatch.png`**: calmer recoil; may still show **tutorial badge** chrome. |
| Tutorial / pair markers | Not on reference panels; level-1 fixtures still show **pair badges** in crops — **capture-profile decision**: suppress for parity **or** accept as product truth. |

**Shipped baseline notes:** resolving pulses on DOM hit layer; matched **checkmark** `::after`; **score pop** pill (`scorePop` / `scorePopBurst`) gated by `reduceMotion`. **Not in v1:** reference-density particle burst beyond pill unless FX budget added.

| ID | Title | Acceptance criteria (summary) |
|----|--------|-------------------------------|
| PLAY-008 | Card face and interaction grammar | Richer face hierarchy; tighter hover; stronger success/failure; flip closer to page-turn **within** motion budgets |
| PLAY-009 | Tutorial overlay hygiene in parity stills | Fixture or capture profile **suppresses tutorial-only chrome** for parity **or** product explicitly keeps it |

## Required end state

- Match/mismatch unmistakable quickly on phone viewport; **`reduceMotion`** respected ([`MOTION_AND_STATE_SPEC.md`](../../MOTION_AND_STATE_SPEC.md)).
- Parity capture policy for **tutorial badges** is explicit.

## Dependencies

- **PLAY-010**.
- [`../TASKS_CARDS_VFX_PARITY.md`](../TASKS_CARDS_VFX_PARITY.md) (`CARD-*`, `FX-*`).
- Tile motion: [`shuffleFlipAnimation.ts`](../../../../src/renderer/components/shuffleFlipAnimation.ts), [`gameplayVisualConfig.ts`](../../../../src/renderer/components/gameplayVisualConfig.ts).

## Primary runtime files

- [`tileTextures.ts`](../../../../src/renderer/components/tileTextures.ts), [`TileBoard.tsx`](../../../../src/renderer/components/TileBoard.tsx), [`TileBoard.module.css`](../../../../src/renderer/components/TileBoard.module.css)
- [`TileBoardScene.tsx`](../../../../src/renderer/components/TileBoardScene.tsx)
- [`GameScreen.tsx`](../../../../src/renderer/components/GameScreen.tsx), [`GameScreen.module.css`](../../../../src/renderer/components/GameScreen.module.css) — score pop
- [`runFixtures.ts`](../../../../src/renderer/dev/runFixtures.ts), [`visual-endproduct-parity.spec.ts`](../../../../e2e/visual-endproduct-parity.spec.ts)

## Evidence artifacts

- `card-hover.png`, `card-flipped.png`, `card-matched.png`, `interaction-flip.png`, `interaction-match.png`, `interaction-mismatch.png`

## Cross-links

- [`../TASKS_CARDS_VFX_PARITY.md`](../TASKS_CARDS_VFX_PARITY.md)
- [`../../SCREEN_SPEC_GAMEPLAY.md`](../../SCREEN_SPEC_GAMEPLAY.md) Zone E
