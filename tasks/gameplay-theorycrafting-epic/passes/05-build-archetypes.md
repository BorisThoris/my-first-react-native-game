# Pass 5: Build Archetypes

## Status
Completed theory recommendation on 2026-05-03.

## Purpose
Turn relics, powers, dungeon cards, routes, objectives, and floor pressure into recognizable playstyles.

Pass 2 parked talents for v1, so archetypes now carry the job that "talents" would otherwise have done: they are the player-facing language for "what kind of run am I building?"

## Current Anchors
- `src/shared/relics.ts`
- `src/shared/floor-mutator-schedule.ts`
- `src/shared/run-map.ts`
- `src/shared/dungeon-cards.ts`
- `src/shared/objective-rules.ts`
- `src/shared/secondary-objectives.ts`

## Naming Recommendation
Keep existing source IDs stable for now, but replace the player-facing fantasy names aggressively in future UI/copy work.

| Source ID | Current Label | Proposed Build Name | Promise |
| --- | --- | --- | --- |
| `guard_tank` | Guard tank | The Warden | Survive pressure by preparing protection before danger lands. |
| `trap_control` | Trap control | The Saboteur | Turn hazards into solvable board-control puzzles. |
| `treasure_greed` | Treasure greed | The Vaultbreaker | Extract more value from risky reward boards. |
| `boss_hunter` | Boss hunter | The Slayer | Prepare for known spike floors and cash in against bosses. |
| `route_gambler` | Route gambler | The Gambit | Treat route risk, wagers, and uncertainty as a resource. |
| `reveal_scout` | Reveal / scout | The Seer | Win through partial information, pins, peeks, and careful reads. |
| `combo_shard_engine` | Combo shard engine | The Catalyst | Convert clean play and pressure answers into compounding momentum. |

These names are theory recommendations, not immediate code renames.

## Archetype Detail

### The Warden (`guard_tank`)
Fantasy: "I can enter hostile rooms because I prepared enough protection to survive one bad read."

Signals:
- Early: extra guard, safer route choices, longer study windows.
- Mid: guard tokens influence route appetite and allow harder floors at low lives.
- Late: guard converts near-fail states into recoverable clears without removing all punishment.

Changed decisions:
- Take Safe or dangerous routes based on guard reserves, not only current lives.
- Leave high-pressure or uncertain pairs until guard can absorb a mistake.
- Spend reveal/control tools less aggressively because guard covers a known risk.

Current support:
- Relics: `guard_token_plus_one`, `memorize_bonus_ms`.
- Routes: Safe, rest, shrine, boss prep.
- Floors: `trap_hall`, `parasite_tithe`, `rush_recall`.
- Cards: shrine, enemy, trap, rest/room utility.
- Objectives: `glass_witness`, `scholar_style` when guard protects a clean attempt.

Missing payoff:
- Guard saves are not emotionally legible enough.
- Guard has limited positive payoff when unused.
- Needs a clear "Warden saved this run" floor-clear moment.

Seeds:
- Warden's Oath relic: first guard spent each floor also marks the source of danger for the rest of the floor.
- Bulwark shrine card: matching it grants temporary guard that expires at floor clear.

### The Saboteur (`trap_control`)
Fantasy: "The board is rigged, but I know how to dismantle it."

Signals:
- Early: extra shuffle, row shuffle, or destroy control.
- Mid: trap cards and sticky floors become opportunities instead of panic.
- Late: the build preserves rewards while neutralizing dangerous patterns.

Changed decisions:
- Decide whether to destroy a pair or preserve its reward.
- Use row shuffle to isolate risk instead of full-board shuffle.
- Prioritize lever/trap pairs based on active danger, not just memory confidence.

Current support:
- Relics: `extra_shuffle_charge`, `first_shuffle_free_per_floor`, `region_shuffle_free_first`, `destroy_bank_plus_one`.
- Powers: full shuffle, row shuffle, destroy, stray remove.
- Routes: trap, mystery, Safe under pressure.
- Floors: `trap_hall`, `anchor_chain`, `spotlight_hunt`.
- Cards: trap, lever, lock, room, gateway.
- Objectives: `glass_witness`, `scholar_style` tension with destroy/shuffle.

Missing payoff:
- Destroy can read as a generic delete button.
- Trap disarm success needs stronger board and floor-clear feedback.
- Traps need target previews and permanent sprung/solved language to avoid confusion.

