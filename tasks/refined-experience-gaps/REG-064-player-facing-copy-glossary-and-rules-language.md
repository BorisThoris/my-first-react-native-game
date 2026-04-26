# REG-064: Player Facing Copy Glossary And Rules Language

## Status
Done

## Priority
P1

## Area
UI

## Evidence
- `src/shared/mechanics-encyclopedia.ts`
- `src/shared/game-catalog.ts`
- `src/renderer/copy/`
- `src/renderer/components/GameScreen.tsx`
- `docs/gameplay-tasks/ENCYCLOPEDIA_FOLLOWUP_TASKS.md`
- `CONTRIBUTING.md`

## Problem
The game has many terms: lives, guards, shards, favor, relics, mutators, contracts, powers, findables, dailies, perfect memory, score parasite, and floor tags. If copy drifts, players will misunderstand rules.

## Target Experience
Player-facing language should be consistent across HUD, tooltips, Codex, onboarding, settings, game over, and mode cards.

## Suggested Implementation
- Create or audit a glossary for recurring terms and preferred labels.
- Use `mechanics-encyclopedia.ts` as the canonical player-facing mechanics source.
- Bump `ENCYCLOPEDIA_VERSION` when meaningfully changing mechanics copy.
- Align HUD, game over, Codex, and onboarding text with the glossary.
- Avoid exposing internal-only names unless they are the intended player labels.

## Acceptance Criteria
- Key mechanics have one preferred player-facing name.
- HUD, Codex, and game-over wording agree on power and achievement consequences.
- New `RelicId`, `MutatorId`, or mechanic work includes encyclopedia updates.
- Copy remains concise on mobile.

## Verification
- Run mechanics encyclopedia tests.
- Grep for duplicate or conflicting labels after copy changes.
- Manual review onboarding, HUD, Codex, settings, and game-over language.

## Cross-links
- `REG-005-in-game-rules-hints-disclosure.md`
- `REG-026-playable-onboarding.md`
- `REG-055-localization-string-extraction-foundation.md`
