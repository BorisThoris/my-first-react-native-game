# Pass 4: Card Type Expansion

## Status
Completed theory recommendation on 2026-05-03.

## Purpose
Theorycraft new card families and card concepts without making the board unreadable, unfair, or unsafe.

This pass intentionally uses a wide "chaos mode" idea catalog. Classification is strict: strange ideas can be recorded, but only clear, fair, low-risk ideas can be marked ship-soon.

## Current Anchors
- `src/shared/contracts.ts`
- `src/shared/game.ts`
- `src/shared/dungeon-cards.ts`
- `tasks/refined-experience-gaps/REG-157-hazard-tile-type-taxonomy-and-outcomes.md`
- `tasks/refined-experience-gaps/REG-158-hazard-tile-engine-hooks-and-invariants.md`
- `tasks/refined-experience-gaps/REG-160-hazard-tile-ui-a11y-and-telegraphy.md`

## Baseline Families
Current card families are already broad: normal pairs, enemy, trap, treasure, shrine, gateway, key, lock, exit, lever, shop, room, route specials, findables, decoy, and wild.

The theory need is not "more classes for their own sake." The theory need is more card decisions that support builds, routes, objectives, and floor identity while staying readable.

## Guardrails
- Do not visually reveal card class from the back.
- Keep family and state separate: a card can be a trap family and armed/resolved state.
- Every new card must use Pass 7 tokens and explain preview, reminder, success, failure, and forfeit feedback.
- No card may punish hidden information that the player had no fair way to learn.
- Singleton utility cards need completion and fallback rules so floors cannot softlock.
- Cards that move, hide, seal, transform, remove, duplicate, or protect other cards must define board-complete behavior.
- Destroy, shuffle, peek, stray, wild, and other powers need explicit interactions with the card.

## Classification Rules
| Classification | Meaning |
| --- | --- |
| Ship soon | Close to current rules; low softlock risk; clear UI path. |
| Prototype only | Good decision, but needs sandbox and focused tests. |
| Defer | Good fantasy, but depends on future engine/UI/floor systems. |
| Reject for now | Fails memory clarity, counterplay, or softlock safety. |

## Ship Soon
| Name | Role | Trigger | Player Decision | Tokens | Archetype Fit | Counterplay | Risk / Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Disarm Bounty | Trap reward variant | Match an armed trap pair cleanly. | Destroy for safety or match for reward. | Risk, Reward, Armed, Forfeit, Resolved. | Saboteur, Vaultbreaker. | Trap is visible once armed; bounty line appears before choice. | Test destroy forfeits bounty; matching resolves trap and pays once. |
| Guard Shrine Pair | Shrine variant | Match shrine pair. | Preserve shrine pair for guard timing or claim now. | Safe, Reward, Momentum. | Warden, Catalyst. | Shrine family is readable when revealed. | Test guard cap, Favor gain, floor-clear summary. |
| Scout Room | Room variant | Activate revealed room. | Spend the room action to reveal one family label. | Hidden-known, Cost, Reward. | Seer, Slayer. | Reveals family, not exact solution. | Test no exact pair reveal; screen reader announces known/unknown split. |
| Cache Lock | Lock/treasure variant | Match lock with key available. | Spend key for full cache or accept lesser value. | Reward, Cost, Forfeit, Locked. | Vaultbreaker, Gambit. | Key count visible in HUD/room prompt. | Test no-key fallback, key spend, reward copy. |
| Trap Workshop Room | Room utility | Activate room. | Resolve one armed trap or reveal one hidden trap family. | Safe, Armed, Resolved, Hidden-known. | Saboteur, Seer. | Room action is explicit and one-shot. | Test no trap softlock; used room cannot repeat except allowed variants. |
| Boss Trophy Cache | Treasure/boss reward | Appears after boss or on boss floor. | Complete boss objective for upgraded reward. | Objective, Reward, Momentum. | Slayer, Catalyst. | Objective requirement visible before boss clear. | Test objective success/fail reward branch. |

