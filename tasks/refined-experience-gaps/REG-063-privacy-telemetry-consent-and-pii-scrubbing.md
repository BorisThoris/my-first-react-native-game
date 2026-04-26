# REG-063: Privacy Telemetry Consent And PII Scrubbing

## Status
Done

## Priority
P1

## Area
Systems

## Evidence
- `src/shared/telemetry.ts`
- `src/shared/telemetry.test.ts`
- `src/renderer/App.tsx`
- `docs/refinement-tasks/REF-067.md`
- `docs/LEADERBOARDS_DEFERRAL.md`

## Problem
Telemetry can support balance, but it also creates privacy obligations. The current sink is optional and scrubbed, but product policy, consent, retention, and event taxonomy need to be explicit before any real sink ships.

## Target Experience
Players should know whether telemetry exists, what is collected, and how to disable it. Developers should get useful balance data without PII or leaderboard trust confusion.

## Suggested Implementation
- Define event categories: local debug, balance playtest, crash/error, and online competitive submission.
- Keep `TelemetryPayload` scrubbed and documented.
- Add opt-in or opt-out policy before non-local telemetry ships.
- Add Settings copy only when a real telemetry sink exists.
- Do not include player names, emails, raw file paths, or account identifiers by default.

## Acceptance Criteria
- Telemetry policy distinguishes local logs from remote collection.
- PII scrub tests cover known risky keys.
- Balance events are useful without identifying players.
- Leaderboard submissions, if ever added, are separate from telemetry.

## Verification
- Run telemetry tests.
- Review event payloads from sample play sessions.
- Confirm settings and privacy copy match actual behavior.

## Cross-links
- `REG-030-telemetry-and-balance-playtest-loop.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`
- `REG-041-run-export-replay-seed-integrity.md`
