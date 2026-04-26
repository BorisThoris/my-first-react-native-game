# REG-056: Cognitive Accessibility And Older Player Comfort

## Status
Done

## Priority
P1

## Area
QA

## Evidence
- `src/renderer/components/SettingsScreen.tsx`
- `src/renderer/components/TileBoard.tsx`
- `src/shared/cameraViewportMode.ts`
- `src/renderer/styles/theme.wcag.test.ts`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`
- `docs/new_design/TASKS/TASKS_A11Y_I18N_E2E.md`

## Problem
The game has many cognitive demands: memorize windows, symbol similarity, timers, mutators, toolbars, and dense HUD states. Older or casual players need comfort settings and clear goals without flattening the core challenge.

## Target Experience
Players should be able to tune readability, motion, timing, and assistance. The app should avoid relying on hue alone, tiny text, or unexplained time pressure.

## Suggested Implementation
- Audit touch target size, font size, contrast, motion, timer pressure, and cognitive load.
- Add or refine comfort settings only when they map to real behavior in `Settings`.
- Ensure color is never the only carrier of essential information.
- Keep accessibility settings separate from difficulty or monetized rewards.
- Use `GAME_RULES_VERSION` only when comfort settings alter scoring or rules.

## Acceptance Criteria
- Key controls meet practical touch target and focus visibility standards.
- Critical game state has shape/text/icon redundancy beyond color.
- Timed modes have clear alternatives or explanations.
- Settings copy distinguishes accessibility from challenge difficulty.

## Verification
- Run scoped a11y e2e and contrast tests.
- Manual keyboard and touch pass.
- Capture small mobile board and HUD states for readability review.

## Cross-links
- `REG-029-input-accessibility-and-controller-comfort.md`
- `REG-047-symbol-band-readability-and-distractor-similarity.md`
- `REG-046-forgiveness-difficulty-profiles-and-fairness-tuning.md`
