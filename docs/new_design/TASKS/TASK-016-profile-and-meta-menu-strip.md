# Task 016: Profile and Meta Menu Strip

## Status
Done (deferred for Steam demo; documented in gap analysis)

## Implementation notes
- **Audit finding:** Reference menu often shows a top meta strip (profile, soft currency, streaks beyond current stats cards). Live menu has build/best score/daily/Steam cards but not a full profile layer.
- **Relationship:** New **model + UI** work; not covered by closed TASK-001–008.
- **Resolution:** Out of scope for current demo; see **Profile / social strips** in `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`. Re-open as Partial when product adds profile fields.

## Priority
Low (unless product elevates to v1)

## Objective
If in scope, design and implement a thin profile/meta strip (avatar, name placeholder, optional currency) consistent with tokens and `MainMenu` layout; wire only fields backed by real or honestly mocked data.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md` (Main Menu / player profile row)
- `src/renderer/components/MainMenu.tsx`

## Affected Areas
- `MainMenu.tsx`, `MainMenu.module.css`
- `SaveData` / player stats contracts if new fields are required
- `useAppStore.ts` for hydration

## Dependencies
- Product decision: which fields are real vs cosmetic for Steam demo
- `TASK-002-shared-ui-primitives.md` for any new chips/tiles

## Implementation Outcomes
- Strip composes on compact and roomy densities without crowding CTAs.
- Screen reader labels for non-decorative meta.

## Acceptance Criteria
- Visual review against reference when strip is in v1 scope.
- No false claims (e.g. currency) unless backed by data or labeled sample.

## Out of Scope
- Full account system or multiplayer profile
