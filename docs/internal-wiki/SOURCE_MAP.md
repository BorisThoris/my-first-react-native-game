# Source map (`src/`)

Quick orientation for navigation and code review. **Rules of thumb:** `shared/` stays pure where possible; `renderer/` owns input, animation, and shell UI; `main/` owns OS integration.

## `src/shared/` (rules + data)

| Module | Role |
|--------|------|
| `game.ts` | Core `RunState` transitions: phases, flips, resolve, scoring, powers, mutators branches, level advance, game over |
| `contracts.ts` | Types, settings, mutator IDs, `GAME_RULES_VERSION`, appendices’ source of truth for catalog |
| `mechanics-encyclopedia.ts` | Player-facing codex copy SoT (relics, mutators, modes, topic articles) |
| `game-catalog.ts` | Re-exports encyclopedia + achievements + helpers for UI |
| `mutators.ts` | Mutator **catalog** imported from mechanics-encyclopedia; helpers like `hasMutator`, daily table subset |
| `floor-mutator-schedule.ts` | Endless floor mutator rotation + floor tags |
| `relics.ts` | Relic definitions / hooks consumed by `game.ts` |
| `builtin-puzzles.ts` | Hand-authored puzzle boards |
| `tile-symbol-catalog.ts` | Symbol bands / generation curve |
| `save-data.ts` | Save schema merge, migration hooks |
| `achievements.ts` | Achievement IDs and evaluation helpers |
| `telemetry.ts` | Local telemetry payloads / consent gates |
| `rng.ts` | Seeded RNG utilities |
| `utc-countdown.ts` | Daily window / UTC helpers |
| `run-export.ts` | Import/export serialization for runs |
| `puzzle-import.ts` | Validates user **puzzle JSON** (`title` + `tiles`) for `createPuzzleRun` |
| `graphicsQuality.ts` | Quality tier presets for renderer |
| `cameraViewportMode.ts` | Breakpoint-derived camera / shell mode |
| `pairProximityHint.ts` | Pair-distance hint math (shared with renderer) |
| `focusDimmedTileIds.ts` | Focus-assist dimming set |
| `*.test.ts` | Vitest coverage beside modules above |

## `src/main/` (Electron main)

| File | Role |
|------|------|
| `index.ts` | App lifecycle, window, menus |
| `ipc.ts` | IPC handlers: bridge to preload/renderer contracts |
| `persistence.ts` | electron-store: saves, settings paths |
| `steam.ts` | steamworks.js adapter; no-op when unavailable |

## `src/preload/`

| File | Role |
|------|------|
| `index.ts` | `contextBridge` surface for renderer (typed in renderer consumption) |

## `src/renderer/` (React + board)

| Directory | Role |
|-----------|------|
| `components/` | Screens: `GameScreen`, `TileBoard`, menus, Codex, settings, HUD, modals, WebGL helpers |
| `store/` | `useAppStore.ts` — orchestration, timers, calls into `game.ts` |
| `audio/` | `gameSfx.ts` — Web Audio procedural SFX (flip, match, mismatch) |
| `hooks/` | Shell zoom, HUD a11y announcements, etc. |
| `a11y/` | Focus order / focusable queries |
| `styles/` | Theme tokens, global CSS, app shell styles |
| `ui/` | Shared UI primitives (`MetaFrame`, buttons, titles) |
| `assets/` | Static assets; see [ASSET_SOURCES.md](../../src/renderer/assets/ASSET_SOURCES.md) |
| `cardFace/` | Programmatic card face helpers |
| `dev/` | Dev-only fixtures, sandboxes, HUD test harnesses |
| `sandbox/` | Dev route sandboxes (e.g. logo intro) |
| `platformTilt/` | Device tilt integration for presentation |

## `packages/notifications/`

Standalone package: Zustand-backed toasts/confirms; built to `dist/` for import from renderer.

## Tests co-located

- **Unit / component:** `*.test.ts`, `*.test.tsx` next to sources; `yarn test`
- **E2E:** `e2e/*.spec.ts`; see [E2E_AND_QA.md](./E2E_AND_QA.md)
