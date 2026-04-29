# Synergy and anti-synergy matrix

## Purpose

This matrix is a theory-crafting tool for future route-driven boards. It lists combinations that should feel good, combinations that should be risky, and combinations that should be avoided or capped.

The goal is not to ship every idea at once. The goal is to make route choice, card generation, pickups, perks, relics, mutators, and floor archetypes speak the same design language.

Status labels:

| Label | Meaning |
|---|---|
| `ship-now` | Fits current systems with modest extension |
| `prototype` | Promising but needs test board/simulation |
| `defer` | Too complex or needs other systems first |
| `avoid` | Likely unfair, unreadable, or degenerate |

## Route plus floor archetype

| Route | Floor | Status | Expected result | Design note |
|---|---|---|---|---|
| Safe | `speed_trial` | `ship-now` | Add ward/memorize support without removing short study identity | Good low-life recovery route |
| Safe | `trap_hall` | `ship-now` | Fewer added hazards, safe ward blocks or reveals one trap | Lets player opt out of greed spike |
| Safe | `treasure_gallery` | `ship-now` | Stable pickups, lower payout, protect scholar style | Feels like recovery plus value |
| Safe | `parasite_tithe` | `prototype` | Parasite buffer card or guard reward | Must not erase parasite pressure |
| Safe | `rush_recall` | `ship-now` | Defensive route card, no extra hazards | Boss remains hard but fair |
| Greed | `treasure_gallery` | `ship-now` | More pickups, richer caches, one trapped reward | Clearest greed fantasy |
| Greed | `trap_hall` | `prototype` | Extra trap pressure and bigger witness/cache payout | Needs strict hazard caps |
| Greed | `parasite_tithe` | `ship-now` | Bigger favor/gold payout under parasite pressure | Strong with parasite relics |
| Greed | `breather` | `ship-now` | Convert low-pressure floor into payday with mild hazard | Gives breather a strategic fork |
| Greed | `rush_recall` | `prototype` | Boss payout rises, flip par stricter or cache timed | High risk of overload |
| Mystery | `survey_hall` | `ship-now` | One veil introduces route uncertainty gently | Good onboarding for Mystery |
| Mystery | `shadow_read` | `prototype` | Veils plus silhouette, but with reveal support | Must avoid unreadable visuals |
| Mystery | `spotlight_hunt` | `prototype` | Hidden swap or delayed ward/bounty reveal | Strong identity, high complexity |
| Mystery | `speed_trial` | `avoid` early | Hidden card identity under short study | Too much unknown pressure before player has tools |
| Mystery | `breather` | `ship-now` | Unknown recovery/economy blend | Safe way to teach mystery |

## Route plus mutator

| Route | Mutator | Status | Synergy | Risk |
|---|---|---|---|---|
| Safe | `short_memorize` | `ship-now` | Wards or memory support answer time pressure | Too much support deletes identity |
| Safe | `glass_floor` | `ship-now` | Trap reveal/guard lets player preserve witness | Must not make decoy irrelevant |
| Safe | `score_parasite` | `prototype` | Parasite buffer or ward card | Can trivialize parasite if too frequent |
| Safe | `wide_recall` | `ship-now` | Peek/pin support helps wide board reading | Avoid cluttering card faces |
| Safe | `shifting_spotlight` | `prototype` | Ward penalty mitigation | Spotlight rules already complex |
| Greed | `findables_floor` | `ship-now` | Extra pickups and trapped caches | Destroy anti-synergy must be clear |
| Greed | `score_parasite` | `ship-now` | Higher payout justifies parasite tax | Strong sustain can become dominant |
| Greed | `glass_floor` | `prototype` | Trap hall fantasy becomes clear | Needs softlock/a11y review |
| Greed | `sticky_fingers` | `prototype` | Reward extraction with movement friction | Can feel annoying if no tools |
| Greed | `short_memorize` | `prototype` | Fast extraction under pressure | Easy to become unfair |
| Mystery | `n_back_anchor` | `prototype` | Veil changes after anchor cadence | Interesting but cognitively heavy |
| Mystery | `wide_recall` | `ship-now` | Veil/reveal has room to breathe | Needs strong visual markers |
| Mystery | `silhouette_twist` | `prototype` | Low-info theme is strong | Must avoid color/shape ambiguity |
| Mystery | `distraction_channel` | `avoid` default | Too many attention drains | Keep opt-in challenge only |
| Mystery | `shifting_spotlight` | `prototype` | Unknown target shifts | Needs tight copy and tests |

