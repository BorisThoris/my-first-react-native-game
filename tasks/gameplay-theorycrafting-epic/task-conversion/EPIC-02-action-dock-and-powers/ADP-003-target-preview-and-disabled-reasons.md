# ADP-003: Target preview and disabled reasons

## Status
In Progress

## Priority
P0

## Source Theory
- Pass 3: target preview rules.
- Pass 7: Cost, Forfeit, Locked, Hidden-known tokens.

## Player Decision
Show what an armed power can target before the player spends it.

## Current System Connection
- Destroy eligible hidden pairs.
- Peek target rules.
- Row shuffle row selection.
- Stray remove eligibility.
- Card prompts for shop, exit, room, lever, key, and lock.

## Proposed Behavior
When a targetable action is armed or hovered/focused, preview valid targets and explain invalid targets. Destroy must preview reward forfeits. Peek must preview information scope. Row shuffle must preview affected row and cost/free state.

## UI / Visual / Audio
Use board highlights, concise disabled reasons, keyboard focus states, and screen reader labels. Do not rely on color alone.

## Memory-Tax Score
Information bypass 1, spatial disruption 1, mistake recovery 1, hidden punishment 0, board-completion risk 1, UI load 2. Total 6.

## Risks
Target previews can become accidental solver overlays if they reveal too much exact identity.

## Acceptance Criteria
- Every armed/structured target action has a valid-target preview.
- Every invalid target has a short reason.
- Destroy shows forfeited score/reward/pickup value where applicable.
- Preview does not reveal exact hidden card identity unless the power explicitly does.

## Verification
- Existing board highlights remain wired through destroy/peek/stray eligible target sets.
- Focused tile announcements now include valid/invalid target state and consequence copy for destroy, peek, and stray.
- `yarn typecheck`

## Cross-links
- `../../passes/03-powers-and-action-buttons.md`
