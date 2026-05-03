# FBL-003: Accessibility mechanic parity

## Status
Done

## Priority
P0

## Source Theory
- Pass 7: a11y rules.
- Pass 1: every harm has a tell.

## Player Decision
Ensure important mechanic state is available without relying only on animation, color, or fast visual changes.

## Current System Connection
- Card labels.
- Live regions.
- Focus states.
- Reduced-motion settings.
- Tooltips and Codex/help copy.

## Proposed Behavior
For every tokenized mechanic state, define a non-visual equivalent: label text, focus announcement, persistent reminder, reduced-motion substitute, or floor-clear summary.

## UI / Visual / Audio
Screen reader labels should state family, state, cost, locked reason, and result when relevant. Reduced-motion should preserve timing meaning with static indicators.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 0, UI load 2. Total 2.

## Risks
Hazards and moving/temporary effects become unfair if only sighted, motion-enabled players can read them.

## Acceptance Criteria
- Armed, Locked, Hidden-known, Forfeit, and Objective states have text/a11y equivalents.
- Reduced-motion users can understand shuffle/memorize/resolve state.
- Modal and contextual action focus behavior is predictable.

## Verification
- Focused tile announcements now include non-visual target state for destroy, peek, and stray powers.
- Gambit opportunity strip now uses `role="status"` and `aria-live="polite"`.
- Semantic token definitions include a11y hints for all token families.
- `yarn typecheck`

## Cross-links
- `../../passes/07-ui-and-feedback-language.md`
