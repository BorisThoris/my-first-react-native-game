# Remove stray tile (power)

**Goal:** Remove **one** hidden tile from play without scoring a pair — distinct from **Destroy pair** (removes a full hidden pair for no score).

## Rules

1. **Charge** — consumes `strayRemoveCharges` (earned like destroy or granted at run start for testing).
2. **Target** — player arms **Stray**, taps one **hidden** tile that is **not** the decoy (`DECOY_PAIR_KEY`).
3. **Effect** — that tile becomes `state: 'removed'` (invisible / inert). Its partner remains on the board as a **singleton**; the player must clear all normal pairs (and wild/joker if present) to finish the floor.
4. **Win** — `matchedPairs === pairCount` and no unfinished business: singleton leftovers still block perfect clear logic unless matched via wild or another power (design: singleton cannot match alone — player may need destroy on the orphan later).
5. **Achievements** — counts as **power used** (`powersUsedThisRun`).

## vs Destroy

| Power | Target | Result |
|-------|--------|--------|
| Destroy | Hidden pair | Both matched, no score |
| Stray | One hidden tile | One removed, partner orphan |
