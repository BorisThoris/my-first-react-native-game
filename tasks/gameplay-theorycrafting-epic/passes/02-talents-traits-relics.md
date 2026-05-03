# Pass 2: Talents, Traits, And Relics

## Status
Completed theory recommendation on 2026-05-03.

## Purpose
Decide whether talents/traits become real systems, and redesign run rewards around meaningful playstyles.

## Current Anchors
- `src/shared/relics.ts`
- `src/shared/mechanics-encyclopedia.ts`
- `src/shared/contracts.ts`
- `docs/BALANCE_NOTES.md`
- `tasks/refined-experience-gaps/REG-019-relic-build-archetypes.md`
- `tasks/refined-experience-gaps/REG-156-relic-mutator-synergy-exploits-balance.md`

## Recommendation
Do not add a separate talent system for v1. The game already has several overlapping build and pressure layers, and another named layer would make the current clarity problem worse before it makes builds deeper.

Use the existing systems harder:

- Relics stay as run-scoped draft rewards.
- Archetypes become the player-facing build language.
- Mutators stay as external pressure rules.
- Contracts stay as voluntary challenge constraints.
- Traits become internal design/data tags, not a headline player-facing system.

This means "talent" is parked as a future term. It should not appear in v1 UI unless a later meta-progression pass reopens the idea with a specific non-overlapping job.

## System Boundaries
| Term | Decision |
| --- | --- |
| Talent | Parked. No v1 gameplay layer. Future use only if the game needs run-start kits or class identities. |
| Trait | Internal tag on relics, floors, cards, mutators, routes, or actions. Used for synergy, draft weighting, filtering, and tests. Not a primary UI word. |
| Relic | Run-scoped draft reward that should change board decisions, route appetite, action economy, or risk tolerance. |
| Archetype | Player-facing build identity assembled from relics, actions, card interactions, routes, objectives, and mutator answers. |
| Mutator | External rule pressure that changes how the player reads a floor or run. |
| Contract | Voluntary constraint that changes scoring, rewards, or mastery goals. |

## Current Read
The code already contains useful build infrastructure:

- `RelicBuildArchetype` buckets exist in `src/shared/relics.ts`.
- Relic draft rows already have tags, rarities, archetypes, and contract filters.
- Scheduled Endless drafts already bias toward contextual answers.
- Relic offer UI already has archetype labels and contextual reasons.
- Meta progression exists, but it is not the right place to smuggle in a talent tree yet.

The weakness is not absence of data. The weakness is that many effects still read like utility inventory instead of a run fantasy. The player can get more charges, more time, or more safety without feeling like they are becoming a specific kind of player.

## Relic Meaning Audit
| Relic | Current Meaning | Theory Verdict | Rescue Direction |
| --- | --- | --- | --- |
| `extra_shuffle_charge` | More full-board control. | Useful but generic. | Tie to trap-control identity with trap previews, shuffle tax clarity, and "stabilize chaos" copy. |
| `first_shuffle_free_per_floor` | Reduces shuffle cost pressure. | Stronger than a plain charge because it changes willingness to use a tool. | Surface "first shuffle free" directly on the action button and floor start. |
| `memorize_bonus_ms` | More study time. | Comfort effect, not yet build-defining. | Reframe as scout/guard prep: extra time should pair with floor-intel or pin/peek planning. |
| `memorize_under_short_memorize` | Answer to short memorize. | Good contextual answer, narrow identity. | Keep as an anti-pressure relic and label it as a chapter answer. |
| `region_shuffle_free_first` | Free row control. | Good because it changes target selection. | Make row choice feel like a tactical action, not a hidden alternate shuffle. |
| `destroy_bank_plus_one` | More pair removal. | Strong action economy, but risks becoming a generic delete button. | Keep in trap-control/boss-hunter only if destroy has visible opportunity cost and forfeits rewards clearly. |
| `combo_shard_plus_step` | Raises shard ceiling. | Needs payoff visibility. | Show "engine online" states and connect shards to deliberate streak decisions. |
| `parasite_ward_once` | One parasite safety valve. | Good if parasite pressure is visible. | Show the ward before it saves the player and after it is spent. |
| `peek_charge_plus_one` | More information. | Strong scout identity. | Pair with Mystery routes, hidden card tells, and action-button targeting preview. |
| `stray_charge_plus_one` | Removes awkward singleton/stray pressure. | Currently sounds like cleanup, not fantasy. | Recast as scout/control tech that fixes dangerous layouts or special-card noise. |
| `pin_cap_plus_one` | More marks. | Strong memory-skill tool because it does not solve the board by itself. | Make pin builds legible in HUD: planned reads, vow pressure, and current cap. |
| `guard_token_plus_one` | Safety buffer. | Strong if guard is a visible resource. | Treat as guard-tank core; show what it can absorb before danger happens. |
| `shrine_echo` | More relic pick value. | Potentially exciting, but abstract. | Tie to treasure-greed and shrine moments with a clear "future draft doubled" signal. |
| `chapter_compass` | Better future contextual drafts. | Conceptually strong, currently indirect. | Make it the boss-hunter/scout planning relic: preview why future offers improved. |
| `wager_surety` | Makes wagers safer. | Strong route-gambler identity. | Preserve bust risk; show exactly what loss floor or protection changes. |
| `parasite_ledger` | Parasite-related scaling/answer. | Good archetype glue. | Make it visibly count parasite pressure and convert it into a controlled payoff. |

