# Renderer asset sources

Per [docs/new_design/ASSET_AND_ART_PIPELINE.md](../../docs/new_design/ASSET_AND_ART_PIPELINE.md), major art files note origin and license.

## Which module to import? (`AST-003`)

Two files both export a constant named `UI_ART` — they are **not** interchangeable.

| Module | Export | Use for |
|--------|--------|---------|
| [`ui/index.ts`](ui/index.ts) | `UI_ART` | Shell / meta: menu & gameplay **PNG** backgrounds, crest, divider, emblem, seal, stage ring. Default import for full-screen scenes and shared chrome. |
| [`ui/slots.ts`](ui/slots.ts) | `UI_ART` | Slot-style chrome plus **card** texture URLs (`cardBackUrl`, `cardFaceUrl`) and a small set of flourishes. Prefer aliasing on import (e.g. `UI_ART as SLOT_UI_ART`) in new code so it is not confused with the shell barrel. |
| [`ui/modeArt.ts`](ui/modeArt.ts) | `MODE_CARD_ART` | Choose Your Path mode posters; re-exported from `index.ts`. |

**Authoritative menu / gameplay scenes:** `UI_ART.menuScene`, `UI_ART.choosePathScene`, and `UI_ART.gameplayScene` in `index.ts` point at **`ui/backgrounds/*.png`**. Legacy SVGs on disk (below) are not wired into the build.

## Asset inventory

