# Task 015: Settings Schema for Reference Controls

## Status
Done (matrix + honest Controls placeholders verified)

## Implementation notes
- **Audit finding:** Reference settings show difficulty, timer mode, max lives, card theme, etc.; live `Settings` in `src/shared/contracts.ts` does not model all of them. Gap analysis requires honest labeling or schema work.
- **Relationship:** Builds on `TASK-006-settings-shell.md` (shell done—this is **model + UI truth**).
- **Landed:** `docs/new_design/SETTINGS_REFERENCE_CONTROLS_MATRIX.md`; live UI uses **Future tuning (not wired)** with disabled segments and explicit hints in `SettingsScreen.tsx`.

### Phase 2 — implementation (when product approves)
Tracked here to avoid a duplicate task number; phase 1 remains **Done** (honest labeling).

- **Difficulty**, **timer mode**, **max lives**: persist in `Settings` / `save-data` and apply to run rules, or keep deferred with copy only.
- **Card theme:** five-back preview row wired to `tileTextures` / assets (see [`DROP_IN_ASSET_CHECKLIST.md`](../DROP_IN_ASSET_CHECKLIST.md), [`TASK-011`](TASK-011-final-card-art-and-texture-pipeline.md)).
- **Tutorial hints** toggle in Gameplay pane if distinct from existing onboarding.
- **Reset to defaults** footer pattern vs Back/Save—align copy with reference if product wants both.

### Reference audit ([`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md))
- See § Settings vs ENDPRODUCTIMAGE2 (top right) for the checklist of reference-only rows vs capture `03-settings-page.png`.

## Priority
Medium

## Objective
For each reference-only control, choose one: implement with persistence and validation, or keep absent with explicit “coming later” copy; remove ambiguous mocks that read as functional.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md` (Settings mapping)
- `src/shared/contracts.ts` (`Settings`, `SaveData`)
- `src/renderer/components/SettingsScreen.tsx`
- `src/shared/save-data.ts` normalization

## Affected Areas
- `contracts.ts`, `save-data.ts`, `useAppStore.ts`
- `SettingsScreen.tsx` and copy
- Tests that cover settings persistence

## Dependencies
- Product decision list per control (design + engineering sign-off)
- `TASK-006-settings-shell.md`

## Implementation Outcomes
- No settings row implies behavior the engine cannot perform.
- Save migration story documented if new fields are added.

## Acceptance Criteria
- Matrix in task notes or gap doc updated: each reference control → implemented | deferred with copy | out of scope.
- Vitest and any settings e2e paths green.

## Out of Scope
- Balancing rules tied to “difficulty” unless product defines them
