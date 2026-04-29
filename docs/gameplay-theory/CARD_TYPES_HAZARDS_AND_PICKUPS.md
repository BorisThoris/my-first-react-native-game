# Card types, hazards, and pickups

## Thesis

The game needs a card vocabulary that can grow without turning every special tile into a one-off exception. Route-driven boards should be built from card families with clear jobs:

- some cards reward memory precision,
- some cards protect the player,
- some cards tempt risky extraction,
- some cards create traps,
- some cards hide information,
- and some cards bind the floor objective to the board itself.

This document is intentionally design-facing. The current authoritative shipped fields are still in code: `Tile.findableKind`, `Tile.routeCardKind`, `BoardState.cursedPairKey`, `wardPairKey`, `bountyPairKey`, and mutator-driven special cases like the glass decoy.

## Card family overview

| Family | Current or future | Main job | Route affinity |
|---|---|---|---|
| Normal pair | Current | Core memory objective | All |
| Findable pickup | Current | Optional reward on successful match | Safe, Greed, treasure |
| Route card | Current seed, expandable | Carry route-specific reward or effect | Safe, Greed, Mystery |
| Decoy trap | Current via `glass_floor` | Tempt an impossible match and threaten objective | Greed, trap floors |
| Cursed pair | Current objective marker | Reward saving a pair for last | Greed, Mystery, shadow |
| Ward and bounty | Current via `shifting_spotlight` | Create target priority decisions | Safe, Greed, spotlight |
| Hazard card | Future | Punish poor routing or first mismatch | Greed, Mystery |
| Rescue card | Future | Stabilize a floor after smart matching | Safe |
| Transform card | Future | Change reward/hazard after reveal or match | Mystery |
| Elite/boss card | Future | Anchor a set-piece floor | Boss routes |

The route pipeline should choose from these families through weights and caps.

## Normal pair

Purpose:

- Preserve the memory game baseline.
- Keep all special mechanics grounded in "match pairs to clear the board."

Rules:

- Two tiles share a `pairKey`.
- Matching clears the pair and advances floor completion.
- Mismatching costs lives or triggers existing forgiveness/guard systems.
- Shuffle moves normal pairs as tiles.
- Destroy can remove a pair through power use.

Design note:

Every special card should be compared against the normal pair. If a card family does not create a clearer decision than a normal pair, it should probably be a visual variation or reward tag, not a new rule.

## Findable pickups

Current shipped kinds:

- `shard_spark`
- `score_glint`

Purpose:

- Add optional reward routing.
- Encourage the player to care which pair they match, not only whether they can clear.
- Give treasure floors and safe recovery floors concrete board content.

Rules from current docs:

- Findables are attached to real pairs.
- Matching the pair claims the pickup.
- Destroy clears the pair without claiming the pickup.
- Shuffle moves the pickup with the tile.
- Findables should not appear on decoy or wild pairs.

Route usage:

| Route | Pickup behavior |
|---|---|
| Safe | Fewer but more defensive pickups, such as shard/guard/recovery-style rewards |
| Greed | More pickups, higher value, more likely to be tied to risk |
| Mystery | Pickup kind may be hidden until reveal or convert after first match event |

Synergy:

- `combo_shard_plus_step` improves shard pickup value.
- `first_shuffle_free_per_floor` can help route toward pickups without burning normal charges.
- Peek/pin tools help remember pickup carriers.

Anti-synergy:

- Destroy-heavy play loses pickup value.
- Greed pickups can bait bad matches if the player chases them before memorizing the board.
- Silhouette or wide-recall floors can make pickup routing harder unless markers are readable.

## Route cards

Current route card kinds:

- `safe_ward`
- `greed_cache`
- `mystery_veil`

Purpose:

- Make the route physically present on the next board.
- Let selected route produce visible, claimable gameplay.
- Create a bridge from route choice to rendering.

Current behavior:

- Route choice creates a `RouteCardPlan`.
- Next board stamps a route card kind onto a pair.
- Matching the route pair grants route reward.
- Route card visual markers render in DOM/WebGL/card textures.

Future behavior:

Route cards should become one family inside a larger route world profile. A Greedy route can stamp greed cards, but it can also add greed hazards, reward pickups, and stricter extraction rules.

