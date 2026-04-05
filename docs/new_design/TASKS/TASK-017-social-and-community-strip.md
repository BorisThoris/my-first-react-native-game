# Task 017: Social and Community Strip

## Status
Done (explicit deferral; no in-app strip)

## Implementation notes
- **Audit finding:** Reference may include community/social affordances; live app has no equivalent. Gap analysis classifies as missing screen or external-link feature.
- **Relationship:** Optional v1+; default outcome may be **document as out of product scope**.
- **Resolution:** Documented under **Profile / social strips** in `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`. Add links only if product approves storefront/community URLs.

## Priority
Low

## Objective
Decide product scope: add a lightweight strip (Discord, wishlist, patch notes) with external links, or explicitly document “not in Steam demo” and ensure audits do not treat it as a bug.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
- `src/renderer/components/MainMenu.tsx` (if links land here)

## Affected Areas
- `MainMenu.tsx` or footer region
- Optional `desktopClient` or shell-safe `openExternal` pattern for Electron

## Dependencies
- Legal/comms approval for URLs and copy
- Steam demo positioning

## Implementation Outcomes
- Either implemented link row with telemetry-safe URLs or documented deferral in gap README.

## Acceptance Criteria
- If implemented: links open in system browser (or Steam overlay) and are keyboard accessible.
- If deferred: single authoritative doc sentence so UI audit stops flagging it.

## Out of Scope
- In-app social feed or chat
