# Offline card motif assets (optional)

Gameplay card **faces** use deterministic Canvas2D overlays plus static raster art (`front.svg`). This repo does **not** run machine-learning models inside the shipped game. If you want richer plates, sigils, or backgrounds, generate them **on your machine** and commit the exported PNG/SVG.

## ComfyUI / Stable Diffusion

1. Install [ComfyUI](https://github.com/comfyanonymous/ComfyUI) locally and pick a small checkpoint (for example SDXL Lightning or a distilled model) to keep iteration fast.
2. Author a prompt that matches the game palette (deep navy panel, gold rim, subtle paper grain). Use a **square or portrait** aspect ratio close to the card overlay canvas (see `STATIC_CARD_TEXTURE_*` in `src/renderer/components/tileTextures.ts`).
3. Export PNG, trim to a transparent center “safe zone” if needed, and place under `src/renderer/assets/textures/cards/` (or a new subfolder). Wire the URL through `tileTextures` `textureImageUrls` only if you replace the base plate art.
4. Bump `GAMEPLAY_CARD_VISUALS.textureVersion` in `src/renderer/components/gameplayVisualConfig.ts` whenever committed raster art changes, so cached `CanvasTexture` entries invalidate.

## Ollama (SVG or prompt ideation)

1. Run [Ollama](https://ollama.com/) with a code-capable or general model locally.
2. Use it to **draft** SVG paths or short design notes; paste results into a design tool or into `src/renderer/cardFace/programmaticCardFace.ts` only after human review so determinism and tests stay stable.
3. Do not add an HTTP dependency from the Electron renderer to Ollama in production builds.

## Regenerating programmatic SVG goldens

After changing `buildProgrammaticCardFaceSvg`, update fingerprint expectations in `src/renderer/cardFace/programmaticCardFace.test.ts`:

```bash
yarn tsx scripts/print-programmatic-svg-fingerprints.ts
```

Copy the printed lines into the `expected` map in that test file.

## Author-time `front.svg` optimization (SVGO)

Dry-run byte reduction (does not write):

```bash
yarn optimize:card-front
```

Apply in-place only after visually verifying the card in-game:

```bash
yarn optimize:card-front -- --write
```

## Generated plate manifest (offline pipeline stub)

```bash
yarn generate:card-plates
```

Optionally set `COMFY_OUTPUT_DIR` when extending the script to harvest local Comfy exports. Output: `src/renderer/assets/generated/card-plates/manifest.json`.
