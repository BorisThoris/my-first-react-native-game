# REG-036: Reference Settings Controls Model Plan

## Status
Done

## Priority
P1

## Area
Systems

## Evidence
- `src/renderer/components/SettingsScreen.tsx`
- `src/shared/contracts.ts`
- `src/shared/save-data.ts`
- `docs/new_design/SETTINGS_REFERENCE_CONTROLS_MATRIX.md`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`

## Problem
Difficulty, timer mode, max lives, card theme, and tutorial hints appear in reference settings, but several are disabled or future-only in the live model. Without a clear plan, the settings screen can look broken or dishonest.

## Target Experience
Settings should show only controls that work, or clearly mark future/demo-scope controls. When a control becomes real, it should have rules, persistence, and UI behavior before it appears enabled.

## Suggested Implementation
- For each reference-only row, decide: ship now, keep honest disabled placeholder, move to future roadmap, or remove.
- Define `Settings` fields only for controls that alter real behavior.
- For difficulty and max lives, decide whether they are true rule variants that require `GAME_RULES_VERSION`.
- For card theme, coordinate with cosmetic ownership in `SaveData` and `SAVE_SCHEMA_VERSION`.
- Remove disabled placeholder rows once real controls exist.

## Acceptance Criteria
- Every visible settings control is either functional or explicitly labeled as not in the current build.
- No setting writes unused data silently.
- Rule-affecting controls document achievements, daily fairness, and export implications.
- Save migration tests exist for new persisted controls.

## Verification
- Review `Settings`, `DEFAULT_SETTINGS`, and `normalizeSaveData` after implementation.
- Test settings save/load and reset-to-defaults.
- Capture settings in desktop, phone portrait, and short landscape.

## Cross-links
- `REG-006-settings-mobile-scroll-and-footer.md`
- `REG-046-forgiveness-difficulty-profiles-and-fairness-tuning.md`
- `REG-066-card-theme-system-and-theme-economy.md`
- `docs/new_design/SETTINGS_REFERENCE_CONTROLS_MATRIX.md`
