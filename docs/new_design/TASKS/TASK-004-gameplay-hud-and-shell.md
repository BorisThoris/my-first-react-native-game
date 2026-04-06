# Task 004: Gameplay HUD and Shell

## Status
Done (shipped scope; residuals documented)

## Implementation notes
- Gameplay shell, ornate HUD segments, left rail, flyout (inventory/codex), and overlay framing were brought toward `SCREEN_SPEC_GAMEPLAY.md`.
- **Residual:** pixel-tight parity with `docs/ENDPRODUCTIMAGE*.png` still depends on illustrated stage/HUD art and final polish passes noted in `CURRENT_VS_TARGET_GAP_ANALYSIS.md`—not a code-only gap.

- **Mobile camera:** Left toolbar uses **`z-index: 8`** (`.mobileCameraLeftToolbar`) so the in-game utility flyout receives clicks above the HUD (`GameScreen.module.css`) — fixes Playwright `01d` / `01e` and real taps on small viewports.

### Reference audit ([`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md))
- **Score parasite** strip (purple bar + crystal) and hex-like floor module density in HUD vs live single bar—product/mechanic decision plus [`TASK-013`](TASK-013-gameplay-hud-segment-ornament-pass.md).
- Daily seed / ID presentation in HUD row vs mode line layout in capture.
- **Board framing:** reference circular stone dais vs cards on grid over environment; stage composition and `GameScreen` / board chrome.
- **In-run tutorial** copy overlay and **pair markers** on early floors (visible in captures) vs marketing stills—product/UX whether to relocate or soften for parity.

## Priority
High

## Objective
Rebuild the gameplay shell to match the reference composition: illustrated stage, ornate segmented HUD, premium left rail, and unified overlay language.

## Source Reference
- `docs/ENDPRODUCTIMAGE.png`
- `docs/new_design/SCREEN_SPEC_GAMEPLAY.md`
- `docs/new_design/MOTION_AND_STATE_SPEC.md`

## Affected Areas
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameScreen.module.css`
- `src/renderer/components/OverlayModal.tsx`
- related overlay CSS modules

## Dependencies
- `TASK-001-theme-foundation-and-assets.md`
- `TASK-002-shared-ui-primitives.md`

## Implementation Outcomes
- Replace the flat HUD feel with ornate segmented modules.
- Restyle the left gameplay rail into a premium in-world object.
- Improve stage framing and board placement.
- Align pause and floor-cleared overlays with the new shell.

## Acceptance Criteria
- Score is the dominant element in the top HUD.
- Sidebar actions look intentional and premium.
- The gameplay stage feels embedded in an environment rather than floating on a generic background.
- Overlays feel like part of the same system.

## Out of Scope
- Collection, inventory, and codex routes
- Gameplay rule changes
