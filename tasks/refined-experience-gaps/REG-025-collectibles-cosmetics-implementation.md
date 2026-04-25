# REG-025: Collectibles Cosmetics Implementation

## Status
Open

## Priority
P2

## Area
Meta

## Evidence
- `docs/COLLECTIBLE_SYSTEM.md`
- `src/shared/save-data.ts`
- `src/shared/honorUnlocks.ts`
- `src/renderer/components/CollectionScreen.tsx`
- `src/renderer/components/InventoryScreen.tsx`

## Problem
The older collectible and shop documentation is aspirational. The repo needs a decision about which collectibles, cosmetics, and shop concepts become real and which should be cut or deferred.

## Target Experience
Collectibles and cosmetics should give players durable expression and goals without muddying core gameplay balance. The system should feel intentional, discoverable, and worth returning to.

## Suggested Implementation
- Categorize collectible ideas into ship now, later, and cut.
- Define cosmetic slots such as card backs, board skins, crests, titles, or menu themes.
- Connect cosmetics to unlocks, objectives, shop, or progression track.
- Store owned and equipped cosmetics in `SaveData`, likely extending `unlocks[]` or adding a typed cosmetic field.
- Bump `SAVE_SCHEMA_VERSION` for durable cosmetic ownership or equipment fields.

## Acceptance Criteria
- A scoped collectible/cosmetic plan exists with explicit first implementation slice.
- Collection and inventory screens show owned, locked, and equipped states.
- Cosmetics do not change gameplay unless deliberately categorized as upgrades.
- Fallback visuals exist for missing assets.

## Verification
- Test fresh and migrated saves with no cosmetics, some cosmetics, and equipped cosmetics.
- Capture collection/inventory states and gameplay with equipped cosmetic.
- Verify missing asset fallback behavior.

## Cross-links
- `REG-011-meta-screens-reward-value.md`
- `REG-016-meta-progression-upgrades.md`
- `REG-024-economy-unification.md`
