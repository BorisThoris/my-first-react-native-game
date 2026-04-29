# Route world pipeline

## Thesis

Route choice should be a real input to the next floor. If the player chooses the **Greedy route**, the next board should not only show a greed-colored reward card. It should become a greed-shaped floor: more volatile rewards, more traps, harsher mistake pressure, and stronger reasons to use safety tools. If the player chooses **Safe**, the next board should visibly stabilize. If the player chooses **Mystery**, the board should hide part of its contract until play reveals it.

The current code already has the right first hook:

- `RouteNodeType`: `safe`, `greed`, `mystery`
- `RouteCardKind`: `safe_ward`, `greed_cache`, `mystery_veil`
- `RunState.pendingRouteCardPlan`: route choice survives through shop and is consumed by `advanceToNextLevel`
- `Tile.routeCardKind`: rendering can mark route cards

The next design step is making the route plan feed the **board/world generation pipeline**, not only route-card stamping.

## Target mental model

The player should eventually learn this:

| Route | Player promise | World response | Core question |
|---|---|---|---|
| Safe | Lower payout, more control | The floor gives wards, guard tools, softer hazards, and fewer stacked pressure effects | Can I preserve streaks and rebuild? |
| Greed | Higher payout, higher danger | The floor adds more traps, volatile reward cards, harder objectives, and richer gold/favor/pickup opportunities | Can I extract value without losing the run? |
| Mystery | Unknown upside, unstable rules | The floor veils some cards, converts rewards/hazards mid-floor, or hides a modifier until first contact | Can I adapt with imperfect information? |

The important design rule: **route should bias the whole next floor**, not replace the floor archetype. A Greedy `trap_hall` should be a more dangerous trap hall. A Safe `speed_trial` should still be a speed trial, but with enough support to feel like the player chose protection.

## Pipeline shape

Future implementation should flow like this:

1. Player clears floor.
2. `generateRouteChoices` offers `safe`, `greed`, and `mystery`.
3. Player chooses a route, producing `pendingRouteCardPlan`.
4. Shop/event screens may happen, but the selected route remains pending.
5. `advanceToNextLevel` computes the normal scheduled floor entry.
6. Route choice derives a **route world profile**.
7. Board generation consumes both:
   - scheduled floor identity from `floor-mutator-schedule.ts`
   - route world profile from `pendingRouteCardPlan.routeType`
8. `buildBoard` assigns tiles, findables, hazards, route cards, objective markers, and special metadata.
9. Renderer shows the generated reality: not just route tint, but different card populations and board threats.

This keeps route choice deterministic and replayable because the same `runSeed`, `runRulesVersion`, `level`, and route choice produce the same world profile.

## Route lifecycle

Route choice should eventually influence more than the next board. The current run systems already have adjacent room concepts that can make a route feel like a short journey:

1. **Preview**: route choice shows risk, reward, and likely node type.
2. **Commit**: route is stored as `pendingRouteCardPlan`.
3. **Interlude**: shop, event, rest, treasure, or bonus room may resolve before the board.
4. **World profile**: route modifies the next generated floor.
5. **Board rendering**: route cards, hazards, pickups, and support cards appear on the actual grid.
6. **Resolution**: matching, destroying, peeking, or skipping route cards produces route-specific rewards or missed opportunities.
7. **Summary**: floor clear copy explains what the route changed and what the player gained or lost.

This matters because route should not feel like a single button with a hidden stat effect. It should feel like a chain of visible consequences.

## Route plus run-map nodes

Current `RunMapNodeKind` values are `combat`, `shop`, `elite`, `rest`, `event`, and `treasure`. The theory layer should use those as route texture.

