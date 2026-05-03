# FEI-001: Floor intro and reminder contract

## Status
Planned

## Priority
P0

## Source Theory
- Pass 6: encounter grammar.
- Pass 1: pre-memorize and active-play phase hooks.

## Player Decision
Understand the floor's main pressure, reward, and counterplay before the board starts.

## Current System Connection
- Floor mutator schedule.
- Run map node kinds.
- Objective and route preview UI.

## Proposed Behavior
Each floor identity should expose one teaching sentence and one counterplay sentence, plus compact in-play reminders for major pressure and objective state.

## UI / Visual / Audio
Use Objective, Risk, Reward, Hidden-known, and Safe tokens. Reduced-motion users need static reminders.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 0, UI load 2. Total 2.

## Risks
Floor identity becomes invisible if rules are only learned after damage or reward loss.

## Acceptance Criteria
- Floor intro names primary pressure and player answer.
- In-play HUD/reminder shows objective and major pressure.
- Boss/elite/trap floors have stronger warning than baseline combat floors.

## Verification
- Visual snapshots for at least baseline, trap, treasure, boss, and parasite floors.
- Copy review against encounter grammar.

## Cross-links
- `../../passes/06-floor-and-encounter-identity.md`

