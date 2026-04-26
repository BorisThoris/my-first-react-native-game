# REG-045: Power Verbs Charge Economy And Toolbar Teaching

## Status
Done

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/game.ts`
- `src/shared/contracts.ts`
- `src/renderer/components/GameLeftToolbar.tsx`
- `src/renderer/components/GameplayHudBar.tsx`
- `docs/gameplay-depth/02-helper-tiers-and-cognitive-jobs.md`
- `docs/GAME_MECHANICS_PLAN.md`

## Problem
The power verbs are powerful, but players may not understand the difference between Recall, Search, and Damage-control tools, their opportunity costs, and their impact on perfect achievements.

## Target Experience
Toolbar powers should read as meaningful verbs with visible charges, costs, disabled reasons, and achievement consequences. Players should know why they would use shuffle, region shuffle, peek, destroy, pin, undo, stray, flash, or gambit.

## Suggested Implementation
- Group powers by cognitive job: Recall, Search, Damage control, Risk.
- Add compact teaching copy and disabled reasons for each power.
- Surface charge source and perfect-memory implications in HUD, tooltip, or Codex.
- Keep charge and cost logic in `RunState` and shared rules.
- Bump `GAME_RULES_VERSION` when power costs, scoring, or achievement predicates change.

## Acceptance Criteria
- Every toolbar power has a clear player-facing purpose and disabled reason.
- Power use consequences for score, charges, contracts, and achievements are visible.
- Mobile toolbar remains usable without bloating the board frame.
- Codex and tutorial language matches actual rules.

## Verification
- Unit test changed power rules.
- Manual run using every power and invalid state.
- Capture toolbar states on mobile and desktop.

## Cross-links
- `REG-003-gameplay-sidebar-integration.md`
- `REG-026-playable-onboarding.md`
- `REG-064-player-facing-copy-glossary-and-rules-language.md`