| Node kind | Safe route use | Greed route use | Mystery route use |
|---|---|---|---|
| `combat` | Predictable floor, lower volatility, better defensive preview | Harder combat with cache/hazard injection | Combat with one hidden rule or veiled reward |
| `shop` | Discounted heal/peek/guard services after a safe clear | Vendor access after pressure, expensive but richer stock | Strange vendor stock, one unknown service until inspected |
| `elite` | Rare; safe route can avoid elite pressure | Core Greed identity: harder floor, bigger payout | Elite with unknown modifier revealed at entry |
| `rest` | Strong Safe identity: heal, guard, or quiet recovery | Greed can skip rest for payout or turn rest into bargain | Rest event may have unknown blessing/cost |
| `event` | Low-risk choice, guard/life outcome | Bargain event with gold/favor upside and real cost | Core Mystery identity: mirror, lantern, secret, odd bargain |
| `treasure` | Smaller guaranteed cache | Rich chest with hazard or toll | Secret room, cracked wall, veiled chest |

Greed should not always be "harder board immediately." Sometimes Greed is "take a harder elite floor because it opens vendor access or chest payout." Safe should not always be "easy board." Sometimes Safe is "normal board, but the next interlude helps you survive." Mystery should not always be "random board." Sometimes Mystery is "the node itself is an event or secret room."

## Side-room hooks

Existing side systems can become route language.

### Shops

Greed naturally points toward shops because gold is the route's economy fantasy. The route can:

- place greed caches on the board that pay shop gold,
- increase shop access after an elite or greed floor,
- make shop offers stronger but more expensive,
- add a "debt" or "toll" card that pays now and pressures later,
- or preview a vendor alcove after the next floor.

Safe shop identity should be different:

- discounted healing,
- guard or peek stock,
- stable service prices,
- no cursed bargains,
- smaller gold needs.

Mystery shop identity can support odd offers:

- one unknown item revealed after purchase preview,
- mirror bargain stock,
- secret shrine reroll,
- or a veiled service with deterministic seed.

### Rest and shrine

Current rest-shrine services include `rest_heal` and `shrine_bargain`. These can become route outcomes:

- Safe route: more likely to expose rest heal, quiet lantern, or guard recovery.
- Greed route: more likely to tempt `shrine_bargain`, favor progress, or pay-for-risk services.
- Mystery route: may reveal whether a shrine is rest, bargain, or secret only after the player enters.

Safe should be the route that says "keep the run alive." Greed should be "turn safety into value." Mystery should be "discover what this shrine actually is."

### Events

Current event IDs are `lost_cache`, `mirror_bargain`, and `quiet_lantern`.

| Event | Safe treatment | Greed treatment | Mystery treatment |
|---|---|---|---|
| `lost_cache` | Leave cache or take small safe gold | Take more gold, but next floor gets a hazard/cache toll | Cache may be real, trapped, or secret-room clue |
| `mirror_bargain` | Usually avoid or soften cost | Favor now, route pressure later | Signature Mystery event; unknown upside with revealed cost |
| `quiet_lantern` | Heal or guard; strongest Safe event | Skip rest for payout or convert guard into cache value | Lantern reveals a veil, hidden card family, or secret door |

Events should feed the route-world profile only through small modifiers. They should not rewrite the next floor so hard that route choice becomes unreadable.

### Bonus rewards

Current bonus reward rooms include `treasure_chest`, `secret_room`, and `bonus_cache`.

| Bonus room | Safe route | Greed route | Mystery route |
|---|---|---|---|
| Treasure chest | Smaller guaranteed gold/score | Larger chest, possibly toll/fuse/trap attached | Chest might be secret, false, or veiled |
| Secret shrine | Rare but safe favor | Favor tied to bargain or elite pressure | Natural Mystery payoff |
| Bonus cache | Combo shard or guard recovery | Bigger cache with extraction risk | Unknown reward until reveal |

Greed can make bonus rooms more frequent or richer, but must spend danger budget somewhere. Mystery can make secret rooms more likely, but must explain discovery and avoid feeling like pure luck.

## Route world profile

A future route profile can be thought of as a small data object, even if it is not implemented exactly this way:

