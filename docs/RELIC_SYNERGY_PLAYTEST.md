# Relic × mutator × contract matrix (B4)

Quick pass before balance changes. Check: no softlock (always can finish floor legally), achievements still make sense, daily seed reproducible.

| Combo | Check |
|-------|--------|
| Scholar contract + `first_shuffle_free_per_floor` | Free shuffle must not bypass `noShuffle` contract. |
| `glass_floor` + destroy | Decoy destroy rules — no free pair clear. |
| `sticky_fingers` + pin | Player can still open legal second tile. |
| `score_parasite` + relic heals | Life total stays within `MAX_LIVES`. |
| `short_memorize` + `memorize_bonus_ms` relic | Memorize ms stays ≥ `MEMORIZE_MIN_MS`. |
| Daily mutator + import seed | Same payload → same mutator list and floor 1 layout. |

Record failures as issues with save payload + `runSeed`.
