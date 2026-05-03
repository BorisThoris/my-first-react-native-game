# ADP-001: Core dock grouping

## Status
Done

## Priority
P0

## Source Theory
- Pass 3: core dock plus contextual actions.
- Pass 1: action assists need cost honesty.

## Player Decision
Let players quickly choose repeatable active-play verbs without mistaking rare/contextual actions for always-available powers.

## Current System Connection
- `GameLeftToolbar`
- `power-verbs`
- Pin, peek, full shuffle, row shuffle, destroy, and stray remove.

## Proposed Behavior
Group only repeatable active-play verbs in the main dock. Keep pin, peek, shuffle, row shuffle, destroy, and stray remove as dock candidates. Do not promote undo, gambit, shop, exit, room, route, relic, guard, Favor, keys, or passive triggers into permanent dock buttons.

## UI / Visual / Audio
Use icon-first controls with consistent charge badges, armed states, invalid states, and tooltips. Avoid adding explanatory text blocks inside the play surface.

## Memory-Tax Score
Information bypass 1, spatial disruption 1, mistake recovery 1, hidden punishment 0, board-completion risk 1, UI load 2. Total 6.

## Risks
Too many permanent buttons makes the play screen feel like a command panel instead of a memory board.

## Acceptance Criteria
- Dock contains only core active-play verbs.
- Each button shows count/free state/disabled state.
- Armed actions are visually distinct from immediate actions.
- Mobile layout remains usable without crowding the board.

## Verification
- `GameLeftToolbar` continues to keep permanent dock actions scoped to core active-play verbs.
- Toolbar titles and teaching rows now use `src/shared/power-verbs.ts` for cost, consequence, Perfect Memory impact, and memory-tax metadata.
- `yarn typecheck`
- `yarn test src/shared/power-verbs.test.ts`

## Cross-links
- `../../passes/03-powers-and-action-buttons.md`
