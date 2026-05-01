# DNG-060: Dungeon HUD information architecture

## Status
Done

## Priority
P0

## Subsystem
Presentation, audio, UX

## Depends on
- `DNG-024`
- `DNG-033`

## Current repo context
HUD chips and dungeon presentation selectors exist.

## Problem
As dungeon systems deepen, the HUD can become crowded or fail to show the most urgent information.

## Target experience
The HUD prioritizes objective, danger, lives/guard, route/floor identity, and actionable prompts without covering the board.

## Implementation notes
- Define priority order for dungeon chips and alerts.
- Collapse low-priority details into Codex/help or hover/focus copy.
- Keep mobile layout within existing responsive constraints.

## Acceptance criteria
- Critical dungeon state is visible during play.
- HUD does not duplicate every card rule.
- Mobile and desktop states are readable.

## Tests and verification
- Renderer tests for chip ordering.
- Mobile screenshot smoke where available.

## Risks and edge cases
- Risk: alert fatigue. Mitigation: only one primary alert line at a time.

## Cross-links
- `../../refined-experience-gaps/REG-106-hud-final-information-architecture.md`
- `DNG-064`

## Future handoff notes
Dungeon HUD presentation now sorts and caps status chips by urgency, keeps one primary alert line, and exposes chip priority to renderer tests. Future UI work should preserve the objective/danger/exit/boss/key/utility priority contract instead of adding uncapped HUD rows.
