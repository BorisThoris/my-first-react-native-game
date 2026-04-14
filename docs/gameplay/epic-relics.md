# Epic: Relics

## Scope

Meta-upgrades offered at milestone floors; deterministic options from the relic pool; immediate effects applied on pick.

## Implementation status

| Area | Status | Notes |
|------|--------|--------|
| Pool & milestones | **Shippable** | `RELIC_POOL`, floors `[3,6,9]`, `needsRelicPick`, `rollRelicOptions` (deterministic RNG from run seed + tier). |
| Offer flow | **Shippable** | On `continueToNextLevel`, may open `relicOffer` instead of advancing; `pickRelic` → `applyRelicImmediate` → `advanceToNextLevel`. |
| Per-relic behavior | **Shippable** | Implemented in `game.ts` (`applyRelicImmediate`), not only in `relics.ts`. |
| Player-facing copy | **Shippable** | `RELIC_CATALOG` in `mechanics-encyclopedia.ts` (blurbs; re-exported through `game-catalog.ts`). |
| Persistence | **Shippable** | `mergeRelicPickStat` on pick. |

## Rough edges

- **Discovery:** New players may not understand relics stack across runs only within a run — codex helps if present.
- **Balance:** Pool is small and fixed; no dynamic relic rotation in this scan.

## Primary code

- `src/shared/relics.ts` — selection only.
- `src/shared/game.ts` — `applyRelicImmediate`, hooks in memorize/shuffle/destroy/parasite ward.
- `src/shared/mechanics-encyclopedia.ts` — `RELIC_CATALOG`.
- `src/shared/game-catalog.ts` — re-exports catalog + `getRelicMeta`.
- `src/renderer/store/useAppStore.ts` — `pickRelic`, `continueToNextLevel`.

## Refinement

**Shippable** as a roguelite-style perk layer. Depth is **functional** (limited pool) rather than expansive.

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §13, §15.

- [ ] Codex / offer UI: clarify relics apply **within the current run**; reduce “meta between runs” confusion.
- [ ] (Product) Expand relic pool, rotating offers, or post-v1 variety — document decision vs small fixed pool.
- [x] Document in `relics.ts` / this epic where `applyRelicImmediate` delegates to `getMemorizeDurationForRun` and other helpers (avoid “no-op” misreads) — align with [GAMEPLAY_SYSTEMS_ANALYSIS.md](../GAMEPLAY_SYSTEMS_ANALYSIS.md) §8.
