# Findables system

**Status:** Design spec — implementation tracked as [`GP-FIN*` tasks](./gameplay-tasks/GP-FINDABLES.md).  
**Backlog id:** **FN-01** in [`gameplay-depth/05-app-specific-idea-backlog.md`](./gameplay-depth/05-app-specific-idea-backlog.md).

## Purpose

**Findables** are optional, board-placed goals **besides** clearing pairs: specific tiles (or pairs) carry a **pickup** that the player **claims** by meeting a clear rule (default: **complete that pair’s match**). They add **exploration / planning** on top of pair memory without replacing the win condition (**clear the board**).

Design goals:

1. **Readable** — Player can see during memorize (or on first reveal) that something is special; HUD/codex explain the **claim** rule.
2. **Low extraneous load** — Bounded count per floor (v1: **0–2** active findables), **visually distinct** from generic pair chrome (not hue-only); aligns with [research/RESEARCH_LOG.md](./research/RESEARCH_LOG.md) (distractor similarity).
3. **Fair** — Seeded from `runSeed` / level / `shuffleNonce` so daily/export reproduce; **destroy** / **shuffle** behaviors are explicit (see below).
4. **Optional by default** — v1 ships **off** unless a **mutator** (or later: contract) enables findables so classic runs stay cognitively lean.

## Concepts

| Term | Meaning |
|------|---------|
| **Findable kind** | Enum e.g. `shard_spark`, `score_glint` (v1: one or two kinds for tuning). |
| **Carrier** | A **tile** (by `tile.id`) that **holds** the findable. Usually **both** tiles of a pair carry the same `findableKind` so the pair is the unit of meaning. |
| **Claim** | Transition findable → reward applied, carrier cleared. |
| **Spawn** | Generation-time attachment of findable to chosen tile(s). |

## v1 rules (proposal)

### When findables appear

- **Gate:** `hasMutator(run, 'findables_floor')` (or a name TBD — new `MutatorId`) **OR** a run flag set only from that mutator / future contract. **No findables** when gate is off.
- **Count:** `0`, `1`, or `2` **pairs** (two tiles each) per floor, chosen by seeded RNG. Weight toward `1` for first ship.

### Claim condition (default)

- **On successful match** of a pair where **either** tile had `findableKind != null` **before** match resolution → **claim** once per pair (idempotent if both tiles tagged).

### Rewards (v1)

| Kind | Effect |
|------|--------|
| `shard_spark` | +1 toward combo shard pipeline **or** flat **+K score** on claim (pick one for v1; document in `game.ts` constants). |
| `score_glint` | (optional second kind) smaller flat score only. |

Tune so rewards **do not** obsolete secondary objectives (scholar style, glass witness, etc.) — findables are **extra sugar**, not the main economy.

### Interactions

| Action | Behavior |
|--------|----------|
| **Match pair** (normal) | Claim if findable on that pair. |
| **Destroy pair** | **v1:** Findable **lost** (no claim) **or** **claimed at reduced value** — pick one and document; prefer **lost** for simplicity so destroy stays a tradeoff. |
| **Shuffle (full or row)** | Findables **move with tiles** (attached to `tile.id` through permutation) — still claimable on match. |
| **Peek** | Does not claim; may reveal carrier is special if UI shows marker only when face-up / peek face-up. |
| **Decoy / glass** | Findable never on decoy tile (`DECOY_PAIR_KEY`). |

### Floor advance

- Reset `findablesClaimedThisFloor` (and any per-floor claim list) in `advanceToNextLevel` alongside other floor flags.

## Data model (target)

### `Tile` ([`contracts.ts`](../src/shared/contracts.ts))

```ts
/** If set, this tile is part of a findable pickup (both mates usually share kind). */
findableKind?: FindableKind | null;
```

### `RunState`

- `findablesClaimedThisFloor: number` (or `claimedFindableIds: string[]` if you need dedupe).
- Optional `findablesTotalRun: number` for meta / achievements later.

### `LevelResult` / `finalizeLevel`

- Extend `bonusTags` / `objectiveBonusScore` **or** fold findable score into match-time score only — **decision in GP-FIN04** (must be consistent with export).

## Generation

- In `buildBoard` / `createTiles` (after pairs exist, before return): if gate on, pick **pair indices** with RNG derived from `deriveLevelTileRngSeed`-style input + a **findable nonce** string.
- Never assign to decoy; never assign more than **N** pairs.

## Presentation & accessibility

- **Memorize + play:** Marker on carrier tiles — **pattern / icon / border**, not color alone; compatible with `silhouette_twist` (silhouette + findable glyph).
- **`reduceMotion`:** No pulsing requirement; static badge is enough.
- **Screen reader:** `aria-label` or visible text “Bonus pickup on this pair” in codex / FTUE string.

## Modes & fairness

- **Daily:** Only if mutator rolls into daily table (optional future) or dedicated daily variant — product choice.
- **Practice / Meditation:** Can enable via mutator pick.
- **Puzzle / fixed board:** Generation must respect handcrafted layout; v1 can **skip** findables on `fixedBoard` unless explicitly enabled.

## `GAME_RULES_VERSION` and export

- Bump when findables affect **generation** or **scoring** semantics.
- `RunExportPayload`: if findables are mutator-gated and schedule reproduces mutators, **no extra field** may be needed; if findables use a **per-floor secret table**, document whether **seed + rules** reproduce (preferred) or add a small payload field.

## Non-goals (v1)

- Findables **between** cells (edge-only) — higher spatial WM load; defer to v2 (see [GAME_MECHANICS_IDEAS.md](./GAME_MECHANICS_IDEAS.md) presentation ideas).
- **Sequence combos** (match `1` then `2`) — separate design; not part of findables.

## Related docs

- [GAME_MECHANICS_IDEAS.md](./GAME_MECHANICS_IDEAS.md) — board powers, cognitive load note.
- [gameplay-depth/02-helper-tiers-and-cognitive-jobs.md](./gameplay-depth/02-helper-tiers-and-cognitive-jobs.md) — findables as **Search / planning**, not Recall substitute.
- [gameplay-tasks/GP-FINDABLES.md](./gameplay-tasks/GP-FINDABLES.md) — implementation tasks.
