# FBL-001: Semantic mechanic token system

## Status
Done

## Priority
P0

## Source Theory
- Pass 7: named semantic feedback tokens.

## Player Decision
Let players understand what kind of mechanic they are seeing without relearning visual language every time.

## Current System Connection
- Board card states.
- HUD resource chips.
- Action buttons.
- Floor clear, route, shop, relic draft, Codex, and inventory screens.

## Proposed Behavior
Implement or document a reusable token vocabulary for Safe, Risk, Reward, Armed, Resolved, Hidden-known, Objective, Build, Cost, Forfeit, Locked, and Momentum. Each token needs visual, text, and a11y treatment.

## UI / Visual / Audio
Use consistent icon/color/label treatment across surfaces. Color cannot be the only differentiator.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 0, UI load 2. Total 2.

## Risks
If tokens drift by surface, mechanics become harder to learn as more card families are added.

## Acceptance Criteria
- Token list has stable names and usage rules.
- At least board, HUD, action dock, and floor-clear surfaces have token mappings.
- Future tasks can reference tokens without redefining them.

## Verification
- Added `src/shared/mechanic-feedback.ts` semantic token definitions.
- Dungeon card and power read models now carry mechanic tokens for downstream UI.
- `yarn test src/shared/mechanic-feedback.test.ts`
- `yarn test src/shared/dungeon-cards.test.ts`
- `yarn test src/shared/power-verbs.test.ts`

## Cross-links
- `../../passes/07-ui-and-feedback-language.md`
