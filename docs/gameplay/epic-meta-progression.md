# Epic: Meta — achievements, telemetry, saves

## Scope

Steam-style achievements, anonymous telemetry hooks, save schema, and how they interact with run flags (`powersUsedThisRun`, `achievementsEnabled`).

## Implementation status

| System | Status | Notes |
|--------|--------|--------|
| Achievements (5) | **Shippable** | `achievements.ts` — first clear, level 5, 1000 score, perfect clear, last-life finish. |
| Perfect clear rule | **Functional** | Gated on `!powersUsedThisRun` — but **powersUsedThisRun** is set by many actions (see powers epic); contract comment understates this (**Risky**). |
| Unlock delivery | **Shippable** | `evaluateAchievementUnlocks` from `applyResolvedRun`; `desktopClient.unlockAchievement` when available. |
| Telemetry | **Partial** | `telemetry.ts` — `trackEvent` / `setTelemetrySink`; **no in-repo sink wired**; events include `run_start` / `run_complete` from store. |
| Save data | **Shippable** | `save-data.ts`, schema version, `normalizeSaveData` merging new settings keys. |
| Encore pair keys | **Functional** | Stored in player stats for encore scoring hook. |

## Rough edges

- **Telemetry:** Infrastructure exists; product analytics depends on host injecting `setTelemetrySink`.
- **Achievement fairness:** Players may not realize undo/peek/gambit disqualify “perfect” — consider UI hint or rename.

## Primary code

- `src/shared/achievements.ts`, `achievements.test.ts`
- `src/shared/telemetry.ts`
- `src/shared/save-data.ts`
- `src/renderer/store/useAppStore.ts` — `applyResolvedRun`, `trackEvent` payloads

## Refinement

**Shippable** for achievements + save. **Partial** for telemetry (no default sink). **Risky** for perfect-clear expectations vs `powersUsedThisRun` breadth.

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §3–4.

- [x] Wire or document `setTelemetrySink` for shipping builds (Electron main dev hook, opt-in file sink, or product “no analytics” stance).
- [x] Improve perfect-clear discoverability: tooltip, achievement description, or rename so players know undo/peek/gambit/stray/etc. disqualify (coordinate with [epic-powers-and-interactions](./epic-powers-and-interactions.md) comment fix).
