# Contributing puzzles (F3)

Puzzles are **fixed layouts** keyed by id in `src/shared/builtin-puzzles.ts` (or future JSON loader with the same shape).

## Quick playtest import (not a shipped puzzle)

The main menu **Import puzzle JSON** action loads a file and runs `parsePuzzleImportJson` → `createPuzzleRun` with an ephemeral `import:…` id. Use the same **tile** shape as below; validation requires **4–64** tiles and **exactly two** tiles per non-decoy `pairKey`. This path is for **local iteration**; shipping puzzles still go through `BUILTIN_PUZZLES` and PR review.

## Optional systems (`fixedTiles`)

Procedural-only mechanics (**cursed pair** seeding, **shifting_spotlight** ward/bounty keys, etc.) are **not** implied by a bare tile list. They run when `createPuzzleRun` / `buildBoard` callers attach them—same as endless boards. Shipped **builtin** ids are summarized in the table at the top of [`src/shared/builtin-puzzles.ts`](../src/shared/builtin-puzzles.ts) (currently layout-only). **Import JSON** validates pair structure only; authors who need special objectives must use code paths that supply those fields.

## Data shape

```ts
{
  id: string;       // stable key, e.g. 'starter_pairs'
  title: string;    // menu display
  tiles: Tile[];    // full grid: id, pairKey, symbol, label, state: 'hidden'
}
```

- `columns` × `rows` are derived from tile count (same rules as `buildBoard` pair count).  
- Use **even** tile count; each `pairKey` appears on **exactly two** tiles.  
- Symbols must stay readable at minimum tile size (see ideas doc: picture superiority).

## PR checklist

1. Add entry to `BUILTIN_PUZZLES`.  
2. If new size: verify `createPuzzleRun` / board dimensions in `game.ts`.  
3. Add a short **vitest** case: puzzle id loads, pair count matches, no orphan keys.  
4. Screenshot or describe solve path in PR for review.

## Weekly featured (A4)

Menu copy can point at a featured id (e.g. `starter_pairs`). Rotating the id is a one-line / config change until remote config exists.