### Safe ward

Fantasy:

- "I chose the careful path and found protection."

Possible effects:

- grant guard token,
- grant combo shard,
- reduce one route hazard penalty,
- protect objective streak on a route-specific failure,
- reveal a nearby trap or veiled card,
- add a small memorize bonus to the next floor after this one.

Good pairings:

- `short_memorize`: ward offsets pressure without deleting it.
- `trap_hall`: ward can block one decoy-adjacent penalty.
- `spotlight_hunt`: ward can soften a ward-pair score penalty.
- low-life run state: safe route becomes a recovery decision.

Bad pairings:

- Too many safe wards can erase danger.
- Safe ward should not become a generic extra life every time.

### Greed cache

Fantasy:

- "The payout is on the board, but extracting it is risky."

Possible effects:

- grant extra shop gold,
- grant relic favor,
- grant score multiplier for the floor,
- pay bonus only if matched before a threshold,
- pay more if no destroy/shuffle was used,
- pay more if matched under a hazard condition,
- become trapped if first exposed in a mismatch.

Good pairings:

- `score_parasite`: greed cache can pay enough to justify parasite pressure.
- `shrine_echo` / `wager_surety`: favor builds can compound the payout.
- `peek_charge_plus_one`: reveal lets the player safely extract cache.
- `guard_token_plus_one`: lets player take risk without immediate collapse.

Bad pairings:

- one-life state with no guard,
- destroy-heavy habits,
- low-information mutators without reveal tools,
- greed cache attached to too many penalties at once.

### Mystery veil

Fantasy:

- "I chose uncertainty and the board will reveal what that meant."

Possible effects:

- unknown reward until first reveal,
- veiled card converts into ward/cache/hazard by deterministic seed,
- delayed objective copy,
- temporary hidden modifier,
- reward doubles if claimed after adaptation condition,
- hazard disarms if inspected with peek or matched cleanly.

Good pairings:

- peek,
- pin,
- stray tools,
- chapter/draft manipulation,
- flexible relic spread.

Bad pairings:

- no reveal tools,
- already overloaded `silhouette_twist` plus short memorize,
- greed-only economy build that cannot absorb variance.

## Decoy trap

Current shipped source:

- `glass_floor` mutator creates a singleton decoy with `DECOY_PAIR_KEY`.
- It never forms a real pair.
- Board completion ignores hidden decoy once all real pairs are cleared.
- `glass_witness` rewards avoiding decoy mistakes.

Purpose:

- Make the player respect false information.
- Add tension without simply adding pair count.
- Support trap floors and Greedy route danger.

Route usage:

| Route | Decoy relationship |
|---|---|
| Safe | Avoid adding more decoy pressure; maybe add a ward that helps identify or survive it |
| Greed | Increase decoy-adjacent reward, add trapped caches, or improve witness payout |
| Mystery | Hide whether a veiled card is harmless reward or decoy-adjacent hazard until reveal |

Rules to preserve:

- Decoy must not make the board unwinnable.
- Decoy should not count as a normal pair.
- Route card assignment should not accidentally turn decoy into a completable reward pair.
- If future traps attach to decoy, `isBoardComplete` rules need explicit tests.

## Cursed pair

Current shipped source:

- `BoardState.cursedPairKey`.
- `cursed_last` objective rewards matching it last among real pairs.

Purpose:

- Create route planning and delayed gratification.
- Make a known pair dangerous to clear too early.

Route usage:

Safe:

- Cursed pair marker remains clear and readable.
- Safe route may offer a ward if cursed pair is accidentally exposed.

Greed:

- Cursed pair can carry a larger cache if saved for last.
- Greed can increase payout for disciplined sequencing.
- Greed can punish early matching by losing reward, not by ending the run.

Mystery:

- Cursed identity may be partially hidden until memorize or first reveal.
- A mystery veil can reveal that a pair was secretly cursed.
- Must be bounded so the player is not punished for unknowable early actions.

Synergy:

- Pinning cursed pair is strong.
- Peek helps confirm cursed positions.
- Shuffle tools are risky because they move the plan.

Anti-synergy:

- Wide recall plus hidden cursed identity can become unfair.
- Destroying cursed pair should have explicit reward denial.

## Ward and bounty cards

Current shipped source:

- `shifting_spotlight` uses `wardPairKey` and `bountyPairKey`.
- Ward reduces reward if matched while active.
- Bounty increases reward if matched while active.

Purpose:

- Create target priority.
- Make the player reconsider route after each resolve.
- Encourage controlled tempo instead of pure memory execution.

Route usage:

Safe:

- More ward mitigation.
- Easier-to-read spotlight copy.
- Safety payout for avoiding the ward.

Greed:

- Bigger bounty rewards.
- Ward penalties become more meaningful.
- Greed cache can be placed on or near spotlight logic.

Mystery:

- Ward/bounty may be veiled until first spotlight shift.
- A mystery card can swap ward and bounty once.

Synergy:

- Peek and pin help track active targets.
- `chapter_compass` style draft shaping can prepare for spotlight floors.

Anti-synergy:

- Short memorize plus spotlight plus mystery can exceed readable complexity.
- Greed bounty should not force players into guaranteed objective failure.

## Future hazard cards

Hazards should be designed as families, not random punishments.

### Snare card

Job:

- Punish first wrong exposure or mismatch involving the carrier.

Possible effects:

- lock one tile for a turn,
- add sticky-fingers-like restriction,
- reduce route reward,
- spawn a temporary ward.

Best route:

- Greed, Mystery.

Safety rule:

- Snare should be telegraphed before it can punish.

### Toll card

Job:

- Charge a resource to claim a reward.

Possible effects:

- lose score to claim gold,
- spend combo shard to double cache,
- spend guard to avoid penalty.

Best route:

- Greed.

Safety rule:

- Toll should never auto-spend a scarce resource without clear player-facing rules.

### Fragile card

Job:

- Reward careful sequencing.

Possible effects:

- breaks reward if mismatched,
- loses value after shuffle,
- pays if matched without using destroy.

Best route:

- Greed, Safe treasure.

Safety rule:

- Breaking the reward should not break the floor.

### Omen card

Job:

- Preview or foreshadow another special card.

Possible effects:

- reveal a hazard family,
- mark a safe pair,
- show where a cache is likely placed.

Best route:

- Safe, Mystery.

Safety rule:

- Omen is support, not another hidden rule to memorize.

### Fuse card

Job:

- Create a countdown-style extraction.

Possible effects:

- cache value decays after each mismatch,
- hazard arms after N turns,
- bounty shifts faster.

Best route:

- Greed, boss floors.

Safety rule:

- Avoid exact real-time pressure. Keep it turn-based so the memory game remains fair.

### Mirror card

Job:

- Cause one route card to copy another special's family.

Possible effects:

- mystery veil becomes the last revealed pickup kind,
- greed cache copies bounty reward if matched cleanly,
- safe ward copies a guard reward if found after mismatch.

Best route:

- Mystery.

Safety rule:

- Copy rules must be visible in summary or codex, or this becomes unreadable.

## Future rescue cards

Rescue cards are not freebies. They are protection earned through memory.

### Guard cache

- Match to gain one guard token or prevent one route hazard.
- Safe route staple.
- Greed can rarely offer it as a "take this before the big cache" decision.

### Map shard

- Match to reveal one veiled or hazard card.
- Safe/Mystery support.
- Strong with Mystery, weak if there are no hidden card families.

### Memory anchor

- Match to refresh a small memorize hint or anchor pair.
- Safe on `short_memorize`.
- Must be capped to avoid invalidating memorize pressure.

### Clean slate

- Match to clear one minor route penalty.
- Safe recovery.
- Should not clear boss identity or floor objective.

## Expanded named card roster

These are theory cards for future implementation. They should be treated as a catalog of candidates, not a demand to ship all of them.

### Greed cards

