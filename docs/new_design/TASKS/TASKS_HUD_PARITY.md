# Tasks: Gameplay HUD parity (`HUD-*`)

**Research summary:** The HUD is a single glass `floatingDeck` with `deckCluster` as `flex-wrap` + `justify-content: flex-start`. Score is visually dominant **inside** `hudScoreSegment` but the strip is **not** viewport-centered with symmetric wings. `score_parasite` only appears as a text chip; `RunState.parasiteFloors` exists in `contracts` / `game.ts` but has **no HUD binding**. Gauntlet time can appear in both mode label and `statRail`. `cameraViewportMode` is hard-coded `true`.

**Primary code:** `src/renderer/components/GameScreen.tsx`, `GameScreen.module.css`  
**Specs:** `docs/new_design/SCREEN_SPEC_GAMEPLAY.md`, `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| HUD-001 | P0 | Three-zone HUD layout | Score is the optical center of the bar with left/right wings (grid or flex), not a wrapping row that drifts left. | Wide viewport: score block centered in header; floor/lives/shards on left wing; mode/mutators/daily on right (order per SCREEN_SPEC). | — |
| HUD-002 | P0 | Center HUD strip in column | The HUD container centers within `mainGameColumn` (or full width with internal centering). | `justify-content` / grid column alignment documented in CSS; no accidental `flex-start` on outer bar. | HUD-001 |
| HUD-003 | P1 | Extract `GameplayHudBar` | Isolate HUD presentational component + typed props (run slice, labels). | `GameScreen.tsx` shrinks; props unit-testable or Storybook optional (`HUD-016`). | HUD-001 |
| HUD-004 | P1 | Daily / seed segment | Dedicated segment for daily id when `run.gameMode === 'daily'`, per SCREEN_SPEC. | Segment hidden for non-daily; matches typography tokens. | HUD-001 |
| HUD-005 | P1 | Deduplicate gauntlet time | Single authoritative surface for countdown (mode line XOR `statRail`, not both). | Grep shows one user-visible countdown for gauntlet. | — |
| HUD-006 | P0 | Parasite meter binds state | HUD reads `parasiteFloors` (and rules from `game.ts` threshold ~4 floors) for `score_parasite`. | When mutator active, meter or ticks reflect progress toward parasite event; hidden when mutator off. | Rules review |
| HUD-007 | P1 | Parasite art pass | Purple crystal + bar treatment aligned to ENDPRODUCT / VISUAL_SYSTEM_SPEC. | Uses asset or CSS vars; documented in `ASSET_SOURCES.md` if raster/SVG added. | HUD-006 |
| HUD-008 | P1 | Mutator visual variants | Beyond parasite: distinct mini-widgets or icons for time-sensitive mutators where spec demands. | At least 2 mutator types differ visually from generic chip. | HUD-006 |
| HUD-009 | P1 | Separate mutator “context” styling | Meta/mutator region visually subordinate to score (spec: context not peer). | Tokens or section class distinguish stats vs context. | HUD-001 |
| HUD-010 | P2 | Floor module ornament | Hex / heavy gold frame variant for floor badge. | Matches COMPONENT_CATALOG direction; visual review. | TASK-013 / art |
| HUD-011 | P2 | Continuous rail chrome | Shared outer frame connecting segments. | Optional SVG/CSS; does not break responsive wrap fallback. | HUD-001 |
| HUD-012 | P1 | `cameraViewportMode` derivation | Replace always-`true` with viewport + setting or flag; document behavior. | Types + comment; e2e updated if default changes. | Product |
| HUD-013 | P1 | Z-index / safe-area QA | After layout changes, flyout and HUD do not overlap incorrectly. | Manual + `mobile-layout` green. | HUD-001 |
| HUD-014 | P1 | Narrow breakpoint behavior | Symmetric layout degrades gracefully (scroll, stack, or compact wing). | No clipped stats at 390×844; screenshot spot-check. | HUD-001 |
| HUD-015 | P2 | Live regions | Announce gauntlet / parasite threshold changes for SR users. | `aria-live` polite where appropriate. | HUD-005, HUD-006 |
| HUD-016 | P2 | Storybook / fixtures | Static states: daily, gauntlet, scholar, multi-mutator. | Optional package; speeds design review. | HUD-003 |
| HUD-017 | P2 | COMPONENT_CATALOG sync | Update gameplay HUD entry after redesign. | Doc PR linked to implementation. | HUD-001 |
| HUD-018 | P1 | Stable e2e hooks | `data-testid` per major segment if structure splits; keep `game-hud` on root. | `navigation-flow`, `mobile-layout` pass. | HUD-001 |
| HUD-019 | P1 | Visual baselines | Refresh gameplay screenshots after HUD ship. | `yarn test:e2e:visual` or project baseline process green. | HUD-001 |
| HUD-020 | P2 | Distraction overlay vs HUD | `distractionHud` z-index safe with new bar. | No regression on mobile camera layout. | HUD-001 |

---

## Refinement notes (post-research)

- **HUD-006** is high leverage: data already exists; UI is the gap.
- **HUD-001 + HUD-002** should land together to avoid half-centered layouts.
- Coordinate **HUD-018** with **SIDE-016** (`TASKS_SIDEBAR_PARITY.md`) so selectors stay coherent.
