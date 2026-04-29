# Perks, relics, modifiers, and world interactions

## Thesis

Perks and relics should not only change player inventory. They should change how the player reads the world. A good build makes certain routes, card types, and floor archetypes feel meaningfully different.

The shipped relic system already points this way:

- relics have draft tags like `memorize`, `parasite`, `shuffle`, `search`, `destroy`, `combo`, `peek`, `pin`, `guard`, `wager`, `favor`, and `draft`;
- scheduled Endless drafts can consider current and next mutators;
- some relics answer specific mutator pressure, such as short memorize or parasite;
- contracts can forbid certain relic classes, such as shuffle under `noShuffle`.

Route-world design should extend this. If the player selects Greed, their build should decide whether that was clever or reckless.

## Design vocabulary

| Term | Meaning |
|---|---|
| Perk | Any run modifier that improves or reshapes a player tool. Relics are the current concrete perk system. |
| Modifier | Any rule pressure applied by mutator, route, objective, card family, or floor archetype. |
| World pressure | A generated board/floor condition that asks the player to act differently. |
| Synergy | A perk makes a route/card/floor pressure more valuable, safer, or more expressive. |
| Anti-synergy | A perk and world pressure fight each other, creating weak value or dangerous habits. |
| Build story | The short explanation of why this run plays differently. |

## World pressure axes

All future route and card mechanics should map to one or more pressure axes.

| Axis | Existing examples | Player skill tested |
|---|---|---|
| Memory speed | `short_memorize`, boss rush | Encode fast |
| Information clarity | `silhouette_twist`, `wide_recall`, mystery veil | Read partial or transformed info |
| Spatial control | shuffle, region shuffle, pin, sticky slots | Manage positions |
| Target priority | bounty, ward, cursed last, greed cache | Decide what to match when |
| Resource economy | gold, favor, combo shards, guard tokens | Spend or save |
| Mistake tolerance | guards, wards, parasite ward, safe route | Survive errors |
| Extraction risk | greed cache, trapped rewards, fragile pickups | Claim value without overreaching |
| Adaptation | Mystery route, transform cards, event rooms | Change plan mid-floor |

Good mechanics combine two axes. Bad mechanics stack five axes and become noise.

## Current relic archetypes as world answers

The existing `RelicBuildArchetype` labels are useful and should remain the high-level buckets.

### Memory control

Relics:

- `memorize_bonus_ms`
- `memorize_under_short_memorize`

Answers:

- `short_memorize`
- `rush_recall`
- `speed_trial`
- Mystery floors with hidden identity
- Greed floors where reward extraction requires confident early routes

Route relationship:

- Safe: memory control makes Safe feel stable and lets player preserve streaks.
- Greed: memory control supports aggressive extraction before hazards/timers punish.
- Mystery: memory control gives enough time to notice veiled patterns and markers.

Anti-synergy:

- Too much memory control can make Safe feel flat if no other pressure exists.
- Memory control does not solve target-priority confusion. It helps you remember, not decide.

### Board control

Relics:

- `extra_shuffle_charge`
- `first_shuffle_free_per_floor`
- `region_shuffle_free_first`
- `destroy_bank_plus_one`

Answers:

- bad tile layout,
- sticky positions,
- pickup routing,
- cursed pair planning,
- wide-recall board footprint.

Route relationship:

- Safe: board control can preserve objective streaks.
- Greed: board control can chase caches and pickups efficiently.
- Mystery: board control lets the player recover after hidden conversions.

Anti-synergy:

- Destroy can deny findable and route-card rewards.
- Shuffle can disrupt a carefully memorized pickup/cache plan.
- `noShuffle` and `noDestroy` contracts must keep incompatible offers out.
- Greed builds that rely on destroy can self-sabotage reward extraction.

### Combo sustain

Relics:

- `combo_shard_plus_step`
- `parasite_ward_once`
- `guard_token_plus_one`
- `parasite_ledger`

Answers:

- `score_parasite`,
- long greed floors,
- risk wager,
- high-pressure boss floors,
- trap mistakes.

Route relationship:

- Safe: sustain helps rebuild.
- Greed: sustain is the most natural greed enabler.
- Mystery: sustain absorbs variance.

Anti-synergy:

- Sustain without reward pressure can feel invisible.
- Parasite relics are weak on floors that never apply parasite pressure unless drafts consider future chapters.
- Too much sustain can make Greed the always-correct route.

### Safe reveal

Relics:

- `peek_charge_plus_one`
- `stray_charge_plus_one`
- `pin_cap_plus_one`

Answers:

- mystery veil,
- trap cards,
- cursed pair,
- spotlight decisions,
- wide recall,
- low-information floors.

Route relationship:

- Safe: reveal tools make defensive play precise.
- Greed: reveal tools are the skillful way to extract high-value caches.
- Mystery: reveal tools should be the premier mystery counter.

Anti-synergy:

- Reveal tools do little if the route profile creates only raw score pressure.
- If Mystery has no hidden card identity, peek/pin synergy is wasted.
- Too much reveal can trivialize trap cards unless trap rewards remain sequence-sensitive.

### Risk/favor

Relics:

- `shrine_echo`
- `wager_surety`
- `guard_token_plus_one`
- `peek_charge_plus_one`

Answers:

- greed economy,
- risk wagers,
- relic favor pacing,
- route decisions before shops/drafts.

Route relationship:

- Safe: preserve favor streak and reduce wager collapse.
- Greed: amplify payout and make risk strategically justified.
- Mystery: turn uncertain route into a calculated gamble.

Anti-synergy:

- Risk/favor relics with no risky route/card content feel like passive economy.
- Greed route with risk relics but no safety can still collapse.
- Favor gain should not be so high that Safe becomes irrelevant.

### Chapter draft

Relics:

- `chapter_compass`
- `parasite_ledger`
- `shrine_echo`

Answers:

- scheduled floor sequence,
- current/next mutator pressure,
- route-world profile predictability.

Route relationship:

- Safe: prepare for known high-pressure floors.
- Greed: draft the tools needed before taking greed.
- Mystery: improve adaptability by shaping future offers.

Anti-synergy:

- Draft-shaping relics require the game to expose enough next-floor identity to matter.
- If route choice overrides schedule too strongly, chapter draft predictions become unreliable.

## Route plus perk build stories

### Safe guardian

Ingredients:

- Safe route,
- `guard_token_plus_one`,
- `peek_charge_plus_one`,
- `memorize_bonus_ms`,
- objective streak or low lives.

World behavior:

- Safe wards and rescue cards appear.
- Trap density is lower.
- Route reward is modest but protects long-run stability.

Strong against:

- `short_memorize`,
- `trap_hall`,
- `rush_recall`,
- one-life states.

Weak against:

- score race,
- urgent shop gold needs,
- easy treasure floors where greed would be correct.

### Greed accountant

Ingredients:

- Greed route,
- `parasite_ledger`,
- `wager_surety`,
- `combo_shard_plus_step`,
- `guard_token_plus_one`.

World behavior:

- The board adds caches, tolls, parasite/favor rewards, and hazard pressure.
- Player profits by sequencing rewards and avoiding unnecessary destroy.

Strong against:

- `parasite_tithe`,
- `treasure_gallery`,
- breather floors that can be converted into payday,
- risk wager loops.

Weak against:

- no guard tokens,
- no reveal tools,
- trap floors at low lives,
- destroy-heavy play that erases rewards.

### Mystery scout

Ingredients:

- Mystery route,
- `peek_charge_plus_one`,
- `pin_cap_plus_one`,
- `stray_charge_plus_one`,
- `chapter_compass`.

World behavior:

- Veiled cards become readable through tools.
- Mystery rewards can be extracted because player can adapt.

Strong against:

- unknown route previews,
- veiled reward/hazard cards,
- spotlight and cursed pair floors.

