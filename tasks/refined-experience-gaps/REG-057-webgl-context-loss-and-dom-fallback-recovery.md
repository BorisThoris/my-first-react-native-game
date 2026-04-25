# REG-057: WebGL Context Loss And DOM Fallback Recovery

## Status
Open

## Priority
P1

## Area
QA

## Evidence
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/TileBoardScene.tsx`
- `src/renderer/components/TileBoardPostFx.tsx`
- `src/renderer/components/StartupIntro.tsx`
- `docs/new_design/TASKS/TASKS_PERFORMANCE_GRAPHICS.md`
- `docs/refinement-tasks/REF-078.md`

## Problem
The app relies on WebGL for the premium board and intro, but context loss and renderer fallback need a player-visible recovery path. Without it, low-power devices can get stuck on a blank or stale canvas.

## Target Experience
If WebGL fails, the app should recover or fall back to a DOM/2D path with a clear message. Gameplay should remain playable when possible.

## Suggested Implementation
- Listen for `webglcontextlost` and `webglcontextrestored` on board and intro canvases.
- Define fallback behavior: rebuild scene, switch to DOM board, or show a recover action.
- Keep quality preset and bloom toggles from causing unnecessary remounts.
- Add manual test script for context loss.
- Store no new state unless a user-facing `Settings` override is added.

## Acceptance Criteria
- Context loss does not leave a blank board indefinitely.
- Recovery or fallback messaging is understandable.
- DOM fallback remains input-compatible for core play.
- Quality setting changes do not leak contexts.

## Verification
- Manual context-loss simulation in browser devtools where possible.
- Run WebGL and DOM tile board specs.
- Capture fallback state.

## Cross-links
- `REG-031-performance-graphics-real-device-pass.md`
- `REG-034-startup-intro-hydration-and-skip-contract.md`
- `REG-062-e2e-flake-budget-and-ci-visual-sharding.md`