## Archetype Matrix
| Archetype | Run Fantasy | Board Decisions It Should Change | Current Supports | Missing Payoff |
| --- | --- | --- | --- | --- |
| Guard tank | I can take pressure routes because I prepared protection. | Choose risky routes, leave hard pairs later, absorb known hazards. | `guard_token_plus_one`, safe routes, guard tokens, parasite/wager hooks. | Needs stronger "guard is why I survived" feedback. |
| Trap control | I dismantle dangerous boards with controlled disruption. | Decide when to shuffle, row shuffle, destroy, or preserve rewards. | Shuffle relics, destroy relic, trap halls, trap cards. | Needs clearer destroy opportunity costs and trap-specific action previews. |
| Treasure greed | I turn risk into extra economy and relic velocity. | Take greed routes, preserve cache pairs, spend in shops, plan shrine timing. | `shrine_echo`, `wager_surety`, Greed routes, shop gold. | Needs treasure cards and shops to create more spend/save tension. |
| Boss hunter | I prepare for known spikes instead of reacting late. | Draft for next chapter, bank tools for boss floors, accept prep routes. | `chapter_compass`, `wager_surety`, boss floor schedule. | Needs boss-facing tells and boss-specific relic payoffs. |
| Route gambler | I use route risk as a resource. | Choose Greed/Mystery over Safe, accept wagers, protect streaks. | Risk wager, Greed/Mystery routes, Favor, wager relics. | Needs route preview clarity and "risk paid off" summaries. |
| Reveal / scout | I win by gathering information without fully solving the board for free. | Peek, pin, preserve memory anchors, choose Mystery routes. | Peek, pin, stray remove, memorize relics, Mystery routes. | Needs a stronger distinction between fair information and brute-force reveal. |
| Combo shard engine | I convert clean play into repeatable momentum. | Prioritize streaks, avoid unnecessary assists, spend shards at high leverage. | Combo shards, parasite hooks, featured objectives. | Needs an unmistakable engine state and more shard spend/use verbs. |

## Trait Policy
Traits should exist internally because they solve real implementation and design problems without adding UI vocabulary overload.

Recommended trait-like tags:

- `answers_traps`
- `answers_parasite`
- `supports_greed`
- `supports_mystery`
- `supports_boss`
- `supports_guard`
- `supports_combo`
- `adds_information`
- `adds_removal`
- `adds_shuffle_control`
- `raises_action_capacity`
- `spends_or_protects_wager`

These tags can later power draft weighting, Codex grouping, test matrices, shop inventory rules, and card-family compatibility. UI should usually translate them into archetype labels or plain English reasons.

## Future Content Seeds
Future relics should be proposed as archetype payoffs first, numbers second.

| Seed | Archetype | Concept | Quality Gate |
| --- | --- | --- | --- |
| Trap cartographer | Trap control / scout | First armed trap each floor is permanently marked after memorize. | Player sees the tell before danger; does not trivialize all traps. |
| Cache insurance | Treasure greed / route gambler | Destroying or missing a cache loses less value once per floor. | Still rewards clean cache play more than brute force. |
| Boss rehearsal | Boss hunter / scout | On the floor before a boss, preview one boss pressure rule. | Helps planning without removing surprise entirely. |
| Guard conversion | Guard tank / combo | Unspent guard at floor clear becomes a small shard or Favor gain. | Avoids degenerate stalling; rewards survival planning. |
| Pin lattice | Reveal / scout | Matching a pinned pair refunds one pin placement this floor. | Rewards correct memory, not random pin spam. |
| Parasite dividend | Combo shard engine | Clearing parasite pressure cleanly grants a visible shard burst. | Requires parasite risk to be present and readable. |

## Task Seeds
Do not convert these directly into implementation until Pass 5 and Pass 3 refine them.

- Build archetype pass: completed in Pass 5; use it as the source for future archetype implementation slices.
- Action button pass: define how each build-relevant action shows charge, cost, target preview, disabled reason, and perfect-run impact.
- Card expansion pass: propose cards that pressure or support the archetypes, especially treasure, trap, boss, and scout cards.
- UI feedback pass: define where archetype identity appears: relic draft, HUD, floor clear, Codex, collection, and route choice.

## Open Risks
- Archetype labels can become decorative if they do not change board decisions.
- Internal traits can drift into hidden rules if tests and Codex copy do not stay aligned.
- Charge relics can still feel boring unless the action buttons make charges emotionally legible.
- "No talents" is cleaner now, but future meta progression may still need a run-start identity layer after core builds mature.

## Output
Pass 2 recommends against a separate v1 talent layer. Build identity should be deepened through relics, archetypes, internal traits, routes, cards, actions, and feedback. Pass 5 has now deepened the archetypes; Pass 3 should define action-button support next.