## Route plus card family

| Route | Card family | Status | Good version | Bad version |
|---|---|---|---|---|
| Safe | Safe ward | `ship-now` | Earned protection on match | Free life every floor |
| Safe | Rescue card | `prototype` | Reveals or blocks one route hazard | Removes all danger |
| Safe | Findable | `ship-now` | Defensive pickup or shard | Too many pickups make Safe best economy |
| Safe | Decoy trap | `ship-now` | Lower density, clearer counterplay | Safe still adds surprise traps |
| Safe | Cursed pair | `ship-now` | Clear marker and route reward for discipline | Hidden curse under Safe route |
| Greed | Greed cache | `ship-now` | High payout with visible risk | Pure bonus with no danger |
| Greed | Hazard card | `prototype` | Trapped reward, toll, fuse, fragile card | Invisible life loss |
| Greed | Findable | `ship-now` | More rewards, destroy denies claim | Rewards stack beyond objective economy |
| Greed | Bounty | `prototype` | Bigger bounty, harsher ward | Forced bad target order |
| Greed | Decoy trap | `prototype` | Extra reward near decoy pressure | Unwinnable or last-tile confusion |
| Mystery | Mystery veil | `ship-now` | Deterministic reveal into ward/cache/hazard | Random-feeling punishment |
| Mystery | Transform card | `prototype` | Card changes after a visible trigger | State changes with no summary |
| Mystery | Omen card | `prototype` | Reveals a hazard family | Adds another thing to memorize |
| Mystery | Cursed pair | `prototype` | Veiled curse revealed before punishment | Punish before fair information |
| Mystery | Spotlight | `prototype` | Hidden swap once | Constantly shifting hidden target |

## Route plus run-map node

| Route | Node | Status | Good version | Risk |
|---|---|---|---|---|
| Safe | `combat` | `ship-now` | Predictable next floor with support card | Too plain if no route card payoff |
| Safe | `shop` | `prototype` | Defensive stock, heal/peek discounts | Safe becomes best economy if too cheap |
| Safe | `rest` | `ship-now` | Heal/guard recovery and objective-streak prep | Can remove all tension after spikes |
| Safe | `event` | `prototype` | Quiet lantern or low-risk event | Event feels like Mystery if too weird |
| Safe | `treasure` | `prototype` | Small guaranteed cache | Outpays Greed if uncapped |
| Greed | `elite` | `ship-now` | Harder floor, visible cache/hazard, bigger payout | Fake risk if hazards are too soft |
| Greed | `shop` | `ship-now` | Elite/greed floor opens vendor access | Gold loop can dominate |
| Greed | `treasure` | `ship-now` | Rich chest with toll/fuse/trap | Must show risk before claim |
| Greed | `event` | `prototype` | Bargain event with real next-floor pressure | Hidden debt feels unfair |
| Mystery | `event` | `ship-now` | Mirror, lantern, secret, unknown but seeded | Feels random without reveal/summary |
| Mystery | `treasure` | `ship-now` | Secret room or veiled chest | False cache can frustrate |
| Mystery | `shop` | `prototype` | Odd stock or veiled service | Unknown purchases need preview |
| Mystery | `rest` | `prototype` | Rest may become shrine/secret | Must not deny needed recovery invisibly |

