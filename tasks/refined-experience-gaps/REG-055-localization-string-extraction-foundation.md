# REG-055: Localization String Extraction Foundation

## Status
Open

## Priority
P2

## Area
Systems

## Evidence
- `docs/new_design/I18N_FOUNDATION.md`
- `docs/new_design/TASKS/TASKS_A11Y_I18N_E2E.md`
- `src/shared/mechanics-encyclopedia.ts`
- `src/renderer/copy/`
- `src/renderer/components/`

## Problem
The app is English-only, and that is acceptable for the current build, but future localization will be expensive if player-facing strings remain scattered across React components and shared logic.

## Target Experience
The codebase should be ready for localization without forcing a full i18n implementation before product needs it.

## Suggested Implementation
- Keep English-only shipping default for now.
- Consolidate new player-facing copy in shared or renderer copy modules instead of scattered literals where practical.
- Use stable IDs for mechanics, achievements, relics, mutators, and modes.
- When localization starts, prefer the documented `react-i18next` path unless product chooses Lingui.
- Bump `ENCYCLOPEDIA_VERSION` when player-facing mechanics text changes meaningfully.

## Acceptance Criteria
- New tasks and PRs know where player-facing copy belongs.
- Mechanics/Codex copy remains data-driven and versioned.
- No non-English locale is promised in UI before implementation.
- String concatenation is avoided for complex player-facing text.

## Verification
- Grep new UI work for hard-coded large copy blocks.
- Run mechanics encyclopedia tests after copy changes.
- No localization unit tests required until the i18n stack is implemented.

## Cross-links
- `REG-064-player-facing-copy-glossary-and-rules-language.md`
- `REG-029-input-accessibility-and-controller-comfort.md`
- `docs/new_design/I18N_FOUNDATION.md`
