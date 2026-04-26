# REG-008: Overlays Mobile Height And Hierarchy

## Status
Done

## Priority
P0

## Area
Mobile

## Evidence
- `src/renderer/components/OverlayModal.tsx`
- `src/renderer/components/OverlayModal.module.css`
- `src/renderer/components/PauseMenu.tsx`
- `src/renderer/components/FloorClearOverlay.tsx`
- `src/renderer/components/RunSettingsModal.tsx`
- `test-results/visual-screens/mobile/portrait/05-pause-modal.png`
- `test-results/visual-screens/mobile/portrait/06-run-settings-modal.png`
- `test-results/visual-screens/mobile/portrait/07-floor-cleared-modal.png`

## Problem
Pause, floor-clear, relic, and run-settings overlays need compact mobile rules. Current overlay content can feel vertically heavy, with too many equally weighted sections competing for attention.

## Target Experience
Each overlay should have one obvious job. The primary action and decision should be visible immediately, while supporting details should collapse or scroll inside a controlled body area.

## Suggested Implementation
- Define modal size classes: alert, decision, sheet, and full-screen.
- Use bottom sheets for mobile decisions where that fits touch ergonomics.
- Keep modal headers compact and action footers sticky.
- Limit full-screen overlays to flows that truly need full browsing context.
- When relic or mutator details appear, ensure IDs map cleanly to `RelicId` or `MutatorId` and remain compatible with `RunState`.

## Acceptance Criteria
- Primary overlay action is visible without scrolling on phone portrait.
- Modal body scrolls internally when needed and never hides close/confirm actions.
- Pause, floor-clear, relic choice, and run settings use consistent header and footer behavior.
- Overlay z-index and focus trapping remain reliable.

## Verification
- Capture each overlay at phone portrait, phone landscape, tablet, and desktop.
- Keyboard test focus trap, escape, enter, and tab cycling.
- Touch test close and confirm actions near safe-area insets.

## Cross-links
- `REG-006-settings-mobile-scroll-and-footer.md`
- `REG-019-relic-build-archetypes.md`
- `REG-020-mutator-chapter-identity.md`
- `docs/new_design/TASKS/TASKS_OVERLAYS_FTUE.md`