| Card | Trigger | Reward | Penalty or risk | Tool interaction | Fairness note |
|---|---|---|---|---|---|
| Toll Cache | Matched successfully | Gold or favor | Costs score, shard, or guard to fully claim | Peek reveals toll; destroy denies payout | Never auto-spend scarce resources silently |
| Fuse Cache | Each mismatch or match resolution advances fuse | High gold/score if claimed early | Reward decays or hazard arms after N turns | Pin helps track; peek reveals fuse count | Turn-based only, no real-time panic |
| Fragile Cache | First exposure or first mismatch matters | Strong payout if clean | Reward breaks on mismatch/shuffle/destroy | Shuffle warns it will break value | Broken reward cannot block board clear |
| Parasite Purse | Active on parasite floors | Favor/gold scales with parasite pressure | Missing it feeds score tax or loses bonus | Parasite relics improve safety | Must cap payout to avoid infinite greed |
| Bounty Vault | Tied to bounty/spotlight target | Larger bounty score/favor | Ward penalty increases while chasing it | Peek/pin track target | Cannot force impossible target order |
| Glass Lure | Appears near decoy/trap logic | Big payout for clean trap avoidance | Decoy mismatch voids reward | Safe ward can reveal or block once | Needs softlock tests on last pairs |
| Debt Note | Claimed immediately or on match | Gold now | Next floor starts with route pressure | Shop preview should show debt | Use sparingly; future pressure must be explicit |
| Double-or-Leave Cache | Player can ignore or claim | Doubled route reward | Claiming adds hazard marker elsewhere | Destroy leaves it unclaimed | Needs obvious optional-greed language |

Greed cards should be attractive even when the player ignores them. The board should say "there is money here" without forcing the player to take every risk.

### Safe cards

| Card | Trigger | Reward | Cost | Tool interaction | Fairness note |
|---|---|---|---|---|---|
| Guard Cache | Match pair | Guard token or one hazard block | Lower score/gold than greed cache | Guard cap applies | Should not exceed guard economy caps |
| Lantern Ward | Revealed during memorize or first flip | Identifies one hazard/veil/cursed family | No direct payout | Peek can extend reveal | Strong Safe identity card |
| Clean Slate | Match pair after route penalty exists | Clears one minor route penalty | No big reward | Destroy denies cleanup | Cannot clear boss/floor identity |
| Memory Anchor | Match or reveal | Briefly reinforces one remembered family/pair | Limited count | Pin stacks nicely | Must not replay whole memorize phase |
| Decoy Map | Match pair | Marks decoy-adjacent or trap family | No score payout | Peek can trigger map early | Decoy should remain threatening |
| Rest Sigil | Match pair, then floor clear | Improves next rest/heal/lantern effect | Delayed payoff | Shop/rest UI must show it | Good route-to-side-room bridge |
| Streak Seal | Match pair cleanly | Protects objective streak from one route mistake | No life heal | Guard handles life separately | Avoid overlapping too much with guard |
| Safe Passage | End floor with route card claimed | Lowers next interlude cost | Lower reward ceiling | Shop/rest hook | Good for cautious economy |

Safe cards should make the player feel clever for surviving, not bored because danger disappeared.

### Mystery cards

| Card | Reveal | Possible outcomes | Tool interaction | Fairness note |
|---|---|---|---|---|
| Mystery Veil | On peek, first reveal, or match | Ward, cache, hazard, secret clue | Peek reveals family without claim | Outcome deterministic |
| Mirror Card | After another special resolves | Copies reward family or flips reward/risk | Pin tracks source and mirror | Copy rule must be summarized |
| Omen Card | During memorize or first flip | Foreshadows a hazard or secret | Peek improves clarity | Omen should reduce uncertainty, not add more |
| Secret Door | Match pair, then floor clear | Opens secret room or bonus cache | Destroy denies discovery | Clear eligibility must be visible |
| False Cache | Revealed as fake or trap-adjacent | Small consolation or hazard clue | Peek exposes false identity | Should not feel like lost reward from nowhere |
| Delayed Curse | Reveals cursed status before punishment | Bigger reward if saved | Pin/peek strong | Must reveal before early match can fail it |
| Veiled Shrine | Match pair | Next interlude becomes rest, bargain, or secret | Chapter/draft tools can bias | Must show resolved result |
| Locked Memory | First reveal locks its identity until matched | Higher mystery payout | Stray/destroy interactions explicit | Avoid softlocks |

Mystery cards should be learnable. The player can be surprised, but the system should prove it was seeded and fair.

