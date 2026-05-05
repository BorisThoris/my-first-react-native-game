# PPI-008: Meta screens reward value

## Status
Done

## Priority
P1

## Area
Meta UI / player value

## Evidence
- `src/renderer/components/CollectionScreen.tsx`
- `src/renderer/components/ProfileScreen.tsx`
- `src/renderer/components/InventoryScreen.tsx`
- `src/renderer/components/CodexScreen.tsx`
- `src/renderer/components/SettingsScreen.tsx`
- `tasks/refined-experience-gaps/REG-011-meta-screens-reward-value.md`

## Problem
Navigation proves the meta screens are reachable and can return correctly. It does not prove that each screen is valuable, rewarding, or meaningfully connected to the run the player just played.

## Target Experience
Collection, Profile, Inventory, Codex, and Settings each answer a clear player question and reflect current save/run progress in a useful way.

## Suggested Implementation
- Define one primary value proposition for each meta screen.
- Add post-run or active-run assertions that screens show relevant changed state.
- Improve empty states so they guide the next action instead of feeling like placeholders.
- Keep Settings focused as a control center, not a content sink.

## Acceptance Criteria
- Collection shows rewards/progression value after clear or achievement state.
- Profile shows local progress and trust/save context.
- Inventory shows active run economy, relics, mutators, and build identity.
- Codex explains active mechanics or mode context.
- Settings retains return-target behavior from menu, profile, Choose Path, and in-run overlays.

## Verification
- `yarn playwright test e2e/playable-path-navigation.spec.ts --workers=1`
- Focused component tests for changed meta-screen copy or state rows.

## Placeholder and asset contract
No final art required. Use existing panels, reward rows, and local save data.

## Cross-links
- `../refined-experience-gaps/REG-011-meta-screens-reward-value.md`
- `../refined-experience-gaps/REG-093-collection-final-reward-gallery.md`
- `../refined-experience-gaps/REG-094-inventory-final-loadout-and-run-prep-screen.md`
- `../refined-experience-gaps/REG-095-codex-final-knowledge-base.md`
