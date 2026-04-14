# Epic: Lives, pressure, and pacing

## Scope

Life loss and recovery, guard tokens, combo shards, mismatch grace, memorize timing, gauntlet countdown, and parasite-style pressure.

## Implementation status

| Mechanic | Status | Notes |
|----------|--------|--------|
| Lives (max/cap) | **Shippable** | `INITIAL_LIVES` / `MAX_LIVES`; loss on mismatch after grace; guard can absorb. |
| Guard tokens | **Shippable** | Consumed before life on some mismatch paths. |
| Combo shards / chain heal | **Shippable** | Match rewards; **meditation** disables chain-heal life per game rules. |
| Mismatch “grace” | **Functional** | First-mismatch behavior tied to tries / stats — tune with care. |
| Memorize phase | **Shippable** | `getMemorizeDuration` / `getMemorizeDurationForRun`; mutators and relics adjust; meditation lengthens. |
| Echo feedback | **Shippable** | User `echoFeedbackEnabled`; extends mismatch visibility window (`ECHO_EXTRA_RESOLVE_MS` path). |
| Gauntlet timer | **Functional** | Menu presets **5 / 10 / 15** minutes (`createGauntletRun(..., durationMs)`); `gauntletSessionDurationMs` on `RunState` stores the chosen length for **restart**; `gauntletDeadlineMs` is wall-clock expiry; store + HUD paths unchanged. |
| Score parasite | **Shippable** | Mutator + `parasiteFloors` / ward relic; advance-level life hit. |
| Contracts (max mismatches) | **Functional** | Scholar / special runs can cap mismatches → game over. |

## Rough edges

- **Gauntlet:** Multiple **menu** durations; still no in-run difficulty curve beyond the base game (product could add scaling later).
- **Parasite + UX:** HUD shows progress, ward stock, and screen-reader lines via `useHudPoliteLiveAnnouncement`; Codex covers mutator + relic.

## Primary code

- `src/shared/game.ts` — life/guard/combo/parasite/gauntlet checks, memorize helpers, `advanceToNextLevel`.
- `src/renderer/components/GameplayHudBar.tsx`, `GameScreen.tsx` — gauntlet and parasite messaging.

## Refinement

**Shippable** for core pressure loops. **Functional** for gauntlet as a “mode shell” with a **few** timer knobs (preset minutes).

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §8.

- [x] (Product) Gauntlet: **multiple presets** (5 / 10 / 15m) on main menu; `gauntletSessionDurationMs` for restart fidelity.
- [ ] (Product) Gauntlet: optional scaling difficulty or post-ship tuning beyond timer length.
- [x] Codex or HUD: reinforce **score parasite** for players who skip mutator HUD chips. *(HUD: accurate drain/ward tooltip, `aria-label`, **Ward ×N** when `parasiteWardRemaining` > 0; Codex already documents mutator + relic.)*
