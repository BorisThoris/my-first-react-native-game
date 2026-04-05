# New Design Tasks

## Purpose
This directory breaks the redesign into implementation-sized tasks. The tasks are ordered so that foundational work lands before screen-specific work.

## Priority Order
1. `TASK-001-theme-foundation-and-assets.md`
2. `TASK-002-shared-ui-primitives.md`
3. `TASK-003-main-menu-redesign.md`
4. `TASK-004-gameplay-hud-and-shell.md`
5. `TASK-005-card-states-and-fx.md`
6. `TASK-006-settings-shell.md`
7. `TASK-007-mode-selection-and-menu-ia.md`
8. `TASK-008-gap-surfaces-and-regression.md`

### Post-audit / reference parity (TASK-009+)
9. `TASK-009-final-menu-and-gameplay-illustrations.md`
10. `TASK-010-final-logo-and-emblem-lockup.md`
11. `TASK-011-final-card-art-and-texture-pipeline.md`
12. `TASK-012-card-interaction-fx-and-celebration.md`
13. `TASK-013-gameplay-hud-segment-ornament-pass.md`
14. `TASK-014-visual-reference-captures-and-diff-process.md`
15. `TASK-015-settings-schema-for-reference-controls.md`
16. `TASK-016-profile-and-meta-menu-strip.md`
17. `TASK-017-social-and-community-strip.md`
18. `TASK-018-mode-select-card-illustrations.md`
19. `TASK-019-reference-stills-and-scenario-audit-matrix.md`

## Dependency Summary
- Theme and asset intake come first.
- Shared primitives land before per-screen work.
- Gameplay shell work should precede deep card FX polish.
- Mode-selection routing decisions should wait until the new visual language is stable.
- Visual regression refresh closes the sequence.
- **TASK-009–013** track reference-still fidelity (art + HUD + card FX) after the shipped redesign baseline.
- **TASK-014–019** cover review process, settings truthfulness, optional meta/social scope, mode-card art, and reference/scenario mapping.

## Notes
- **Reference review docs:** [VISUAL_REVIEW.md](../VISUAL_REVIEW.md), [REFERENCE_VS_SCENARIOS.md](../REFERENCE_VS_SCENARIOS.md), [SETTINGS_REFERENCE_CONTROLS_MATRIX.md](../SETTINGS_REFERENCE_CONTROLS_MATRIX.md), [DROP_IN_ASSET_CHECKLIST.md](../DROP_IN_ASSET_CHECKLIST.md).
- These tasks are implementation-oriented; status and notes in each `TASK-*.md` track what landed in the renderer versus what remains reference-level polish.
- **Live routes:** `modeSelect` (Choose Your Path), `collection`, `inventory`, and `codex` are implemented in `src/shared/contracts.ts` and wired in `App.tsx` / `useAppStore.ts`. Inventory and codex open as in-run overlays from the gameplay flyout; collection is reachable from the main menu.
- **Honest mock scope:** Settings categories that are UI-only (for example Controls reference copy, locked Endless on mode select) stay labeled in copy and tests per TASK-008.