## Prototype Only
| Name | Role | Trigger | Player Decision | Tokens | Archetype Fit | Counterplay | Risk / Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mimic Cache | Dual trap/treasure | Reveals as treasure, becomes trap if mishandled. | Claim carefully or use scout/control first. | Risk, Reward, Armed, Hidden-known. | Saboteur, Vaultbreaker, Seer. | Must telegraph mimic possibility by route/floor; never pure surprise. | Prototype fake-reward clarity and no unfair first hit. |
| Omen Pair | Memory pressure | On reveal, marks a future pair as dangerous or valuable. | Remember the omen target and sequence around it. | Hidden-known, Objective, Risk. | Seer, Slayer. | Omen marker persists; Codex explains scope. | Test marker persistence, target cleanup, objective interaction. |
| Anchor Seal | Board-control lever | Match to freeze one moving/rotating pressure. | Use now for safety or save for later pressure. | Safe, Cost, Resolved. | Warden, Saboteur, Slayer. | Seal target preview is explicit. | Test boss/floor pressure remains completable if seal unused. |
| Catalyst Altar | Shard spend card | Activate with combo shards. | Spend shards for reward upgrade or objective protection. | Cost, Reward, Momentum, Objective. | Catalyst, Vaultbreaker. | Shard cost and payoff previewed. | Prototype shard economy and runaway prevention. |
| Loaded Gateway | Route card | Match/activate gateway. | Choose known route risk or reroll into unknown higher value. | Risk, Reward, Hidden-known. | Gambit, Seer. | Shows exact known option and unknown category. | Test deterministic route plan and no route-choice dead end. |
| Pin Lattice Card | Planning reward | Match while pinned or adjacent to pinned pair. | Spend pin capacity to set up future refund/value. | Hidden-known, Momentum, Cost. | Seer, Warden. | Requires deliberate pin use; no random payout. | Test pin refund limits and contract pin vow interactions. |
| Parasite Vessel | Pressure converter | On parasite floor, match to convert pressure into shard/Favor. | Clear it before parasite drain escalates. | Risk, Reward, Momentum. | Catalyst, Slayer. | Parasite HUD explains timer/value. | Test parasite floor only; no free value on calm floors. |

## Defer
| Name | Role | Trigger | Player Decision | Tokens | Archetype Fit | Why Deferred |
| --- | --- | --- | --- | --- | --- | --- |
| Time Loop Pair | Chaos memory | Matching rewinds one prior resolved non-objective pair. | Undo a mistake or preserve current board state. | Cost, Hidden-known, Momentum. | Gambit, Seer. | Requires robust history/state rewind rules and very clear board-complete logic. |
| Mirror Pair | Transform | Copies another revealed family/effect. | Choose when to reveal target before mirror resolves. | Hidden-known, Risk, Reward. | Seer, Gambit. | Needs copy legality rules for every family/effect. |
| Gravity Row | Board movement | On match, shifts a row/column of hidden tiles. | Memorize movement rule and plan sequence. | Risk, Hidden-known, Cost. | Saboteur, Seer. | Movement can destroy memory fairness without strong animation and preview. |
| Living Door | Exit variant | Exit moves or changes lock each resolve. | Chase exit now or stabilize board first. | Objective, Risk, Locked. | Slayer, Gambit. | High softlock risk; needs strict fallback and accessibility path. |
| Relic Echo Card | Build card | Copies one owned relic as a one-floor trigger. | Trigger now or hold for better floor. | Build, Momentum, Cost. | All builds. | Needs relic effect compatibility matrix. |
| Shop Debt Card | Economy risk | Buy without enough gold, repay by objective. | Take power now for future constraint. | Cost, Risk, Reward, Objective. | Vaultbreaker, Gambit. | Requires debt UI, fail state, and exploit review. |
| Fog Bank | Hidden-known pressure | Conceals labels until nearby pair is solved. | Build local knowledge through adjacency. | Hidden-known, Risk. | Seer, Saboteur. | Needs spatial UI and a11y alternatives. |
| Chain Reactor | Combo chaos | Clearing one card auto-resolves a linked card. | Set up beneficial chain or avoid bad chain. | Momentum, Risk, Reward. | Catalyst, Gambit. | Needs deterministic link visibility and chain safety rules. |

