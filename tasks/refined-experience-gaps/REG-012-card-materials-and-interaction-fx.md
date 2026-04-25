# REG-012: Card Materials And Interaction FX

## Status
Open

## Priority
P1

## Area
UI

## Evidence
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/TileBoard.module.css`
- `src/renderer/components/PlayingCard.tsx`
- `src/renderer/components/PlayingCard.module.css`
- `src/renderer/audio/`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`

## Problem
Card backs, faces, hover states, match states, and mismatch feedback still miss the warmth and impact expected from a refined game. Interactions can read as functional UI rather than tactile game pieces.

## Target Experience
Cards should feel responsive, readable, and satisfying. Hover, press, flip, match, mismatch, combo, and disabled states should communicate outcome with motion, sound, light, and material treatment without harming clarity.

## Suggested Implementation
- Audit card materials, face hierarchy, suit/rank visibility, and color contrast.
- Add or tune flip timing, match pulses, mismatch recoil, combo emphasis, and disabled states.
- Align visual feedback with audio cues already present under `src/renderer/audio/`.
- Keep animations short and respect reduced-motion settings.
- Ensure card state is derived from board and `RunState`, not duplicated in animation-only logic.

## Acceptance Criteria
- Card states are visually distinct at a glance.
- Feedback for match, mismatch, combo, and invalid action feels materially different.
- Reduced-motion users receive non-motion feedback.
- Performance remains stable on mobile during rapid flips.

## Verification
- Capture card state screenshots and short video or visual test traces if available.
- Play through match, mismatch, combo, relic-triggered, and disabled card states.
- Test reduced-motion setting and mobile performance.

## Cross-links
- `REG-031-performance-graphics-real-device-pass.md`
- `REG-029-input-accessibility-and-controller-comfort.md`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
