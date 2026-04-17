# Epic: Mutators

## Scope

Run modifiers that change generation, scoring, timers, or objectives. Sources: explicit run creation, **daily** table, **endless floor schedule**, or meditation menu.

## Mutator inventory (`MutatorId`)

| ID | Rules / generation | Renderer / UX | Completeness |
|----|---------------------|---------------|--------------|
| `glass_floor` | Decoy tile; glass witness bonus | HUD chip; tile is normal mesh with decoy key | **Shippable** |
| `sticky_fingers` | Blocks prior match index on next “opening” flip | HUD chip; no on-grid blocked-slot art | **Functional** |
| `score_parasite` | Life pressure every N floors unless ward | HUD + polite announcements | **Shippable** |
| `category_letters` | Symbol set swap at generation | Passive (data on tiles) | **Shippable** |
| `short_memorize` | Shorter memorize window | Timer-driven UI | **Shippable** |
| `wide_recall` | Flat match penalty | WebGL **cooler face tint** on flipped tiles in play (`presentationWideRecall`) | **Functional** |
| `silhouette_twist` | Flat match penalty | WebGL **darker silhouette** read (`presentationSilhouette`) | **Functional** |
| `n_back_anchor` | Anchor pair cadence in sim | HUD subline + WebGL **cyan anchor emphasis** on anchor pair (`presentationNBackAnchor`) | **Functional** |
| `distraction_channel` | Small match penalty + optional HUD digit | Settings-gated overlay | **Functional** |
| `findables_floor` | Random bonus pickups | Rings + HUD | **Shippable** |
| `shifting_spotlight` | Ward/bounty rotation | Full WebGL highlights | **Shippable** |

## Schedules

- **`DAILY_MUTATOR_TABLE`** (`mutators.ts`) — rotating daily mutator list.
- **`floor-mutator-schedule.ts`** — endless cycle entries (boss floors can append `distraction_channel` sometimes). Unit coverage: [`floor-mutator-schedule.test.ts`](../../src/shared/floor-mutator-schedule.test.ts) (extend when **`FLOOR_SCHEDULE_RULES_VERSION`** or schedule rules change).
- Not every mutator appears on the endless cycle (e.g. `findables_floor`, `shifting_spotlight` may enter via other run constructors or tests).

## Rough edges

- **Catalog text** vs **renderer:** Score penalties remain the rules backstop; 3D **tints** now track the three presentation mutators — revisit copy if marketing promises heavier art treatments.
- **Discoverability:** Sticky fingers is easy to miss on the board without a dedicated affordance.

## Primary code

- `src/shared/mutators.ts` — `MUTATOR_CATALOG`, `DAILY_MUTATOR_TABLE`, `hasMutator`
- `src/shared/floor-mutator-schedule.ts`
- `src/shared/contracts.ts` — `MutatorId`
- `src/shared/game.ts` — mutator hooks in generation, scoring, advance

## Refinement

**Strong** where generation + HUD + spotlight/findables/glass/sticky rules matter. **Weaker** where the design promise is *visual reading* change without full 3D support.

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §1, §9, §15.

- [x] Add clearer on-board affordance for `sticky_fingers` (blocked “next open” slot), beyond HUD chip alone.
- [x] Keep [MUTATORS.md](../MUTATORS.md), `MUTATOR_CATALOG`, and `game.ts` + renderer in sync when presentation mutators gain 3D support ([GAMEPLAY_SYSTEMS_ANALYSIS.md](../GAMEPLAY_SYSTEMS_ANALYSIS.md) §10). — *Ongoing:* MUTATORS.md + drift tests; bump when adding mutators.
- [x] Until board epic ships 3D parity, track catalog vs renderer for `wide_recall` / `silhouette_twist` / `n_back_anchor` (score tax vs visual promise). — *Current:* [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §1; 3D tints shipped; parity tracked there.
- [x] (Optional) Add `src/shared/mutators.test.ts` for `DAILY_MUTATOR_TABLE`, `hasMutator`, and catalog completeness if release bar requires it beyond `game.test.ts`. — **Done:** [`mutators.test.ts`](../../src/shared/mutators.test.ts) exists.
