# Visual capture (whole UI audit)

PNG screenshots are gitignored here by default. Commit the generated Markdown audits, and only commit PNG baselines when a design-review update is intentional.

## Device matrix

- Folder slugs: [`devices.ts`](./devices.ts) (`VISUAL_CAPTURE_DEVICE_IDS`).
- Viewport sizes and coarse-pointer emulation: [`e2e/visualInventoryDevices.ts`](../../e2e/visualInventoryDevices.ts) (`INVENTORY_DEVICE_SLOTS`).

Phones (SE, iPhone 14 Pro, Pixel 7, large), iPad 11", laptop 1366x768, desktops 1280x720 and 1440x900, each in portrait and landscape, all running the full visual scenario suite.

## Commands

From the repository root (Playwright starts Vite via `playwright.config`; no manual `yarn dev` needed):

1. Canonical full-grid gate:

   ```bash
   yarn test:e2e:visual
   ```

2. Faster local smoke run:

   ```bash
   yarn test:e2e:visual:smoke
   ```

3. Capture docs/review screenshots (writes `*.png` under `docs/visual-capture/<device>/<orientation>/`):

   ```bash
   yarn capture:ui-audit
   ```

4. Generate Markdown (`INVENTORY.md` plus per-folder `AUDIT.md`):

   ```bash
   yarn docs:ui-audit
   ```

   To build the workbook from the default gitignored captures instead of `docs/visual-capture`, point the same command at the existing root:

   ```bash
   cross-env VISUAL_CAPTURE_ROOT=test-results/visual-screens yarn docs:ui-audit
   ```

The default visual test output still writes to `test-results/visual-screens/<device>/<orientation>/` when `VISUAL_CAPTURE_ROOT` is unset. `yarn capture:ui-audit` redirects the same scenario suite into `docs/visual-capture/` for human review.
