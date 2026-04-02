# Visual capture (UI inventory)

PNG screenshots are **gitignored** here; commit the generated Markdown audits and scripts from the repo root instead.

## Device matrix

- Folder slugs: [`devices.ts`](./devices.ts) (`VISUAL_CAPTURE_DEVICE_IDS`).
- Viewport sizes and coarse-pointer emulation: [`e2e/visualInventoryDevices.ts`](../../e2e/visualInventoryDevices.ts) (`INVENTORY_DEVICE_SLOTS`).

Phones (SE, iPhone 14 Pro, Pixel 7, large), iPad 11", laptop 1366×768, desktops 1280×720 and 1440×900 — each in **portrait** and **landscape**.

## Commands

From the repository root (Playwright starts Vite via `playwright.config`; no manual `yarn dev` needed):

1. **Capture** (writes `*.png` under `docs/visual-capture/<device>/<orientation>/`):

   ```bash
   yarn capture:visual-inventory
   ```

2. **Generate Markdown** (`INVENTORY.md` plus per-folder `AUDIT.md`):

   ```bash
   yarn docs:visual-inventory
   ```

The default e2e visual tests still write to `test-results/visual-screens/<device>/<orientation>/` when `VISUAL_CAPTURE_ROOT` is unset (`yarn test:e2e:visual`).