### Boss and elite cards

| Card | Encounter use | Reward | Risk | Note |
|---|---|---|---|---|
| Keystone Pair | Boss floor anchor | Boss bonus/favor if resolved cleanly | Matching too early weakens bonus | Makes boss identity board-visible |
| Elite Cache | Greed elite floor | Gold/favor/score | Strong hazard or strict extraction | Core elite route fantasy |
| Pressure Seal | Boss or elite | Multiplier if broken last/cleanly | Adds objective pressure | Similar to cursed pair, but encounter-branded |
| Final Ward | Boss Safe route | Prevents one boss-route penalty | Lower reward than elite cache | Safe boss identity |
| Trophy Pair | Post-boss reward carrier | Score/favor | Destroy denies trophy | Good summary moment |
| Gate Pair | Must match to unlock side reward, not floor clear | Bonus room access | Missing it skips side reward | Never required for board completion |

Boss/elite cards should make set-piece floors visible on the board. A boss floor should have at least one board-level object that feels like "the boss," not only a HUD multiplier.

## Conflict rules

Special cards need conflict rules. Recommended defaults:

- Decoy cannot carry findable, route reward, or normal pair reward.
- Wild/special completion pairs should not carry route hazard unless explicitly tested.
- One pair should not carry more than one major special family in v1.
- Minor reward tags can stack only if UI can explain them in one line.
- Destroy denies reward pickups and route claim unless a future relic says otherwise.
- Shuffle moves tile-carried effects with tiles.
- Peek can reveal card identity but does not claim.
- Pins mark position only and should not disarm hazards by default.

## Card-by-action interaction grid

| Action | Reward card | Hazard card | Rescue card | Mystery card | Boss/elite card |
|---|---|---|---|---|---|
| Match | Claims reward | May disarm or safely resolve | Grants protection | Reveals and resolves | Advances set-piece reward |
| Mismatch | May break fragile value | Triggers penalty if armed | Usually no effect | Can reveal family if fair | May reduce bonus only |
| Destroy | Denies reward by default | Removes only if explicitly allowed | Denies protection | Denies discovery unless card says otherwise | Denies trophy/bonus, never blocks clear |
| Shuffle | Moves tile-carried effect | Moves hazard unless fragile/fuse says otherwise | Moves rescue marker | Moves veil | Moves encounter card |
| Peek | Reveals family/claim rule | Reveals armed state | Can preview protection | Core counterplay | Shows encounter role |
| Pin | Tracks position only | Does not disarm | Tracks support | Strong with veils | Tracks set-piece target |
| Stray remove | Usually ineligible | Can remove minor stray hazard if rules allow | Usually no | May deny mystery discovery | Should not remove keystone by default |

This grid should be copied into implementation tickets when new card families ship. Most confusion will come from destroy, peek, and mystery reveal rules.

## Route-specific rendering language

Rendering should communicate family and route separately.

- Route identity: Safe, Greed, Mystery color/glyph/frame.
- Card family: cache, ward, hazard, veil, boss, pickup shape/glyph.
- State: hidden, previewed, revealed, armed, claimed, broken, denied.
- Tool preview: peekable, guarded, destroy-denies, fuse count, toll cost.

Example: a Greed Fragile Cache should read as both Greed and Fragile. It should not be only a gold-tinted card with a hidden rule.

## Rendering needs

Each card family should eventually define:

- hidden/back marker,
- face-up marker,
- claimed/matched state,
- a11y label,
- reduced-motion behavior,
- color-independent shape/glyph,
- tooltip/codex wording,
- and score pop/reward copy.

The current route-card rendering already proves the surface can show special route metadata. Future work should add more metadata, not fake it through CSS alone.

## Acceptance bar

A player should be able to look at a Greedy floor and see that it is a Greedy floor:

- more caches,
- more danger markers,
- clearer extraction choices,
- and reward text that matches the route.

A player should be able to look at a Safe floor and see protection:

- wards,
- support pickups,
- fewer punishing stacks,
- and recovery tools.

A player should be able to look at a Mystery floor and see uncertainty:

- veils,
- unknown conversions,
- and reveal tools that matter.