## Route plus bonus room

| Route | Bonus room | Status | Synergy | Anti-synergy |
|---|---|---|---|---|
| Safe | Treasure chest | `prototype` | Small guaranteed recovery/economy | If too rich, Safe beats Greed |
| Safe | Secret shrine | `prototype` | Safe favor progress without bargain pressure | Can flatten shrine risk |
| Safe | Bonus cache | `ship-now` | Combo shard or guard recovery | Must respect caps |
| Greed | Treasure chest | `ship-now` | Bigger gold/score, possible toll | Trap must be visible |
| Greed | Secret shrine | `prototype` | Favor for route pressure | Favor loops need caps |
| Greed | Bonus cache | `ship-now` | Extra shard/gold if extracted cleanly | Destroy denial needs clear copy |
| Mystery | Treasure chest | `ship-now` | Veiled/false/secret chest | Random-feeling false cache |
| Mystery | Secret shrine | `ship-now` | Best secret-room route | Needs deterministic seed/explanation |
| Mystery | Bonus cache | `prototype` | Unknown reward family | Too many hidden rewards blur identity |

## Route plus event

| Route | Event | Status | Good version | Risk |
|---|---|---|---|---|
| Safe | `lost_cache` | `ship-now` | Leave safely or take small gold | Boring if always skip |
| Safe | `mirror_bargain` | `prototype` | Decline or soften cost | Mirror loses identity |
| Safe | `quiet_lantern` | `ship-now` | Heal/guard/reveal | Can overprotect |
| Greed | `lost_cache` | `ship-now` | Take more gold with debt/hazard | Hidden debt |
| Greed | `mirror_bargain` | `ship-now` | Favor now, pressure later | Degenerate favor if pressure too low |
| Greed | `quiet_lantern` | `prototype` | Convert rest into value | Feels wrong if it punishes recovery too hard |
| Mystery | `lost_cache` | `prototype` | Cache may be clue, false, or secret | Needs reveal before cost |
| Mystery | `mirror_bargain` | `ship-now` | Signature mystery bargain | Must be seeded and summarized |
| Mystery | `quiet_lantern` | `ship-now` | Reveal veil/secret/hidden route card | If too strong, Mystery has no uncertainty |

## Route plus inventory tool

| Route | Tool | Status | Good version | Bad version |
|---|---|---|---|---|
| Safe | Guard token | `ship-now` | Preserves life/streak through known danger | Free mistakes every floor |
| Safe | Peek | `ship-now` | Confirms trap/cursed target | Reveals too much and deletes memory |
| Safe | Shuffle | `ship-now` | Rebuilds bad board | Breaks safe objective plan without warning |
| Safe | Destroy | `prototype` | Emergency only | Safe becomes destroy route and loses pickup clarity |
| Greed | Guard token | `ship-now` | Risk budget for caches | Makes greed risk fake |
| Greed | Peek | `ship-now` | Skillful extraction | Too much peek trivializes traps |
| Greed | Shuffle | `prototype` | Reward routing | Fragile/fuse cache break rules unclear |
| Greed | Destroy | `ship-now` anti-synergy | Sacrifice reward for survival | Player misses denial copy |
| Greed | Combo shard | `ship-now` | Sustain parasite/elite pressure | Infinite sustain loop |
| Mystery | Peek | `ship-now` | Reveals veil family | Solves every mystery |
| Mystery | Pin | `ship-now` | Tracks veiled/cursed positions | UI clutter on large boards |
| Mystery | Stray remover | `prototype` | Removes false/stray hazard | Accidentally deletes reward or key card |
| Mystery | Shuffle | `prototype` | Recovers after reveal | Makes mystery outcomes meaningless |

## Perk/relic plus route

