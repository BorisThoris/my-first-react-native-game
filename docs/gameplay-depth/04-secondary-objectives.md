# Secondary objectives (beyond clear the board)

## Problem

“Match every pair” is a single win condition. Long runs can feel like **grind** if the only variation is pair count and mutator intensity. **Secondary objectives** add a second axis: players optimize two things at once, which creates stories (“I cleared with the cursed pair last”) and rewards mastery without replacing the core loop.

## Research backbone

### Optional goals pattern (game design language)

The *Optional Goals* pattern states that reaching such a goal **does not advance** the primary goal, but may help **indirectly**—by changing game state or letting the player practice a skill ([VU pattern library — Optional Goals](https://www.cs.vu.nl/~eliens/design/media/pattern-optionalgoals.html)). It warns to check whether a goal is truly optional or secretly a prerequisite, and notes optional goals can become **red herrings** if they distract without helping.

**Translation:** secondary objectives in this memory game should either (a) **reinforce matching skill** (flip budget, order discipline) or (b) offer **opt-in score/meta rewards** that do not split attention toward unrelated tasks.

### Empirical caution: “harmful” secondaries

University of Washington / FDG 2011 work ([On the Harmfulness of Secondary Game Objectives](https://grail.cs.washington.edu/projects/game-abtesting/fdg2011/)) reports large-scale A/B results where **some** secondary objectives reduced play time for many players, while helping retention for others—suggesting heterogeneity, not a universal “more objectives = better.” The project summary emphasizes aligning secondaries so they **support the primary goal** rather than distract from it ([game A/B testing project](http://grail.cs.washington.edu/projects/game-abtesting/)).

**Design takeaway for this repo**

- Prefer **orthogonal bonuses** that still require clearing the board the same way (e.g. match order, cursed-last, no-destroy bonus).
- Be careful with objectives that encourage **stalling** or **non-matching** behaviors unless that is a deliberate mode.
- Anything that looks optional but is required for meta progression reads as **false optional**—players burn trust.

### Supporting goals vs distracting goals

The same pattern library relates optional goals to **supporting goals** and **hierarchy of goals** ([Optional Goals — relations](https://www.cs.vu.nl/~eliens/design/media/pattern-optionalgoals.html)). A supporting secondary makes the primary win **more likely** or rewards executing it *better* (higher score, cleaner line). A distracting secondary asks the player to hold a **separate** optimization in working memory while matching—fine for veterans, harsh for learners.

**Scaffold suggestion:** tie secondaries to **teach / test / twist** (see doc 01)—introduce one bonus type per chapter, not five at once.

## Design constraints

- **Still completable** — no unwinnable gen; respect softlock matrix (`RELIC_SYNERGY_PLAYTEST.md`).  
- **Readable** — one short HUD line + pre-floor modal for new players.  
- **Optional or tiered rewards** — bonus score / shard / cosmetic streak vs hard gate (hard gates frustrate casual endless).  
- **Deterministic for daily** — if objective affects layout or scoring, it must derive from `runSeed` + level (same as tiles).

## Objective families

### 1. Match order

**Rule:** Some pairs must be matched **before** others, or in **groups**.

Examples:

- **Priority pairs** — match all “marked” pairs before any other (marks shown only in memorize phase, or subtle frame).  
- **Sequence** — pair A before B before C (heavy UI; better as occasional **boss** floor).

**State needs:** ordered list of `pairKey`s or tile tags; validation on match resolution in `game.ts`.

**Risk:** Frustration if player forgets order; mitigate with **memorize-only checklist** or pin interaction.

### 2. Avoidance (“cursed” pair)

**Rule:** A specific pair must **not** be matched until last, or matching it early **costs** (life, score, parasite tick).

Examples:

- **Cursed last** — matching the cursed pair before all others fails bonus (not run).  
- **Cursed early penalty** — allowed but triggers `glass_floor`-style event once.

**Fit:** Excellent with narrative flavor; pairs well with `score_parasite` as “you fed the curse.”

### 3. Flip or mismatch budget

**Rule:** Clear within **N** opening flips, or **N** total mismatches allowed for S-rating / bonus life.

Examples:

- **Par flip** — bonus if flips ≤ `pairs * k`.  
- **Clean streak gate** — already adjacent to “clean floor” bonuses in forgiveness design; secondary objective can **raise** the bar for an extra reward.

**State needs:** counters on `RunState` (some already exist in stats paths); careful interaction with peek (does peek increment flips? should be explicit).

### 4. Score threshold under constraint

**Rule:** Reach score S before floor ends, or in first K matches.

**Fit:** Works if scoring is transparent in HUD; avoid obscure formulas.

### 5. Tool restriction objective

**Rule:** Bonus if you clear without shuffle, or without destroy, **even when legal**.

**Fit:** Overlaps contracts but is **opt-in reward** rather than forced scholar mode.

## Where objectives live (implementation sketch)

| Layer | Responsibility |
|-------|----------------|
| `RunState` | `secondaryObjective: null \| { type, params, rewardTier }` for current floor.  
| Generation | When building level `board`, attach objective compatible with pair keys.  
| Resolution | On match/mismatch/advance, evaluate objective; set `LevelResult` fields for UI and achievements.  
| UI | `GameScreen` banner + end-of-floor line (“Bonus: Cursed last ✓”). |

## Examples tied to existing mutators

- `n_back_anchor` + **order** objective — anchor pairs must be cleared in cadence with anchor hints (advanced).  
- `glass_floor` + **avoid decoy match** as explicit bonus — teaches decoy without hard-failing the floor.  
- `short_memorize` + **flip budget** bonus — rewards fast, confident play.

## Reward philosophy

- **Soft reward** (recommended default): bonus score, extra shard progress, flavor text.  
- **Hard reward**: extra relic reroll, bonus life — use sparingly; can invalidate balance.  
- **Achievement-only**: safest for weird objectives.

## Testing checklist

- Objective achievable with **every** legal board instance for that seed.  
- Destroy / wild / undo interactions defined (does destroy bypass “cursed last”?).  
- Daily import: same objective outcome for same payload.  
- Accessibility: color-only marks fail WCAG; use shape + label.

## Open questions

- Are secondary objectives **always on** in endless, or every K floors?  
- Should puzzle mode use **authored** objectives only?  
- Do peek flips **count** toward flip-budget objectives?

## Taxonomy quick reference

| Type | Primary skill stressed | Aligns with primary clear? | Risk |
|------|------------------------|----------------------------|------|
| Match order | Planning / WM | Yes | Forgotten order → frustration |
| Cursed-last | Inhibition / planning | Yes | Feels punitive if UI weak |
| Flip / mismatch budget | Efficiency | Yes | Must define peek/undo/destroy |
| Score threshold | Risk / speed | Mostly | Opaque formulas → extraneous load |
| No-power bonus | Resource discipline | Yes | overlaps contracts—keep one clear rule |

## Further reading

- [Optional Goals pattern — consequences](https://www.cs.vu.nl/~eliens/design/media/pattern-optionalgoals.html) — freedom, replayability, red herrings.
- Andersen et al., FDG 2011 — secondary objectives and player behavior ([project page](https://grail.cs.washington.edu/projects/game-abtesting/fdg2011/)).

**Repo backlog:** concrete tickets **O-01–O-04** → [05-app-specific-idea-backlog.md](./05-app-specific-idea-backlog.md).
