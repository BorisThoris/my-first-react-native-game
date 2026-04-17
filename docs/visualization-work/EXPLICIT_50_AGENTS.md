# Explicit 50-agent visualization pass (VIZ-001–006)

Use this to run **50 parallel Cursor agents** (or humans) against the **procedural visualization backlog** without inventing duplicate sources of truth. Each agent gets **one narrow slice**. Merge results into authoritative code/docs ([`ARCHITECTURE.md`](./ARCHITECTURE.md), [`SOURCE_MAP.md`](../internal-wiki/SOURCE_MAP.md)), not parallel one-off narratives.

**Mapping:** This is **not** 1:1 with a single ID file like `REF-NNN.md`. Tasks roll up to **[VIZ-001](./VIZ-001.md) … [VIZ-006](./VIZ-006.md)** and [INDEX.md](./INDEX.md).

## Execution model

| Layer | Meaning |
|-------|---------|
| **50 logical agents** | Agent **k** ↔ row **k** in the table below (**01–50**). |
| **5 controller agents** | **C01–C05** — each owns **10 consecutive rows** (5×10 = **50**). |

## Controller batches (optional — paste batch prompt)

```
You are Controller C0K for Memory Dungeon (covers visualization agents AAA–BBB from docs/visualization-work/EXPLICIT_50_AGENTS.md).
For each agent row in that range, execute the Prompt column: minimal diff, run `yarn verify` or scoped test when touching code.
Summarize: done / deferred / blocked. Do not edit `.cursor/plans/`.
```

| Controller | Agent rows | Topic band |
|------------|------------|------------|
| C01 | 01 – 10 | VIZ-001 docs parity + version bumps |
| C02 | 11 – 20 | VIZ-002 gallery UX + dev ergonomics |
| C03 | 21 – 30 | VIZ-003 fixture taxonomy |
| C04 | 31 – 40 | VIZ-004 tier consistency tests |
| C05 | 41 – 50 | VIZ-005 bake contract + VIZ-006 pipeline handoff |

## Per-agent prompts (01–50)