Weak against:

- pure speed pressure,
- no information tools,
- already overloaded silhouette plus short memorize stacks.

### Trap breaker

Ingredients:

- Safe or Greed route depending on confidence,
- guard and reveal relics,
- `glass_floor` / `trap_hall`,
- possible safe ward or greed cache.

World behavior:

- Trap cards matter, but tools let player identify and route around them.
- Greed version pays more; Safe version preserves objective/streak.

Strong against:

- glass witness,
- decoy pressure,
- trap-card floors.

Weak against:

- forgetting that destroy does not claim rewards,
- chasing greed cache near decoy without reveal support.

### Scholar of control

Ingredients:

- `noDestroy` or scholar-style habits,
- shuffle and pin support,
- Safe or Mystery routes,
- pickup-rich floors.

World behavior:

- Player wins by preserving rewards and avoiding destructive shortcuts.
- Route cards can support non-destroy play with wards or reveal.

Strong against:

- findables,
- cursed last,
- flip par if shuffle does not count against it,
- safe recovery routes.

Weak against:

- sticky-fingers plus no shuffle,
- greed traps that require emergency removal,
- high hazard density without guard.

### Route banker

Ingredients:

- Greed route,
- shop gold from caches, lost cache, or treasure chest,
- `wager_surety`,
- `shrine_echo`,
- enough guard/peek support to survive elite pressure.

World behavior:

- Player turns board risk into vendor/rest/draft leverage.
- Greed caches and bonus rooms become part of the same economy line.
- The build is strongest when a shop or shrine is visible soon.

Strong against:

- treasure floors,
- elite-to-shop route sequences,
- parasite/favor floors,
- breather floors converted into payday.

Weak against:

- bad route previews,
- no future shop/rest sink,
- too much gold without enough survival.

### Veil reader

Ingredients:

- Mystery route,
- `peek_charge_plus_one`,
- `pin_cap_plus_one`,
- possible `chapter_compass`,
- veiled cards and secret rooms.

World behavior:

- Mystery stops being random and becomes a scouting puzzle.
- Peeking a veil reveals family; pinning preserves the plan.
- Secret doors and veiled shrines create route-to-room payoff.

Strong against:

- mystery veil,
- secret shrine,
- spotlight hunt,
- delayed curse.

Weak against:

- pure speed,
- no peek charges,
- hidden effects that do not reveal before punishment.

### Shrine gambler

Ingredients:

- Mystery or Greed route,
- `mirror_bargain`,
- `shrine_bargain`,
- `shrine_echo`,
- `wager_surety`.

World behavior:

- Player spends safety or gold to accelerate favor/draft momentum.
- Greed version has clearer payout but harder next floor.
- Mystery version may discover secret shrine or mirror twist.

Strong against:

- runs with stable lives and spare gold,
- upcoming relic milestone,
- favor builds.

Weak against:

- low-life state,
- no guard buffer,
- over-investing in future picks while current board is lethal.

### Cache breaker

Ingredients:

- Greed route,
- destroy or stray tools,
- route card reward denial rules,
- possibly a future relic that converts destroyed rewards.

World behavior:

- Default version is anti-synergy: destroy clears danger but loses cache value.
- A future specialized perk could flip the relationship and let destroyed caches pay partial value.

Strong against:

- hazard-heavy greed floors if survival matters more than payout,
- emergency board states.

Weak against:

- treasure gallery,
- findables,
- fragile/fuse caches,
- any objective rewarding clean extraction.

### Anchor cartographer

Ingredients:

- `n_back_anchor`,
- Mystery or Safe route,
- pin and peek support,
- Omen/Map/Memory Anchor cards.

World behavior:

- Player uses marked information to navigate changing targets.
- Safe version stabilizes anchor floors.
- Mystery version makes anchor cadence reveal or transform veils.

Strong against:

- anchor_chain,
- spotlight_hunt,
- cursed last,
- wide recall.

Weak against:

