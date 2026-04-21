# Visual audit: laptop-1366 / portrait

- **Device folder:** `laptop-1366`
- **Orientation:** portrait
- **Relative path:** `docs/visual-capture/laptop-1366/portrait`

## Screenshots

| File | Dimensions | Screen | Slug |
| --- | --- | --- | --- |
| `00-startup-intro.png` | 768×1366 | Startup relic intro | `00-startup-intro` |
| `01-main-menu.png` | 768×1366 | Main menu | `01-main-menu` |
| `01a-choose-your-path.png` | 768×1366 | Choose Your Path | `01a-choose-your-path` |
| `01b-collection.png` | 768×1366 | Collection | `01b-collection` |
| `01c-inventory-empty.png` | 768×1366 | Inventory (no active run) | `01c-inventory-empty` |
| `01d-inventory-active.png` | 768×1366 | Inventory (active run) | `01d-inventory-active` |
| `01e-codex.png` | 768×1366 | Codex | `01e-codex` |
| `02-main-menu-howto.png` | 768×1366 | Main menu with How To Play | `02-main-menu-howto` |
| `03-settings-page.png` | 768×1366 | Settings (full page) | `03-settings-page` |
| `04-game-playing.png` | 768×1366 | Level 1 play (board visible) | `04-game-playing` |
| `05-pause-modal.png` | 768×1366 | Pause modal | `05-pause-modal` |
| `06-run-settings-modal.png` | 768×1366 | Run settings (in-game modal) | `06-run-settings-modal` |
| `07-floor-cleared-modal.png` | 768×1366 | Floor cleared modal | `07-floor-cleared-modal` |
| `08-game-over.png` | 768×1366 | Game over / Expedition Over | `08-game-over` |

### Startup relic intro

![Startup relic intro](00-startup-intro.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Confirm intro is dismissible and focus order makes sense with keyboard.
- [ ] Check contrast of relic frame and primary CTA against background.

### Main menu

![Main menu](01-main-menu.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Balance vertical spacing so primary actions stay above the fold on short phones.
- [ ] Verify stats / last run summary do not crowd touch targets.
- [ ] Pixi backdrop grid should read as atmosphere, not a literal wire grid (compare `ENDPRODUCTIMAGE2` left panel).

### Choose Your Path

![Choose Your Path](01a-choose-your-path.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Poster frames vs reference: gradient panels should stay legible behind labels; bump contrast if headlines wash out.
- [ ] Featured mode glow — ensure selected state stays obvious in bright environments.

### Collection

![Collection](01b-collection.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).

### Inventory (no active run)

![Inventory (no active run)](01c-inventory-empty.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).

### Inventory (active run)

![Inventory (active run)](01d-inventory-active.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).

### Codex

![Codex](01e-codex.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).

### Main menu with How To Play

![Main menu with How To Play](02-main-menu-howto.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Ensure How To Play panel scrolls cleanly and close control is obvious on small widths.

### Settings (full page)

![Settings (full page)](03-settings-page.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Validate slider hit areas and label alignment in compact density.

### Level 1 play (board visible)

![Level 1 play (board visible)](04-game-playing.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Confirm tile board uses playable height; HUD and board should not overlap awkwardly.
- [ ] Check WebGL vs DOM fallback if `reduceMotion` or WebGL loss differs from this capture.

### Pause modal

![Pause modal](05-pause-modal.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Verify focus trap, backdrop click behavior, and resume path.
- [ ] Modal width and padding on ultra-narrow and landscape phones.

### Run settings (in-game modal)

![Run settings (in-game modal)](06-run-settings-modal.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Match typography scale to full Settings where possible; check scroll in modal body.

### Floor cleared modal

![Floor cleared modal](07-floor-cleared-modal.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] CTA hierarchy (continue vs menu) and safe-area padding on notched devices.

### Game over / Expedition Over

![Game over / Expedition Over](08-game-over.png)

#### Review checklist

- [ ] No unintended horizontal overflow on the document root.
- [ ] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [ ] Text remains legible at this viewport; check line length and heading scale.
- [ ] Interactive elements have visible focus states (keyboard).
- [ ] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [ ] Review this screenshot for visual regressions (spacing, color, clipping).
- [ ] Readability of score summary; avoid horizontal scroll; retry/menu balance.