| Perk/relic | Safe | Greed | Mystery | Notes |
|---|---|---|---|---|
| `memorize_bonus_ms` | Strong stability | Helps extract caches | Helps inspect veils | Good universal, avoid over-buff |
| `memorize_under_short_memorize` | Excellent on speed Safe | Strong on speed Greed | Useful if mystery speed is allowed | Contextual offer should explain |
| `extra_shuffle_charge` | Protects objective plan | Chases rewards, but may disrupt memory | Recovers after reveal | Bad under `noShuffle` |
| `first_shuffle_free_per_floor` | Good board-control Safe | Strong greed routing | Good mystery recovery | Track scholar-style interaction clearly |
| `region_shuffle_free_first` | Precise control | Cache/pickup routing | Fix revealed bad lanes | Strong but understandable |
| `destroy_bank_plus_one` | Emergency tool | Anti-synergy with pickups/cache if destroys deny reward | Can remove hazards if allowed | Needs explicit reward denial copy |
| `combo_shard_plus_step` | Recovery sustain | Greed enabler | Variance buffer | Strong with parasite |
| `parasite_ward_once` | Safe parasite answer | Greed parasite enabler | Mystery parasite buffer | Weak outside parasite context |
| `peek_charge_plus_one` | Strong trap/cursed support | Skillful greed extraction | Premier mystery synergy | Should reveal route/hazard family |
| `stray_charge_plus_one` | Clean up uncertainty | Risky if it removes reward carriers | Strong with mystery | Define reward denial |
| `pin_cap_plus_one` | Great cursed/spotlight support | Tracks cache positions | Tracks veils | Strong information tool |
| `guard_token_plus_one` | Safe sustain | Greed risk budget | Mystery variance budget | Can make greed too safe if abundant |
| `shrine_echo` | Preserve future draft | Greed/favor compounding | Adaptation payoff | Economy pacing risk |
| `chapter_compass` | Prepare for danger | Plan greed before right floor | Plan mystery with support | Needs visible future context |
| `wager_surety` | Protects streak | Greed risk/favor engine | Mystery gamble support | Prevent infinite favor loops |
| `parasite_ledger` | Stable parasite route | Strong greed parasite route | Flexible parasite answer | Needs cap and future-floor explanation |

## Smart combo examples

### Greed parasite engine

Status: `ship-now` with tuning.

Ingredients:

- Greed route before or during `parasite_tithe`.
- `parasite_ledger`, `parasite_ward_once`, or `combo_shard_plus_step`.
- Greed cache cards that pay relic favor or gold.

Why it works:

- Parasite adds pressure.
- Greed adds payout.
- Sustain perks let skilled players ride the pressure.

Failure mode:

- If rewards are too high, Greed becomes always correct on parasite floors.

### Safe speed stabilizer

Status: `ship-now`.

Ingredients:

- Safe route into `speed_trial` or `rush_recall`.
- `memorize_bonus_ms` or `memorize_under_short_memorize`.
- Safe ward or memory anchor card.

Why it works:

- The route answers a known floor problem.
- Player feels the choice immediately in the next board.

Failure mode:

- Too much memory support turns speed floors into normal floors.

### Mystery scout build

Status: `ship-now` for simple veils, `prototype` for transform cards.

Ingredients:

- Mystery route.
- `peek_charge_plus_one`, `pin_cap_plus_one`, `stray_charge_plus_one`.
- Veil cards that reveal family on peek.

Why it works:

- The build converts hidden information into value.
- Mystery becomes a route for prepared players, not pure dice.

Failure mode:

- If peeking fully solves every mystery hazard, the route has no tension.

### Treasure greed puzzle

Status: `ship-now`.

Ingredients:

- Greed route into `treasure_gallery` or `findables_floor`.
- Extra pickups and greed caches.
- Destroy reward denial.

Why it works:

- Player can see lots of value.
- The hard question becomes route planning and restraint.

Failure mode:

- Destroying reward pairs must clearly lose the reward, or players feel cheated.

### Trap breaker

Status: `prototype`.

Ingredients:

- Trap floor or `glass_floor`.
- Safe ward or reveal tool.
- Optional Greed route for extra payout.

Why it works:

- Trap pressure has counterplay.
- Safe and Greed create distinct approaches to the same floor.

Failure mode:

- Extra traps can revive old last-pair/softlock concerns if completion rules are not tested.

## Bad combo examples

### Greed without safety

Status: acceptable anti-synergy.

Ingredients:

- Greed route.
- One life.
- No guard, no peek, no pin.
- Trap or parasite floor next.

Expected feel:

- Dangerous, maybe a player mistake.

Required UI:

- Route preview should say risk is high.
- Board should visibly contain extra danger.

Do not:

- Hide the reason for failure.

### Mystery plus overloaded low information

Status: `avoid` early, `prototype` late/challenge.

Ingredients:

- Mystery route.
- `silhouette_twist`.
- `short_memorize`.
- Veiled cards.
- No reveal tools.

Problem:

- Too much information is missing at once.

Possible fix:

- Only allow if Safe-style reveal support is added, or in opt-in wild/challenge mode.

### Destroy economy into pickup floor

Status: acceptable anti-synergy if explained.

Ingredients:

- `destroy_bank_plus_one`.
- `findables_floor`.
- Greed route.
- Player destroys reward carriers.

Problem:

- Build has power but uses it against its own reward plan.

Required UI:

- Destroy preview or summary should communicate that pickups/route rewards were not claimed.

### Safe always best

Status: `avoid`.

Ingredients:

- Safe route gives guard, pickups, memory support, and good gold.

Problem:

- No reason to take Greed or Mystery.

Fix:

- Safe rewards should be lower or defensive.
- Safe can preserve streaks but should not be best economy.

### Greed always best

Status: `avoid`.

Ingredients:

- Greed rewards huge gold/favor.
- Hazard penalties are blockable too often.
- Guard economy abundant.

Problem:

- Risk is fake.

Fix:

- Cap guard gains.
- Use reward denial instead of only life loss.
- Make greed hazards affect objective/streak/economy too.

### Mystery feels random

Status: `avoid`.

Ingredients:

- Veiled card reveals arbitrary outcome.
- No seeded pattern.
- No preview/codex summary.

Problem:

- Player cannot learn.

Fix:

- Mystery outcomes are deterministic from seed.
- Reveal family before punishment.
- Provide post-floor explanation.

## Route profile caps

Recommended starting caps for future implementation:

| Thing | Early floors | Mid floors | Boss/late floors |
|---|---:|---:|---:|
| Major route cards | 1 | 1-2 | 2 |
| Extra Greed hazards | 0-1 | 1 | 1-2 |
| Mystery veils | 1 | 1-2 | 2 |
| Safe rescue cards | 1 | 1 | 1-2 |
| Total major special families | 1 | 2 | 2-3 |

Major special families include route cards, traps/hazards, cursed/spotlight, mystery transforms, and boss cards. Findables count as minor unless they are trapped or transformed.

## Danger budget examples

| Scenario | Base pressure | Route addition | Allowed? | Reason |
|---|---|---|---|---|
| Greed `treasure_gallery` | Low-medium pickup planning | One fragile or toll cache | Yes | Adds extraction risk to reward floor |
| Greed `trap_hall` | Glass decoy + sticky | One greed cache near trap logic | Prototype | Needs softlock/a11y tests |
| Greed `rush_recall` | Boss + short/wide pressure | Fuse cache plus stricter par | Risky | Likely too many axes |
| Safe `rush_recall` | Boss + short/wide pressure | One ward or memory anchor | Yes | Adds relief without deleting boss |
| Mystery `shadow_read` | Silhouette low info | One veil plus reveal support | Prototype | Must avoid unreadable markers |
| Mystery `speed_trial` early | Short memorize | Hidden veil | No | Missing information under time pressure |

## Reward budget examples