- sticky boards without shuffle,
- too many simultaneous target-priority markers.

### Glass thief

Ingredients:

- Greed route,
- `glass_floor` or `trap_hall`,
- peek/guard support,
- greed caches near decoy pressure.

World behavior:

- Player steals value from a dangerous trap board.
- Glass witness and greed cache create a clean-play jackpot.

Strong against:

- trap specialists,
- reveal-heavy builds,
- high confidence players with guard.

Weak against:

- one-life runs,
- no reveal,
- last-pair decoy confusion.

### Lantern monk

Ingredients:

- Safe route,
- `quiet_lantern`,
- rest heal,
- guard tokens,
- scholar-style objectives.

World behavior:

- Player protects streak and lives rather than chasing payout.
- Rest Sigil, Lantern Ward, and Safe Passage cards support a slower run.

Strong against:

- objective streak preservation,
- low-life recovery,
- boss preparation.

Weak against:

- urgent economy needs,
- greed builds that need gold/favor before next milestone.

## Route decisions by run state

| Run state | Best route bias | Why |
|---|---|---|
| Low lives, no guard | Safe | Needs mistake tolerance |
| High lives, guard tokens, peek | Greed | Can extract danger |
| Strong reveal build | Mystery or Greed | Can convert unknowns into value |
| Destroy-heavy build | Safe or non-pickup route | Greed pickups may be wasted |
| Parasite relics online | Greed on parasite floors | Converts pressure into payout |
| Memory relics online | Greed or Mystery on speed floors | Can afford harder extraction |
| Objective streak high | Safe | Preserve streak unless Greed payout is worth it |
| Shop ahead and low gold | Greed | Economy need justifies risk |
| Boss ahead | Safe unless build is strong | Avoid over-stacking pressure |
| Breather ahead | Greed | Converts low pressure into reward opportunity |

## Inventory tools as world interactions

Current run inventory tools should each have route meaning.

| Tool | Safe route use | Greed route use | Mystery route use | Anti-synergy |
|---|---|---|---|---|
| Shuffle charge | Rebuild a safe board after bad reveal | Route toward caches/pickups | Recover after veil outcome | Can break fragile cache or disrupt memorized rewards |
| Row shuffle | Precise correction without full chaos | Move toward a reward lane | Fix a revealed bad row | Can still disrupt cursed/spotlight plan |
| Destroy charge | Emergency survival | Sacrifice reward to remove danger | Remove minor hazard if allowed | Denies findable/route rewards by default |
| Peek charge | Confirm trap/cursed card | Skillful cache extraction | Premier veil counter | If too strong, Mystery is solved |
| Stray remover | Clean up awkward special | Remove danger at payout cost | Remove false/stray mystery tile | Must not remove completion-critical cards |
| Guard token | Preserve lives and streak | Budget for greed risk | Buffer unknown outcomes | Too many guards make Greed fake-risk |
| Combo shard | Recovery sustain | Fuel risk/favor economy | Variance buffer | Sustain without danger feels invisible |

Design implication: route preview should care about current inventory. A Greed route can be recommended by the game state only if the player has enough risk budget. A Mystery route should look more attractive when the player has peek or pin capacity.

## Shop, rest, and event perk hooks

Perks can connect route choice to side rooms.

| System | Safe perk hook | Greed perk hook | Mystery perk hook |
|---|---|---|---|
| Shop | Discounts healing, guard, peek | Better cache-to-gold conversion, richer stock | Unknown item reveal, odd stock |
| Rest shrine | Better `rest_heal`, guard if full life | `shrine_bargain` pays more favor but next floor harder | Veiled shrine resolves into rest/bargain/secret |
| Lost cache | Safe leave/claim small gold | Larger gold, debt or hazard next floor | Cache may reveal secret clue |
| Mirror bargain | Soften or reject cost | Favor now, route pressure later | Signature mystery bargain |
| Quiet lantern | Heal/guard/reveal support | Convert rest into value at risk | Reveal veil or secret door |
| Bonus chest | Modest guaranteed reward | Bigger chest with toll/fuse | False or secret chest |