## Reject For Now
| Name | Role | Trigger | Why Rejected |
| --- | --- | --- | --- |
| Invisible Trap | Penalty | Springs without prior reveal or route/floor tell. | Unfair hidden punishment; violates Pass 7 preview rule. |
| Random Card Swap | Chaos movement | Randomly swaps any two hidden cards after each flip. | Destroys memory skill unless heavily constrained; use authored movement only. |
| Permanent Blind Card | Information denial | A card never reveals identity until after mismatch. | Removes fair counterplay. |
| Mandatory Sacrifice Exit | Objective | Requires destroying a random pair to leave. | Conflicts with no-destroy contracts and can softlock objectives. |
| Infinite Copy Mirror | Transform | Copies any card repeatedly. | Exploit and board-complete risk too high. |
| Silent Score Tax Card | Penalty | Reduces score with no in-play warning. | Hidden economy punishment; poor feedback. |

## Build Coverage
| Archetype | Strong Current/Future Cards | Gap |
| --- | --- | --- |
| The Warden | Guard Shrine, Anchor Seal, Safe Exit, shrine/room utility. | Needs more visible "protection mattered" cards. |
| The Saboteur | Disarm Bounty, Trap Workshop, Mimic Cache, Rune Seal. | Needs trap states and forfeit copy to be unmistakable. |
| The Vaultbreaker | Cache Lock, Mimic Cache, Boss Trophy Cache, Shop Debt. | Needs treasure extraction beyond flat gold/score. |
| The Slayer | Boss Trophy Cache, Omen Pair, Anchor Seal, enemy/elite cards. | Needs boss prep cards tied to floor identity. |
| The Gambit | Loaded Gateway, Shop Debt, Time Loop, Chain Reactor. | Needs risk UI before the player commits. |
| The Seer | Scout Room, Omen Pair, Pin Lattice, Fog Bank. | Needs fair-information boundaries. |
| The Catalyst | Catalyst Altar, Parasite Vessel, Chain Reactor, Boss Trophy Cache. | Needs shard spend verbs and anti-runaway caps. |

## Candidate Card Suites
### Safe Near-Term Suite
- Disarm Bounty.
- Guard Shrine Pair.
- Scout Room.
- Cache Lock.
- Trap Workshop Room.
- Boss Trophy Cache.

Purpose: improve current families without changing board fundamentals.

### Chaos Prototype Suite
- Mimic Cache.
- Omen Pair.
- Anchor Seal.
- Catalyst Altar.
- Loaded Gateway.
- Pin Lattice Card.
- Parasite Vessel.

Purpose: test richer build decisions behind controlled fixtures.

### Engine Research Suite
- Time Loop Pair.
- Mirror Pair.
- Gravity Row.
- Living Door.
- Relic Echo Card.
- Shop Debt Card.
- Fog Bank.
- Chain Reactor.

Purpose: preserve high-fantasy ideas until movement, transform, debt, and chain-resolution rules are ready.

## Task Implications
- Pass 6 should connect card suites to floor/encounter identity before any implementation ticket graduates.
- Any ship-soon implementation should start with one vertical slice: card definition, generation rule, board visual, action/target interaction, Codex copy, a11y label, and unit tests.
- Prototype-only cards should ship only behind dev fixtures or authored sandbox floors until readability and softlock tests pass.
- The rejected list should stay visible so future passes do not reintroduce unfair hidden punishment under a new name.

## Output
Pass 4 records a broad card idea catalog and classifies it. The safe near-term suite should deepen existing dungeon-card families; chaos prototypes can explore richer decisions; engine research ideas are deferred until board-complete, transform, movement, debt, and chain rules are mature.