| Path | Role | Source / tool | Notes |
|------|------|---------------|-------|
| `ui/backgrounds/bg-main-menu-cathedral-v1.png` | Main menu hero layer | AI-generated (Cursor image tool, project batch) | Fantasy vault; central negative space for title. **`GameOverScreen`** composites the same raster via `UI_ART.menuScene` behind the scrim (**META-002** shell parity). |
| `ui/backgrounds/bg-gameplay-dungeon-ring-v1.png` | Gameplay stage under board | AI-generated | Memory ring / arena; board-safe center |
| `ui/backgrounds/bg-mode-classic-v1.png` | Mode card poster | AI-generated | Classic / blue-silver gate |
| `ui/backgrounds/bg-mode-daily-v1.png` | Mode card poster | AI-generated | Daily / purple crystal featured |
| `ui/backgrounds/bg-mode-endless-v1.png` | Mode card poster (locked) | AI-generated | Endless / ember gate, darker |
| `ui/backgrounds/bg-mode-placeholder-v1.png` | Mode card poster (fallback) | Copy of `bg-mode-endless-v1.png` until per-mode art ships | Wired in `modeArt.ts` for catalog keys (gauntlet, wild, imports, etc.). Replace the file or add keyed PNGs and point `MODE_CARD_ART` at them. |
| `ui/backgrounds/bg-choose-path-stage-ambient-v2.png` | Choose Your Path hero layer (**shipped**) | AI / external (`image_gen.mjs`); path wired from [`ui/index.ts`](ui/index.ts) | `ChooseYourPathScreen` soft-light layer over gameplay base. |
| `ui/backgrounds/bg-choose-path-stage-v1.png` | Choose Your Path procedural **preview** (optional) | `node scripts/generate-choose-path-background.mjs` | Mid-res procedural plate (~800×500); **not** imported by default — swap into `UI_ART.choosePathScene` or replace `ambient-v2` when iterating. |
| `ui/brand-crest.svg` | Menu crest | Authored SVG | Crystal sigil in gold frame; reused on **GameOver** hero lockup (**META-002**). |
| `ui/menu-emblem.svg` | Secondary emblem | Authored SVG | Ring + tome motif |
| `ui/divider-ornament.svg` | Hero divider | Authored SVG | Gold gradient + center gem + side flourishes |
| `ui/icons/icon-inventory-bag-v1.svg` | Gameplay left rail / flyout inventory glyph | Authored SVG | `currentColor` strokes; barrel in `ui/icons/index.ts` |
| `ui/icons/icon-codex-book-v1.svg` | Gameplay left rail / flyout codex glyph | Authored SVG | Same |
| `ui/icons/icon-main-menu-v1.svg` | Gameplay left rail main menu (abandon) glyph | Authored SVG | Same |
| `ui/icons/icon-menu-hamburger-v1.svg` | Utility flyout toggle | Authored SVG | Same |
| `ui/icons/icon-fit-board-v1.svg` | Mobile fit-board control | Authored SVG | Same |
| `ui/icons/icon-pause-v1.svg` / `icon-play-v1.svg` | Pause / resume rail | Authored SVG | Same |
| `ui/icons/icon-settings-v1.svg` | In-run settings (toolbar) | Authored SVG | Same |
| `ui/icons/icon-shuffle-v1.svg` | Board power: shuffle | Authored SVG | Same |
| `ui/icons/icon-pin-v1.svg` | Board power: pin mode | Authored SVG | Same |
| `ui/icons/icon-destroy-v1.svg` | Board power: destroy pair | Authored SVG | Same |
| `ui/icons/icon-peek-v1.svg` | Board power: peek | Authored SVG | Same |
| `ui/icons/icon-stray-v1.svg` | Board power: stray remove | Authored SVG | Same |
| `ui/icons/icon-undo-v1.svg` | Resolving-phase undo | Authored SVG | Same |
| `ui/icons/icon-score-parasite-crystal.svg` | HUD score parasite mutator crystal glyph | Authored SVG | **HUD-007:** arcane-violet / gold-rim crystal aligned to `VISUAL_SYSTEM_SPEC` + `theme.ts` `--theme-hud-parasite-*`; used in `GameplayHudBar.tsx` (`?url` import). |
| `ui/frames/hud-segment-ornament.svg` | HUD score segment flourish | Authored SVG | Hex motif; used in `GameScreen.module.css` |
| `textures/cards/back.svg` | Tile **hidden** side (default runtime) | SVG Storm–style trace; wired from `tileTextures.ts`, `TileBoard.module.css`, `TileBoardScene.tsx`, `slots.ts`. WebGL merged mesh when under byte/vertex caps ([`cardSvgPlaneGeometry.ts`](../components/cardSvgPlaneGeometry.ts)). | Large path count; primary card back source. |
| `textures/cards/front.svg` | Face-up panel (default runtime) | Traced front; pairs with `back.svg` | Same pipeline as `back.svg`. |
| `textures/cards/authored-card-back.svg` | Alternate back art (optional) | Hand-authored vector (**PLAY-007**, [`PLAYING_ENDPRODUCT/05-cards.md`](../../../docs/new_design/TASKS/PLAYING_ENDPRODUCT/05-cards.md)); not wired by default | On disk for reference or future toggle. |
| `textures/cards/authored-card-front.svg` | Alternate face panel (optional) | Hand-authored stone frame + center well | Pairs with `authored-card-back.svg`. |
| _(not in repo)_ `tmp/card-backs-normalized/` | Local SDXL batch card backs (36× portrait PNGs) | `yarn card-backs:local` → [`batch_local_card_backs.py`](../../../scripts/card-pipeline/batch_local_card_backs.py); manifest [`generated-backs-last-run.json`](../../../scripts/card-pipeline/generated-backs-last-run.json) | Gitignored temp output (~1403×2048 each). Pick a keeper and replace raster imports or add a theme pool when product wires multi-back selection in `tileTextures.ts`. |
| `textures/cards/edge.png` | Card edge map | `scripts/card-pipeline/generate-card-textures.ps1` | Pairs with `tileTextures.ts` |
| `textures/cards/panel-roughness.png` | Panel roughness | `scripts/card-pipeline/generate-card-textures.ps1` | |
| `textures/cards/edge-roughness.png` | Edge roughness | `scripts/card-pipeline/generate-card-textures.ps1` | |
| `textures/cards/reference-back.png` | Card-back **pipeline source** (normalize / PS1 raster steps) | Authored / AI → normalize | Default input for [`generate-card-textures.ps1`](../../../scripts/card-pipeline/generate-card-textures.ps1); **not** the runtime `back.svg` URL in `tileTextures.ts`. |
| `textures/cards/front-face.png` | Card-face **pipeline output** / plate reference | Same PS1 pipeline from `reference-back.png` | Runtime faces still use `front.svg` + illustration mats unless you replace imports. |
| `cards/illustrations/face-panel-01.png` … `face-panel-80.png` | Tarot illustration **mat** rasters (center panel), tiered common/uncommon/rare | `yarn face-panels:local` → [`batch_local_face_panels.py`](../../../scripts/card-pipeline/batch_local_face_panels.py); URL barrel [`facePanelRasterUrls.ts`](../cardFace/facePanelRasterUrls.ts) | Weighted fallback in [`weightedFacePanelPool.ts`](../cardFace/weightedFacePanelPool.ts). Legacy `deck-01..06.svg` stay referenced for `yarn build:card-illustration-manifest`. |
| _(not in repo)_ `tmp/face-panels/` | Local SDXL batch staging | Same | Gitignored until copied into `cards/illustrations/`. |