| Agent | VIZ | Prompt |
|-------|-----|--------|
| 01 | VIZ-001 | When `ILLUSTRATION_GEN_SCHEMA_VERSION` bumps next: ensure [ARCHITECTURE.md](./ARCHITECTURE.md) “When to bump what” table still matches [`illustrationSchemaVersion.ts`](../../src/renderer/cardFace/proceduralIllustration/illustrationSchemaVersion.ts). |
| 02 | VIZ-001 | When `GAMEPLAY_CARD_VISUALS.textureVersion` bumps next: cross-check [`gameplayVisualConfig.ts`](../../src/renderer/components/gameplayVisualConfig.ts) vs ARCHITECTURE cache-key section. |
| 03 | VIZ-001 | Document in one PR comment template: “If illustration hashes changed, bump schema or texture version + run `yarn regenerate:illustration-regression`.” |
| 04 | VIZ-001 | Audit [`mechanics-catalog-appendix-builder`](../../src/shared/mechanics-catalog-appendix-builder.ts) unrelated drift—ensure visualization docs never duplicate mechanics appendix rules. |
| 05 | VIZ-001 | Link [`multiple-agents.md`](../internal-wiki/multiple-agents.md) from [README](./README.md) “Related” if missing. |
| 06 | VIZ-001 | Verify [SOURCE_MAP.md](../internal-wiki/SOURCE_MAP.md) dev table lists gallery + pair-key module (fix if stale). |
| 07 | VIZ-001 | Grep for outdated `textureVersion` numbers in docs under `docs/visualization-work/` only; fix references. |
| 08 | VIZ-001 | Add note to [VIZ-001](./VIZ-001.md) Acceptance: “APP_ANALYSIS procedural bullet reviewed when bumping versions.” |
| 09 | VIZ-001 | Ensure [`APP_ANALYSIS.md`](../internal-wiki/APP_ANALYSIS.md) procedural illustration row still points at live paths. |
| 10 | VIZ-001 | Spot-check [`illustrationCacheKey.test.ts`](../../src/renderer/cardFace/proceduralIllustration/illustrationCacheKey.test.ts) procedure mode vs ARCHITECTURE prose. |
| 11 | VIZ-002 | Run dev server; open `?devSandbox=1&fx=proceduralGallery`; confirm grid renders 24 cells and tier toggles work. |
| 12 | VIZ-002 | Verify keyboard **1 / 2 / 3** switches tiers in [`ProceduralIllustrationGallerySandbox.tsx`](../../src/renderer/dev/ProceduralIllustrationGallerySandbox.tsx); extend if incomplete. |
| 13 | VIZ-002 | Add `prefers-reduced-motion` handling in gallery (disable nothing needed for static canvas—document “N/A”). |
| 14 | VIZ-002 | Confirm `data-e2e-procedural-gallery` on gallery shell; add Playwright smoke spec if desired. |
| 15 | VIZ-002 | Export screenshot workflow in README: capture viewport for art review. |
| 16 | VIZ-002 | Performance: memoize palette lookup if gallery causes jank on tier switch (profile first). |
| 17 | VIZ-002 | Optional: filter text input to subset pairKeys for faster review. |
| 18 | VIZ-002 | Optional: show two tiers side-by-side for same pairKey (split cell). |
| 19 | VIZ-002 | Wire [`INDEX.md`](./INDEX.md) row VIZ-002 to mention gallery URL once stable. |
| 20 | VIZ-002 | Vitest: smoke render `ProceduralIllustrationGallerySandbox` with `happy-dom` if feasible without WebGL—else defer with reason. |
| 21 | VIZ-003 | Classify each `pairKey` in fixture into tarot / greek / numeric / long-token buckets in a short `docs/visualization-work/TAXONOMY.md` (new). |
| 22 | VIZ-003 | Identify one missing archetype (e.g. unicode edge) for future fixture addition—document only. |
| 23 | VIZ-003 | Cross-read [`hashPairKey.ts`](../../src/shared/hashPairKey.ts); note collision risks in TAXONOMY or VIZ-003. |
| 24 | VIZ-003 | Ensure [`illustrationRegressionPairKeys.test.ts`](../../src/renderer/dev/illustrationRegressionPairKeys.test.ts) stays mandatory when editing fixture JSON. |
| 25 | VIZ-003 | Document process: editing `pairKeys` requires regenerate illustration regression + pair-keys TS sync. |
| 26 | VIZ-003 | Compare fixture length to [`VIZ-003`](./VIZ-003.md) Acceptance—close gaps in prose only. |
| 27 | VIZ-003 | Audit `pairKeys` sort order in JSON vs alphabetical—document intentional order if any. |
| 28 | VIZ-003 | Link VIZ-003 to [`e2e/tile-card-face-illustration-regression.spec.ts`](../../e2e/tile-card-face-illustration-regression.spec.ts). |
| 29 | VIZ-003 | List games’ tile `pairKey` sources (`game.ts` / spawn) for future alignment—read-only note in VIZ-003 or TAXONOMY. |
| 30 | VIZ-003 | Add INDEX priority justification if taxonomy work should rise from P2 to P1—decision note only. |
| 31 | VIZ-004 | Read [`bake-procedural-illustration-set.ts`](../../scripts/bake-procedural-illustration-set.ts) `--tiers=` mapping; table CLI alias → `OverlayDrawTier`. |
| 32 | VIZ-004 | Add Vitest unit test: `overlayDrawTierFromGraphicsQuality` round-trip for low/med/high. |
| 33 | VIZ-004 | Compare bake default tier (`full`) vs gallery default tier—document match/mismatch in ARCHITECTURE. |
| 34 | VIZ-004 | Script idea: emit three PNGs per pairKey for CI diff—document only unless trivial. |
| 35 | VIZ-004 | Trace `drawProceduralIllustrationInCanvasOverlay` tier branch count in [`cardIllustrationDraw.ts`](../../src/renderer/cardFace/cardIllustrationDraw.ts)—summary for VIZ-004. |
| 36 | VIZ-004 | Ensure `minimal` tier actually skips work (no-op check) via code read—note in VIZ-004. |
| 37 | VIZ-004 | Add task to VIZ-004: optional Playwright one-shot comparing tier hashes for one pairKey. |
| 38 | VIZ-004 | Verify [`tileTextures.ts`](../../src/renderer/components/tileTextures.ts) uses same tier mapping as E2E `qualityByTier`. |
| 39 | VIZ-004 | Document edge case: `GraphicsQualityPreset` vs DEV gallery tier independence. |
| 40 | VIZ-004 | Close VIZ-004 Acceptance with checklist in task file after automation exists—meta row. |
| 41 | VIZ-005 | Document `manifest.json` top-level keys by reading bake script write path—append to README or ARCHITECTURE. |
| 42 | VIZ-005 | Decide CI: document “no bake in CI” vs nightly—add to [`TOOLING.md`](../internal-wiki/TOOLING.md) one line. |
| 43 | VIZ-005 | Extract inline comment from bake script on `page.goto` / HMR into ARCHITECTURE “Bake stability”. |
| 44 | VIZ-005 | List failure modes: port in use, Vite not up—README troubleshooting subsection. |
| 45 | VIZ-005 | Align `yarn bake:procedural-set` help text (`--out=`) with visualization README. |
| 46 | VIZ-006 | Inventory [`scripts/card-pipeline/`](../../scripts/card-pipeline/) entrypoints; table “input → output”. |
| 47 | VIZ-006 | Define happy path: `manifest.json` → trim script → optional `image_gen.mjs`—doc only. |
| 48 | VIZ-006 | Explicit non-goal: no Stable Diffusion in renderer—add to VIZ-006 Acceptance. |
| 49 | VIZ-006 | Link [`EXPLICIT_50_AGENTS.md`](./EXPLICIT_50_AGENTS.md) from [TASKS.md](./TASKS.md) under Related. |
| 50 | VIZ-006 | Rollup: update [INDEX.md](./INDEX.md) if any VIZ priority shifts after agents 41–49 findings. |

## Single-agent template (copy)

```
You are Agent NN (01–50) for Memory Dungeon.
Open docs/visualization-work/EXPLICIT_50_AGENTS.md, find row NN, execute the Prompt with minimal scope.
Run `yarn verify` from repo root if you changed TS/TSX. Report: files touched, tests run.
```

## Relation to the wiki

[multiple-agents.md](../internal-wiki/multiple-agents.md) describes parallel **documentation** passes; this file is the **VIZ-backed** counterpart for procedural visualization workstreams.
