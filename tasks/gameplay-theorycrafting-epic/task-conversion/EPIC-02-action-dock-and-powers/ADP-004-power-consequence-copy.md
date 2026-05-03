# ADP-004: Power consequence copy

## Status
Planned

## Priority
P1

## Source Theory
- Pass 3: Perfect-impact language.
- Pass 7: feedback language.

## Player Decision
Make the cost of pressing each power honest before the player commits.

## Current System Connection
- Power tooltips.
- Floor-clear summaries.
- Mechanics encyclopedia.
- Settings/help overlays.

## Proposed Behavior
Standardize short consequence copy for every active power: cost, target, immediate result, forfeit, and Perfect Memory impact.

## UI / Visual / Audio
Button tooltip, teaching panel, floor-clear blocker label, and Codex copy should use the same terms.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 0, UI load 1. Total 1.

## Risks
Inconsistent copy makes powers feel arbitrary and hides why achievements or rewards were lost.

## Acceptance Criteria
- Each core power has canonical one-line copy.
- Floor-clear can name assist blockers.
- Destroy/shuffle copy names reward/spatial consequences.

## Verification
- Snapshot or unit tests for generated action labels where available.
- Manual copy review against Pass 7 tokens.

## Cross-links
- `../../passes/03-powers-and-action-buttons.md`
- `../../passes/07-ui-and-feedback-language.md`

