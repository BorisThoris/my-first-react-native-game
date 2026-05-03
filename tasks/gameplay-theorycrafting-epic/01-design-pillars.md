# Design Pillars

## 1. Memory First, Tactics Second
The player should win because they remember and infer. Tactical systems should create prioritization, risk, and recovery, not replace memory with button spam.

Design test: if a mechanic lets players ignore remembering card positions, it needs a cost, limit, or mode-specific justification.

## 2. Every Mechanic Must Be Seen Before It Hurts
Hazards, talents, traits, mutators, and objectives must be previewable through card visuals, HUD state, Codex copy, or floor intro language.

Design test: the first time a player loses value to a system, they should be able to say "I saw that coming" after reading the UI.

## 3. Builds Should Change Decisions
Relics and future talents should alter decisions during a floor, route choice, or draft. Pure numeric bumps are allowed only when they support an identity.

Design test: a build item should change at least one of: what the player flips first, what they save, which route they take, which risk they accept, or how they recover.

## 4. Cards Are the Main Game Object
Most new mechanics should attach to cards, pairs, rows, rooms, or floors rather than hidden global modifiers. The board is the primary surface.

Design test: if a rule cannot be represented on or around the board, it needs extra justification.

## 5. Powers Need Cost Honesty
Actions like destroy, peek, shuffle, undo, and gambit should show charge count, consequence, target validity, and perfect-run impact.

Design test: a player should know whether pressing a button spends a charge, arms a mode, breaks perfect, or changes score before they press it.

## 6. Expansion Must Preserve Softlock Safety
Every new card type, talent, trait, or action needs completion rules, failure modes, save/replay determinism, and fairness inspection.

Design test: a bot should be able to generate or simulate a floor and prove it can still end.

## 7. Terminology Must Become Stable
"Talent", "trait", "relic", "mutator", "contract", "power", "findable", and "card type" must not overlap casually.

Working definitions for theory:

- **Talent**: a player-chosen persistent or class-like rule that shapes future runs.
- **Trait**: an inherent modifier attached to a run, character, floor, card, or item.
- **Relic**: a run-scoped draft reward.
- **Mutator**: a run/floor pressure rule, often mode or schedule driven.
- **Contract**: a voluntary constraint with reward or identity.
- **Power**: an explicit player action.
- **Card type**: a board object family with rules and visual language.

