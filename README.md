# Memory Dungeon

Windows-first desktop arcade rebuild of Memory Dungeon, packaged with Electron and designed for Steam.

The active application lives under `src/`. The older Expo/roguelike implementation has been archived under `legacy/expo-roguelike/` and is kept as reference only.

## Stack

- Electron for the desktop shell
- Vite + React + TypeScript for the renderer
- Zustand for app/game state
- electron-store for saves and settings
- steamworks.js behind a main-process adapter for Steam achievements

## Development

```bash
yarn install
yarn dev
```

This starts:

- the Vite renderer on `http://127.0.0.1:5173`
- the Electron main/preload build watcher
- an Electron app window connected to the dev server

## Scripts

```bash
yarn dev
yarn typecheck
yarn lint
yarn test
yarn build
yarn package:dir
yarn package:win
```

## Dev: WebGL board profiling

These flags are **dev builds only** (`import.meta.env.DEV`). After changing `localStorage`, **reload the page** so the renderer picks up the new value.

| Flag | Effect |
| --- | --- |
| `localStorage.perfBoard = '1'` | Logs `[perfBoard]` average milliseconds per frame for the consolidated tile-stepping slice in the board scene (see `src/renderer/dev/boardWebglPerfSample.ts`). |
| `localStorage.tileStepLegacy = '1'` | Uses per-tile `useFrame` stepping instead of the scene-level consolidated loop (see `src/renderer/dev/tileStepLegacy.ts`). |

Clear the key or set it to anything other than `'1'` to turn a flag off, then reload.

## Steam Notes

- `steam_appid.txt` is set to `480` for local testing.
- Steam integration is initialized in the Electron main process.
- If Steam is unavailable, the app falls back to a no-op adapter and still runs normally.
- Steam redistributables are copied from `steamworks.js/dist/win64` into packaged Windows builds.

## Product Scope

This v1 desktop build is intentionally narrow on platform, but exposes several **run types** from the main menu (see `src/shared/game-catalog.ts` for codex copy):

- **Classic run** (internal mode: endless): procedural floors, relic offers, escalating pair counts
- **Daily challenge**: shared UTC seed with a rotated daily mutator
- **Gauntlet**: run-wide countdown
- **Puzzle**: fixed handcrafted boards from the built-in set
- **Meditation**: calmer pacing / longer memorize windows
- **Featured runs** from the menu include practice, scholar contract, pin vow, wild/joker, and puzzle shortcuts

Also:

- Mouse + keyboard (responsive layout for different window sizes)
- Local saves, settings, and achievements
- Windows x64 only

Design and mutator details: [docs/MUTATORS.md](docs/MUTATORS.md), [docs/GAMEPLAY_SYSTEMS_ANALYSIS.md](docs/GAMEPLAY_SYSTEMS_ANALYSIS.md).

## Archived Legacy Code

- `legacy/expo-roguelike/` contains the older Expo, web, and roguelike prototype tree.
- The archived code is not part of the supported build, lint, or test workflow for the desktop product.
- New work should target `src/` unless the archived code is being consulted for reference.