```ts
interface RouteWorldProfile {
    routeType: RouteNodeType;
    intensityDelta: number;
    rewardBias: number;
    hazardBias: number;
    pickupBias: number;
    safetyBias: number;
    mysteryBias: number;
    preferredCardFamilies: string[];
    suppressedCardFamilies: string[];
    mutatorPressureHints: MutatorId[];
}
```

The profile should not directly mutate everything. It should provide weights and caps used by generation.

## Danger and reward budgets

Route profiles need budgets so they do not stack into unreadable floors.

| Budget | Safe | Greed | Mystery |
|---|---:|---:|---:|
| Extra hazard budget | 0 or negative | 1-2 | 0-1, hidden/revealed |
| Reward budget | Low-medium | High | Medium-high variance |
| Information penalty | None | Low-medium | Medium |
| Recovery budget | High | Low | Variable |
| Side-room value | Rest/shop support | Shop/treasure/elite payout | Event/secret payout |

Budget examples:

- Greed into `trap_hall` should spend most danger budget on trap pressure, not also add short memorize, fuse cache, and hidden curse.
- Mystery into `silhouette_twist` should spend information budget carefully and probably add reveal support.
- Safe into `breather` should not become best economy; it can recover but should not outpay Greed.

The intended result is a controlled "yes, and" system: route adds identity, but the floor remains readable.

### Safe profile

Safe is not boring. Safe is a **defensive build route**.

World effects:

- Lower chance of extra hazards.
- Higher chance of `safe_ward` cards.
- Higher chance of guard/peek/pin-friendly board layouts.
- Fewer compounded "hard pressure" additions when the scheduled floor already has `short_memorize`, `glass_floor`, `score_parasite`, or boss tag.
- Better chance of recovery pickups or defensive route rewards.
- Slightly lower gold, favor, and bonus-score upside.

Safe should preserve the scheduled floor's identity. A Safe `rush_recall` can still be hard, but it should offer one of:

- a ward card pair that grants guard token or blocks one route hazard,
- a safer route objective,
- a reduced hazard count,
- a visible support pickup,
- or stronger preview copy so the player knows what to protect.

Safe should be the correct route for players who are low on lives, entering a boss floor, holding a fragile streak, or running a build with poor safety coverage.

### Greed profile

Greed is the route that most clearly needs to affect the actual board.

World effects:

- Add trap/hazard density on the next floor.
- Increase reward-card density.
- Prefer richer `greed_cache` cards.
- Increase gold and relic favor opportunities.
- Add optional objectives that punish autopilot.
- More likely to combine reward pickups with danger carriers.
- If the floor is already a boss or trap archetype, greed should upgrade danger carefully rather than blindly stacking every hazard.

Greed should create boards where the player says: "I can see the money, but getting it is going to cost attention."

Greedy route examples:

| Base floor | Greed transformation |
|---|---|
| `treasure_gallery` | More reward carriers, but one or two reward cards become trapped caches that punish mismatch |
| `trap_hall` | Extra decoy-adjacent pressure, greed caches near risky memory routes, bigger glass witness reward |
| `parasite_tithe` | Bigger favor/gold payout, but parasite clock or score tax becomes more threatening |
| `rush_recall` | Higher match reward and maybe extra cache, but less safety and stricter flip par |
| `spotlight_hunt` | Bounties pay more, wards penalize harder, greed cache may move spotlight pressure |

Greed should be wrong if the player has no defensive tools and poor information control. That is the point. A smart greed player drafts guard, peek, pin, parasite, or shuffle support before leaning into greed.

### Mystery profile

Mystery is the route of uncertainty, not pure randomness.

World effects:

- Some route cards begin as `mystery_veil`.
- Rewards or hazards may be unknown until first reveal or first match.
- Mystery can convert into Safe-like or Greed-like outcomes, but should have a deterministic seed.
- Mystery can hide a small rule modifier, then reveal it with UI copy.
- Mystery should be swingy but bounded: it should not create invisible run-ending traps.

