# Visual audit: ipad-11 / landscape
> **Checklist policy:** Items marked [x] per [visual-capture README](../../README.md); re-verify when replacing PNGs.


- **Device folder:** `ipad-11`
- **Orientation:** landscape
- **Relative path:** `docs/visual-capture/ipad-11/landscape`

## Screenshots

| File | Dimensions | Screen | Slug |
| --- | --- | --- | --- |
| `00-startup-intro.png` | 1180×820 | Startup relic intro | `00-startup-intro` |
| `01-main-menu.png` | 1180×820 | Main menu | `01-main-menu` |
| `01a-choose-your-path.png` | 1180×820 | Choose Your Path | `01a-choose-your-path` |
| `01b-collection.png` | 1180×820 | Collection | `01b-collection` |
| `01c-inventory-empty.png` | 1180×820 | Inventory (no active run) | `01c-inventory-empty` |
| `01d-inventory-active.png` | 1180×820 | Inventory (active run) | `01d-inventory-active` |
| `01e-codex.png` | 1180×820 | Codex | `01e-codex` |
| `02-main-menu-howto.png` | 1180×820 | Main menu with How To Play | `02-main-menu-howto` |
| `03-settings-page.png` | 1180×820 | Settings (full page) | `03-settings-page` |
| `04-game-playing.png` | 1180×820 | Level 1 play (board visible) | `04-game-playing` |
| `05-pause-modal.png` | 1180×820 | Pause modal | `05-pause-modal` |
| `06-run-settings-modal.png` | 1180×820 | Run settings (in-game modal) | `06-run-settings-modal` |
| `07-floor-cleared-modal.png` | 1180×820 | Floor cleared modal | `07-floor-cleared-modal` |
| `08-game-over.png` | 1180×820 | Game over / Expedition Over | `08-game-over` |

### Startup relic intro

![Startup relic intro](00-startup-intro.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] Confirm intro is dismissible and focus order makes sense with keyboard.
- [x] Check contrast of relic frame and primary CTA against background.

### Main menu

![Main menu](01-main-menu.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] Balance vertical spacing so primary actions stay above the fold on short phones.
- [x] Verify stats / last run summary do not crowd touch targets.

### Choose Your Path

![Choose Your Path](01a-choose-your-path.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).

### Collection

![Collection](01b-collection.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).

### Inventory (no active run)

![Inventory (no active run)](01c-inventory-empty.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).

### Inventory (active run)

![Inventory (active run)](01d-inventory-active.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).

### Codex

![Codex](01e-codex.png)

> **Expected (Apr 2026):** Menu Codex uses the full meta stage wash (`shellMetaStage`). In-run Codex opens in the desk/grimoire modal stack (`App.tsx` + `modalOverlayDesk` / `modalInnerDesk` in `MetaScreen.module.css`, META-010). Codex UI includes a topic filter, collapsible sections (`details`/`summary`), and mechanics encyclopedia v3. Re-capture scenario still **01e-codex** when Codex art or layout intentionally changes.

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).

### Main menu with How To Play

![Main menu with How To Play](02-main-menu-howto.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] Ensure How To Play panel scrolls cleanly and close control is obvious on small widths.

### Settings (full page)

![Settings (full page)](03-settings-page.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] Validate slider hit areas and label alignment in compact density.

### Level 1 play (board visible)

![Level 1 play (board visible)](04-game-playing.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] Confirm tile board uses playable height; HUD and board should not overlap awkwardly.
- [x] Check WebGL vs DOM fallback if `reduceMotion` or WebGL loss differs from this capture.

### Pause modal

![Pause modal](05-pause-modal.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] Verify focus trap, backdrop click behavior, and resume path.
- [x] Modal width and padding on ultra-narrow and landscape phones.

### Run settings (in-game modal)

![Run settings (in-game modal)](06-run-settings-modal.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] Match typography scale to full Settings where possible; check scroll in modal body.

### Floor cleared modal

![Floor cleared modal](07-floor-cleared-modal.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] CTA hierarchy (continue vs menu) and safe-area padding on notched devices.

### Game over / Expedition Over

![Game over / Expedition Over](08-game-over.png)

#### Review checklist

- [x] No unintended horizontal overflow on the document root.
- [x] Touch targets ≥ 44px where applicable (coarse pointer layouts).
- [x] Text remains legible at this viewport; check line length and heading scale.
- [x] Interactive elements have visible focus states (keyboard).
- [x] WebGL tile board: silhouette/SMAA acceptable; fallback path if WebGL unavailable.

#### Improvement tasks

- [x] Review this screenshot for visual regressions (spacing, color, clipping).
- [x] Readability of score summary; avoid horizontal scroll; retry/menu balance.
