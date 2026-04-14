# FX-007 — DOM hover tokens → WebGL reference

DOM fallback hover is defined on `.fallbackTile:hover:not(.faceUp):not(.matched)` in [`TileBoard.module.css`](../../src/renderer/components/TileBoard.module.css). WebGL cards approximate the same read in [`TileBoardScene.tsx`](../../src/renderer/components/TileBoardScene.tsx) `TileBezel` via pointer UV tilt, **Z lift/depth**, a **warm tint lerp** on `meshStandardMaterial.color`, **emissive** (`#f2d39d`, theme `goldBright`), and **gold quad strips** on the visible hidden face — only while that DOM selector would apply (`hoverDomParity`: pointer hover + `!faceUp` + tile not `matched`).

**TBF-008 (face-up pickable):** When the tile is **face-up**, still **pickable**, and not `matched` (e.g. gambit third pick), a **second set** of the same four gold strips is drawn on the **front** face at reduced opacity (`getFaceUpHoverRimOpacityMul` × `getHoverGoldQualityScales.rimOpacity`). Tint lerp uses `HOVER_RIM_TINT_LERP * 0.38` and emissive uses ~34% of the hidden-hover intensity so the board does not read “dead” but stays lighter than the full hidden-back treatment.

## Border / rim (screen-space feel)

| Token | DOM (CSS) | WebGL mapping |
|-------|-----------|---------------|
| Border emphasis | `border-color: color-mix(in srgb, var(--theme-gold-bright) 42%, var(--theme-border-strong))` on `.fallbackTile:hover:not(.faceUp):not(.matched)` | Warm tint lerp toward `#fff0d4` at **0.2** (`HOVER_RIM_TINT_LERP`) on front/back `MeshStandardMaterial.color` |
| Outer gold ring | `0 0 0 2px color-mix(in srgb, var(--theme-glow-gold) 55%, transparent)` (+ inner `1px` chrome ring in same rule) | Four shared `PlaneGeometry` strips (`HOVER_GOLD_RIM_STRIP` world thickness) parented like the card back (`z = -faceZ`, `rotateY = π`); `meshBasicMaterial` uses `goldBright`, opacity **quality-scaled** (`getHoverGoldQualityScales`: low / medium / high) |
| Outer glow | Large gold blurs in the same hover rule (`--theme-glow-gold`, `--theme-gold-bright`) | `emissive` + `emissiveIntensity` on both card faces (same quality scale) plus existing scene **directional** / **point** gold lights |

## Lift / tilt

| Token | DOM | WebGL |
|-------|-----|-------|
| Micro lift | `translateZ(2px)` under `perspective(940px)` (same `.fallbackTile:hover` rule) | `hoverLift` ≈ `0.00265` world units when `hoverDomParity`, `0.001` when matched (matched path inactive with current pick rules) |
| Tilt gain | `rotateX/Y` ±9° from `--hover-x/y` | `hoverTiltX/Z` from UV, clamped ±1 → radians scale `0.092` / `0.1` (non-matched) |
| Depth push | — | `hoverDepth` ≈ `0.00385` on Z when `hoverDomParity` |

## Inner card panel

| Token | DOM | WebGL |
|-------|-----|-------|
| Back saturation | `.cardBack` filter `saturate(1.02) brightness(1.02)` | Tint lerp only (no separate overlay) |
| Inner frame | `::after` inset `14%`, `border: 1px solid rgba(255,214,133,0.24)` | Overlay texture + wear stamps |

## Reduce motion

When `settings.reduceMotion` / `data-reduce-motion='true'`: DOM hover transform stack is disabled; WebGL skips hover tilt, lift, depth, tint/emissive/strip parity (`hovered` still tracks UV for bend; gold read uses `hoverDomParity` which requires `!reduceMotion`).
