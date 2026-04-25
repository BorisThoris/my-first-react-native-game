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
| REG-022 | 2 | done | Built-in puzzle library has metadata/progress rows, persisted local completion slots, and import validation errors. | puzzle-import + save-data tests |
| REG-025 | 2 | done | Cosmetics are scoped to visual-only unlock tags with collection/inventory owned/locked/equipped surfaces and fallbacks. | cosmetics tests + UI typecheck |
| REG-045 | 2 | done | Board powers are grouped as Recall/Search/Damage/Risk verbs with costs, disabled reasons, and Perfect Memory consequences. | power-verbs tests + toolbar UI |
| REG-046 | 2 | done | Default forgiveness profile is explicit: softened memorize curve, first-miss grace, clean/perfect life recovery, and fixed daily comparability. | difficulty-profile + HUD tests |
| REG-047 | 2 | done | Symbol bands expose readability profiles and validation catches duplicate/confusable labels before mobile-facing drift. | tile-symbol catalog tests |
| REG-048 | 2 | done | Secondary objectives expose active/failed/completed copy, HUD state, and floor-clear completion/failure explanation. | secondary-objectives + HUD/GameScreen tests |
| REG-049 | 2 | done | Findables expose reward copy for shard/score pickups across HUD and tile a11y without changing reward values. | findables + HUD/TileBoard tests |
| REG-050 | 2 | done | Wild, Gauntlet, and Meditation mode cards/details/results state distinct player promises, constraints, and achievement eligibility. | run-mode catalog + GameOver tests |
| REG-065 | 2 | done | Puzzle content tail has pack taxonomy, authored metadata, an advanced built-in board, and safe import/library validation. | puzzle-import + save-data tests |
| REG-066 | 2 | done | Card-back theme slots are real cosmetic rows with asset/fallback contracts while selection persistence remains deferred. | cosmetics tests + Settings/Inventory typecheck |
| REG-069 | 2 | done | Route graph contract names deterministic combat/shop/elite/rest node hooks, seed identity, and default selected node without new online state. | run-map tests |
| REG-070 | 2 | done | Vendor offers expose base/scaled cost, stock, sold-out state, and one local reroll with gold-gated failure UX. | game + floor-clear UI tests |
| REG-071 | 2 | done | Shop catalog rows include item families, compatibility, stack caps, and service effects for heal, peek, destroy, and discount services. | game catalog tests + floor-clear UI tests |
| REG-072 | 2 | done | Shop wallet pacing exposes deterministic floor earnings, current wallet, sink total, and run-end expiry. | game wallet tests |
| REG-073 | 2 | done | Rest/shrine services define local heal, favor bargain, costs, risk types, and disabled reasons without adding persisted state. | rest-shrine tests |
| REG-074 | 2 | done | Random event rooms expose deterministic seed-based event selection, choice rewards, risk labels, and no-op invalid choices. | run-events tests |
| REG-075 | 2 | done | Treasure/secret bonus rewards expose deterministic seed-based reveal rules, anti-grind one-claim tokens, economy-safe payouts, and route-map treasure hooks. | bonus-rewards + run-map tests |
| REG-076 | 2 | done | Boss and elite floors expose identity tiers, telegraph copy, reward pressure, placeholder slots, and HUD-readable boss/elite tags. | boss-encounters + floor schedule/HUD tests |
| REG-077 | 2 | done | Endless floors expose stable act, biome, cycle-floor, progress, and gate metadata through schedule helpers, HUD copy, and Codex text. | floor schedule + HUD tests |
| REG-078 | 2 | done | Relic draft services expose shop-gold costs, once-per-round reroll/ban/upgrade availability, deterministic offer mutation, and disabled failure copy. | relics/game/GameScreen tests |
| REG-079 | 2 | done | Run inventory exposes run-scoped loadout slots, consumable stack caps, mutation timing, and offline/non-persistent constraints in rules and Inventory UI. | run-inventory + InventoryScreen tests |
| REG-080 | 2 | done | Permanent meta track exposes local-only upgrade/cosmetic rows, progress gates, unlock tags, no pay-to-skip currency, and Collection surfacing. | meta-progression + cosmetics tests |
| REG-081 | 2 | done | Challenge modes expose offline save-derived gate rows, lock/available states, eligibility notes, and Choose Path detail copy for Gauntlet, puzzles, and contracts. | challenge-progression + run-mode catalog tests |
| REG-082 | 2 | done | Quest campaign ladder exposes authored local quest steps, contract requirements, progress/status rows, failure/retry rules, and Main Menu surfacing. | quest-campaign tests |
| REG-083 | 2 | done | Daily/weekly/season archive rows expose offline UTC identities, local streak/history summaries, share strings without PII, and Collection archive surfacing. | daily-archive tests |
| REG-084 | 2 | done | Puzzle packs expose medal rows, curation tier/order, completion progress, unlock status, and local-only author/version metadata. | puzzle-import tests |
| REG-085 | 2 | done | Run history exposes local journal/build/replay rows from RunSummary/RunState without creating a second save file or leaking PII. | run-history tests |
| REG-086 | 2 | done | Balance simulation exposes deterministic offline economy/drop-rate baselines for shop gold, findables, boss cadence, and relic offer rarity drift. | balance-simulation tests |
| REG-001 | 3 | done | Mobile gameplay chrome gives board-first ratio: tighter HUD/rail footprint, larger camera fit margin, and safe touch targets for common phone portraits. | tileBoardViewport tests + typecheck |
| REG-002 | 3 | done | Desktop gameplay stage uses denser play-dais spacing and wider fit budget to reduce dead space while preserving HUD/toolbar interaction. | tileBoardViewport tests + typecheck |
| REG-003 | 3 | done | Gameplay side rail is a canonical icon spine with integrated chrome, desktop flyout labels, compact mobile footprint, and unchanged keyboard focus order. | GameScreen + typecheck tests |
| REG-004 | 3 | done | Gameplay HUD defines primary/secondary/tertiary hierarchy with score/floor/lives first, tactical context second, and passive stats collapsed into an accessible details drawer. | GameplayHudBar tests |
| REG-005 | 3 | done | In-game rules hints use progressive disclosure: hidden by default after FTUE, explicit Rules toggle, contextual first-exposure nudges, and shortcut help remains available. | GameScreen tests |
| REG-006 | 3 | done | Settings page/modal keeps phone and short-view footer actions sticky, body scrollable, and dense category/subsection controls reachable without schema changes. | SettingsScreen tests |
| REG-007 | 3 | done | Game-over mobile layout keeps score/outcome and replay/menu actions above the fold, with detailed stat grids moved behind a post-run details disclosure. | GameOverScreen tests |
| REG-008 | 3 | done | Overlay modal shell uses explicit decision/sheet classes, internal scroll body, sticky safe-area action footer, and stable focus-trap behavior on mobile. | OverlayModal tests |
| REG-009 | 3 | done | Main menu mobile/landscape density exposes compact quick-action hierarchy, primary Play prominence, and non-competing secondary meta links. | MainMenu tests |
| REG-014 | 3 | done | Design-system density tokens expose compact/roomy panel/button/shell spacing tiers so major screens share dead-space language without one-off padding. | theme tests + typecheck |
| REG-028 | 3 | done | Short/mobile viewport matrix is centralized with expected compact, stack, camera, settings, and modal behaviors for high-traffic screens. | breakpoints/viewport matrix tests |
| REG-034 | 3 | done | Startup intro exposes a single hydration/skip/asset contract: keyboard and pointer skip request an exit, slow assets show readable pending/fallback state, focus returns to menu root, and menu pointer interaction remains blocked underneath. | startup intro contract/component tests + targeted e2e |
| REG-044 | 3 | done | Navigation return behavior is defined by a bounded route contract: menu/meta settings retain return targets, in-run meta overlays freeze/resume run state, invalid/null-run closes route to menu, and tests cover store plus navigation e2e flows. | navigation model/store tests + navigation-flow e2e |
| REG-016 | 3 | done | Meta progression exposes profile level, next reward, long-term goal, reward sources, and explicit gameplay-affecting vs cosmetic-only mode rules without a save schema bump. | meta-progression + save/store tests |

default_contracts:
  runtime: implement minimal offline-capable vertical slice; no mandatory online service.
  ui: must meet responsive/touch quality for affected surfaces.
  schema: if SaveData/Settings/PlayerStatsPersisted changes, run REG-089 gate and migration tests.
  rules: if RunState/rules/catalog/generated identity changes, run REG-089 gate and deterministic tests.
  assets: placeholders allowed; final licensed art/audio/store media may be deferred with unblock condition.
