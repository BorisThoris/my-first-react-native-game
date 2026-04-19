# Tasks: Gameplay HUD parity (`HUD-*`)

**Research summary:** The HUD uses a **five-column** `hudStatsStrip` (left wing | divider | score | divider | right wing), glass `floatingDeck` / `hudDeck`, and **score parasite** segment when the mutator is active (`RunState.parasiteFloors`). **Gauntlet** countdown: single surface on `statRail` (**`HUD-005`** archived). Right-wing **mode + mutators + stat rail** density vs marketing still is tracked under **[`PLAY-003`](./TASKS_PLAYING_ENDPRODUCT.md)**. **`cameraViewportMode`** derivation remains (**HUD-012**).

**Primary code:** [`GameScreen.tsx`](../../../src/renderer/components/GameScreen.tsx), [`GameScreen.module.css`](../../../src/renderer/components/GameScreen.module.css)  
**Specs:** [`SCREEN_SPEC_GAMEPLAY.md`](../SCREEN_SPEC_GAMEPLAY.md), [`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md)  
**Archived IDs:** [`TASKS_ARCHIVE_PARITY.md`](./TASKS_ARCHIVE_PARITY.md) (includes **HUD-002**, **HUD-003**, **HUD-005**, **HUD-006**).

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| HUD-001 | P1 | Three-zone HUD layout (residual) | Single-row optical wings + center score shipped (`hudStatsStrip`). | Wide viewport: no accidental second-row grid wrap; right wing uses `nowrap` where intended. Further **meta strip** simplification: **PLAY-003**. | — |
| HUD-007 | P1 | Parasite art pass | Purple crystal + bar treatment aligned to ENDPRODUCT / VISUAL_SYSTEM_SPEC. | Uses asset or CSS vars; documented in `ASSET_SOURCES.md` if raster/SVG added. | — |
| HUD-008 | P1 | Mutator visual variants | Beyond parasite: distinct mini-widgets or icons for time-sensitive mutators where spec demands. | At least 2 mutator types differ visually from generic chip. | — |
| HUD-009 | P1 | Separate mutator “context” styling | Meta/mutator region visually subordinate to score (spec: context not peer). | Tokens or section class distinguish stats vs context. | HUD-001, **PLAY-003** |
| HUD-010 | P2 | Floor module ornament | Hex / heavy gold frame variant for floor badge. | Matches COMPONENT_CATALOG direction; visual review. | [`PLAYING_ENDPRODUCT/03-hud.md`](./PLAYING_ENDPRODUCT/03-hud.md) (**PLAY-005**), art |
| HUD-011 | P2 | Continuous rail chrome | Shared outer frame connecting segments. | Optional SVG/CSS; does not break responsive wrap fallback. | HUD-001 |
| HUD-012 | P1 | `cameraViewportMode` derivation | Replace hard-coded or always-on behavior with viewport + setting or flag; document behavior. | Types + comment; e2e updated if default changes. | Product |
| HUD-013 | P1 | Z-index / safe-area QA | After layout changes, left rail and HUD do not overlap incorrectly. | Manual + `mobile-layout` green. | HUD-001 |
| HUD-014 | P1 | Narrow breakpoint behavior | Symmetric layout degrades gracefully (scroll, stack, or compact wing). | No clipped stats at 390×844; screenshot spot-check. | HUD-001 |
| HUD-015 | P2 | Live regions | Announce gauntlet / parasite threshold changes for SR users. | `aria-live` polite where appropriate. | HUD-005 |
| HUD-016 | P2 | Storybook / fixtures | Static states: daily, gauntlet, scholar, multi-mutator. | Optional package; speeds design review. | HUD-003 |
| HUD-017 | P2 | COMPONENT_CATALOG sync | Update gameplay HUD entry after redesign. | Doc PR linked to implementation. | HUD-001 |
| HUD-018 | P1 | Stable e2e hooks | `data-testid` on `game-hud` and wings; extend if structure splits. | `navigation-flow`, `mobile-layout`, parity specs pass. | HUD-001 |
| HUD-019 | P1 | Visual baselines | Refresh gameplay screenshots after HUD ship. | `yarn test:e2e:visual` or project baseline process green. | HUD-001 |
| HUD-020 | P2 | Distraction overlay vs HUD | `distractionHud` z-index safe with new bar. | No regression on mobile camera layout. | HUD-001 |

---

## Refinement notes (post-research)

- **PLAY-003** reduces cognitive noise before heavy **HUD-009** polish.
- **HUD-001** residual is mostly **information architecture** vs the slim mock strip (`PLAY-003`).
- Coordinate rail changes with **[`TASKS_PLAYING_ENDPRODUCT.md`](./TASKS_PLAYING_ENDPRODUCT.md)** (`PLAY-*`) and **[`TASKS_SIDEBAR_PARITY.md`](./TASKS_SIDEBAR_PARITY.md)** (`SIDE-*`).
