# Tooling and scripts

## `package.json` scripts (abridged by theme)

### Development

| Script | What it does |
|--------|----------------|
| `yarn dev` | Concurrently: Vite renderer, tsup watch for main/preload, Electron against dev server |
| `yarn dev:renderer` | Vite only (`http://127.0.0.1:5173`) |
| `yarn dev:electron:watch` | tsup watch for Electron bundles |
| `yarn dev:electron` | Waits for Vite + built `dist-electron`, runs electronmon |

### Quality gates

| Script | What it does |
|--------|----------------|
| `yarn ci` | Same as **`yarn fullcheck`** (`eslint` + test extension guard + `tsc` + Vitest) — primary automation entrypoint. |
| `yarn verify` | `yarn typecheck` + `yarn test` |
| `yarn fullcheck` | `yarn lint` + `yarn verify` — includes ESLint + test file extension guard |
| `yarn typecheck` | `tsc --noEmit` (full `src/` + root configs) |
| `yarn typecheck:shared` | `tsc -p tsconfig.shared.json --noEmit` — optional narrow check for `src/shared` only (no `composite` split; see TypeScript note below) |
| `yarn lint` | ESLint + `scripts/check-test-file-extensions.mjs` (REF-093: no JSX in `.test.ts`) |
| `yarn test` | Vitest run |

**Refinement backlog (REF-100):** [REF-100](../refinement-tasks/REF-100.md) is **Done** (INDEX acceptance met). Notes live in [refinement-tasks/README.md](../refinement-tasks/README.md) and [COMPLETION.md](../refinement-tasks/COMPLETION.md) (2026-04-17); optional INDEX re-triage is process only.
| `yarn test:watch` | Vitest watch |
| `yarn test:e2e` | Full Playwright suite |
| `yarn test:e2e:a11y` | Scoped axe on main menu, settings, in-run shell (`e2e/a11y-scoped-routes.spec.ts`) |
| `yarn sim:endless` | `tsx scripts/sim-endless.ts` — endless schedule CSV sampler (REF-098) |

### TypeScript: shared vs renderer

The repo uses a **single** root `tsconfig.json` for `tsc --noEmit` so CSS module typings and Vite aliases stay one graph. A **composite** split (`tsc -b` with `src/shared` emitting `.d.ts`) was evaluated; it stalled on the usual CSS-module string typing gap under a partitioned app project, so incremental project references are **deferred**. Use `tsconfig.shared.json` + `yarn typecheck:shared` when you want a faster mental model or IDE focus on `src/shared` only.

### Playwright visual / QA bundles

| Script | What it does |
|--------|----------------|
| `yarn test:e2e:visual` | Device-grid visual inventory capture |
| `yarn test:e2e:visual:device-grid` | Same, explicit name |
| `yarn test:e2e:visual:device-grid:shard1` … `shard4` | Sharded runs |
| `yarn test:e2e:visual:smoke` (+ shards) | Smaller mobile + standard visual set |
| `yarn test:e2e:renderer-qa` | Curated gameplay/renderer QA bundle (see [e2e/README](../../e2e/README.md)) |
| `yarn test:e2e:ui` | Playwright UI mode |

### Captures (writes under `docs/` or configured roots)

| Script | What it does |
|--------|----------------|
| `yarn capture:ui-audit` / `capture:visual-inventory` | `VISUAL_CAPTURE_ROOT=docs/visual-capture` + device-grid spec |
| `yarn capture:ui-design-reference` | Reference stills for design buckets |
| `yarn capture:endproduct-parity` | End-product parity captures (defaults `VISUAL_CAPTURE_ROOT=docs/visual-capture/endproduct-parity`) |
| `yarn capture:matched-flame` | Matched-card flame capture spec |

### Docs generation

| Script | What it does |
|--------|----------------|
| `yarn docs:mechanics-appendix` | Regenerates [GAMEPLAY_MECHANICS_CATALOG.auto-appendix.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.auto-appendix.md) (`tsx scripts/run-mechanics-appendix.ts`) — run after encyclopedia/catalog changes (see [CONTRIBUTING.md](../../CONTRIBUTING.md)) |
| `yarn docs:ui-audit` / `docs:visual-inventory` | Regenerates markdown from captures via `scripts/generate-visual-inventory-md.mjs` |

### WIP / card pipeline

| Script | What it does |
|--------|----------------|
| `yarn wip:extract-endproduct` | Extract WIP assets from end-product refs (`scripts/extract-endproduct-wip-assets.mjs`) |
| `yarn wip:extract-endproduct:react` | Same + React emit |
| `yarn wip:extract-endproduct:png-only` | PNG only |
| `yarn imagegen` | `scripts/card-pipeline/image_gen.mjs` |
| `yarn card-texture:ideal` / `card-texture:ai-brief` | Print ideal texture spec / AI brief |
| `yarn capture:ui-vs-assets` | Compare UI vs asset renders |
| `yarn png:trim-bbox` | Trim PNG bounding boxes |

### Build / package

