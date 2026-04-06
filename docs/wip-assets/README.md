# WIP assets (non-shipped / reference)

Material in this tree is for **design iteration, QA captures, and import sources**. Shipped game art lives under `src/renderer/assets/` and `public/` (served URLs).

| Path | Purpose |
|------|---------|
| **`card-sources/`** | Original PNG/SVG exports (e.g. AI outputs) before normalization; not imported by the app. |
| **`card-des/`** | Ad-hoc card reference PNGs. |
| **`validation/`** | Screenshots from `yarn capture:ui-vs-assets` (board vs source assets). |
| **`png/`**, **`svg/`**, `crops.json`, `index.json` | Output from `yarn wip:extract-endproduct` (`scripts/extract-endproduct-wip-assets.mjs`). |

Card texture tooling: **`scripts/card-pipeline/`** (`imagegen`, normalize, trim, etc.).
