# REG-027: Visual Baseline Refresh

## Status
Open

## Priority
P0

## Area
QA

## Evidence
- `test-results/visual-screens/mobile/portrait/01-main-menu.png`
- `test-results/visual-screens/mobile/portrait/01a-choose-your-path.png`
- `test-results/visual-screens/mobile/portrait/03-settings-page.png`
- `test-results/visual-screens/mobile/portrait/04-game-playing.png`
- `test-results/visual-screens/mobile/portrait/05-pause-modal.png`
- `test-results/visual-screens/mobile/portrait/06-run-settings-modal.png`
- `test-results/visual-screens/mobile/portrait/07-floor-cleared-modal.png`
- `test-results/visual-screens/mobile/portrait/08-game-over.png`
- `test-results/visual-screens/mobile/landscape/01-main-menu.png`
- `docs/ui-design-reference/`

## Problem
Stale reference captures and fresh partial screenshots need reconciliation. Current visual truth should come from the running app, but the latest visual smoke audit timed out after producing only partial mobile captures.

## Target Experience
The project should have current, intentional visual baselines for major screens and viewport classes. Designers and developers should know which screenshots represent the app today and which are historical references.

## Suggested Implementation
- Refresh the screenshot inventory from the current app.
- Move or label stale `docs/ui-design-reference/*` captures as historical reference.
- Split visual smoke into narrower specs or increase timeout to avoid losing partial results.
- Include phone portrait, phone landscape, tablet, desktop, short desktop, and overlay states.
- Record which captures are baseline, exploratory, and historical.

## Acceptance Criteria
- Baseline screenshots exist for main menu, Choose Path, gameplay, pause, run settings, floor clear, game over, settings, and core meta screens.
- Historical screenshots are not mistaken for current UI.
- Visual smoke can complete reliably or be run in smaller targeted chunks.
- REG tickets reference refreshed screenshots when implementation work starts.

## Verification
- Run targeted visual capture specs after splitting or increasing timeout.
- Note: during this audit, `yarn test:e2e:visual:smoke` timed out after partial mobile screenshots were produced, so future refresh should use narrower specs or a longer timeout.
- Compare refreshed screenshots against current source changes before approving UI tasks.

## Cross-links
- `REG-014-design-system-dead-space-audit.md`
- `REG-028-mobile-short-viewport-regression-hardening.md`
- `docs/ui-design-reference/`
- `test-results/visual-screens/`
