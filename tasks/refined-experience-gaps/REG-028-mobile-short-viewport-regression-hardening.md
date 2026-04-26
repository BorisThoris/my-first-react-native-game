# REG-028: Mobile Short Viewport Regression Hardening

## Status
Done

## Priority
P0

## Area
QA

## Evidence
- `test-results/visual-screens/mobile/portrait/`
- `test-results/visual-screens/mobile/landscape/`
- `src/renderer/components/*.module.css`
- `docs/visual-capture/`
- `docs/UI_TASKS/`

## Problem
Phone portrait, phone landscape, short desktop, and tablet coverage must be reliable. Many current issues are viewport-specific: cropped menus, over-tall modals, board being pushed down, and hidden actions.

## Target Experience
Every high-traffic screen should have known behavior at constrained viewport sizes. Regressions should be caught before manual playtesting discovers them.

## Suggested Implementation
- Define a supported viewport matrix: 360x740, 390x844, 430x932, phone landscape, 768x1024, 1024x768, 1366x640, and 1440x900.
- Add focused visual specs for gameplay, overlays, settings, menu, Choose Path, and game over.
- Use stable screenshot states and deterministic test seeds.
- Add assertions for visible primary actions where possible, not only image snapshots.
- Review safe-area handling and dynamic viewport units in CSS.

## Acceptance Criteria
- P0 screens have visual or DOM coverage at short mobile and desktop heights.
- Tests fail when primary actions are pushed off-screen.
- Test runtime remains practical by splitting specs into focused groups.
- The viewport matrix is documented and easy to update.

## Verification
- Run the updated visual smoke or targeted specs.
- Manually inspect generated captures after major responsive changes.
- Confirm `git status --short` only contains intentional baseline updates when screenshots are committed.

## Cross-links
- `REG-001-mobile-gameplay-hud-board-ratio.md`
- `REG-006-settings-mobile-scroll-and-footer.md`
- `REG-007-mobile-game-over-above-fold.md`
- `REG-027-visual-baseline-refresh.md`