Mystery should reward flexible builds:

- peek helps reveal veiled cards,
- pin helps remember unknown positions,
- guard tokens protect against misreads,
- chapter/draft relics help adapt to the next floor,
- shuffle tools can rescue bad board states after mystery reveals.

Mystery should punish narrow builds. If the player only has greed economy and no reveal/control tools, mystery can become inefficient or dangerous.

## Interaction with floor schedule

The scheduled floor remains the spine. Route modifies it.

| Floor archetype | Safe route | Greed route | Mystery route |
|---|---|---|---|
| `survey_hall` | Preserve flip par with one support card | Richer par bonus but one hazard pair pressures routing | Hide one route-card identity until reveal |
| `speed_trial` | Add memorize support or ward reward | Add cache payout under tighter mistake pressure | Veiled cards reveal as timer/support/hazard |
| `treasure_gallery` | Safer pickups, lower payout | More pickups plus trapped caches | Unknown pickup families until matched |
| `shadow_read` | Better telegraphing and guard reward | More reward under silhouette risk | Silhouette plus veiled route cards |
| `anchor_chain` | Pin/peek oriented reward | Cache rewards tied to anchor cadence | Veil changes after anchor refresh |
| `trap_hall` | Fewer extra hazards, ward against decoy mistakes | More traps and bigger witness/cache payout | Unknown decoy-adjacent route cards |
| `script_room` | Letter-reading support | Higher score, stricter par | Veiled symbols or delayed route reveal |
| `rush_recall` | One defensive pressure valve | Bigger boss payout, harder route objective | Unstable boss modifier |
| `parasite_tithe` | Parasite buffer or ward reward | Rich parasite/favor payout, faster tax | Hidden parasite relief or penalty |
| `spotlight_hunt` | Ward mitigation | Bounty payouts become dangerous and rich | Spotlight rule can shift once |
| `breather` | Strong recovery | Tempting "turn breather into payday" with mild hazard | Unknown recovery/economy blend |

## Difficulty language

Route difficulty should be built from multiple axes, not a single "harder" flag.

| Axis | Safe | Greed | Mystery |
|---|---|---|---|
| Pair count | Same or slightly softened | Same or slightly increased only when safe | Same |
| Memorize time | Same or protected by support | Same or slightly pressured through objective | Same, but information may be partial |
| Hazard count | Lower | Higher | Variable |
| Pickup count | Defensive | Reward-heavy | Unknown/mixed |
| Reward value | Lower | Higher | Variable |
| Objective strictness | Forgiving | Stricter | Hidden until revealed |
| Information clarity | High | Medium | Low at first, then revealed |

Prefer adding **interesting danger** over raw scalar difficulty. Greed should not always mean "+2 pairs." It can mean:

- one trapped reward card,
- a higher penalty for matching ward while chasing bounty,
- an extra decoy-like hazard,
- a greed cache that pays only if matched before a parasite tick,
- a stronger reward if the cursed pair is saved for last,
- a shop-gold jackpot attached to a risky pair.

## Route card density

Current implementation stamps one selected pair with a route card. Future versions can use density ranges:

| Route | Early floors | Mid floors | Boss/late floors |
|---|---:|---:|---:|
| Safe | 1 ward pair | 1-2 ward/support pairs | 2 support pairs, capped |
| Greed | 1 cache pair | 2 cache/hazard pairs | 2-3 volatile reward pairs, capped |
| Mystery | 1 veiled pair | 1-2 veiled pairs | 2 veiled or transform pairs |

Caps matter because too many special cards destroy readability. The player should see that the route changed the board, but the board should still be a memory game.

## Reward routing

Route rewards should be consistent enough to become strategic:

| Reward type | Safe | Greed | Mystery |
|---|---|---|---|
| Guard tokens | High | Low | Medium |
| Combo shards | Medium | Medium-high | Variable |
| Shop gold | Low | High | Variable |
| Relic favor | Medium | High | Variable |
| Score | Medium | High | Variable |
| Peek/pin support | High | Low-medium | High if revealed |
| Memorize support | Medium-high | Low | Variable |

