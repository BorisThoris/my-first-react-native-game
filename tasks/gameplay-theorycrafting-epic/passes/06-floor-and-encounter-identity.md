# Pass 6: Floor And Encounter Identity

## Status
Completed theory recommendation on 2026-05-03.

## Purpose
Make floors feel authored and distinct while staying deterministic and generated.

This pass keeps the current 12-floor endless cycle intact. It annotates what each floor should teach, which builds should care, which Pass 4 card suites fit, and what Pass 7 feedback is required.

## Current Anchors
- `src/shared/floor-mutator-schedule.ts`
- `src/shared/run-map.ts`
- `src/shared/boss-encounters.ts`
- `src/shared/game.ts`
- `tasks/dungeon-epic/01-experience-pillars.md`

## Encounter Grammar
Every floor identity should be describable through six grammar slots.

| Slot | Question | Examples |
| --- | --- | --- |
| Pressure | What threatens the player? | Short study, trap, parasite, boss, target priority. |
| Reward | What value is worth chasing? | Gold, cache, Favor, relic pick, guard, shard, boss trophy. |
| Information | What is known, hidden-known, or uncertain? | Pins, route preview, Omen, Mystery, family label. |
| Recovery | How can the run stabilize? | Safe route, shrine, rest, guard, room service. |
| Objective | What proof does the floor ask for? | Flip par, scholar style, glass witness, cursed last. |
| Build hook | Which archetypes should shine? | Warden, Saboteur, Vaultbreaker, Slayer, Gambit, Seer, Catalyst. |

No floor should max out every slot. A memorable floor usually has one primary pressure, one reward reason, and one clear objective.

## Route Promises
| Route | Promise | Should Contain | Should Avoid |
| --- | --- | --- | --- |
| Safe | Recovery, guard, clarity, lower variance. | Guard Shrine, Scout Room, rest/room utility, clear exits. | High reward with no tradeoff. |
| Greed | Reward density, elite/trap pressure, extraction risk. | Cache Lock, Disarm Bounty, Mimic Cache prototypes, shops. | Hidden punishment without preview. |
| Mystery | Information variance, events, scouting value, unusual rewards. | Scout Room, Loaded Gateway, Omen Pair, route reveals. | Random rules that cannot be learned before harm. |

## Current 12-Floor Cycle Annotation
| Floor | Identity | Grammar | Best Builds | Card Suite Hooks | Feedback Need |
| --- | --- | --- | --- | --- | --- |
| 1 `survey_hall` | Onboarding gate. | Pressure: wide recall; Reward: route access; Information: route intel; Objective: flip par. | Seer, Gambit. | Scout Room later, Loaded Gateway prototype later. | Pre-play should teach route and objective without crowding first board. |
| 2 `speed_trial` | Commit quickly. | Pressure: short memorize; Reward: clean tempo; Objective: flip par. | Slayer, Catalyst, Seer. | Omen Pair prototype only after timing UI is strong. | Memorize countdown and "commit now" pressure need clear non-motion backup. |
| 3 `treasure_gallery` | First extraction breather. | Reward: pickups/cache; Recovery: lower pressure; Objective: scholar style. | Vaultbreaker, Warden, Catalyst. | Guard Shrine Pair, Cache Lock, Boss Trophy later. | Destroy/forfeit and pickup preservation must be explicit. |
| 4 `shadow_read` | Partial visual read. | Pressure: silhouette; Information: incomplete identity; Objective: cursed last. | Seer, Slayer. | Scout Room, Omen Pair prototype. | Hidden-known language should say what is obscured and what remains fair. |
| 5 `anchor_chain` | Track cadence. | Pressure: n-back anchor; Information: anchor memory; Objective: cursed last. | Seer, Warden, Slayer. | Pin Lattice prototype, Anchor Seal prototype. | Pins/peek need to feel like planning, not failure. |
| 6 `breather` | Rebuild resources. | Recovery: low threat; Reward: utility; Objective: scholar style. | Warden, Vaultbreaker, Catalyst. | Guard Shrine Pair, Scout Room, Trap Workshop Room. | Floor clear should explain recovery value and next-floor prep. |
| 7 `trap_hall` | Trap boss lesson. | Pressure: glass/sticky trap; Reward: disarm safety; Objective: glass witness. | Saboteur, Warden, Seer. | Disarm Bounty, Trap Workshop, Mimic Cache prototype. | Armed/sprung/resolved trap states must be unmistakable. |
| 8 `script_room` | Symbol grammar switch. | Pressure: category letters; Information: new symbol read; Objective: flip par. | Seer, Gambit. | Loaded Gateway prototype, Omen Pair prototype. | Letter/category read needs static teaching and reduced-motion parity. |
| 9 `rush_recall` | Boss recall spike. | Pressure: short study plus wide recall; Objective: flip par; Reward: boss payoff. | Slayer, Catalyst, Warden. | Boss Trophy Cache, Anchor Seal prototype. | Pre-boss tell and post-boss payoff need stronger causality. |
| 10 `treasure_gallery` | Late extraction reset. | Reward: pickups/cache; Recovery: controlled breather; Objective: scholar style. | Vaultbreaker, Gambit, Catalyst. | Cache Lock, Guard Shrine Pair, Catalyst Altar prototype. | Differentiate from floor 3 by emphasizing late-build payoff. |
| 11 `parasite_tithe` | Sustain tax. | Pressure: parasite; Reward: Favor/streak; Objective: scholar style. | Catalyst, Warden, Slayer. | Parasite Vessel prototype, Guard Shrine Pair. | Parasite counter changes need cause labels and ward feedback. |
| 12 `spotlight_hunt` | Finale target priority. | Pressure: ward/bounty rotation; Information: changing target value; Objective: cursed last. | Seer, Slayer, Gambit, Catalyst. | Chain Reactor deferred, Omen Pair prototype, Boss Trophy Cache. | Target priority must update clearly after every resolve. |