Seeds:
- Trap Cartographer relic: first armed trap each floor is marked after memorize.
- Disarm bounty card: cleanly matching a trap pair grants gold or Favor, but destroying it forfeits the bounty.

### The Vaultbreaker (`treasure_greed`)
Fantasy: "I can squeeze extra value out of reward rooms without losing the run."

Signals:
- Early: greed route value and cache preservation become visible.
- Mid: shops, keys, locks, shrines, and treasure cards create spend/save choices.
- Late: relic velocity and economy let the player steer drafts and services.

Changed decisions:
- Take Greed routes when tools can protect extraction.
- Avoid destroy or careless mismatches on cache pairs.
- Spend gold on immediate safety versus draft/reroll leverage.

Current support:
- Relics: `shrine_echo`, `wager_surety`, `guard_token_plus_one`, `peek_charge_plus_one`.
- Routes: Greed, treasure, shop, event.
- Floors: `treasure_gallery`, `breather`, `parasite_tithe`.
- Cards: treasure, key, lock, shrine, shop, room.
- Objectives: `scholar_style` conflicts with destructive extraction.

Missing payoff:
- Treasure cards need more identity than "extra score/gold."
- Shop/service choices need stronger connection to build direction.
- Greed success should be summarized as value extracted, not just score gained.

Seeds:
- Cache Insurance relic: first damaged or destroyed cache each floor loses less value.
- Vault lock card: pays high value only if opened with a key or matched cleanly.

### The Slayer (`boss_hunter`)
Fantasy: "I know the spike is coming, and I built to answer it."

Signals:
- Early: route preview and draft reasons point toward future boss pressure.
- Mid: the player banks tools instead of spending everything on normal floors.
- Late: boss floors feel like planned tests, not random difficulty jumps.

Changed decisions:
- Draft for next chapter/floor pressure rather than current comfort.
- Save destroy, guard, peek, or shards for boss floor leverage.
- Choose routes that trade short-term value for boss preparation.

Current support:
- Relics: `chapter_compass`, `wager_surety`, `destroy_bank_plus_one`, `parasite_ledger`.
- Routes: boss, elite, Safe before boss, shop before boss.
- Floors: `trap_hall`, `rush_recall`, `spotlight_hunt`.
- Cards: enemy, boss/elite, gateway, shrine, room.
- Objectives: `flip_par`, `cursed_last`, boss score multiplier.

Missing payoff:
- Boss identity is not yet strong enough to justify a full hunter fantasy.
- `chapter_compass` is conceptually good but indirect.
- Needs more pre-boss and post-boss feedback.

Seeds:
- Boss Rehearsal relic: the floor before a boss previews one boss pressure rule.
- Trophy cache card: boss clear upgrades the next reward choice if a boss objective was completed.

### The Gambit (`route_gambler`)
Fantasy: "I win by taking dangerous paths at the right time."

Signals:
- Early: route choices show risk, reward, and current build fit.
- Mid: wagers, Favor, Mystery, and Greed routes create calculated risk.
- Late: the build chains risk into extra relic choices or economy without deleting failure.

Changed decisions:
- Accept or decline wagers based on protection, information, and route profile.
- Choose Mystery/Greed instead of Safe when the current build has answers.
- Preserve streaks and resources for the exact floor where risk pays most.

Current support:
- Relics: `wager_surety`, `shrine_echo`, `guard_token_plus_one`, `peek_charge_plus_one`.
- Routes: Greed, Mystery, elite, event.
- Floors: `parasite_tithe`, `spotlight_hunt`, `treasure_gallery`.
- Cards: gateway, treasure, shrine, room, lock/key.
- Objectives: featured objective streaks and Favor pacing.

Missing payoff:
- Risk decisions need clearer before/after summaries.
- Greed and Gambit overlap heavily unless Gambit owns route/wager manipulation.
- Failure states must remain real or the archetype becomes "always take risk."

Seeds:
- Loaded Map relic: one route choice per act reveals an extra risk/reward line.
- Double-or-bank event card: choose a visible reward now or wager it for the next floor.

### The Seer (`reveal_scout`)
Fantasy: "I do not reveal everything; I reveal just enough to make the right call."

Signals:
- Early: pins, peeks, and study-time relics create deliberate planning.
- Mid: Mystery and low-information floors become attractive.
- Late: the player uses information tools to preserve perfect/clean objectives under pressure.

