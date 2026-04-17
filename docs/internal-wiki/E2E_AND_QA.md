# E2E specs and QA matrix

**Runner:** Playwright (`yarn test:e2e`). **Config:** `playwright.config.ts` at repo root (`use.baseURL` is `http://127.0.0.1:5173` against the Vite dev server).

**Seeded saves:** Helpers in `e2e/tileBoardGameFlow.ts` and `e2e/visualScreenHelpers.ts` set `schemaVersion` from **`SAVE_SCHEMA_VERSION`** (`src/shared/contracts.ts`) so `localStorage` fixtures stay aligned with [save-data.ts](../../src/shared/save-data.ts) normalization expectations.

**Curated gate (recommended for CI):** `yarn test:e2e:renderer-qa` — see root `package.json` for exact file list.

## Spec inventory (`e2e/`)

| Spec file | Typical focus |
|-----------|----------------|
| `navigation-flow.spec.ts` | Shell navigation / flow; **Import run JSON** modal (not puzzle import) |
| `mobile-layout.spec.ts` | Mobile breakpoints / layout |
| `scholar-contract.spec.ts` | Scholar contract run |
| `wild-run.spec.ts` | Wild / joker style run |
| `tile-card-face-dom.spec.ts` | Card faces DOM path |
| `tile-card-face-webgl.spec.ts` | Card faces WebGL path |
| `tile-board-raycast.spec.ts` | Board raycast / input |
| `visual-inventory-capture.spec.ts` | Full device-grid visual inventory |
| `visual-screens.mobile.spec.ts` | Mobile visual baselines |
| `visual-screens.standard.spec.ts` | Standard/desktop visual baselines |
| `visual-endproduct-parity.spec.ts` | End-product parity |
| `ui-design-reference.spec.ts` | UI design reference stills |
| `capture-matched-flame.spec.ts` | Matched flame VFX capture |
| `menu-boot-visual.spec.ts` | Menu boot visuals |
| `settings-viewport-matrix.spec.ts` | Settings × viewport |
| `viewport-fit-stress.spec.ts` | Viewport fit stress |
| `overlay-smoke.spec.ts` | Overlays smoke |
| `a11y-intro-pause.spec.ts` | Intro / pause a11y |
| `a11y-toast-gameover.spec.ts` | Toast + game over a11y |
| `hud-inspect.spec.ts` | HUD inspection |
| `logo-intro-sandbox.spec.ts` | Logo intro sandbox |
| `ui-screenshots.spec.ts` | Local UI screenshots → `tmp/` (see [e2e/README](../../e2e/README.md)) |

## Helpers (not specs)

`visualScreenHelpers.ts`, `visualScenarioSteps.ts`, `visualScreenScenarios.ts`, `visualInventoryDevices.ts`, `tileBoardGameFlow.ts`, `mobileTouchHelpers.ts`, `startupIntroHelpers.ts`, `pngDiff.ts` — shared steps and diff utilities.

## Related docs

- [visual-capture/README.md](../visual-capture/README.md) — where captures land, device matrix
- [visual-capture/INVENTORY.md](../visual-capture/INVENTORY.md) — generated inventory index
- [VIEWPORT_FIT_UI.md](../VIEWPORT_FIT_UI.md) — viewport behavior
