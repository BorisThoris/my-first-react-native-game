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
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` | ESLint |
| `yarn test` | Vitest run |
| `yarn test:watch` | Vitest watch |
| `yarn test:e2e` | Full Playwright suite |

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
| `yarn capture:endproduct-parity` | End-product parity captures |
| `yarn capture:matched-flame` | Matched-card flame capture spec |

### Docs generation

| Script | What it does |
|--------|----------------|
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
| `postinstall.cjs` | Post-install setup |
| `generate-visual-inventory-md.mjs` | Builds visual inventory markdown |
| `extract-endproduct-wip-assets.mjs` | WIP extraction |
| `card-pipeline/image_gen.mjs` | Card image generation |
| `card-pipeline/print-card-texture-ideal.mjs` | Texture ideal / AI brief output |
| `card-pipeline/capture-ui-vs-asset-screens.mjs` | UI vs asset screenshot pass |
| `card-pipeline/trim-png-bounding-box.mjs` | PNG trim |
| `card-pipeline/cardTextureConstants.mjs` | Shared constants for pipeline |
| `card-pipeline/*.ps1` | Windows PowerShell helpers for textures |

## Config files (pointers)

- `vite.config.ts`, `tsup.config.ts`, `playwright.config.ts`, `eslint.config.js`, `tsconfig.json` — standard locations at repo root.
