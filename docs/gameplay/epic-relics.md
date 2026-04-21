# Epic: Relics

## Scope

Meta-upgrades offered at milestone floors; deterministic options from the relic pool; immediate effects applied on pick.

## Implementation status

| Area | Status | Notes |
|------|--------|--------|
| Pool & milestones | **Shippable** | `RELIC_DRAFT` weights + rarity tier scaling (`effectiveRelicDraftWeight`), `RELIC_POOL`, milestones every 3 floors from 3 (cap **12 milestone visits**/run), `needsRelicPick` (puzzle off), `rollRelicOptions` (deterministic RNG: run seed + tier + floor + `pickRound`; weighted without replacement via `weightedPick.ts`). Scheduled Endless drafts guarantee one contextual option when possible. |
| Offer flow | **Shippable** | `computeRelicOfferPickBudget` stacks Daily (+1), `generous_shrine`, meta (`relicShrineExtraPickUnlocked` → `metaRelicDraftExtraPerMilestone`), Scholar `bonusRelicDraftPick`, and banked `shrine_echo` / `grantBonusRelicPickNextOffer`. On `continueToNextLevel`, may open `relicOffer`; `pickRelic` applies relic; if `picksRemaining > 1`, rerolls; else `relicTiersClaimed++` once and `advanceToNextLevel`. See [relic-draft-fluid-system](../epics/relic-draft-fluid-system/README.md). |
| Draft UI | **Shippable** | Rarity via card chrome (color/glow); effect text plus optional contextual reason line; a11y `aria-label` / `sr-only`. `RelicDraftOfferPanel` + `GameScreen`. |
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

- [x] Codex / offer UI: clarify relics apply **within the current run**; reduce “meta between runs” confusion. — *Deferred:* copy polish with next Codex pass.
- [x] (Product) Expand relic pool, rotating offers, or post-v1 variety — document decision vs small fixed pool. — *Deferred:* fixed pool for v1; expansion backlog.
- [x] Document in `relics.ts` / this epic where `applyRelicImmediate` delegates to `getMemorizeDurationForRun` and other helpers (avoid “no-op” misreads) — align with [GAMEPLAY_SYSTEMS_ANALYSIS.md](../GAMEPLAY_SYSTEMS_ANALYSIS.md) §8.
