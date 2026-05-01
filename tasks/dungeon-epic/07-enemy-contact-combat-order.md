# Enemy Contact and Combat Order

## Status
Implemented by `DNG-032`.

## Contact Order
1. Input selects a tile occupied by a non-defeated moving enemy patrol.
2. `applyEnemyHazardClick` reveals that patrol and applies contact damage.
3. Guard tokens absorb contact before life is lost.
4. If life reaches 0, run status becomes `gameOver` and the tile action stops.
5. If still playing, the original tile action may continue.
6. Movement advances immediately for first-flip contact, or can be deferred until match resolution for occupied second flips.

## Combat Order
1. Safe successful matches damage the first revealed enemy card pair, then the first revealed moving patrol.
2. HP reaching 0 marks that target defeated and updates the relevant floor counters.
3. Floor clear defeats any remaining moving patrols without applying contact damage.

## Exceptions
- Exits, shops, and rooms keep their singleton reveal/interaction rules after contact if the run is still playing.
- Powers should call the same contact path before acting on an occupied card unless a later ticket explicitly exempts them.
