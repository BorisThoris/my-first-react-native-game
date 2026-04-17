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
| `index.ts` | App lifecycle, `BrowserWindow`, IPC registration, persistence + Steam services (no Electron **Menu** API) |
| `ipc.ts` | IPC handlers: bridge to preload/renderer contracts |
| `persistence.ts` | electron-store: saves, settings paths |
| `steam.ts` | steamworks.js adapter; **mock** adapter when init fails (IPC still saves unlocks locally first). `STEAM_ACHIEVEMENT_API_NAME`: **5** entries, 1:1 with `AchievementId` in `contracts.ts` |

## `src/preload/`

| File | Role |
|------|------|
| `index.ts` | `contextBridge` surface for renderer (typed in renderer consumption) |

## `src/renderer/` (React + board)

| File | Role |
|------|------|
| `main.tsx` | Theme CSS vars on `document.documentElement`, global CSS, provider stack (`NotificationHost`, etc.), mount `App` |
| `App.tsx` | Routed shell from `useAppStore`: screens, portals (intro, in-run settings), `data-view` / overlay semantics |

| Directory | Role |
|-----------|------|
| `components/` | Screens: `GameScreen`, `TileBoard`, menus, Codex, settings, HUD, modals, WebGL helpers |
| `store/` | `useAppStore.ts` — orchestration; `desktopClient` save/settings/Steam; memorize/resolve/gauntlet timers; `game.ts`; `gameSfx`; achievements/telemetry on run end |
| `audio/` | `gameSfx.ts` — Web Audio procedural SFX (flip, match, mismatch) |
| `hooks/` | Shell zoom, HUD a11y announcements, etc. |
| `a11y/` | Focus order / focusable queries |
| `styles/` | Theme tokens, global CSS, app shell styles |
| `ui/` | Shared UI primitives (`MetaFrame`, buttons, titles) |
| `assets/` | Static assets; see [ASSET_SOURCES.md](../../src/renderer/assets/ASSET_SOURCES.md) |
| `cardFace/` | Programmatic card face helpers |
| `dev/` | **Dev sandbox** — URL harness, canned runs, HUD fixtures, perf toggles ([section below](#renderer-dev-sandbox)) |
| `sandbox/` | Dev route sandboxes (e.g. logo intro) — **not** the same folder as `dev/` |
| `platformTilt/` | Device tilt integration for presentation |

## Renderer dev sandbox

**Folder:** [`src/renderer/dev/`](../../src/renderer/dev/). **Contrast:** [`src/renderer/sandbox/`](../../src/renderer/sandbox/) holds separate **route** sandboxes (for example logo intro); this section is only the `dev/` harness.

**Gate:** [`devSandboxParams.ts`](../../src/renderer/dev/devSandboxParams.ts) `readDevSandboxConfig()` enables the harness only when `import.meta.env.DEV` **and** the URL contains `devSandbox=1`. Without that gate, other query keys are ignored; production builds never apply sandbox config.

**Wiring:** After hydration, [`App.tsx`](../../src/renderer/App.tsx) reads the config once. If `fx` is set, the full shell is replaced by the matching preview component (today: `matchedRimFire` → [`MatchedCardRimFireSandbox.tsx`](../../src/renderer/dev/MatchedCardRimFireSandbox.tsx)). Otherwise [`useAppStore`](../../src/renderer/store/useAppStore.ts) `__devApplySandbox` navigates to `screen`, builds a run from [`runFixtures.ts`](../../src/renderer/dev/runFixtures.ts) when `screen` is `playing` or `gameOver`, and applies `skipIntro` / `unlockAchievements` as documented in `devSandboxParams.ts`.

### URL query parameters (summary)

| Param | Role |
|--------|------|
| `devSandbox=1` | Required for any other key to take effect |
| `screen` | Target `ViewState` excluding `boot`: `menu`, `settings`, `playing`, `gameOver`, `modeSelect`, `collection`, `inventory`, `codex` (aliases such as `game-over` / `modeselect` are accepted — see `parseScreenParam`) |
| `fixture` | Canned run preset when `screen` is `playing` or `gameOver` (default `arcade` if missing or unknown) |
| `skipIntro=1` | Skip startup intro when landing on `menu` |
| `unlockAchievements` | Comma-separated [`AchievementId`](../../src/shared/contracts.ts) values; seeds `newlyUnlockedAchievements` on `playing` for toast / E2E harness |
| `fx=matchedRimFire` | Isolated WebGL rim-fire preview; ignores normal `screen` navigation |

Authoritative comments and example URLs live at the top of [`devSandboxParams.ts`](../../src/renderer/dev/devSandboxParams.ts).

### Canned fixtures (`fixture=`)

Defined in [`runFixtures.ts`](../../src/renderer/dev/runFixtures.ts) (`SANDBOX_FIXTURE_IDS`). Default when absent or invalid: **`arcade`**.

| ID | Intent |
|----|--------|
| `arcade` | Practice run, post-memorize |
| `memorize` | Practice run still in memorize phase |
| `daily` | Daily run after memorize (live daily mutator table) |
| `dailyParasite` | Daily-style run with score parasite + fixed seed |
| `gauntlet` | Gauntlet run after memorize |
| `paused` | Paused practice run |
| `gameOver` | Game-over summary state |

### Files in `src/renderer/dev/`

| File | Role |
|------|------|
| [`devSandboxParams.ts`](../../src/renderer/dev/devSandboxParams.ts) | Parse URL → `DevSandboxConfig` |
| [`runFixtures.ts`](../../src/renderer/dev/runFixtures.ts) | `buildSandboxRun` / fixture IDs for canned runs |
| [`MatchedCardRimFireSandbox.tsx`](../../src/renderer/dev/MatchedCardRimFireSandbox.tsx) (+ `.module.css`) | Full-app replacement for `fx=matchedRimFire` |
| [`hudFixtures.ts`](../../src/renderer/dev/hudFixtures.ts) | Static `GameplayHudBar` props for four HUD states (no Storybook); `gameplayHudBarFixturePropsById` |
| [`hudFixtures.test.tsx`](../../src/renderer/dev/hudFixtures.test.tsx) | Vitest smoke for fixture renders |
| [`fitScreenSpike.test.tsx`](../../src/renderer/dev/fitScreenSpike.test.tsx) | Keeps `@fit-screen/react` imported for typecheck; not the shipped shell ([`VIEWPORT_FIT_UI.md`](../VIEWPORT_FIT_UI.md)) |
| [`boardWebglPerfSample.ts`](../../src/renderer/dev/boardWebglPerfSample.ts) | DEV: `localStorage.perfBoard = '1'` → logs average ms per consolidated tile-step frame |
| [`boardWebglPerfSample.test.ts`](../../src/renderer/dev/boardWebglPerfSample.test.ts) | Unit tests for perf sampler |
| [`tileStepLegacy.ts`](../../src/renderer/dev/tileStepLegacy.ts) | DEV: `localStorage.tileStepLegacy = '1'` → per-tile `useFrame` path for A/B vs scene loop |
| [`tileStepLegacy.test.ts`](../../src/renderer/dev/tileStepLegacy.test.ts) | Tests for legacy toggle reader |

### Captures and E2E helpers

- **End-product HUD/board crops:** `yarn capture:endproduct-parity` (paths and defaults described in `devSandboxParams.ts`; Playwright specs such as [`e2e/hud-inspect.spec.ts`](../../e2e/hud-inspect.spec.ts) / [`e2e/visual-endproduct-parity.spec.ts`](../../e2e/visual-endproduct-parity.spec.ts); helpers in [`e2e/visualScreenHelpers.ts`](../../e2e/visualScreenHelpers.ts)).
- **Matched flame stills:** `yarn capture:matched-flame` → `test-results/matched-flame-capture/` (or `VISUAL_CAPTURE_ROOT`).

### Related wiki / design docs

- [VIEWPORT_FIT_UI.md](../VIEWPORT_FIT_UI.md) — `@fit-screen/react` spike (`fitScreenSpike.test.tsx`)
- [COMPONENT_CATALOG.md](../new_design/COMPONENT_CATALOG.md) — HUD-016 references `hudFixtures.ts`
- [reference-comparison/CURRENT_VS_ENDPRODUCT.md](../reference-comparison/CURRENT_VS_ENDPRODUCT.md) — Playwright gates tied to dev-sandbox playing fixture

## `packages/notifications/`

Standalone package: Zustand-backed toasts/confirms; built to `dist/` for import from renderer.

## Tests co-located

- **Unit / component:** `*.test.ts`, `*.test.tsx` next to sources; `yarn test`
- **E2E:** `e2e/*.spec.ts`; see [E2E_AND_QA.md](./E2E_AND_QA.md)
