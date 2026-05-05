# PPI-005: Card feedback and state impact

## Status
Done

## Priority
P0

## Area
Gameplay feedback / visual clarity

## Evidence
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/TileBoardScene.tsx`
- `src/renderer/components/GameScreen.tsx`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `tasks/refined-experience-gaps/REG-108-card-state-feedback-animation-and-impact-system.md`

## Problem
Card interaction works, but the audit identified card-state feedback as below the desired impact. Hidden, hover, flipped, matched, mismatch, score, and reduced-motion states need stronger and more consistent communication.

## Target Experience
Every card state is obvious without relying only on color. Match and miss outcomes feel immediate, readable, and satisfying without covering important board information.

## Suggested Implementation
- Define state language for hidden, focus, hover, flipped, matched, mismatch, disabled, hazard, route, and objective cards.
- Align DOM fallback and WebGL presentation where feasible.
- Improve score/miss pop placement and timing.
- Add reduced-motion equivalents for all high-impact feedback.

## Acceptance Criteria
- Card state screenshots show clear non-color-only differences.
- Match and mismatch feedback is visible but does not occlude next action.
- Reduced-motion mode still communicates outcome and state changes.
- DOM fallback remains functionally equivalent.

## Verification
- `yarn capture:gameplay-audit`
- `yarn capture:endproduct-parity`
- Focused tile-board visual and DOM tests.

## Placeholder and asset contract
Final art is not required. Use procedural/material changes or existing placeholder assets unless the implementation explicitly depends on new art.

## Cross-links
- `../refined-experience-gaps/REG-012-card-materials-and-interaction-fx.md`
- `../refined-experience-gaps/REG-108-card-state-feedback-animation-and-impact-system.md`
- `../refined-experience-gaps/REG-112-effect-lod-reduced-motion-and-visual-noise-control.md`