## Act Identity
| Act | Floors | Current Promise | Strength | Gap |
| --- | --- | --- | --- | --- |
| Act I - Survey Grounds | 1-4 | Teach route, speed, treasure, and shadow reads. | Good ramp from baseline to partial information. | Needs stronger "first route choice matters" feedback. |
| Act II - Shadow Archive | 5-8 | Track anchor, recover, survive trap boss, switch symbol grammar. | Strongest authored identity. | Trap boss and script room need clearer transition language. |
| Act III - Spire Convergence | 9-12 | Boss recall, late treasure, parasite sustain, spotlight finale. | Good late pressure variety. | Needs stronger boss/trophy payoff and Catalyst engine read. |

## Node Kind Composition
| Node Kind | Encounter Promise | Best Card Hooks | Build Hooks | Rule |
| --- | --- | --- | --- | --- |
| Combat | Stable memory encounter with route access. | Gateway, enemy, exit. | Seer, Gambit. | Keep as low-noise baseline. |
| Elite | Higher pressure for richer reward. | Enemy, Boss Trophy, Cache Lock. | Slayer, Catalyst, Gambit. | Must preview why it is worth the danger. |
| Trap | Hazard density and disarm payoff. | Trap, Disarm Bounty, Trap Workshop. | Saboteur, Warden, Seer. | No hidden trap harm without armed/floor tell. |
| Treasure | Reward extraction puzzle. | Treasure, Cache Lock, key/lock, shrine. | Vaultbreaker, Gambit. | Every forfeit must be visible before action. |
| Shop | Spend/save decision inside the run. | Shop, room utility, key/lock support. | Vaultbreaker, Warden, Slayer. | Show build fit, not just item list. |
| Rest | Recovery and prep. | Shrine, Scout Room, Guard Shrine. | Warden, Seer, Catalyst. | Recovery should support next pressure, not feel like empty pause. |
| Event | Controlled uncertainty. | Loaded Gateway, Omen Pair, Scout Room. | Gambit, Seer. | Mystery means learnable uncertainty, not random punishment. |
| Boss | Spike and payoff. | Enemy/elite, Boss Trophy, Anchor Seal. | Slayer, Warden, Catalyst. | Needs pre-floor tell and post-floor reward identity. |

## Weak Or Repeated Identities
| Area | Issue | Recommendation |
| --- | --- | --- |
| Treasure floor repetition | Floors 3 and 10 share `treasure_gallery` and `scholar_style`. | Floor 3 should teach clean extraction; floor 10 should emphasize late-build payoff and higher cache stakes. |
| Boss payoff | Boss floors have pressure but need stronger reward identity. | Attach Boss Trophy Cache or trophy summary concepts after boss objective success. |
| Mystery route | Mystery promise can blur with treasure/event. | Use Scout Room, Loaded Gateway, and Omen Pair prototypes as Mystery identity tests. |
| Trap clarity | Trap pressure is strong but needs state language. | Standardize armed, sprung, disarmed/resolved, and reward-forfeit feedback. |
| Catalyst identity | Shards and clean play exist but engine state is quiet. | Parasite Tithe and Spotlight Hunt should become Catalyst showcase floors. |

## Composition Rules
- One floor should not stack more than two major pressure axes unless it is a boss/finale.
- Reward-heavy floors must explain what destroy, mismatch, or exit timing can forfeit.
- Boss and elite floors need pre-floor tell, in-HUD reminder, and post-floor payoff.
- Utility singleton cards need fallback completion rules.
- Route choice should bias the next floor, not erase its archetype.
- New Pass 4 cards should be assigned to a node kind and floor identity before implementation.
- Every floor should have one "what this teaches" sentence and one "what the player can do about it" sentence.

## Near-Term Encounter Seeds
| Seed | Source | Fit |
| --- | --- | --- |
| Trap Bounty Hall | Safe near-term card suite | Trap node / floor 7: Disarm Bounty makes Saboteur identity concrete. |
| Recovery Study Room | Safe near-term card suite | Breather/rest/shop: Scout Room plus Guard Shrine supports Warden and Seer. |
| Locked Gallery | Safe near-term card suite | Treasure node / floors 3 and 10: Cache Lock gives Vaultbreaker extraction decisions. |
| Boss Trophy Moment | Safe near-term card suite | Floors 9 or 12: Boss Trophy Cache gives Slayer/Catalyst payoff. |
| Omen Event | Chaos prototype suite | Event/script/shadow floors: Omen Pair tests learnable uncertainty. |
| Parasite Vessel Floor | Chaos prototype suite | Floor 11: Parasite Vessel turns pressure into Catalyst decision. |

## Output
Pass 6 defines encounter grammar and annotates the current 12-floor cycle without changing it. Future card, route, and floor tasks should use this pass to choose where mechanics belong before they become implementation tickets.
