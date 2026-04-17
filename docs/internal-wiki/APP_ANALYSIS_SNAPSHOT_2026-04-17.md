# App analysis snapshot (2026-04-17)

**Purpose:** Point-in-time rollup after **three rounds of 50 parallel code-analysis passes each** (scoped subagents: renderer shell, `src/shared` rules, Electron main/preload, packages, e2e, and doc cross-checks). Round 2 focused on refinements (dev-sandbox matrix, store/IPC split, floor-schedule test gap, HUD catalog class names, e2e `schemaVersion`, `paused` vs `ViewState`, …). **Round 3** went deeper on interaction details (`App` `useShallow`, gauntlet interval start/stop, `flipTile` preconditions, pause **P** shortcut, wheel `passive: false`, Codex/Settings/Inventory UX, dead DOM FLIP exports, `RELIC_ROSTER` vs `RelicId`, decoy key duplication across files, scale notes ~1.4k-line store / ~2.5k-line `TileBoardScene`). Use this as orientation, not a substitute for [SOURCE_MAP.md](./SOURCE_MAP.md), [ARCHITECTURE.md](./ARCHITECTURE.md), or gameplay epics.

**Method:** Each pass owned a narrow slice (single files or a small directory), returned responsibilities, dependencies, and doc/wiki gaps; this page merges non-duplicative facts and points at authoritative sources.

---

## Executive map

| Layer | Truth in code | Primary docs |
|--------|-----------------|--------------|
| Game rules | `src/shared/game.ts`, `contracts.ts` | [GAMEPLAY_MECHANICS_CATALOG.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.md), epics |
| Shell / nav | `App.tsx`, `useAppStore.ts` | [NAVIGATION_MODEL.md](../new_design/NAVIGATION_MODEL.md), [SCREEN_SPEC_GAMEPLAY.md](../new_design/SCREEN_SPEC_GAMEPLAY.md) |
| Board WebGL | `TileBoard.tsx`, `TileBoardScene.tsx`, `TileBoardPostFx.tsx`, `tileBoardViewport.ts` | [FX_REDUCE_MOTION_MATRIX.md](../new_design/FX_REDUCE_MOTION_MATRIX.md), [TILE_BOARD_WEBGL_FX_V2_AUDIT.md](../reference-comparison/TILE_BOARD_WEBGL_FX_V2_AUDIT.md) |
| Matched rim FX tunables | `gameplayVisualConfig.ts`, rim shader/material/geometry | Same + sandbox `?devSandbox=1&fx=matchedRimFire` |
| Electron I/O | `main/`, `preload/`, `desktop-client.ts` | This wiki: ARCHITECTURE, SOURCE_MAP |
| Player copy / Codex | `mechanics-encyclopedia.ts`, `game-catalog.ts` | Encyclopedia + `yarn docs:mechanics-appendix` → auto-appendix |

---

## Consolidated findings (high signal)

1. **Renderer bootstrap:** `main.tsx` applies theme CSS vars and mounts `NotificationHost` → `App`. `App.tsx` maps `ViewState` to screens, portals (intro, in-run settings), and sets `data-view`, `data-reduce-motion`, etc.
2. **Store:** `useAppStore` orchestrates IPC via `desktopClient`, timers (memorize/resolve/gauntlet), `game.ts`, and `gameSfx`; persistence is explicit (`hydrate` / `persistSaveData`), not Zustand `persist`.
3. **Gauntlet:** `isGauntletExpired` is consulted from `pressTile` and from a **subscription** that installs a **~300ms `setInterval`** while an active gauntlet run is in `playing` view—not “the subscription fires every 300ms.”
4. **Gambit:** `pressTile` can advance the **third flip** while `run.status === 'resolving'` (exception to a naive “playing-only” mental model).
5. **Steam:** Main uses steamworks when available; failure yields a **mock** adapter (`isConnected` false). **Unlock** IPC always persists locally before Steam activation.
6. **Main process:** `index.ts` does not register Electron **application menus**—only `autoHideMenuBar`; the main menu UI is renderer/React.
7. **Mechanics appendix:** Regenerate with `yarn docs:mechanics-appendix` after catalog/encyclopedia changes so `GAMEPLAY_MECHANICS_CATALOG.auto-appendix.md` matches `GAME_RULES_VERSION` / counts.
8. **E2E:** Playwright `baseURL` `http://127.0.0.1:5173`; curated gate `yarn test:e2e:renderer-qa`. Seeded saves in `e2e/` use **`SAVE_SCHEMA_VERSION`** from `contracts.ts` so injected `localStorage` matches the live schema stamp. Inventory: see [E2E_AND_QA.md](./E2E_AND_QA.md).
9. **Audio:** `resumeAudioContext()` runs on tile press **and** when resolve applies (immediate or timed)—not only on gesture.
10. **Assets:** `ASSET_SOURCES.md` should stay aligned with `assets/ui/index.ts` (e.g. choose-path background filename if art revs).
11. **`App.tsx`:** Subscribes with **`useShallow`** so the selected object of navigation/run/settings fields only re-renders when a shallow field changes.
12. **Gauntlet expiry:** `syncGauntletExpiryWatch` starts a **300ms** `setInterval` only when `view === 'playing'`, gauntlet mode, deadline set, not `gameOver`; clears when those fail or on `clearAllTimers`.
13. **`flipTile`:** Early-outs for missing board, status not `playing` (except gambit third while `resolving`), flip count cap, non-hidden tile, sticky block on first flip.
14. **`DEFAULT_SETTINGS`:** Matches full **`Settings`** + **`debugFlags`** shape in TypeScript; no missing contract keys in defaults.
15. **Decoy key:** `'__decoy__'` is repeated in several modules (not a single shared export); consider centralizing `DECOY_PAIR_KEY` from `contracts` or `game.ts` to prevent drift.
16. **DOM FLIP shuffle:** `captureTileRects` / `runShuffleFlipFromRects` in `shuffleFlipAnimation.ts` are **unwired** in the app; active path is WebGL stagger + `TileBoard` motion budget.

