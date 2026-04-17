# Refinement tasks index

Quick table for triage. Detail lives in each `REF-NNN.md`. [REF-100](./REF-100.md) (hygiene) is **done**; optional future trims — see [README.md](./README.md).

| ID | Scope (hint) | Priority | Title |
|----|----------------|----------|-------|
| [REF-001](./REF-001.md) | various | P1 | Unit-test `tilesArePairMatch` (wild / decoy / normal parity) |
| [REF-002](./REF-002.md) | UI | P1 | Coerce remaining `Settings` string unions in `normalizeSaveData` |
| [REF-003](./REF-003.md) | tests | P2 | Unit tests for endless floor mutator schedule |
| [REF-004](./REF-004.md) | various | P2 | REF-004 — Truthy timer checks skip `0ms` completion on resume |
| [REF-005](./REF-005.md) | WebGL | P2 | REF-005 — WebGL face spec: replace fixed post-flip sleep with a condition wait |
| [REF-006](./REF-006.md) | Electron | P2 | REF-006 — Electron main: IPC surface + persistence (`src/main/`) |
| [REF-007](./REF-007.md) | Electron | P2 | Single source of truth for `desktop:*` IPC channel strings (preload ↔ main) |
| [REF-008](./REF-008.md) | various | P2 | REF-008 — Align imperative `notify*` bridge with store `show*` options |
| [REF-009](./REF-009.md) | WebGL | P2 | REF-009 — Tile board WebGL vs screen reader model |
| [REF-010](./REF-010.md) | various | P2 | REF-010 — `GameScreen.tsx`: keyboard (global `P` pause / resume) |
| [REF-011](./REF-011.md) | various | P2 | REF-011 — GameplayHudBar + GameLeftToolbar (combined) |
| [REF-012](./REF-012.md) | various | P2 | REF-012 — MainMenu + ChooseYourPathScreen: hub shell fit contract (single source of truth) |
| [REF-013](./REF-013.md) | UI | P2 | REF-013 — SettingsScreen: unsaved draft discarded on Back |
| [REF-014](./REF-014.md) | docs | P2 | REF-014 — CodexScreen + mechanics encyclopedia wiring |
| [REF-015](./REF-015.md) | UI | P2 | REF-015 — InventoryScreen + CollectionScreen (single meta-surface pass) |
| [REF-016](./REF-016.md) | audio | P2 | REF-016 — Web gameplay SFX (`gameSfx.ts`) and `useAppStore` wiring |
| [REF-017](./REF-017.md) | privacy | P2 | `telemetry.ts` + `trackEvent` usage |
| [REF-018](./REF-018.md) | Steam | P2 | REF-018 — `src/main/steam.ts` achievement API name mapping |
| [REF-019](./REF-019.md) | docs | P2 | Align Vitest setup docs with happy-dom `matchMedia` + `visualViewport` polyfill |
| [REF-020](./REF-020.md) | various | P2 | REF-020 — `eslint.config.mjs` + `tsconfig.json`: include / exclude alignment |
| [REF-021](./REF-021.md) | tests | P2 | Expand `pairProximityHint` tests for board edges and blocked paths |
| [REF-022](./REF-022.md) | a11y | P2 | REF-022 — `focusDimmedTileIds.ts` + TileBoard focus-assist dimming |
| [REF-023](./REF-023.md) | various | P2 | `run-export` round-trip and version field discipline |
| [REF-024](./REF-024.md) | various | P2 | RNG helpers: deterministic seeds and no accidental global mutation |
| [REF-025](./REF-025.md) | tests | P3 | `utc-countdown` boundary tests (DST, midnight, negative remaining) |
| [REF-026](./REF-026.md) | various | P2 | REF-026 — `theme.ts` token drift vs CSS modules |
| [REF-027](./REF-027.md) | WebGL | P2 | Audit DOM FLIP / layout animation leftovers vs WebGL path |
| [REF-028](./REF-028.md) | various | P3 | `tileShatter` object pooling or allocation hot path review |
| [REF-029](./REF-029.md) | WebGL | P2 | `boardWebglPerfSample` stub vs real module in Vite/build |
| [REF-030](./REF-030.md) | e2e | P1 | Stabilize e2e flame / WebGL capture specs |
| [REF-031](./REF-031.md) | a11y | P2 | Game over / run summary copy — clarity, a11y, and heading order |
| [REF-032](./REF-032.md) | UI | P2 | REF-032 — Modal z-index ladder (OverlayModal vs Settings vs Meta) |
| [REF-033](./REF-033.md) | Electron | P1 | Preload script surface — IPC allowlist and type parity with renderer |
| [REF-034](./REF-034.md) | various | P1 | Main-process persistence — error surfaces and user-visible recovery |
| [REF-035](./REF-035.md) | Steam | P3 | Steam integration assumptions (overlay, achievements, offline) |
| [REF-036](./REF-036.md) | various | P2 | Achievement unlock order vs persistence — no duplicate toasts or lost unlocks |
| [REF-037](./REF-037.md) | various | P2 | Builtin puzzle import validation — schema + friendly errors |
| [REF-038](./REF-038.md) | docs | P3 | Mechanics encyclopedia — link integrity and generated appendix |
| [REF-039](./REF-039.md) | docs | P2 | REF-039 — `docs/FINDABLES.md` vs `FindableKind` in code |
| [REF-040](./REF-040.md) | docs | P2 | REF-040 — `docs/BALANCE_NOTES.md`: drift check vs tuning constants (script) |
| [REF-041](./REF-041.md) | various | P3 | `programmaticCardFace` golden outputs for symbol variants |
| [REF-042](./REF-042.md) | various | P3 | Card art `svgIds` — collision and import hygiene |
| [REF-043](./REF-043.md) | various | P3 | `devSandboxParams` — typed fixtures and reset-to-defaults |
| [REF-044](./REF-044.md) | various | P3 | `hudFixtures` parity with `GameplayHudBar` live props |
| [REF-045](./REF-045.md) | various | P2 | `useDragScroll` — scroll chaining and modal wheel capture |
| [REF-046](./REF-046.md) | various | P1 | `tileFieldTilt` vs `prefers-reduced-motion` and platform tilt |
| [REF-047](./REF-047.md) | various | P2 | `tileBoardViewport` resize debounce and DPR changes |
| [REF-048](./REF-048.md) | various | P2 | `graphicsQuality` mapping to renderer + shader defines |
| [REF-049](./REF-049.md) | various | P3 | Relic catalog vs balance notes — cross-reference check |
| [REF-050](./REF-050.md) | various | P2 | `run-mode-catalog` vs UI mode art assets |
| [REF-051](./REF-051.md) | audio | P3 | `gameSfx` channel limits and simultaneous one-shots |
| [REF-052](./REF-052.md) | various | P2 | `tileTextures` atlas layout and mip bias per quality tier |
| [REF-053](./REF-053.md) | various | P2 | `matchedCardRimFire` shader precision on Intel/ANGLE |
| [REF-054](./REF-054.md) | various | P3 | `tileBoardRimGeometry` LOD and buffer reuse |
| [REF-055](./REF-055.md) | contracts | P2 | `gameplayVisualConfig` vs `contracts` — single source for timing |
| [REF-056](./REF-056.md) | various | P3 | `mechanics-catalog-appendix-builder` deterministic ordering |
| [REF-057](./REF-057.md) | various | P3 | `cameraViewportMode` transitions — no pop when mode changes mid-run |
| [REF-058](./REF-058.md) | tests | P2 | `breakpoints` — test environment and SSR safety |
| [REF-059](./REF-059.md) | various | P3 | `desktop-client` vs web bootstrap — shared initialization checklist |
| [REF-060](./REF-060.md) | various | P3 | `useCoarsePointer` — hybrid laptop / tablet false positives |
| [REF-061](./REF-061.md) | a11y | P1 | `toolbarRoving` vs modal focus trap — no double roving tab order |
| [REF-062](./REF-062.md) | various | P1 | `tileBoardPick` parity with `game.ts` resolution for edge indices |
| [REF-063](./REF-063.md) | various | P3 | `floor-mutator-schedule` doc cross-links and version bump ritual |
| [REF-064](./REF-064.md) | UI | P2 | `mutators.test.ts` — ritual when adding mutator metadata |
| [REF-065](./REF-065.md) | various | P1 | `save-data` nullish field migration matrix |
| [REF-066](./REF-066.md) | contracts | P3 | `contracts.ts` breaking-change checklist for shared types |
| [REF-067](./REF-067.md) | privacy | P1 | `telemetry.ts` — PII scrubbing and opt-in policy |
| [REF-068](./REF-068.md) | Electron | P2 | Main `ipc` channel naming — namespaces and deprecation path |
| [REF-069](./REF-069.md) | Steam | P3 | Steam achievement bridge — error mapping to user-visible status |
| [REF-070](./REF-070.md) | tests | P2 | `vitest.setup.ts` mock leakage across test files |
| [REF-071](./REF-071.md) | various | P2 | CSS modules vs `theme.ts` — injection order and specificity |
| [REF-072](./REF-072.md) | a11y | P1 | `OverlayModal` — focus return to last focused element on close |
| [REF-073](./REF-073.md) | UI | P3 | `MetaScreen` long lists — virtualization or pagination |
| [REF-074](./REF-074.md) | UI | P3 | `InventoryScreen` — lazy icon imports / code splitting |
| [REF-075](./REF-075.md) | UI | P3 | `CodexScreen` search debounce and highlight perf |
| [REF-076](./REF-076.md) | data | P2 | Settings — export/import save round-trip UI |
| [REF-077](./REF-077.md) | WebGL | P1 | `TileBoardScene` disposal — textures, materials, listeners on unmount |
| [REF-078](./REF-078.md) | WebGL | P2 | WebGL context loss — user-visible recovery path |
| [REF-079](./REF-079.md) | e2e | P2 | E2E test isolation — storage, clocks, and parallel workers |
| [REF-080](./REF-080.md) | various | P2 | `tileResolvingSelection` — cancel in-flight animation on new match |
| [REF-081](./REF-081.md) | various | P3 | Pair proximity hint strings — i18n readiness |
| [REF-082](./REF-082.md) | a11y | P1 | `GameScreen` polite live region — anti-spam throttle |
| [REF-083](./REF-083.md) | various | P2 | `useHudPoliteLiveAnnouncement` — batching API |
| [REF-084](./REF-084.md) | docs | P3 | Mechanics encyclopedia — media alt text and figure captions |
| [REF-085](./REF-085.md) | various | P3 | `runFixtures` — reproducible seeds documentation |
| [REF-086](./REF-086.md) | various | P3 | `tileStepLegacy` removal timeline |
| [REF-087](./REF-087.md) | various | P3 | `cardSvgPlaneGeometry` — subpixel seams between quads |
| [REF-088](./REF-088.md) | WebGL | P3 | Rim fire material — environment map assumptions |
| [REF-089](./REF-089.md) | WebGL | P2 | Three.js hot path — material/geometry disposal policy |
| [REF-090](./REF-090.md) | e2e | P3 | Playwright — trace/video retention policy on failure |
| [REF-091](./REF-091.md) | tooling | P3 | Package scripts — `lint` vs `check` naming consistency |
| [REF-092](./REF-092.md) | tooling | P3 | TypeScript project references — `shared` vs `renderer` split |
| [REF-093](./REF-093.md) | various | P2 | Test file naming — `.test.ts` vs `.test.tsx` convention |
| [REF-094](./REF-094.md) | various | P2 | Accessibility — scoped axe run in CI for key routes |
| [REF-095](./REF-095.md) | various | P2 | Color contrast — dark mode tokens vs WCAG AA |
| [REF-096](./REF-096.md) | a11y | P3 | Keyboard shortcuts — discoverability and help overlay |
| [REF-097](./REF-097.md) | various | P3 | Cloud save placeholder — feature flag audit |
| [REF-098](./REF-098.md) | various | P3 | Endless mode — lightweight balance simulation script |
| [REF-099](./REF-099.md) | tests | P2 | `useDistractionChannelTick` — integration test with mutator schedule |
| [REF-100](./REF-100.md) | docs | P3 | Refinement backlog hygiene — **done** (optional INDEX re-triage) |

See [README.md](./README.md) for workflow.
