# REG-051: Pass And Play And Social Challenge Decision

## Status
Done

## Priority
P2

## Area
Meta

## Evidence
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`
- `docs/LEADERBOARDS_DEFERRAL.md`
- `src/shared/run-mode-catalog.ts`
- `src/shared/save-data.ts`
- `src/renderer/components/ChooseYourPathScreen.tsx`

## Problem
Comparable memory games often support pass-and-play, social challenges, or shareable seeds. The current app has local single-player flow and export/share foundations but no product decision on same-device or social play.

## Target Experience
The app should intentionally choose its social layer: none, share-only, pass-and-play, asynchronous daily comparison, or future online.

## Suggested Implementation
- Decide social scope for premium desktop: no social, pass-and-play, share strings only, or online later.
- If pass-and-play ships, define turn ownership, profiles, scoring, and input handoff.
- If share-only ships, coordinate with `RunExportPayload` and daily/weekly results.
- Persist social stats only if they are player-facing in `SaveData` or `PlayerStatsPersisted`.
- Avoid online promises without `REG-052` trust model.

## Acceptance Criteria
- Product decision is recorded and reflected in UI copy.
- No menu or mode surface implies multiplayer if it is not shipped.
- If pass-and-play is implemented, it supports restart, game over, and profile display.
- Share-only flow is clear and offline-safe.

## Verification
- Review menu, Choose Path, game over, and settings copy.
- Manual test any social challenge or pass-and-play prototype.
- Confirm save data does not persist unused multiplayer fields.

## Cross-links
- `REG-023-daily-weekly-results-loop.md`
- `REG-041-run-export-replay-seed-integrity.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`
