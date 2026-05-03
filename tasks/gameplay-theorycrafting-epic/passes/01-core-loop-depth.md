# Pass 1: Core Loop Depth

## Status
Completed theory recommendation on 2026-05-03.

## Purpose
Protect memory matching as the primary skill while allowing tactical systems to create pressure, recovery, reward, and build identity.

This pass is intentionally stricter than the expansion passes. Earlier passes were allowed to capture big ideas. Pass 1 decides which ideas still respect the core game after the fantasy is stripped away.

## Current Anchors
- `src/shared/game.ts`
- `src/shared/contracts.ts`
- `src/shared/softlock-fairness.test.ts`
- `src/shared/game.test.ts`
- `src/renderer/components/TileBoard.tsx`
- `docs/BALANCE_NOTES.md`

## Protected Core Loop
The game must still be understandable as:

1. Study the board during memorize.
2. Choose a first card from memory, inference, or risk.
3. Choose a second card from remembered position or tactical read.
4. Resolve the pair as match, miss, special interaction, or objective progress.
5. Apply visible consequences: score, damage, guard, rewards, forfeits, objective updates, and card state changes.
6. Repeat until the floor is complete.
7. Choose the next route/reward with knowledge of what the floor changed.

Any expansion that lets the player skip steps 1-4 without a meaningful cost is a bypass. Any expansion that adds consequences to step 5 without prior warning is unfair. Any expansion that makes step 6 ambiguous is a softlock risk.

## Protected Invariants
| Invariant | Rule |
| --- | --- |
| Memory remains the win condition | The strongest play should come from remembering positions, not spending assists until the board solves itself. |
| The board is the primary surface | Important rules should attach to cards, rows, objectives, routes, or floor identity instead of hidden global state. |
| Every harm has a tell | Traps, taxes, locks, movement, and forfeits must be previewed before they punish the player. |
| Recovery costs something | Peek, shuffle, destroy, undo, gambit, flash, wild, and stray removal need charge/resource/score/perfect-impact costs. |
| Perfect categories stay separate | Perfect floor score can mean no mismatches; Perfect Memory should also care about assist use. Pin remains the main safe exception. |
| Completion is always provable | New cards and powers must define board-complete, destroy, shuffle, peek, stray, wild, route, and contract interactions. |
| Timing is readable | Memorize, flip, resolving, and floor-clear moments should not stack unrelated effects that compete for attention. |

## Phase Hook Matrix
| Phase | Allowed Hooks | Warning Required | Forbidden Hooks |
| --- | --- | --- | --- |
| Pre-memorize / floor intro | Objective preview, route promise, major pressure tell, boss/floor identity, static rule reminder. | Short memorize, silhouette, trap-heavy floor, parasite, finale target rules. | Hidden rule changes that only reveal after damage or score loss. |
| Memorize | Card layout, readable backs, fair animation, optional static hints, countdown, floor objective. | Moving/shuffling effects, temporary reveal aids, obscured labels. | Stutter, random movement, late asset loading, or effects that steal study time without compensation. |
| First flip | Card reveal, family/state tell, pin/peek-informed choice, one-card utility reveal. | Omen, mimic possibility, armed trap state, lock/key prompt. | Immediate punishment from a previously unknowable card. |
| Second flip | Match attempt, intentional risk, target objective, utility pair activation. | Destroy/forfeit preview, wild substitution, gambit availability. | Forced second-card changes after the player commits unless the rule was previewed. |
| Resolving | Match/miss delay, score floater, guard/life change, trap/enemy response, undo/gambit strip. | Any assist that changes outcome, any chain or auto-resolve effect. | Multiple unrelated reward/damage/state changes with no clear cause order. |
| Active play between turns | Core dock powers, contextual card prompts, pins, warnings, objective progress. | Full/row shuffle, destroy, stray remove, peek, flash. | Passive effects that silently solve, move, remove, or tax cards. |
| Floor complete | Perfect/mistake/power summary, objective result, route cards, rewards, forfeits, next-floor prep. | Power blocked Perfect Memory, missed bounty/cache/objective, resource conversion. | Reward changes that cannot be traced to visible floor decisions. |
| Between floors | Relic draft, shop, route, wager, recovery, build explanation. | Contracts, debt, route risk, future-floor pressure. | New permanent rules without preview, Codex copy, or deterministic save state. |

## Detailed Memory-Tax Rubric
Use this rubric before a theory item becomes an implementation task. Score each axis from 0 to 3.

| Axis | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Information bypass | No extra identity info; only marks player intent. | Reveals family/category or validates one suspicion. | Reveals exact card/pair with a charge or narrow timing. | Solves broad board state or repeatedly reveals exact answers. |
| Spatial disruption | Does not move cards. | Moves a constrained, previewed row/region. | Moves multiple hidden cards with strong animation and reminders. | Randomly moves hidden cards or invalidates memory without persistent tell. |
| Mistake recovery | No correction; player owns the flip. | Prevents damage or softens loss with visible resource. | Reverses or replaces a bad choice with cost. | Lets mistakes disappear often enough that flips stop mattering. |
| Hidden punishment | No penalty or fully visible penalty. | Penalty is route/floor-told but card-specific detail appears on reveal. | Penalty depends on hidden state but has strong counterplay. | Player is punished for information they could not know. |
| Board-completion risk | Normal pair/completion behavior. | Singleton or utility card has simple fallback. | Alters/removes/protects cards and needs dedicated tests. | Can duplicate, rewind, seal, transform, or chain without complete rules. |
| UI comprehension load | Uses existing token and surface. | Adds one new reminder or target preview. | Adds multiple states that need HUD/card/modal support. | Requires players to track hidden timers, chains, or exceptions manually. |

