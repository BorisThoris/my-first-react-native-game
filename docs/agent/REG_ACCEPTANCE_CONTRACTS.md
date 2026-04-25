# REG acceptance contracts

schema: reg | phase | status | contract | proof

| reg | phase | status | contract | proof |
|---|---:|---|---|---|
| REG-033 | 1 | done | Agent queue, state index, test routing, and deferral ledger exist; first unblocked gates are explicit. | docs parse + git status |
| REG-068 | 1 | done | v1 scope is offline/local + Steam-supported + first-class mobile; online leaderboards/accounts/server realtime are non-blocking. | copy audit + local best-score wording |
| REG-052 | 1 | deferred | Competitive online leaderboard/server authority remains out of v1; local history/export/share may proceed. | deferral ledger + copy audit |
| REG-087 | 1 | done | Softlock/fairness P0 gate has deterministic tests for generated boards and high-risk mechanics; REG-120+ remains deep matrix. | targeted shared tests |
| REG-088 | 1 | done | New player can go from first launch/menu to an early successful run loop with clear local progress and no online dependency. | unit/component + routed e2e if UI changes |
| REG-089 | 1 | done | Save/rules/floor-schedule changes route through local-only version gate with validation commands and migration rules. | version-gate tests |
| REG-024 | 1 | done | Run economy separates score, temporary run currencies, temporary bonuses, durable stats/unlocks, and future shop wallet reset rules. | run-economy tests + HUD/inventory surfacing |
| REG-040 | 1 | done | Save write failures expose a health state, safe recovery action labels, and repeated-failure guidance without PII. | persistBridge tests + main persistence error tests |
| REG-063 | 1 | done | Telemetry distinguishes local debug sinks from remote collection, scrubs PII/path/secrets, and keeps leaderboards separate. | telemetry tests |
| REG-017 | 2 | done | Eligible endless floor clears expose deterministic local route choices before continuing; route hooks remain offline and shop-ready. | game + floor-clear UI tests |
| REG-015 | 2 | done | Runs earn temporary shop gold, expose local vendor offers, and can spend once on eligible floor-clear shops without durable economy changes. | game + floor-clear UI tests |
| REG-018 | 2 | done | Visual Endless remains intentionally locked/upcoming while Classic owns playable procedural endless progression copy. | run-mode catalog + encyclopedia tests |
| REG-019 | 2 | done | Relic draft data exposes build archetypes and UI surfaces those archetype tags alongside contextual reasons. | relic tests + draft UI tests |
| REG-020 | 2 | done | Endless chapter schedule exposes chapter themes and UI telegraphs active mutator roles before/during floors. | floor schedule + GameScreen tests |
| REG-021 | 2 | done | Main menu exposes active/completed/locked local objective board rows from save-derived mastery progress. | objective-board tests + menu surface |

default_contracts:
  runtime: implement minimal offline-capable vertical slice; no mandatory online service.
  ui: must meet responsive/touch quality for affected surfaces.
  schema: if SaveData/Settings/PlayerStatsPersisted changes, run REG-089 gate and migration tests.
  rules: if RunState/rules/catalog/generated identity changes, run REG-089 gate and deterministic tests.
  assets: placeholders allowed; final licensed art/audio/store media may be deferred with unblock condition.
