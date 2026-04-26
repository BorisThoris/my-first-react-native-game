# REG-052: Leaderboards Trust Model And Online Deferral

## Status
Deferred

## Priority
P2

## Area
Systems

## Evidence
- `docs/LEADERBOARDS_DEFERRAL.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`
- `src/shared/telemetry.ts`
- `src/shared/run-mode-catalog.ts`
- `src/renderer/components/GameOverScreen.tsx`

## Problem
Leaderboards are attractive for daily/weekly retention, but client-reported scores are forgeable without a trust model. Adding online rankings casually would create fairness, privacy, and infrastructure risk.

## Target Experience
Online comparison should ship only when the project has a clear trust boundary. Until then, the app should use honest local history and share strings.

## Suggested Implementation
- Keep official scope offline-first unless product explicitly reopens online.
- If revived, limit leaderboards to daily UTC seed plus matching rules versions.
- Define payload: score, floor, mode, date key, `GAME_RULES_VERSION`, optional flip trace hash, and no PII.
- Separate analytics events from competitive submissions.
- Treat server API design as a separate future task before implementation.

## Acceptance Criteria
- UI does not promise online rankings unless backend/trust work exists.
- Daily/weekly comparison remains local or share-string based by default.
- Any leaderboard proposal includes anti-cheat and privacy notes.
- Telemetry and leaderboard data are not conflated.

## Verification
- Review menu, Choose Path, game over, and docs for leaderboard claims.
- Validate share string payload does not include private identifiers.
- No unit tests required until implementation starts.

## Cross-links
- `REG-023-daily-weekly-results-loop.md`
- `REG-068-complete-product-definition-of-done.md` (v1 “fully refined” = offline + mobile; online out of this ship)
- `REG-041-run-export-replay-seed-integrity.md`
- `REG-063-privacy-telemetry-consent-and-pii-scrubbing.md`
- `docs/LEADERBOARDS_DEFERRAL.md`
- `README.md` (*Current product scope (refinement bar)*)
