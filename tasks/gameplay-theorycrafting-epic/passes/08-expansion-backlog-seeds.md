# Pass 8: Expansion Backlog Seeds

## Status
Completed task-conversion pass on 2026-05-03.

## Purpose
Convert mature theory into later tasks without prematurely committing to implementation.

## Seed Statuses
| Status | Meaning |
| --- | --- |
| Research | Needs more theory or playtest framing. |
| Prototype | Worth building behind dev/sandbox only. |
| Candidate | Likely useful, needs task breakdown. |
| Ready | Has design, UI, rules, tests, and risk answered. |
| Deferred | Good idea, wrong time or too risky. |
| Rejected | Fails the quality gate. |

## Task Seed Template
- Title.
- Source pass.
- Player decision.
- Current-system connection.
- Proposed rule.
- Required UI/visual/audio.
- Softlock and exploit risks.
- Test plan.
- Dependencies.
- Open questions.
- Status.

## Conversion Rules
- Do not create implementation tasks from raw ideas.
- Do not mark a seed Ready without UI and test plans.
- Prefer small vertical prototypes over broad rewrites.
- Preserve deterministic local/offline rules.

## Generated Task Pack
The matured seeds have been converted into implementation-ready planning tasks under `../task-conversion/`.

| Epic | Focus |
| --- | --- |
| `EPIC-01-core-loop-gates` | Memory-tax review, Perfect Memory impact, and softlock matrix. |
| `EPIC-02-action-dock-and-powers` | Core dock, contextual resolve actions, target previews, and consequence copy. |
| `EPIC-03-feedback-language` | Semantic tokens, floor-clear causality, a11y parity, and audio cues. |
| `EPIC-04-safe-card-suite` | Disarm Bounty, Guard Shrine, Scout Room, Cache Lock, Trap Workshop, and Boss Trophy Cache. |
| `EPIC-05-floor-and-encounter-identity` | Floor intros, Trap Bounty Hall, Recovery Study Room, Locked Gallery, and Boss Trophy Moment. |
| `EPIC-06-archetypes-and-relic-meaning` | Archetype language, feedback, payoff, engines, and relic role audit. |
| `EPIC-07-prototype-sandbox` | Sandbox-only Omen, Mimic, Anchor/Gateway, Catalyst/Parasite, and Pin Lattice prototypes. |