### Card faces: atomic SVG vs overlay FX

`back.svg` / `front.svg` are **SVG Storm–style traces**: huge flat `<g>`/`<path` soup with no semantic `id`s. The game treats each file as **one drawable** everywhere it matters for gameplay parity:

- **WebGL:** [`tileTextures.ts`](../components/tileTextures.ts) loads each side as a single URL; [`cardSvgPlaneGeometry.ts`](../components/cardSvgPlaneGeometry.ts) merges paths into one plane mesh per side (vertex cap in that file).
- **DOM:** [`TileBoard.module.css`](../components/TileBoard.module.css) uses each file as a full-bleed `background-image` on `.cardBack` / `.cardFaceFront`.

**Independent motion or glow** on motifs is **not** done by parsing those SVGs into React subtrees. Optional **authored** overlays (crystal/sigil marks aligned in `back.svg` user space) live under [`components/cards/cardArt/`](../components/cards/cardArt/); the DOM hidden-face path can stack [`CardBackMotifOverlay`](../components/cards/cardArt/CardBackMotifOverlay.tsx) above the CSS `back.svg` layer. The WebGL board does **not** duplicate that overlay yet (same atomic texture + existing tint/overlay textures).

## Typography (self-hosted)

| Package | License | Usage |
|---------|---------|--------|
| `@fontsource/cinzel` | OFL-1.1 | Display / titles via `global.css` |
| `@fontsource/source-sans-3` | OFL-1.1 | UI + body via `global.css` |

Latin subsets only to limit bundle size.

## Gameplay icon set (`AST-006`)

**Left rail / board powers:** authored SVGs under [src/renderer/assets/ui/icons/](ui/icons/) with barrel [index.ts](ui/icons/index.ts); consumed from `GameLeftToolbar` as `<img>` (`.toolbarGlyphImg`).

**Main menu / settings:** still use `<img>` and assets from the shell `UI_ART` barrel or screen-local paths—not this icons folder. If menu rows gain circular icon buttons that must match the gameplay rail stroke weight, extend **`ui/icons/`** (and this table) or add a small `menuIcons` barrel rather than forking a second SVG style.

**Legacy stroke components:** [src/renderer/ui/gameplayIcons.tsx](../ui/gameplayIcons.tsx) remains for any non-toolbar consumers and re-export from [src/renderer/ui/index.ts](../ui/index.ts).

## Regenerating rasters with OpenAI

With `OPENAI_API_KEY` set:

```bash
# Print exact card PNG dimensions for a given long edge (default 2048)
yarn card-texture:ideal
yarn card-texture:ideal 3072

# Menu / wide hero (default if you omit resolution)
yarn imagegen -- --prompt "YOUR PROMPT" --out src/renderer/assets/ui/backgrounds/name.png

# Optional raster back (if not using `back.svg`): API 1024×1536 → trim → normalize to exact 0.74:1.08
# yarn imagegen … --out tmp/card-back-raw.png
# yarn png:trim-bbox tmp/card-back-raw.png tmp/card-back-trimmed.png --pad 2
# powershell … normalize-card-texture.ps1 … -OutputPath src/renderer/assets/textures/cards/some-back.png

# Vector sides: edit `back.svg` / `front.svg` (also `?url` imports in `tileTextures.ts` / `slots.ts`). WebGL builds merged meshes in `cardSvgPlaneGeometry.ts`.
```

In-game mapping is **contain** (not cover): full illustration stays visible; stretch is avoided so filigree/gems stay round.

Square **1024×1024** (icons / non-card): `--resolution card` or `square`. Explicit size: `--size 1536x1024` (overrides `--resolution`).

Presets: `yarn imagegen -- --list-resolutions`. Optional `--quality low|medium|high|auto` for `gpt-image-*`.

Add or update a row in this table when you replace a file.
