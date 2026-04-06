# FX-007 — DOM hover tokens → WebGL reference

DOM fallback hover is defined on `.fallbackTile:hover:not(.faceUp):not(.matched)` in [`TileBoard.module.css`](../../src/renderer/components/TileBoard.module.css). WebGL cards approximate the same read in [`TileBoardScene.tsx`](../../src/renderer/components/TileBoardScene.tsx) `TileBezel` via pointer UV tilt, **Z lift/depth**, and a **warm lerp** on `meshBasicMaterial.color` while hovered.

## Border / rim (screen-space feel)

| Token | DOM (CSS) | WebGL mapping |
|-------|-----------|---------------|
| Border emphasis | `border-color: rgba(244, 213, 142, 0.52)` | Warm tint lerp toward `#fff0d4` (~20% in linear RGB) on front/back card materials |
| Outer gold ring | `box-shadow: 0 0 0 2px rgba(244, 213, 142, 0.28)` | No mesh outline yet; rim read comes from tint + existing lighting |
| Outer glow | `0 0 40px rgba(195, 149, 79, 0.14)` | Combine with scene directional gold; optional future emissive pass (FX-015) |

## Lift / tilt (FX-006)

| Token | DOM | WebGL |
|-------|-----|-------|
| Micro lift | `translateZ(2px)` under `perspective(940px)` | `hoverLift` ≈ `0.0022` world units (non-matched), `0.001` when matched |
| Tilt gain | `rotateX/Y` ±9° from `--hover-x/y` | `hoverTiltX/Z` from UV, clamped ±1 → radians scale `0.092` / `0.1` (non-matched) |
| Depth push | — | `hoverDepth` ≈ `0.0032` on Z |

## Inner card panel

| Token | DOM | WebGL |
|-------|-----|-------|
| Back saturation | `.cardBack` filter `saturate(1.02) brightness(1.02)` | Tint lerp only (no separate overlay) |
| Inner frame | `::after` inset `14%`, `border: 1px solid rgba(255,214,133,0.24)` | Overlay texture + wear stamps |

## Reduce motion

When `settings.reduceMotion` / `data-reduce-motion='true'`: DOM hover transform stack is disabled; WebGL skips hover tilt, lift, depth, and material lerp (`hovered` forced false).