### Tax Bands
| Total | Meaning | Action |
| --- | --- | --- |
| 0-4 | Core-safe | Can move toward normal task breakdown if it also has tests and UI copy. |
| 5-8 | Controlled assist or pressure | Needs explicit cost, preview, Perfect Memory impact, and focused tests. |
| 9-12 | Prototype only | Keep behind sandbox floors or dev fixtures until playtested. |
| 13+ | Reject or defer | Preserve the idea only as a boundary unless redesigned around fair memory. |

Any single `3` on hidden punishment or board-completion risk blocks shipping until redesigned.

## Mechanic Classification
| Class | Definition | Examples | Rule |
| --- | --- | --- | --- |
| Skill test | Asks the player to remember, infer, sequence, or prioritize. | Flip par, cursed last, Omen marker, target bounty, cache preservation. | Best class for expansion; must remain fair and readable. |
| Tool | Helps the player express a plan or manage pressure without solving the board. | Pin, row preview, Scout Room family label, guard shrine timing. | Good when it changes decisions and has clear limits. |
| Bailout | Recovers from uncertainty, overload, or a bad flip. | Peek, shuffle, destroy, stray remove, undo, gambit, flash, wild. | Allowed with charge/cost, forfeit copy, and Perfect Memory impact. |
| Bypass | Removes the need to remember or creates unknowable punishment. | Random swap, permanent blind, invisible trap, infinite copy, broad auto-solve. | Reject for now, or redesign as a narrow tool with strong cost. |

## Strict Review Of Earlier Passes
### Actions
The Pass 3 core dock survives, but each power must carry its memory tax on the surface.

- Pin is core-safe because it records player knowledge instead of revealing truth.
- Peek is a controlled bailout; keep exact reveals scarce and marked as assist use.
- Full shuffle is high spatial disruption; use as recovery, not a normal optimization loop.
- Row shuffle is better than full shuffle when row scope and animation are clear.
- Destroy is a bailout with reward forfeit; uncapped charges need economy pressure so the player cannot erase too much board value.
- Stray remove is allowed when eligibility is narrow and invalid targets explain why.
- Undo, gambit, flash, and wild are contextual bailouts; keep them out of the permanent dock unless a mode is built around them.

### Cards
The Pass 4 safe suite mostly survives strict review.

- Disarm Bounty, Guard Shrine Pair, Scout Room, Cache Lock, Trap Workshop Room, and Boss Trophy Cache remain candidate vertical slices.
- Mimic Cache and Omen Pair remain prototype-only; they need route/floor tells and persistent state reminders.
- Anchor Seal, Catalyst Altar, Loaded Gateway, Pin Lattice, and Parasite Vessel remain prototype-only because they add build decisions but need focused economy and UI tests.
- Time Loop, Mirror, Gravity Row, Living Door, Relic Echo, Shop Debt, Fog Bank, and Chain Reactor stay deferred; most score high on board-completion risk or UI load.
- Invisible Trap, Random Card Swap, Permanent Blind Card, Mandatory Sacrifice Exit, Infinite Copy Mirror, and Silent Score Tax remain rejected boundaries.

### Floors
Pass 6's encounter grammar is compatible with the core loop if each floor uses restraint.

- One primary pressure and one primary reward is the default.
- Boss/finale floors may stack a second pressure, but need pre-floor tell and post-floor causality.
- Treasure floors must show destroy, mismatch, exit, and key/lock forfeits before commitment.
- Mystery route should mean learnable uncertainty, not hidden random punishment.
- Trap and parasite floors should make state changes persistent enough that players can reason after animation ends.

### Feedback
Pass 7 tokens are now a gate, not flavor text. Every new mechanic needs a token plan for:

- Preview before commitment.
- Reminder while relevant.
- Success state.
- Failure or forfeit state.
- Floor-clear causality.
- Accessibility equivalent.

## Task-Readiness Gate
A future implementation task can graduate from this theory pack only if it answers:

- What memory decision does it create or protect?
- Which phase hooks does it use?
- What is its detailed memory-tax score?
- Which Pass 7 tokens does it use?
- What does it cost or forfeit?
- Does it lock Perfect Memory?
- How does it interact with destroy, shuffle, peek, stray, wild, contracts, and route cards?
- How does `inspectBoardFairness` or a focused unit test prove it cannot softlock?
- What does the player see when it succeeds, fails, or is no longer available?

## Output
Pass 1 completes the theory loop with a strict protection doctrine. The epic can now move into task conversion: each future card, action, floor, relic, or UI task should carry a memory-tax score and use this pass as the rejection gate.
