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

## Steam Notes

- `steam_appid.txt` is set to `480` for local testing.
- Steam integration is initialized in the Electron main process.
- If Steam is unavailable, the app falls back to a no-op adapter and still runs normally.
- Steam redistributables are copied from `steamworks.js/dist/win64` into packaged Windows builds.

## Product Scope

This v1 desktop build is intentionally narrow:

- Arcade mode only
- Mouse + keyboard only
- Local saves, settings, and achievements
- Windows x64 only

## Archived Legacy Code

- `legacy/expo-roguelike/` contains the older Expo, web, and roguelike prototype tree.
- The archived code is not part of the supported build, lint, or test workflow for the desktop product.
- New work should target `src/` unless the archived code is being consulted for reference.
