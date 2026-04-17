# Procedural visualization work

This folder holds **roadmap and architecture notes** for the **Canvas2D procedural card illustration** pipeline: deterministic seeds, roll tables, drawing, texture integration, offline bake, and Playwright regression hashes.

It does **not** replace authoritative code or the internal wiki; it links to them and tracks **what to build next**. Per-task specs: [INDEX.md](./INDEX.md); rollup list: [TASKS.md](./TASKS.md).

## Authoritative code paths

| Concern | Location |
|--------|----------|
| Seed, RNG, roll tables, painter | [`src/renderer/cardFace/proceduralIllustration/`](../../src/renderer/cardFace/proceduralIllustration/) |
| Schema bump (invalidates deterministic output) | [`illustrationSchemaVersion.ts`](../../src/renderer/cardFace/proceduralIllustration/illustrationSchemaVersion.ts) (`ILLUSTRATION_GEN_SCHEMA_VERSION`) |
| Cache keys and mode stamps | [`illustrationCacheKey.ts`](../../src/renderer/cardFace/proceduralIllustration/illustrationCacheKey.ts) |
| Overlay tier model | [`overlayDrawTier.ts`](../../src/renderer/cardFace/overlayDrawTier.ts) |
| Integration with tile textures / caches | [`tileTextures.ts`](../../src/renderer/components/tileTextures.ts), [`gameplayVisualConfig.ts`](../../src/renderer/components/gameplayVisualConfig.ts) (`GAMEPLAY_CARD_VISUALS.textureVersion`) |
| Stable pair-key hashing (shared) | [`hashPairKey.ts`](../../src/shared/hashPairKey.ts) |

## Bake output and git

**`yarn bake:procedural-set`** writes PNGs and `manifest.json` under **`output/baked-procedural-illustrations/`**. The repo root **`output/`** directory is **gitignored**, so baked images **do not appear** in commits or PRs. That is intentional: bakes are for local inspection, tooling, or optional downstream pipelines—not checked-in source art.

## Regression and fixtures

- Fixture hashes: [`e2e/fixtures/tile-card-face-illustration-regression.json`](../../e2e/fixtures/tile-card-face-illustration-regression.json)
- Update hashes after intentional visual changes: **`yarn regenerate:illustration-regression`** (`UPDATE_ILLUSTRATION_FIXTURES=1` via script in [`package.json`](../../package.json))
- Bake script: [`scripts/bake-procedural-illustration-set.ts`](../../scripts/bake-procedural-illustration-set.ts)

## Related wiki entries

- [`APP_ANALYSIS.md`](../internal-wiki/APP_ANALYSIS.md) — procedural illustration bullet and texture version notes
- [`SOURCE_MAP.md`](../internal-wiki/SOURCE_MAP.md) — `cardFace/` orientation

## How to verify (developer)

| Goal | Command |
|------|--------|
| Lint, typecheck, unit tests | `yarn ci` |
| Illustration canvas hash regression | `yarn test:e2e:illustration-regression` |
| Local PNG bake (needs Vite or script starts it) | `yarn bake:procedural-set` |

## Optional: 30-slot “raster deck” compositor (runtime)

The game can build a card’s illustration from **30 cached panel rasters** (procedurally generated with fixed pair keys `__raster-deck-00` … `__raster-deck-29`) and **blend two layers** per real `pairKey` (base + multiply). This is **off by default** so E2E illustration hashes stay stable.

- **Enable in DEV:** set `localStorage.cardRasterDeck = '1'` and reload, or set `FEATURE_CARD_RASTER_DECK` in [`feature-flags.ts`](../../src/shared/feature-flags.ts) to `true` for a build.
- **Code:** [`cardRasterDeck.ts`](../../src/renderer/cardFace/cardRasterDeck.ts) + `drawCardFrontOverlay` in [`tileTextures.ts`](../../src/renderer/components/tileTextures.ts).
- **Scope:** Non–programmatic-motif faces only (symbolic / emoji path); digit-only programmatic faces keep the existing shell.

## Dev illustration gallery (human eyeball)

With `yarn dev:renderer`, open:

`http://127.0.0.1:5173/?devSandbox=1&fx=proceduralGallery`

Shows every regression `pairKey` at the selected overlay tier (`minimal` / `standard` / `full`), same draw path as E2E hashes. Production builds ignore this route.

Further reading: [ARCHITECTURE.md](./ARCHITECTURE.md), [INDEX.md](./INDEX.md), [TASKS.md](./TASKS.md).
