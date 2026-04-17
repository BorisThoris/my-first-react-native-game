# End-to-end tests (Playwright)

Specs live in this directory and run against the Vite dev server (`playwright.config.ts`).

## Relic draft overlay (manual QA)

The milestone relic draft (`data-testid="game-relic-offer-overlay"`) is covered by a **manual** checklist in [`docs/epics/relic-draft-fluid-system/05-ui-ultra-refinement.md`](../docs/epics/relic-draft-fluid-system/05-ui-ultra-refinement.md) (QA section). Optional Playwright smoke on that test id is not CI-gated.

## Traces and videos on failure

Config uses `trace: 'retain-on-failure'` and `video: 'retain-on-failure'` so passing runs stay light while failed attempts still upload Playwright traces/videos. Download artifacts from the CI job (or open `test-results/` after a local failure) and run `npx playwright show-trace path/to/trace.zip` to inspect.

## `visual-screens.standard.spec.ts` — game over (`08-game-over`)

The default path drives level 1 and burns lives with intentional mismatches (`forceGameOverWithMismatches` in `visualScreenHelpers.ts`). That harness can flake on slow machines when flip animations lag behind Playwright’s hidden-tile queries.

For a deterministic capture or local green runs without changing CI behavior, set:

`E2E_USE_SANDBOX_GAMEOVER=1`

Then the `08-game-over` scenario opens `/?devSandbox=1&screen=gameOver&fixture=gameOver&skipIntro=1` (same save JSON as other visual baselines) and asserts on the real game-over shell. Unset or omit the variable in CI to keep the live mismatch harness.

## `ui-screenshots.spec.ts`

- **Purpose:** Local-only UI capture: drives the app through intro → menu → classic run, then writes full-page PNGs for a couple of viewport sizes.
- **Artifacts:** Creates `tmp/ui-capture/` under the repo root (the `tmp/` tree is gitignored). Safe to delete between runs.
- **CI policy:** Prefer the curated renderer QA command (`yarn test:e2e:renderer-qa` in the root `package.json`) for automated gates so this spec is not relied on in CI. If you run `yarn test:e2e` or `playwright test` in CI, this file will execute and write under `tmp/`; ensure the job allows ephemeral disk writes and does not expect deterministic screenshots without a dedicated visual baseline workflow.
