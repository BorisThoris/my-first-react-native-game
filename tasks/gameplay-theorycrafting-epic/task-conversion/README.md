# Gameplay Theory Task Conversion

## Status
Ready backlog generated from completed theory passes.

## Purpose
This folder converts the gameplay theorycrafting epic into implementation-ready task groups. These are still planning artifacts: each task names the player decision, current-system hook, UI requirements, memory-tax gate, risks, and verification path before code work begins.

## Implementation Order
| Order | Epic | Why First |
| --- | --- | --- |
| 1 | `EPIC-01-core-loop-gates` | Creates the review gates every later mechanic must pass. |
| 2 | `EPIC-03-feedback-language` | Gives shared UI/copy/a11y language before adding mechanics. |
| 3 | `EPIC-02-action-dock-and-powers` | Makes existing actions clearer before expanding cards. |
| 4 | `EPIC-04-safe-card-suite` | Adds low-risk card decisions using existing families. |
| 5 | `EPIC-05-floor-and-encounter-identity` | Places card/action work into authored floor slices. |
| 6 | `EPIC-06-archetypes-and-relic-meaning` | Makes builds readable after core verbs and cards have surfaces. |
| 7 | `EPIC-07-prototype-sandbox` | Tests high-fantasy ideas behind controlled fixtures only. |

## Graduation Rules
- A task cannot become code work unless it has a memory-tax score, UI/a11y plan, acceptance criteria, and test path.
- Prototype tasks cannot ship to normal runs until promoted by playtest and softlock/fairness review.
- Rejected or deferred ideas stay as boundaries unless a future theory pass rewrites them.
- Keep tasks small enough for one vertical slice: shared rules, UI feedback, copy/a11y, and tests.

## Cross-links
- `../passes/01-core-loop-depth.md`
- `../passes/03-powers-and-action-buttons.md`
- `../passes/04-card-type-expansion.md`
- `../passes/05-build-archetypes.md`
- `../passes/06-floor-and-encounter-identity.md`
- `../passes/07-ui-and-feedback-language.md`
- `../passes/08-expansion-backlog-seeds.md`