| Scenario | Reward ceiling | Why |
|---|---|---|
| Safe rest route | Low-medium | Primary reward is survival, not economy |
| Safe treasure route | Medium | Should feel useful but not beat Greed chest |
| Greed elite route | High | Harder floor needs visible payout |
| Greed parasite route | High but capped | Sustain builds can exploit uncapped favor |
| Mystery secret route | Medium-high | Discovery is payoff, but must be bounded |
| Mystery false cache | Low consolation | False reward should teach, not punish hard |

## Implementation-ready priorities

### Priority 1: Route profile affects board generation

Status: `ship-now`.

Minimum:

- Greed adds one extra reward-risk card or extra hazard on eligible floors.
- Safe adds one ward/support card and suppresses one hazard addition.
- Mystery adds one veil that reveals deterministic outcome.

Acceptance:

- Selecting Greed produces a visibly harder or more volatile next floor.

### Priority 2: Route preview copy mirrors world profile

Status: `ship-now`.

Minimum:

- Route choice card says what kind of pressure will be added.
- Shop continue copy repeats pending route identity.
- Floor banner summarizes route world effect.

Acceptance:

- Player understands why the next floor changed.

### Priority 3: Reward denial clarity

Status: `ship-now`.

Minimum:

- Destroying a pickup/route reward carrier denies claim.
- Summary/floater/codex language explains this.

Acceptance:

- Player can connect destroy choice to missed reward.

### Priority 4: Mystery reveal tooling

Status: `prototype`.

Minimum:

- Peek reveals a mystery veil family without claiming.
- Pin helps track veiled cards.
- Veil never punishes before fair reveal.

Acceptance:

- Mystery feels uncertain but learnable.

### Priority 5: Hazard family expansion

Status: `prototype`.

Minimum:

- Add one Greed hazard family, probably Fragile or Toll.
- Keep it turn-based and visible.
- Add softlock tests.

Acceptance:

- Greed creates danger beyond score numbers.

## Test scenarios for future implementation

Use deterministic seeds and scripted route picks.

1. Greed into `treasure_gallery`
   - Expect more reward carriers than Safe.
   - Expect at least one greed cache.
   - Destroying cache denies route reward.

2. Greed into `trap_hall`
   - Expect trap pressure to increase but board remains completable.
   - Decoy remains non-pair.
   - Glass witness rules remain coherent.

3. Safe into `rush_recall`
   - Expect route support but scheduled mutators remain active.
   - Boss floor remains tagged and rewarding.

4. Mystery into `survey_hall`
   - Expect one veil.
   - Peek reveals family.
   - Matching applies deterministic route reward.

5. Mystery into `silhouette_twist`
   - Expect caps or support.
   - No unreadable marker relying only on color.

6. Greed with parasite relics
   - Expect contextual reward to feel stronger.
   - Favor/gold does not grow without cap.

7. Safe at low lives
   - Expect meaningful defensive support.
   - Safe reward lower than Greed.

8. Destroy-heavy build on pickup floor
   - Expect reward denial to be obvious.
   - No softlock.

## Open balancing questions

- Should Greed add hazards before floor 3, or wait until the player has seen route cards once?
- Should Safe ever reduce pair count, or only add support?
- Should Mystery outcomes be visible in replay/export summaries?
- Should route-world profile influence relic offer weighting immediately after the route choice, or only at next milestone?
- Should Greed increase `floorTag` intensity, or should it only add card-level pressure?
- Should route rewards be balanced around score, gold, favor, or survival?

## Hard rules

- Route-world generation must be deterministic.
- Route effects must not create unwinnable boards.
- Route cards should not silently override decoy/wild/completion-critical tiles.
- Mystery should reveal before punishment.
- Greed should visibly increase risk or extraction difficulty.
- Safe should visibly reduce volatility but not delete scheduled floor identity.
- Anti-synergy is allowed only when the player can understand it.
