# Pass 7: UI And Feedback Language

## Status
Completed theory recommendation on 2026-05-03.

## Purpose
Make every mechanic visible, legible, and emotionally clear across visual, audio, copy, motion, keyboard, and screen-reader paths.

Pass 3 defined where actions should live. Pass 5 defined the build fantasies. Pass 7 defines how the game should communicate those systems without adding another rules layer.

## Current Anchors
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameLeftToolbar.tsx`
- `src/renderer/components/GameplayHudBar.tsx`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/TileBoardScene.tsx`
- `src/renderer/components/RelicDraftOfferPanel.tsx`
- `src/shared/mechanics-encyclopedia.ts`
- `docs/AUDIO_INTERACTION_MATRIX.md`

## Recommendation
Use named semantic tokens as design vocabulary, not immediate CSS or TypeScript contracts.

Tokens should explain what a mechanic means to the player. Existing UI components can keep their structure, but future gameplay tasks should state which tokens they introduce, alter, or consume.

## Semantic Tokens
| Token | Meaning | Examples |
| --- | --- | --- |
| Safe | Protection, recovery, stability, or a low-risk path. | Guard, Safe routes, rest rooms, wards. |
| Risk | Danger accepted for payoff or pressure that can punish mistakes. | Greed, wagers, traps, parasite, boss floors. |
| Reward | Value the player can claim or preserve. | Treasure, pickups, Favor, gold, relic picks, caches. |
| Armed | A state that is dangerous or ready to be targeted. | Armed trap, active destroy/peek/stray mode, resolve-window gambit. |
| Resolved | A mechanic has been satisfied, spent, disarmed, claimed, or made safe. | Matched trap, spent ward, claimed cache, completed objective. |
| Hidden-known | The player knows partial information without full reveal. | Pins, Mystery family labels, scouted boss pressure, visible route hints. |
| Objective | A goal that changes scoring, Favor, route, or floor completion. | Featured objective, cursed last, glass witness, exit. |
| Build | A run identity becoming coherent. | The Warden, Saboteur, Vaultbreaker, Slayer, Gambit, Seer, Catalyst. |
| Cost | What the player spends now. | Charges, gold, key, shard, perfect eligibility, route choice, timing window. |
| Forfeit | Value lost because of a choice. | Destroyed pickup, cache value lost, broken streak, missed Perfect Memory. |
| Locked | A rule or option is unavailable due to contract, phase, cost, or prior choice. | Scholar disables shuffle/destroy, no charges, invalid target. |
| Momentum | A compounding state the player should notice. | Combo chain, objective streak, shards, Favor progress, parasite ledger. |

## Surface Contract
| Surface | Must Communicate | Should Avoid |
| --- | --- | --- |
| Board/card | Family, state, danger, reward, objective relevance, valid/invalid target. | Decoration that hides card identity or makes danger color-only. |
| HUD | Passive resources, pressure, objective progress, Perfect Memory, current floor identity. | Treating every mechanic as equal priority. |
| Action dock | Verb, charge, armed state, disabled reason, target preview, perfect impact. | Permanent buttons for rare/card-only actions. |
| Relic draft | Rarity, archetype/build fit, immediate effect, contextual reason, future payoff. | Making archetype names decorative without a decision reason. |
| Floor clear | What changed, what was gained/lost, what caused it, what next choice matters. | Generic victory copy that hides failed objectives or forfeits. |
| Route/shop/room overlays | Risk, reward, cost, compatibility with current build, irreversible choices. | Long rule text where a short consequence line would do. |
| Codex/inventory | Stable rules, current run state, archetype relationships, exact exceptions. | Introducing names that do not appear in play. |

## Mechanic Family Rules
### Powers And Actions
- Every player-facing action needs a short verb, current cost, valid target preview, and consequence line.
- Pin should be labeled as Perfect Memory-safe.
- Peek, destroy, shuffle, row shuffle, stray, flash, undo, gambit, and wild should show "Assist used: Perfect Memory locked" once used.
- Destroy must always show reward forfeits when relevant.
- Armed states should be visually obvious, keyboard-focus obvious, and screen-reader announced.

