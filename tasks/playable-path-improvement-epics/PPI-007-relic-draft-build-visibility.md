# PPI-007: Relic draft and build visibility

## Status
Done

## Priority
P1

## Area
Relics / build identity

## Evidence
- `src/renderer/components/RelicDraftOfferPanel.tsx`
- `src/renderer/components/InventoryScreen.tsx`
- `src/shared/relics.ts`
- `e2e/README.md`
- `tasks/refined-experience-gaps/REG-019-relic-build-archetypes.md`
- `tasks/refined-experience-gaps/REG-078-relic-offer-reroll-ban-and-upgrade-services.md`

## Problem
Relic systems are strong in shared logic, but relic draft remains weak in automated playable-path proof. The current E2E README still treats milestone relic draft as manual QA, and build identity is not yet a core part of the playable path.

## Target Experience
The player can draft a relic, understand why it matters, see the build identity change, and find that effect in HUD, Inventory, and post-run summary.

## Suggested Implementation
- Use deterministic fixture setup from `PPI-001` to open a valid relic draft overlay.
- Add E2E for pick, reroll/ban/upgrade service if available, and resulting inventory/build state.
- Improve visible build identity if a picked relic does not create a clear player-facing signal.

## Acceptance Criteria
- Relic draft overlay is automated in Playwright.
- Picking a relic updates run state and visible build/inventory information.
- Service actions have disabled/used states or clear unavailable reasons.
- Post-run summary includes selected relic identity.

## Verification
- New focused relic draft E2E.
- Existing `relics.test.ts` and renderer tests for relic offer UI.

## Placeholder and asset contract
No final relic art required. Use catalog names, existing iconography, and current UI frames.

## Cross-links
- `PPI-001-deterministic-playable-path-fixtures.md`
- `../refined-experience-gaps/REG-019-relic-build-archetypes.md`
- `../refined-experience-gaps/REG-078-relic-offer-reroll-ban-and-upgrade-services.md`
- `../dungeon-epic/tickets/DNG-051-relic-build-archetypes.md`
