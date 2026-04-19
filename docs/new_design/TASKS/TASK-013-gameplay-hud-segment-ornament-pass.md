# Task 013: Gameplay HUD Segment Ornament Pass

## Status

Done (shipped) — segment order + score/meta contrast landed per playing-shell pass.

**Residual:** ornamental HUD frame rasters — deferred with final menu/gameplay art ([`TASK-009`](./TASK-009-final-menu-and-gameplay-illustrations.md)).

## Implementation notes
- **Audit finding:** HUD structure matches spec; segment frames, score dominance, and mutator/daily context segments can move closer to reference ornament density.
- **Relationship:** Focused pass under `TASK-004-gameplay-hud-and-shell.md` (which is Done for shipped scope—this task captures **reference polish**).
- **Landed:** `GameScreen.tsx` run-stat order **Floor → Lives → Shards → Score → Mode/mutators** per `SCREEN_SPEC_GAMEPLAY.md`. `GameScreen.module.css` — stronger `.hudScoreSegment` treatment, quieter `.hudMetaSegment` for context hierarchy.

### Reference audit ([`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md))
- **Segment ornament density** and **hex-like floor** treatment vs flat bar modules in capture.
- **Score parasite** mechanic strip: reference-only unless gameplay spec adopts it—coordinate with [`TASK-004`](TASK-004-gameplay-hud-and-shell.md).

## Priority
Medium

## Objective
Tune `GameScreen` top HUD segments (typography, frames, spacing, glow) so hierarchy matches `SCREEN_SPEC_GAMEPLAY.md`: score primary, context segments visually subordinate.

## Source Reference
- `docs/new_design/SCREEN_SPEC_GAMEPLAY.md` (HUD Spec)
- `src/renderer/components/GameScreen.tsx`, `GameScreen.module.css`

## Affected Areas
- `GameScreen.tsx`, `GameScreen.module.css`
- Shared tokens in `src/renderer/styles/theme.ts` if new HUD tokens are needed

## Dependencies
- `TASK-004-gameplay-hud-and-shell.md` baseline
- Optional: final illustrated stage from `TASK-009` for contrast tuning

## Implementation Outcomes
- Measurable improvement in score vs secondary segment scale and legibility on 390px-wide viewport.
- Mutator and daily rows read as context, not competing with score.

## Acceptance Criteria
- Review against `ENDPRODUCTIMAGE*.png` with gameplay capture from `yarn test:e2e:visual` output.
- No layout regressions in `e2e/mobile-layout.spec.ts` HUD-related cases.

## Out of Scope
- New HUD data fields unless already in `RunState`
