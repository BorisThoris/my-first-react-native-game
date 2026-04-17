# State machine (relic offer)

## `relicOffer` shape

- `tier` — 1-based display index for this milestone (same as before).
- `options` — up to three `RelicId` choices for the **current round**.
- `picksRemaining` — selections left **including** the pick about to be made (after a pick, decremented).
- `pickRound` — 0-based counter for this milestone visit; fed into RNG for [`rollRelicOptions`](../../../src/shared/relics.ts) so rerolls differ but stay deterministic.

## Opening the offer

`openRelicOffer`:

1. Requires `needsRelicPick` and no active offer.
2. `picksRemaining = 1 + run.bonusRelicPicksNextOffer`, then **clears** `bonusRelicPicksNextOffer` to `0`.
3. `pickRound = 0`, `options = rollRelicOptions(run, tierIndex, clearedFloor, 0)`.

## Picking

On each selection:

1. Validate `relicId ∈ options`.
2. Append `relicId`, `applyRelicImmediate`.
3. If `picksRemaining - 1 > 0`: decrement, increment `pickRound`, reroll `options` from **updated** run (already-owned relics excluded), **keep** `relicOffer`.
4. If that was the **last** pick: set `relicOffer` to `null`, increment **`relicTiersClaimed` once** (one milestone visit), then `advanceToNextLevel`.

So: **multiple relics per visit** still count as **one** milestone tier toward the cap; `relicTiersClaimed` tracks **visits**, not individual relics.

## RNG

`hashStringToSeed(\`relic:${runSeed}:${tierIndex}:${clearedFloor}:${pickRound}\`)` ensures round 0/1/… produce different trios when the pool allows.
