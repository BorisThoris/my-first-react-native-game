# REG-006: Settings Mobile Scroll And Footer

## Status
Open

## Priority
P0

## Area
Mobile

## Evidence
- `src/renderer/components/SettingsScreen.tsx`
- `src/renderer/components/SettingsScreen.module.css`
- `src/renderer/components/RunSettingsModal.tsx`
- `src/renderer/components/OverlayModal.module.css`
- `test-results/visual-screens/mobile/portrait/03-settings-page.png`
- `test-results/visual-screens/mobile/portrait/06-run-settings-modal.png`

## Problem
Settings is long, heavy, and easy to crop on phone-sized layouts. Important actions and footer controls can sit below the comfortable thumb zone or disappear inside modal height constraints.

## Target Experience
Settings should feel like a compact control surface, not a long document. High-frequency options should be quick to reach, destructive or reset actions should be stable, and modal variants should never trap essential controls off-screen.

## Suggested Implementation
- Group settings into tabs or accordions: gameplay, audio, visuals, accessibility, data.
- Use sticky header and footer actions where appropriate.
- Convert dense text rows into compact labeled controls with clear current values.
- Audit modal and full-screen settings separately.
- Keep future persistent values under `Settings`; increment `SAVE_SCHEMA_VERSION` only if persisted shape changes.

## Acceptance Criteria
- Phone portrait settings can be navigated without cropped footer actions.
- Run settings modal has a compact maximum height and scrollable body.
- Reset, close, apply, and back actions remain reachable at short viewport heights.
- Text labels fit without overlapping controls.

## Verification
- Capture settings full-screen and run-settings modal at 360x740, 390x844, phone landscape, and short desktop.
- Manually tab through settings and verify focus remains visible.
- Run visual smoke coverage for settings screens after implementation.

## Cross-links
- `REG-008-overlays-mobile-height-and-hierarchy.md`
- `REG-028-mobile-short-viewport-regression-hardening.md`
- `REG-029-input-accessibility-and-controller-comfort.md`