Greed can pay more, but it should ask for sharper play. Safe can give less, but it should reduce the chance of a run collapsing. Mystery can be better than either if the player brings flexible tools.

## Smart route decisions

Good route choice should depend on current run state.

Choose Safe when:

- lives are low,
- a boss floor is next,
- objective streak is valuable,
- the player has greed relics but no protection,
- the next archetype is high pressure,
- or current route offers would over-stack hazards.

Choose Greed when:

- lives and guard tokens are healthy,
- player has peek/pin/control tools,
- parasite and wager relics can convert risk into favor,
- the next floor is a breather or treasure archetype,
- or the player needs gold before shop.

Choose Mystery when:

- build is flexible,
- player has reveal tools,
- current run has enough safety to absorb variance,
- route previews are poor or all other paths are awkward,
- or the player needs a comeback swing.

## Bad route decisions

Anti-synergy should be allowed, but should feel like a readable mistake.

Bad decisions:

- Greed before `trap_hall` while on one life and no guard tokens.
- Greed into `score_parasite` with no parasite relic, no shard plan, and low score cushion.
- Mystery into `silhouette_twist` without peek or pin support.
- Safe when the player has a strong greed economy and an easy breather floor next, leaving value on the table.
- Greed with a destroy-heavy habit on pickup-rich boards, because destroy clears rewards without claiming them.

The game should not hide why these are bad. Route preview copy, board telegraphing, and post-floor summary should make the causal chain legible.

## Implementation notes for later

Future engineering should likely add a route-world module beside floor schedule logic:

- `deriveRouteWorldProfile(run, routeCardPlan, floorEntry)`
- `applyRouteWorldProfileToBoardOptions(options, profile)`
- `assignRouteSpecialCards(tiles, profile, rng)`
- `getRouteWorldSummary(profile)` for HUD/shop copy

Generation order should be reviewed carefully:

1. create normal pair tiles,
2. apply floor schedule specials such as decoy/wild/cursed/spotlight,
3. apply findables,
4. apply route-world specials,
5. resolve conflicts with caps and forbidden carriers,
6. expose final metadata to renderer.

Do not let route cards overwrite completion-critical hazards unless there is an explicit combo rule. For example, a decoy should not become a normal greed cache unless the rules define exactly how it completes.

## Implementation-ready v1 slice

A first route-world implementation can be small but real:

1. Derive a route profile from `pendingRouteCardPlan.routeType`.
2. Apply it only to Endless scheduled floors.
3. Keep current single route-card pair, but add route profile metadata to board generation.
4. Greed:
   - route card reward is higher,
   - one extra reward-risk card or greed cache appears on eligible floors,
   - trap/boss floors add risk copy and capped hazard pressure.
5. Safe:
   - route card grants defensive value,
   - suppresses any route-added hazard,
   - can add one ward/support card.
6. Mystery:
   - route card starts veiled,
   - reveal outcome is deterministic,
   - peek can identify its family later.
7. Floor banner and route preview mention the profile.
8. Tests assert Greed produces different board metadata than Safe on the same seed.

That v1 would satisfy the user's core complaint: clicking Greedy changes the next floor's generated reality, not just one card's visuals.

## Non-goals for first implementation

- No online authority or server balancing.
- No route effects that make a board unwinnable.
- No invisible lethal traps.
- No route profile that ignores floor schedule identity.
- No unlimited special-card density.
- No route mechanics that require final art assets before they can be tested.

## Acceptance bar

After route-world implementation, selecting Greedy should reliably produce a next floor that is materially different:

- more danger or stricter extraction,
- more visible reward opportunity,
- route-specific card families on the board,
- and post-floor scoring/reward events tied to those cards.

If a player selects Greedy and the next board feels like a normal board with one decorative card, the pipeline has failed.
