# FBL-002: Floor-clear causality summaries

## Status
Done

## Priority
P0

## Source Theory
- Pass 6: floor identity feedback needs.
- Pass 7: floor-clear surface contract.

## Player Decision
Help players understand what the floor changed, what they gained or lost, and what the next choice means.

## Current System Connection
- Floor result modal.
- Route choice cards.
- Objective result summaries.
- Reward and forfeit records.

## Proposed Behavior
Refine floor-clear summaries into cause/result groups: performance, objectives, assists used, rewards gained, rewards forfeited, build triggers, and next-route implications.

## UI / Visual / Audio
Use compact rows with tokens and consistent close/continue placement. Avoid long tutorial copy.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 0, UI load 2. Total 2.

## Risks
If floor clear hides causes, players cannot connect decisions to route, reward, or build outcomes.

## Acceptance Criteria
- Floor clear names missed objective/reward causes.
- Assist usage and Perfect Memory impact are visible.
- Route choices show why they are safe, greedy, or uncertain.

## Verification
- Added `src/shared/level-result-presentation.ts` for grouped floor-clear causality rows.
- Floor-clear modal now renders performance, objective, assist, reward, and route cause/result rows with mechanic token data attributes.
- `yarn test src/shared/level-result-presentation.test.ts`
- `yarn test src/renderer/components/GameScreen.test.tsx`
- `yarn typecheck`

## Cross-links
- `../../passes/06-floor-and-encounter-identity.md`
- `../../passes/07-ui-and-feedback-language.md`