| Script | What it does |
|--------|----------------|
| `yarn build` | Clean + renderer build + Electron tsup bundle |
| `yarn build:renderer` | Vite production build → `dist/` |
| `yarn build:electron` | tsup → `dist-electron/` |
| `yarn clean` | Removes `dist`, `dist-electron`, `release` |
| `yarn package:dir` | Build + electron-builder `--dir` |
| `yarn package:win` | Build + Windows NSIS installer |
| `yarn postinstall` | `scripts/postinstall.cjs` |

## `scripts/` (maintenance)

| Path | Role |
|------|------|
| `postinstall.cjs` | Runs `electron-builder install-app-deps` (skipped on Cloudflare Pages) so native Electron deps match the platform |
| `run-mechanics-appendix.ts` | Writes mechanics catalog machine snapshot (versions + counts) |
| `generate-visual-inventory-md.mjs` | Builds visual inventory markdown |
| `extract-endproduct-wip-assets.mjs` | WIP extraction |
| `card-pipeline/image_gen.mjs` | Card image generation |
| `card-pipeline/print-card-texture-ideal.mjs` | Texture ideal / AI brief output |
| `card-pipeline/capture-ui-vs-asset-screens.mjs` | UI vs asset screenshot pass |
| `card-pipeline/trim-png-bounding-box.mjs` | PNG trim |
| `card-pipeline/cardTextureConstants.mjs` | Shared constants for pipeline |
| `card-pipeline/*.ps1` | Windows PowerShell helpers for textures |

## Config files (pointers)

- `vite.config.mts`, `tsup.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, `tsconfig.json` — standard locations at repo root.

### Vitest (unit / component tests)

Vitest is configured in `vite.config.mts` via `defineConfig` from `vitest/config`, so one file covers Vite dev/build and test runner settings. Tests use the `happy-dom` environment and `./vitest.setup.ts`, which wires `@testing-library/jest-dom/vitest`, runs Testing Library `cleanup()` after each test, and documents **DOM behavior**: happy-dom’s built-in `matchMedia` (desktop-like defaults — coarse pointer false); tests that need touch-first media behavior should override `window.matchMedia` locally. **`visualViewport`** is not implemented in happy-dom; the setup installs a small polyfill so hooks that subscribe to `visualViewport` + `window` `resize` behave consistently. The test `pool` is set to `threads` so teardown avoids Windows/sandbox `EPERM` issues sometimes seen with Vitest’s default fork pool. Test discovery includes `src/**/*.{test,spec}.{ts,tsx}` and `packages/notifications/src/**/*.{test,spec}.{ts,tsx}`. The same `resolve.dedupe` and `resolve.alias` entries as the renderer (React, `react-dom`, `zustand`, and `@cross-repo-libs/notifications` → package `src`) apply during tests so imports match dev and do not require building `packages/notifications/dist` first.

## `@cross-repo-libs/notifications` (`packages/notifications`)

Vendored package: toast + confirm UI (Zustand store, imperative API, `NotificationHost`). The app depends on it via `file:./packages/notifications` in the root `package.json`.

### Build outputs

| Step | Output |
|------|--------|
| `tsc -p tsconfig.build.json` | Emits `packages/notifications/dist/**/*.js` and `**/*.d.ts` from `src/` (`outDir`: `dist`, `rootDir`: `src`). Entry typings: `dist/index.d.ts`. |
| `node packages/notifications/scripts/copy-css.mjs` | Copies `src/notification-host.css` → `dist/notification-host.css`. |

Published surface (see `packages/notifications/package.json`):

- **Main / types:** `dist/index.js`, `dist/index.d.ts`
- **Exports:** `.` → JS + types; `./styles.css` → `dist/notification-host.css` (also listed in `sideEffects` so bundlers do not tree-shake it away)
- **NPM pack contents:** `files`: [`dist`] only

Package script: `yarn --cwd packages/notifications build` (or `npm run build` inside that folder). `prepublishOnly` runs the same build.

### How the renderer imports it

**Source path (local dev + `tsc` in this repo):** Root `tsconfig.json` maps `@cross-repo-libs/notifications` → `./packages/notifications/src/index.ts`, so TypeScript and tests resolve the TypeScript source without building the package first.

**Vite:** `vite.config.mts` aliases:

- `@cross-repo-libs/notifications` → `packages/notifications/src/index.ts`
- `@cross-repo-libs/notifications/styles.css` → `packages/notifications/src/notification-host.css`

That keeps a single React/Zustand instance and lets you edit notification source without pre-building `dist/`.

**Runtime imports** (example from `src/renderer/main.tsx`): `NotificationHost` from `@cross-repo-libs/notifications` and `@cross-repo-libs/notifications/styles.css`, plus app-level overrides in `src/renderer/styles/notificationsGame.css`.

**If you consumed the package only as a built dependency** (no monorepo aliases), you would use the package exports: `@cross-repo-libs/notifications` and `@cross-repo-libs/notifications/styles.css`, which resolve to `dist/` as above.
