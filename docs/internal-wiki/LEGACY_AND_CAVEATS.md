# Legacy code and document caveats

## `legacy/expo-roguelike/`

Archived tree (Expo / older web / roguelike prototype). **Not** part of the supported lint/test/build path for the Windows desktop game. Consult only for history or porting ideas—not for current behavior.

## `docs/GAME_TECHSTACK_ANALYSIS.md`

Written as a **cross-platform / Expo-era** product survey (dungeon map, room types, Android/web). It is **not** the authoritative description of the **current Electron desktop** loop.

**For the shipped desktop product, prefer:**

- [GAMEPLAY_SYSTEMS_ANALYSIS.md](../GAMEPLAY_SYSTEMS_ANALYSIS.md)
- [GAMEPLAY_MECHANICS_CATALOG.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.md)
- Repo root [README.md](../../README.md)

Keep `GAME_TECHSTACK_ANALYSIS.md` for historical product context or if reviving multi-room roguelike ideas—not as “what the EXE does today.”

## Visual / reference assets under `docs/`

Folders such as `ui-design-reference/`, `reference-comparison/captures/`, and many `visual-capture/**/*.png` files are **binary** and often gitignored per folder READMEs. This wiki indexes **markdown** workflows; it does not enumerate every PNG.

## Version bumps

Gameplay schema changes should follow **`GAME_RULES_VERSION`** and the maintenance notes in [GAMEPLAY_MECHANICS_CATALOG.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.md) / [contracts.ts](../../src/shared/contracts.ts).
