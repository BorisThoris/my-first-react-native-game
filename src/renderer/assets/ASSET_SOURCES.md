# Renderer asset sources

Per [docs/new_design/ASSET_AND_ART_PIPELINE.md](../../docs/new_design/ASSET_AND_ART_PIPELINE.md), major art files note origin and license.

| Path | Role | Source / tool | Notes |
|------|------|---------------|-------|
| `ui/backgrounds/bg-main-menu-cathedral-v1.png` | Main menu hero layer | AI-generated (Cursor image tool, project batch) | Fantasy vault; central negative space for title |
| `ui/backgrounds/bg-gameplay-dungeon-ring-v1.png` | Gameplay stage under board | AI-generated | Memory ring / arena; board-safe center |
| `ui/backgrounds/bg-mode-classic-v1.png` | Mode card poster | AI-generated | Classic / blue-silver gate |
| `ui/backgrounds/bg-mode-daily-v1.png` | Mode card poster | AI-generated | Daily / purple crystal featured |
| `ui/backgrounds/bg-mode-endless-v1.png` | Mode card poster (locked) | AI-generated | Endless / ember gate, darker |
| `ui/brand-crest.svg` | Menu crest | Authored SVG | Crystal sigil in gold frame |
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
| `ui/frames/hud-segment-ornament.svg` | HUD score segment flourish | Authored SVG | Hex motif; used in `GameScreen.module.css` |
| `textures/cards/back.svg` | Tile **hidden** side (DOM + WebGL back plane) | Authored SVG (`back.svg?url` in `tileTextures.ts`, `slots.ts`); WebGL uses merged mesh via [`cardSvgPlaneGeometry.ts`](../components/cardSvgPlaneGeometry.ts) | Raster fallback if mesh exceeds vertex cap. Optional PNG pipeline: [`CARD_TEXTURE_AI_BRIEF.md`](../../docs/new_design/CARD_TEXTURE_AI_BRIEF.md). |
| `textures/cards/front.svg` | Tile **face-up** panel (DOM + WebGL front plane) | Same as back (`front.svg?url`, shared `loadSharedCardSvgPlaneGeometry`) | Vector face; raster fallback if SVG mesh fails. |
| `textures/cards/edge.png` | Card edge map | `scripts/generate-card-textures.ps1` | Pairs with `tileTextures.ts` |
| `textures/cards/panel-roughness.png` | Panel roughness | `scripts/generate-card-textures.ps1` | |
| `textures/cards/edge-roughness.png` | Edge roughness | `scripts/generate-card-textures.ps1` | |

## Typography (self-hosted)

| Package | License | Usage |
|---------|---------|--------|
| `@fontsource/cinzel` | OFL-1.1 | Display / titles via `global.css` |
| `@fontsource/source-sans-3` | OFL-1.1 | UI + body via `global.css` |

Latin subsets only to limit bundle size.

## Gameplay icon set

**Left rail / board powers:** authored SVGs under [src/renderer/assets/ui/icons/](ui/icons/) with barrel [index.ts](ui/icons/index.ts); consumed from `GameLeftToolbar` as `<img>` (`.toolbarGlyphImg`).

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
