# Picture superiority checklist (art / UI)

Use when adding themes, larger tiles, or picture-based pairs.

- [x] Symbol readable at **minimum** tile size in gameplay (mobile camera + fallback grid). — *Policy:* verify on next art/theme change; current WebGL + CSS meets bar in capture QA.
- [x] `label` legible when shown (wide recall / future modes). — *Policy:* same; typography tokens in theme/CSS.
- [x] Silhouette / silhouette_twist mutator: silhouette still suggests the correct category. — *Shipped:* presentation path + [GAMEPLAY_POLISH_AND_GAPS.md](./gameplay/GAMEPLAY_POLISH_AND_GAPS.md) §1.
- [x] Atomic pair variants: adjacent pairs on the board are visually separable (border hue or shape ring). — *Policy:* verify when adding new pair art.
- [x] Motion: no critical information only in animation; static frame must be identifiable. — *Policy:* `prefers-reduced-motion` + static legibility reviewed in board epic.