Changed decisions:
- Pin important locations during memorize instead of guessing later.
- Peek a tile that answers a route/card/objective question, not just any hidden tile.
- Choose Mystery routes because the build can convert uncertainty into advantage.

Current support:
- Relics: `peek_charge_plus_one`, `pin_cap_plus_one`, `stray_charge_plus_one`, `memorize_bonus_ms`, `chapter_compass`.
- Powers: peek, pin, stray remove, flash pair if treated carefully.
- Routes: Mystery, Safe, event.
- Floors: `shadow_read`, `anchor_chain`, `script_room`, `spotlight_hunt`.
- Cards: gateway, trap, room, key/lock, hidden/unknown dungeon cards.
- Objectives: `cursed_last`, `flip_par`, `glass_witness`.

Missing payoff:
- Needs stronger distinction between fair information and brute-force reveal.
- Pin success is not celebrated enough.
- Mystery content must be rich enough for scout tools to matter.

Seeds:
- Pin Lattice relic: matching a pinned pair refunds one limited pin placement.
- Oracle room card: reveals one family label without revealing exact tile identity.

### The Catalyst (`combo_shard_engine`)
Fantasy: "Clean play turns into power, and pressure becomes fuel."

Signals:
- Early: shard cap or shard gain makes streaks matter.
- Mid: parasite, guard, and objective play feed a visible engine state.
- Late: the player times shard spending around high-leverage floors.

Changed decisions:
- Protect streaks instead of using every assist immediately.
- Choose parasite or pressure floors when the build can convert them.
- Spend shards on critical moments rather than hoarding blindly.

Current support:
- Relics: `combo_shard_plus_step`, `parasite_ward_once`, `parasite_ledger`, `guard_token_plus_one`.
- Routes: Greed, elite, boss, parasite-friendly paths.
- Floors: `parasite_tithe`, `rush_recall`, `spotlight_hunt`.
- Cards: enemy, shrine, treasure, featured objective rewards.
- Objectives: clean floor play, `scholar_style`, featured objective streaks.

Missing payoff:
- Combo shards need more visible "engine online" state.
- The shard spend verbs are not yet broad enough for a full archetype.
- Must avoid runaway scaling that makes all pressure correct.

Seeds:
- Parasite Dividend relic: cleanly clearing parasite pressure grants a shard burst.
- Catalyst altar card: spend shards to upgrade one floor reward or protect one objective.

## Overlap Audit
| Overlap | Healthy Hybrid | Risk | Boundary Rule |
| --- | --- | --- | --- |
| Warden + Catalyst | Guard protects clean streaks and feeds momentum. | Sustain becomes invisible passive safety. | Warden owns survival; Catalyst owns conversion/payoff. |
| Saboteur + Seer | Scout identifies danger, Saboteur neutralizes it. | Both become generic "information/control." | Seer reveals; Saboteur changes/removes board state. |
| Vaultbreaker + Gambit | Greed routes and wagers become richer. | Both become "more rewards for risk." | Vaultbreaker owns extraction/economy; Gambit owns route/wager manipulation. |
| Slayer + Seer | Previewing future boss pressure creates planning. | Boss hunter becomes just scouting. | Slayer banks answers for spike floors; Seer answers hidden info broadly. |
| Saboteur + Vaultbreaker | Trap rewards and cache preservation create tension. | Destroy trivializes treasure boards. | Destroy must visibly forfeit or reduce some rewards. |

## Implementation Implications For Future Tasks
- Do not add new relics as isolated numeric buffs. Every relic must name at least one archetype and one board decision.
- Do not rename code IDs until a dedicated implementation pass updates catalog labels, Codex, tests, and screenshots.
- Do not surface "traits" as player-facing labels unless Pass 7 proves the UI needs them.
- Future card families should either support one archetype, pressure one archetype, or create a healthy hybrid between two.
- Future action buttons should explain which archetypes they serve through target previews, charge badges, and consequence copy.

## Output
Pass 5 recommends a stronger player-facing build language around seven archetypes: The Warden, The Saboteur, The Vaultbreaker, The Slayer, The Gambit, The Seer, and The Catalyst. The current code IDs can remain stable, but future UI/copy should move toward these fantasy names after Pass 3 and Pass 7 define action and feedback contracts.
