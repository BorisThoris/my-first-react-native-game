# Current System Map

## Source Anchors
Core gameplay systems currently live mostly in:

- `src/shared/game.ts` - run creation, match resolution, scoring, dungeon cards, powers, shops, rooms, routes, objectives, softlock rules.
- `src/shared/contracts.ts` - public gameplay types: `RunState`, `Tile`, relics, mutators, dungeon card kinds, objectives, powers.
- `src/shared/relics.ts` - relic pool, draft rarity, build archetypes, contextual draft weighting.
- `src/shared/mechanics-encyclopedia.ts` - Codex/player-facing definitions for relics, mutators, powers, pickups, contracts, and concepts.
- `src/shared/board-powers.ts` - exported board-power entrypoints from `game.ts`.
- `src/renderer/components/GameLeftToolbar.tsx` - current in-run action dock and power buttons.
- `src/renderer/components/TileBoard.tsx` and `TileBoardScene.tsx` - board interaction, card rendering, visual state.
- `docs/BALANCE_NOTES.md` - current balance stance and roster summaries.

## Current Player-Facing System Families
| Family | Current Shape | Design Concern |
| --- | --- | --- |
| Core memory loop | Memorize, flip, match, mismatch, resolve delay, score, lives. | Strong base, but tactical systems can obscure what is still memory skill. |
| Powers/actions | Full shuffle, row shuffle, pin, destroy, peek, flash pair, stray remove, undo, gambit, wild. | Some actions exist in rules but are hard to discover or not always surfaced equally. |
| Relics | Run-scoped milestone draft, mostly numeric or charge/value modifiers. | Build archetypes exist, but many picks may feel like random utility bumps. |
| Mutators | Daily/endless modifiers such as short memorize, sticky fingers, parasite, wide recall, silhouette, n-back, category letters, glass floor, generous shrine. | Some are interesting pressure, others need stronger visual identity and explanation. |
| Contracts | Scholar, Pin vow, and similar constraints. | Good identity seeds, but can become hard prohibitions rather than playstyle fantasies. |
| Dungeon cards | Enemy, trap, treasure, shrine, gateway, key, lock, exit, lever, shop, room. | Many exist, but visual/player distinction can blur under the uniform card class. |
| Route specials | Fragile cache, lantern ward, omen seal, secret door, keystone pair, route cards. | Strong candidates for card-type expansion, but need clearer tactical taxonomy. |
| Findables | Optional pickup rewards on matched pairs. | Reward exists, but pickup readability and build connection are shallow. |
| Floors/routes | Floor archetypes, route node kinds, objectives, bosses, shops, rooms. | Needs a stronger "why this floor feels different" pass. |
| Meta/progression | Save data, achievements, collection, inventory, Codex, cosmetics. | Traits/talents terminology is not currently a clean system boundary. |

## Current Build Archetypes
`src/shared/relics.ts` defines:

- Guard tank.
- Trap control.
- Treasure greed.
- Boss hunter.
- Route gambler.
- Reveal / scout.
- Combo shard engine.

These are a good starting vocabulary, but the theory pass must test whether current relics actually create these playstyles in moment-to-moment decisions.

## Current Dungeon Card Kinds
`DungeonCardKind` currently includes:

- `enemy`
- `trap`
- `treasure`
- `shrine`
- `gateway`
- `key`
- `lock`
- `exit`
- `lever`
- `shop`
- `room`

Theory work should not add new kinds casually. Each new family needs a gameplay hook, visual tell, softlock rule, and reason it cannot be represented by an existing kind.

## Current Action Dock Gap
The toolbar currently surfaces many powers, but the mental model is mixed:

- Some powers are immediate.
- Some arm a tile-targeting mode.
- Some open a row picker.
- Some are passive/special-case and not represented as buttons.
- Some actions count against perfect rules, some do not.

Theory work should produce a unified action taxonomy before adding more buttons.