## Seed Table
| Seed | Source | Status | Note |
| --- | --- | --- | --- |
| Core-loop protection gate | Pass 1 | Candidate | Future implementation tasks must include phase hooks, detailed memory-tax score, Perfect Memory impact, UI tokens, and softlock proof before graduation. |
| Memory-tax review pass | Pass 1 | Candidate | Score the current action dock, safe card suite, prototype card suite, and floor identities before choosing the first implementation slice. |
| Build archetype implementation slices | Pass 5 | Candidate | Convert the completed archetype theory into small future tickets after Pass 3 and Pass 7 define action and feedback contracts. |
| Action button implementation slices | Pass 3 | Candidate | Convert the completed action contract into small future tickets for dock grouping, contextual actions, target previews, and teaching copy. |
| Archetype-supporting card implementation slices | Pass 6 | Candidate | Convert Pass 4 card suites into future vertical slices using Pass 6 floor/node assignments. |
| Archetype feedback implementation slices | Pass 7 | Candidate | Convert the completed feedback contract into future tasks for build identity in relic draft, HUD, floor clear, route choice, Codex, and collection. |
| Trap cartographer relic | Pass 2 | Research | Candidate trap-control/scout relic: first armed trap each floor is marked after memorize, with strong fairness and anti-trivialization review. |
| Pin lattice relic | Pass 2 | Research | Candidate scout relic: matching a pinned pair refunds limited pin capacity, rewarding correct memory rather than random marking. |
| Guard conversion relic | Pass 2 | Research | Candidate guard/combo relic: unspent guard converts into a bounded floor-clear payoff without encouraging stalling. |
| Archetype display names | Pass 5 | Candidate | Proposed UI-facing names: The Warden, The Saboteur, The Vaultbreaker, The Slayer, The Gambit, The Seer, and The Catalyst; source IDs stay stable until an implementation pass. |
| Warden feedback pass | Pass 5 | Research | Make guard saves, unused guard, and pressure-route survival emotionally legible in HUD and floor clear. |
| Saboteur trap payoff pass | Pass 5 | Research | Define trap disarm rewards, destroy forfeits, and trap-control previews before adding more trap-control relics. |
| Vaultbreaker economy pass | Pass 5 | Research | Make treasure, cache, key, lock, shop, and shrine decisions feel like one extraction economy. |
| Slayer boss prep pass | Pass 5 | Research | Add boss preview, pre-boss preparation, and post-boss trophy concepts once boss identity is stronger. |
| Gambit route wager pass | Pass 5 | Research | Clarify route risk, wager manipulation, and risk payout summaries without making risk always correct. |
| Seer information fairness pass | Pass 5 | Research | Distinguish fair information tools from brute-force reveal across peek, pin, stray, Mystery, and hidden cards. |
| Catalyst shard engine pass | Pass 5 | Research | Define visible engine states and shard spend verbs before expanding combo-shard scaling. |
| Core dock placement pass | Pass 3 | Candidate | Keep repeatable active-play verbs in the dock and move resolve/card/between-floor actions to contextual surfaces. |
| Contextual action surface pass | Pass 3 | Research | Define resolve strips, card prompts, route prompts, and modal actions so rare actions do not crowd the dock. |
| Target preview pass | Pass 3 | Candidate | Add future tasks for tile, row, destroy-forfeit, peek-scope, stray-invalid, and card-activation previews. |
| Perfect-impact copy pass | Pass 3 | Candidate | Make button, teaching, floor-clear, and Codex language consistently show whether an action locks Perfect Memory. |
| Archetype-aware power teaching | Pass 3 | Research | Connect powers to The Warden, The Saboteur, The Vaultbreaker, The Slayer, The Gambit, The Seer, and The Catalyst without making separate build toolbars. |
| Semantic mechanic tokens | Pass 7 | Candidate | Use Safe, Risk, Reward, Armed, Resolved, Hidden-known, Objective, Build, Cost, Forfeit, Locked, and Momentum as future design vocabulary. |
| Floor-clear causality summaries | Pass 7 | Research | Summarize what changed, what was gained or lost, what caused it, and which next choice matters. |
| Audio semantic cue pass | Pass 7 | Research | Align arm, commit, reveal, reward, fail, disarm, lock, and floor-clear cues with the existing audio matrix. |
| A11y mechanic parity pass | Pass 7 | Candidate | Ensure important mechanic state changes have non-visual paths through labels, live regions, focus, or persistent text. |
| Card token feedback pass | Pass 7 | Candidate | Require future card families to define family, state, token, target preview, success, failure, and forfeit feedback. |
| Safe near-term card suite | Pass 4 | Candidate | Explore Disarm Bounty, Guard Shrine Pair, Scout Room, Cache Lock, Trap Workshop Room, and Boss Trophy Cache as low-risk vertical slices. |
| Chaos prototype card suite | Pass 4 | Prototype | Sandbox Mimic Cache, Omen Pair, Anchor Seal, Catalyst Altar, Loaded Gateway, Pin Lattice Card, and Parasite Vessel. |
| Engine research card suite | Pass 4 | Deferred | Defer Time Loop, Mirror, Gravity Row, Living Door, Relic Echo, Shop Debt, Fog Bank, and Chain Reactor until engine rules mature. |
| Rejected unfair card archive | Pass 4 | Rejected | Preserve rejected ideas such as Invisible Trap, Random Card Swap, Permanent Blind Card, Mandatory Sacrifice Exit, Infinite Copy Mirror, and Silent Score Tax as design boundaries. |
| Card softlock matrix | Pass 4 | Candidate | Future card tickets need board-complete, target legality, destroy/shuffle/peek/stray, singleton fallback, and contract compatibility checks. |
| Encounter grammar contract | Pass 6 | Candidate | Use pressure, reward, information, recovery, objective, and build hook as the floor design grammar for future tasks. |
| Trap Bounty Hall | Pass 6 | Candidate | Trap node or floor 7 vertical slice pairing Disarm Bounty with Saboteur/Warden/Seer feedback. |
| Recovery Study Room | Pass 6 | Candidate | Breather/rest/shop vertical slice using Scout Room and Guard Shrine to support Warden and Seer. |
| Locked Gallery | Pass 6 | Candidate | Treasure floor vertical slice using Cache Lock to create Vaultbreaker extraction decisions. |
| Boss Trophy Moment | Pass 6 | Research | Boss floor payoff slice using Boss Trophy Cache after boss objective success. |
| Omen Event prototype | Pass 6 | Prototype | Event/script/shadow floor sandbox for Omen Pair and learnable uncertainty. |
| Parasite Vessel floor | Pass 6 | Prototype | Floor 11 sandbox for turning parasite pressure into Catalyst decision-making. |

## Output
Pass 8 now points to a concrete task-conversion pack. Future implementation should start with `task-conversion/README.md`, then work through EPIC-01 and EPIC-03 before shipping new card or floor mechanics.
