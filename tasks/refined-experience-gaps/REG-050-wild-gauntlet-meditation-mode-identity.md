# REG-050: Wild Gauntlet Meditation Mode Identity

## Status
Done

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/run-mode-catalog.ts`
- `src/shared/game.ts`
- `src/renderer/components/ChooseYourPathScreen.tsx`
- `docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md`
- `docs/gameplay-depth/05-app-specific-idea-backlog.md`

## Problem
Wild, Gauntlet, and Meditation are mechanically present, but their player promises can blur. Each mode needs a stronger identity, reward reason, and UI treatment.

## Target Experience
Players should choose modes for distinct reasons: Wild for chaos and power discovery, Gauntlet for timed pressure, Meditation for focused practice and comfort.

## Suggested Implementation
- Rewrite mode cards around player goals, not implementation details.
- Add distinct visual tags, audio tone, and start settings per mode.
- Decide which modes affect achievements, stats, and progression.
- Store mode-specific records in `PlayerStatsPersisted` if surfaced.
- Use `RunModeDefinition` for mode metadata and bump `GAME_RULES_VERSION` if rules change.

## Acceptance Criteria
- Each mode has a unique start promise and outcome summary.
- Mode-specific constraints are visible before starting.
- Achievements and stats explain eligibility.
- Choose Path remains scannable on mobile.

## Verification
- Start and finish each mode manually.
- Capture Choose Path cards and game-over summaries.
- Unit test any mode-specific rule changes.

## Cross-links
- `REG-010-choose-path-discoverability.md`
- `REG-018-endless-mode-shipping-plan.md`
- `REG-043-pause-timer-resume-and-interruption-contract.md`
