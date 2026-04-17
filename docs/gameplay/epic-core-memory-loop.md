# Epic: Core memory loop (flip → resolve)

## Scope

The heart of the game: hidden tiles flip to reveal symbols; two (or three with gambit) flips resolve to match or mismatch; wild and decoy rules; transition into memorize / level complete / game over.

## Implementation status

| Area | Status | Notes |
|------|--------|--------|
| Two-flip resolution | **Shippable** | `flipTile`, `resolveTwoFlippedTiles` in `game.ts`; `tilesArePairMatch` exported for UI parity. |
| Resolve delay | **Shippable** | `computeFlipResolveDelayMs`; user `resolveDelayMultiplier`; echo adds `ECHO_EXTRA_RESOLVE_MS` for two-flip mismatch path. |
| Gambit (third flip) | **Functional** | Allowed while `resolving` with two flips; `resolveGambitThree`; fail path adds extra tries (`GAMBIT_FAIL_EXTRA_TRIES`). Third-flip delay does not add echo — asymmetry vs two-flip (may be intentional; undocumented). |
| Wild joker | **Functional** | `WILD_PAIR_KEY` matching rules; `wildMatchesRemaining` across floors in wild-style runs. |
| `wildTileId` on `RunState` | **Partial** | Contract mentions a concrete tile id; `game.ts` leaves it `null` after `createNewRun` — logic uses `pairKey` only. |
| Glass decoy | **Shippable** | `DECOY_PAIR_KEY` never matches; `glass_floor` mutator; `decoyFlippedThisFloor` tracking. |
| Board generation | **Shippable** | `createTiles`, `buildBoard`; weaker shuffle modes, cursed pair pick, shifting spotlight init. |
| Fixed / puzzle boards | **Partial** | `fixedTiles` path omits cursed pair init and shifting spotlight keys unless callers supply them — scripted boards can skip those systems. |
| Timer fields | **Functional** | `RunTimerState` in `game.ts` (`pauseRun` / `resumeRun`); tick driving is primarily store/renderer. |

## Rough edges

- **Gambit vs echo:** Mismatch timing differs between 2-flip (echo-aware) and 3-flip resolving — no in-file TODO; worth a design note if balance changes.
- **Wild tile id:** Either implement assignment when a wild tile is spawned or narrow the contract comment to avoid confusion.
- **Puzzle boards:** Document which objectives (cursed, spotlight) are intentionally absent for `builtin-puzzles`.

## Primary code

- `src/shared/game.ts` — `flipTile`, `resolveBoardTurn`, `resolveTwoFlippedTiles`, `resolveGambitThree`, `tilesArePairMatch`, `computeFlipResolveDelayMs`, board builders.
- `src/shared/contracts.ts` — `BoardState`, `RunState`, `TileState`.
- `src/renderer/store/useAppStore.ts` — `pressTile` ordering (gambit third pick before normal play branch).

## Refinement

**Shippable** for standard endless/daily play. **Functional** for gambit/wild edge semantics and contract cleanliness.

## Tasks (polish backlog)

Tracked in rollup: [GAMEPLAY_POLISH_AND_GAPS.md](./GAMEPLAY_POLISH_AND_GAPS.md) §2.

- [x] **Either** assign `wildTileId` in `game.ts` when a wild tile is in play **or** narrow `RunState` / contract comments to reflect `pairKey`-only logic (no misleading “concrete tile id”).
- [x] Document per `builtin-puzzles` entry which systems are intentionally skipped (`fixedTiles` without cursed init, spotlight keys, etc.).
- [x] If balance review requires it: document or adjust gambit three-flip vs two-flip echo mismatch timing asymmetry. — *Documented:* intentional asymmetry in `game.ts` / resolve paths; revisit only on balance ticket.