These hooks let a route become a run-level identity rather than only board metadata.

## Perks should change world behavior, not only math

Future perk design should consider visible world hooks.

Examples:

### Memorize perk

Weak version:

- "+280 ms memorize."

Stronger world-integrated version:

- "+280 ms memorize; on Safe route, first ward card is visible during memorize; on Mystery route, one veil shows family icon."

### Guard perk

Weak version:

- "+1 guard token."

Stronger world-integrated version:

- "+1 guard token; Greed hazards preview whether guard can block them."

### Peek perk

Weak version:

- "+1 peek charge."

Stronger world-integrated version:

- "+1 peek charge; peeking a Mystery veil identifies whether it is reward, ward, or hazard."

### Parasite perk

Weak version:

- "Ignore parasite once."

Stronger world-integrated version:

- "Ignore parasite once; Greed parasite caches show enhanced favor payout."

### Shop perk

Weak version:

- "Gain 1 extra gold."

Stronger world-integrated version:

- "Greed caches pay +1 gold when a shop node is visible; Safe route discounts the next heal instead."

### Shrine perk

Weak version:

- "Gain favor faster."

Stronger world-integrated version:

- "Mystery shrines reveal whether they are bargain or rest before purchase; Greed shrine bargains add route pressure but grant extra favor."

### Destroy perk

Weak version:

- "+1 destroy charge."

Stronger world-integrated version:

- "+1 destroy charge; future Cache Breaker relic can claim partial value from destroyed greed caches, while normal destroy still denies pickups."

## Anti-synergy as intentional texture

Anti-synergy should exist. It creates build literacy. But it must be legible.

Good anti-synergy:

- Player chooses Greed with no safety tools and sees a clear high-risk board.
- Player destroys a pickup pair and summary says reward was not claimed.
- Player takes Mystery with no reveal and feels the cost of uncertainty.
- Player drafts shuffle tools under a no-shuffle contract only if draft filtering failed, which should be fixed.

Bad anti-synergy:

- Invisible route penalty causes life loss without warning.
- Mystery hides a cursed pair and punishes early matching before any fair reveal.
- Greed adds hazards but route preview still reads like normal reward.
- A perk is dead for several floors with no future-context reason.

## Offer weighting ideas

Route choice and next-floor profile can influence future relic/perk offers.

Recommended:

- If next floor includes `short_memorize`, slightly prefer memory control.
- If selected route is Greed, slightly prefer guard/reveal/sustain answers.
- If selected route is Mystery, prefer peek/pin/search.
- If next floor includes `score_parasite`, prefer parasite and combo sustain.
- If player has `noDestroy`, suppress destroy perks.
- If board will be pickup-heavy, prefer non-destroy reward tools.

Avoid:

- guaranteeing perfect answers every time,
- making route choice solve itself,
- hiding why an offer is contextual,
- creating dead offers under contracts.

## Design caps

To keep complexity readable:

- A route card should usually have one effect.
- A perk should usually have one conditional hook.
- A floor should avoid more than two major pressure axes before late/boss floors.
- Greed should not add more hazards when the base floor already hits a danger cap.
- Mystery should reveal enough information before punishing.
- Safe should reduce volatility, not delete floor identity.

## Documentation contract for future perks

Every future perk should document:

- primary archetype,
- supported route,
- supported floor/mutator,
- supported card family,
- anti-synergy,
- whether it changes generation,
- whether it changes scoring,
- whether it changes rendering,
- and whether it requires a rules version bump.

## Acceptance bar

When the route-world pipeline is implemented, perks should make route choice sharper:

- Greed should be smart with guard/reveal/sustain and reckless without them.
- Safe should be valuable when protecting streaks, lives, or objectives.
- Mystery should be best when the player can scout and adapt.
- Bad builds should fail for understandable reasons, not hidden rules.