### Cards And Board States
- Card family and card state should be separable: "trap" is a family; "armed", "sprung", "matched", and "resolved" are states.
- Danger and reward should not share the same only visual channel.
- Hidden-known states should tell the player what is known and what is still unknown.
- Objective-related cards need an objective marker that does not cover center identity.
- Invalid targets should explain why: decoy, anchor, final ward, Omen, protected route card, no charge, wrong phase.

### Relics And Archetypes
- Relic cards should show rarity, archetype/build name, effect, and contextual reason.
- Future UI should prefer proposed build names: The Warden, The Saboteur, The Vaultbreaker, The Slayer, The Gambit, The Seer, The Catalyst.
- A build signal should become stronger only when it changes a decision, not just because the run owns one tagged relic.
- Floor clear and inventory should summarize build momentum, such as "Seer tools preserved Mystery value" or "Saboteur destroyed a cache and forfeited reward."

### Mutators And Floor Identity
- Floor identity needs a pre-play tell, in-HUD reminder, and at least one board-level manifestation.
- Mutator chips should explain the player action impact, not just the system name.
- Boss, breather, trap, treasure, and parasite floors should each have different success/failure emphasis.
- Reduced motion must keep floor identity through static labels, icons, and copy.

### Routes, Wagers, Shops, And Rooms
- Route choices should show risk, reward, and current-build fit.
- Wagers need before/after feedback: what is at stake, what was won, what was lost.
- Shops and rooms should show whether an option supports the current build, solves current pressure, or is simply economy.
- Irreversible spends need a cost and forfeit line before confirmation.

### Objectives And Momentum
- Objective progress should be visible before failure whenever possible.
- Streaks and chains should show why they moved up or down.
- Favor, shards, guard, and parasite counters need cause labels when they change.
- Floor clear should name the highest-value success and the most important missed opportunity.

## Audio And Motion Rules
- Audio should reinforce semantic moments: arm, commit, reveal, reward, fail, disarm, lock, and floor clear.
- Audio never replaces visual or text feedback.
- Repeated cues should stay capped as the audio matrix already requires.
- Reduced motion should remove flourish, not remove state changes.
- Motion should be reserved for state transitions: armed, resolved, reward claimed, objective completed, build momentum gained.

## Accessibility Rules
- Every important state change needs one non-visual path: aria label, live region, focus movement, or persistent text.
- Live regions should announce changes that affect decisions, not passive stat churn.
- Keyboard users must be able to arm, cancel, target, and understand disabled actions.
- Screen-reader labels should name family, state, row/column, reward/danger, and current action eligibility.
- Color-coded tokens need icon, shape, copy, or pattern backup.

## Feedback Checklist For Future Mechanics
Before a mechanic becomes player-facing, answer:

- Which semantic tokens does it use?
- Where is it first previewed?
- Where is it reminded during play?
- What surface shows success?
- What surface shows failure or forfeit?
- Does it alter Perfect Memory, objective progress, or build momentum?
- What is the audio cue or intentional silence?
- What happens in reduced motion?
- What does keyboard focus do?
- What does the screen reader hear?
- What screenshot or fixture should verify it?

## Task Implications
- Pass 4 card-family work must include token, state, and feedback requirements for every card idea.
- Pass 6 floor/encounter work must define pre-play, in-HUD, board, and floor-clear language for each floor identity.
- Implementation tickets should cite this pass when adding card visuals, action target previews, relic draft copy, floor-clear summaries, or audio cues.
- Do not add a new visible "trait" layer unless a specific UI surface proves it needs that word.

## Output
Pass 7 defines a semantic feedback contract around Safe, Risk, Reward, Armed, Resolved, Hidden-known, Objective, Build, Cost, Forfeit, Locked, and Momentum. Future gameplay work should use these tokens to make mechanics readable across board, HUD, dock, relic draft, floor clear, overlays, Codex, audio, motion, keyboard, and screen-reader paths.
