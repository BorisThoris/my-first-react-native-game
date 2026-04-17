# Refinement backlog (REF-001–REF-100) — completion record

**Status:** Addressed in codebase as of the latest `main` integration pass. Original acceptance criteria live in each `REF-NNN.md`; this file is the **rollup** so you do not need to audit 100 cards individually.

**Verify:** `yarn verify` (TypeScript + Vitest). **`yarn ci`** matches **`yarn fullcheck`** (ESLint + test file extension guard + typecheck + Vitest). Use `yarn verify` locally when iterating without lint.

**REF-100:** [REF-100](./REF-100.md) is **Done** — INDEX acceptance met; optional future INDEX reviews are team process, not backlog. **Last hygiene snapshot:** 2026-04-17 — REF-001–REF-100 include `Rollup:` / **Status** aligned with shipped code; **`yarn verify`** + **`yarn ci`** green; INDEX unchanged (single table, scannable).

---

## Evidence by range

| REFs | Theme | Primary locations (non-exhaustive) |
|------|--------|-------------------------------------|
| **001–010** | Core rules, save, IPC, board, GameScreen | `game.test.ts`, `save-data`, `ipc-channels`, `runTimerResumeConditions`, `e2e/tile-card-face-webgl`, `GameScreen`, notifications bridge |
| **011–020** | HUD, hubs, settings, Codex, audio, telemetry, Steam, tooling | `GameLeftToolbar`, `hubShellFit`, `SettingsScreen`, `CodexScreen`, `gameSfx`, `telemetry.ts`, `steam.ts`, `tsconfig` / `eslint.config` |
| **021–030** | Proximity, exports, RNG, time, theme, WebGL perf, e2e flame | `pairProximityHint.test.ts`, `run-export`, `rng.test.ts`, `utc-countdown`, `theme.parity.test.ts`, `capture-matched-flame.spec.ts` |
| **031–040** | Game over, modals, puzzles, balance drift, faces, dev HUD | `GameOverScreen`, `balance-notes-drift.test.ts`, `puzzle-import`, `mechanics-encyclopedia.test.ts`, `programmaticCardFace`, `svgIds` |
| **041–050** | Dev sandboxes, drag/tilt, viewport, graphics, relics, mode art | `devSandboxParams`, `useDragScroll`, `tileFieldTilt`, `tileBoardViewport`, `graphicsQuality`, `relicBalanceDoc.test.ts`, `modeArt.test.ts` |
| **051–060** | Audio/textures/rim, contracts timing, appendix, camera, breakpoints, init shell, pointer | `gameSfx.test.ts`, `tileTextures`, rim shaders/materials, `gameplayVisualConfig`, `mechanics-catalog-appendix-builder`, `cameraViewportMode`, `initRendererShell`, `useCoarsePointer` |
| **061–070** | A11y roving, picks, saves, telemetry scrub, IPC, Steam UX, vitest | `toolbarRoving`, `tileBoardPick.test.ts`, `save-data.test.ts`, `telemetry.test.ts`, `ipc.ts` / preload, `achievementPersistence`, `vitest.setup` / `vite.config` |
| **071–080** | Theme/CSS, modals, meta lists, Codex, settings import/export, WebGL lifecycle, e2e | `theme.ts`, `modalFocusReturnStack`, `CollectionScreen`, `CodexScreen`, `SettingsScreen`, `TileBoardScene`, `playwright.config.ts`, `tileResolvingSelection` |
| **081–090** | Strings, HUD throttle, fixtures, legacy paths, geometry, rim assets, traces | `pairProximityUi`, `useHudPoliteLiveAnnouncement`, `runFixtures`, `dev/legacy/tileStepLegacy`, `cardSvgPlaneGeometry`, `matchedCardRimFireMaterial`, `e2e/README.md` |
| **091–100** | Scripts, a11y e2e, WCAG tokens, shortcuts, feature flags, sim script, distraction test, hygiene | `package.json` (`verify`, `ci`, `sim:endless`, `test:e2e:a11y`), `scripts/check-test-file-extensions.mjs`, `theme.wcag.test.ts`, `gameplayShortcuts`, `feature-flags.ts`, `useDistractionChannelTick.integration.test.tsx`, INDEX/README |

### Cross-cutting

- **REF-034 (persistence):** `PersistenceService` + `persistBridge` + **Main menu, GameScreen, and Settings** strips for write failures.
- **REF-035 (Steam):** documented in `src/main/steam.ts`; mock adapter when Steam unavailable.

---

## If something regresses

1. Run `yarn fullcheck` (CI parity: lint + `yarn verify`) or `yarn verify` for a faster loop.
2. Open the relevant `REF-NNN.md` for the intended behavior.
3. Fix in **authoritative** modules (`contracts`, `game.ts`, renderer feature folders) — avoid duplicating rules in task files.

When you intentionally **drop** a REF’s scope, edit that `REF-NNN.md` with a short “Won’t do — reason” so the INDEX stays honest.
