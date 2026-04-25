# REG-002: Desktop Gameplay Stage Dead Space

## Status
Open

## Priority
P1

## Area
UI

## Evidence
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameScreen.module.css`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/TileBoard.module.css`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/new_design/TASKS/PLAYING_ENDPRODUCT/README.md`

## Problem
The desktop gameplay stage still reads as a board placed inside a large frame instead of a focused play dais. Empty margins and oversized containment weaken the sense of tension, especially when the core board is the most important gameplay surface.

## Target Experience
Desktop play should feel intentional and dense. The board should sit on a strong stage with useful surrounding context, not isolated inside empty panels.

## Suggested Implementation
- Audit stage grid tracks, max widths, and board wrapper padding.
- Reduce decorative framing where it does not carry information.
- Bring high-value run context closer to the board edge.
- Use desktop-specific density tokens instead of relying on mobile-friendly spacing everywhere.
- Preserve room for future route, relic, or shop surfaces without bloating the current play screen.

## Acceptance Criteria
- At 1366x768 and 1440x900, empty stage space is visibly reduced.
- The board feels centered and dominant without clipping HUD or action controls.
- Desktop and tablet layouts use different spacing rules where needed.
- Existing keyboard and mouse interactions remain unchanged.

## Verification
- Capture desktop screenshots before and after the stage pass.
- Check 1366x768, 1440x900, and 1920x1080 viewport behavior.
- Run visual smoke coverage for gameplay screens.

## Cross-links
- `REG-001-mobile-gameplay-hud-board-ratio.md`
- `REG-014-design-system-dead-space-audit.md`
- `docs/new_design/TASKS/PLAYING_ENDPRODUCT/README.md`
