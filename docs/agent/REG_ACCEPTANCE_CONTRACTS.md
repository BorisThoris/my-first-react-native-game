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

default_contracts:
  runtime: implement minimal offline-capable vertical slice; no mandatory online service.
  ui: must meet responsive/touch quality for affected surfaces.
  schema: if SaveData/Settings/PlayerStatsPersisted changes, run REG-089 gate and migration tests.
  rules: if RunState/rules/catalog/generated identity changes, run REG-089 gate and deterministic tests.
  assets: placeholders allowed; final licensed art/audio/store media may be deferred with unblock condition.