### Achievements ↔ Steam parity

- **`AchievementId`** (`src/shared/contracts.ts`): **5** string-literal union members (`ACH_FIRST_CLEAR`, `ACH_LEVEL_FIVE`, `ACH_SCORE_THOUSAND`, `ACH_PERFECT_CLEAR`, `ACH_LAST_LIFE`).
- **Steam mapping** (`src/main/steam.ts` `STEAM_ACHIEVEMENT_API_NAME`): **5** keys, `satisfies Record<AchievementId, string>` — full coverage; Partner **API Name** values currently match those literals. Steamworks dashboard achievement count verified **5** (matches code).

---

## Pass index (50 scopes)

**Shared / rules (1–10):** App entry & tests · `useAppStore` · `game.ts` · `contracts.ts` · encyclopedia + appendix builder · `mutators` + floor schedule · relics / achievements / save / telemetry / rng · tile catalog + puzzles + import/export · graphics + viewport + hints · Electron main + preload.

**Renderer / product (11–20):** `GameScreen` · Tile board stack + viewport · matched rim FX + `gameplayVisualConfig` · HUD + toolbar + `tileTextures` · main menu + choose path + mode art · Codex / inventory / collection / settings / overlays · game over + startup intro · notifications package · `desktop-client` · `gameSfx`.

**Hooks / visuals / modes (21–30):** Fit shell zoom, HUD polite announcements, drag scroll, distraction tick · a11y focusables + theme + `MetaFrame` / `ScreenTitle` · programmatic faces + shuffle animation + resolving selection · dev sandboxes + fixtures · breakpoints + platform tilt + logo sandbox · full e2e inventory · `run-mode-catalog` · proximity + tutorial planes · `ASSET_SOURCES` + UI art · `GAMEPLAY_SYSTEMS_ANALYSIS` accuracy notes.

**Wiki / tooling / docs (31–50):** ARCHITECTURE vs code · TOOLING vs `package.json` · COVERAGE scope anchor · legacy caveats · `cardSvgPlaneGeometry` · MetaScreen CSS-only · docs portal · gameplay README epic table · new_design README · notifications build · Vitest config · Playwright config · mechanics appendix script · CONTRIBUTING appendix step · FX reduce-motion matrix intro · WebGL FX audit doc · UI_TASKS · visual-capture README · research log · root README stack.

**Round 3 (third 50-pass wave):** `useShallow` · gauntlet watch lifecycle · `flipTile` guards · Settings defaults parity · `ACHIEVEMENT_ORDER` vs catalog · daily RNG (`deriveDailyRunSeed`, `deriveDailyMutatorIndex`) · encore merge · DECOY literals · bloom off on `low` · `cameraViewportMode` `never` vs `TileBoard` `compact` · **P** pause · wheel/pointer listeners · `pickTileAtClientPoint` · HUD dual row · three toolbars · Codex tabs META-005 · inventory relic list · OverlayModal focus · GameOver export null path · StartupIntro WebGL vs SVG · achievement toast `aria-live` · silent `playResolveSfx` · `recomputeKey` on Settings · mocked HUD/TileBoard in `GameScreen.test` · dead DOM FLIP · `__devApplySandbox` DEV guard · eslint `e2e` block · `RELIC_ROSTER` completion · `FindableKind` · `peerDependencies` react>=18 · `postinstall` electron-builder · ~**157** markdown files under `docs/` · line-count scale (`useAppStore` ~1.4k, `TileBoardScene` ~2.5k).

---

## Maintenance

When navigation, major modules, or versioning change: update [SOURCE_MAP.md](./SOURCE_MAP.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) first, then refresh this snapshot’s date and summary—or add a new dated file and link it from [README.md](./README.md).
