# REG-035: Main Menu Profile Social Community Strip

## Status
Open

## Priority
P2

## Area
Meta

## Evidence
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/MainMenu.module.css`
- `src/shared/save-data.ts`
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`

## Problem
The reference menu includes a profile/meta strip and social/community affordances, but the live app only exposes a simpler build, best score, daily streak, and Steam state area. The gap is not just styling; it needs product scope.

## Target Experience
The menu should either intentionally omit social/profile chrome or provide a meaningful profile strip with durable progress and safe external/community links.

## Suggested Implementation
- Decide whether profile and social strips are v1, v2, or intentionally out of scope.
- If scoped, define profile data from `SaveData` and `PlayerStatsPersisted`: level, title, selected crest, bests, streaks, and current build identity.
- Add external-link policy for Discord, Steam community, mail/news, or support.
- Avoid fake currencies or social links unless backed by real systems.
- If profile fields persist, add `SAVE_SCHEMA_VERSION` migration tests.

## Acceptance Criteria
- Main menu does not imply missing online features.
- Profile elements use real saved data or honest placeholders.
- External/community actions have clear destination and offline behavior.
- Mobile menu density remains acceptable after adding any strip.

## Verification
- Capture main menu with fresh, mid-progress, and advanced saves.
- Test offline and Steam-connected states.
- Verify no broken external links or placeholder-only actions ship.

## Cross-links
- `REG-009-main-menu-mobile-landscape-density.md`
- `REG-011-meta-screens-reward-value.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
