# Gameplay depth notes

Design deep dives for keeping runs memorable when pair count is not the only axis of difficulty. These documents are **speculation + implementation hints**: they align with shipped systems in `src/shared/contracts.ts`, `game.ts`, `mutators.ts`, and `relics.ts`.

## Contents

| Doc | Topic |
|-----|--------|
| [01-floor-identity-and-archetypes.md](./01-floor-identity-and-archetypes.md) | Scripting “floor identity” (speed / spatial / n-back / silhouette / breather) instead of smooth all-at-once scaling. |
| [02-helper-tiers-and-cognitive-jobs.md](./02-helper-tiers-and-cognitive-jobs.md) | Grouping powers by **Recall / Search / Damage control** and making button presses feel like visible saves or gambles. |
| [03-mutators-as-spine-relics-as-build.md](./03-mutators-as-spine-relics-as-build.md) | Mutators as the main character of each run; relics and contracts as build-defining synergies and tradeoffs. |
| [04-secondary-objectives.md](./04-secondary-objectives.md) | Objectives beyond “clear the board”: order, avoidance, flip budgets, score gates. |
| [05-app-specific-idea-backlog.md](./05-app-specific-idea-backlog.md) | **Actionable backlog**: concrete features (IDs, files, rules, risks) mapped to this repo. |
| [FINDABLES.md](../FINDABLES.md) | **Findables v1**: mutator-gated bonus pickups on pairs; tasks [`GP-FINDABLES`](../gameplay-tasks/GP-FINDABLES.md). |

**Implementation tasks** (separate from `new_design/TASKS`): [`docs/gameplay-tasks/`](../gameplay-tasks/README.md).

## Related repo docs

- [MUTATORS.md](../MUTATORS.md) — hook matrix and `MutatorId` behavior.
- [RELIC_ROSTER.md](../RELIC_ROSTER.md) — `RelicId` roster and draft flow.
- [RELIC_SYNERGY_PLAYTEST.md](../RELIC_SYNERGY_PLAYTEST.md) — combo sanity checks.
- [GAME_FORGIVENESS_DEEP_DIVE.md](../GAME_FORGIVENESS_DEEP_DIVE.md) — forgiveness vs relic overlap boundaries.
- [research/RESEARCH_LOG.md](../research/RESEARCH_LOG.md) — dated sprint log (question → sources → promote/kill) tied to [05-app-specific-idea-backlog.md](./05-app-specific-idea-backlog.md) **RP-*** items.

## When to bump `GAME_RULES_VERSION`

Any change to **floor generation**, **mutator selection schedule**, **win/lose conditions**, or **scoring semantics** that must not deserialize old saves as “wrong gameplay” should bump `GAME_RULES_VERSION` in `contracts.ts` (see `MUTATORS.md`).

## External references (shared across topics)

These sources informed the deeper sections in each doc. They are **not** prescriptions to copy wholesale; use them as vocabulary and sanity checks.

| Topic | Link | Why it matters here |
|-------|------|---------------------|
| Pacing, beats, rest vs accent | [The Level Design Book — Pacing](https://book.leveldesignbook.com/process/preproduction/pacing) | Formalizes **beats**, **rest**, **set pieces**, **teach / test / twist**, and intensity plotting—directly portable to “floor identity” as beats in a run. |
| Tension and release (gameplay, not just story) | [Addressing Conflict: Tension and Release in Games](https://www.gamedeveloper.com/design/addressing-conflict-tension-and-release-in-games) (Game Developer, 2010) | Argues tension operates at many timescales; players **remember** high-tension peaks—useful for naming boss floors and recovery breathers. |
| Cognitive load / working memory | [Game Design and Cognitive Load](https://medium.com/@somogybourizk/game-design-and-cognitive-load-4a6dfaa949f2) (Medium, Tiago Somogy Bou Rizk); [Minimizing Cognitive Load in Game UX](https://coreyhobson.com/minimizing-cognitive-load-strategies-for-simplifying-complex-systems-in-game-ux/) (Corey Hobson) | Frames **intrinsic vs extraneous vs germane** load—helps decide when a new mutator is “new skill” vs UI noise. |
| N-back and working memory | [N-back (Wikipedia)](https://en.wikipedia.org/wiki/N-back) | Background for what `n_back_anchor` is *evoking* cognitively (sequential comparison / updating WM), even if your rule is not a literal n-back task. |
| Game feel / juice | [Game Feel: The Secret Ingredient](https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient) (Game Developer); Steve Swink — *Game Feel* (2009, book) | Helpers need **feedback contrast** so Recall / Search / Damage reads as different *verbs*. |
| Modifiers and replay depth | [Adding depth and replayability using gameplay modifiers](https://kircode.com/en/post/adding-depth-and-replayability-using-gameplay-modifiers) (Kircode) | Tradeoff modifiers (upside + downside) as a design pattern for mutators and contracts. |
| Item synergy culture | [Everything Stacks With Everything](https://parryeverything.com/2021/12/03/everything-stacks-with-everything-ft-risk-of-rain-binging-of-isaac-etc/) (Parry Everything) | Why players *expect* combinatorial builds in roguelites—and why clarity of stacking rules matters. |
| Optional / secondary goals | [Optional Goals (pattern)](https://www.cs.vu.nl/~eliens/design/media/pattern-optionalgoals.html) (VU pattern library); [On the Harmfulness of Secondary Game Objectives](https://grail.cs.washington.edu/projects/game-abtesting/fdg2011/) (FDG 2011, UW) | Pattern language for non-primary goals; empirical warning that **distracting** secondaries can hurt session length—align bonuses with the core match loop. |
