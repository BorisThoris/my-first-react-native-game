# Floor identity and archetypes

## Problem

If every floor feels like “the same rules, more pairs,” difficulty may be fair but **boring**. Players remember **labels** (“the silhouette floor”) more than smooth parameter curves. Identity also helps streamers and friends describe runs without quoting pair counts.

## Research backbone

### Pacing as “beats,” not a straight line

Level design pacing is described as the **order and rhythm** of activities, explicitly calling out **intensity** (when the player pays more attention) versus **rest and recovery** ([The Level Design Book — Pacing](https://book.leveldesignbook.com/process/preproduction/pacing)). Musical analogies are useful:

- **Pulse** — recurring structure (e.g. every floor ends with a clear “you survived” beat).
- **Accent / stress** — some floors deliberately spike (boss / dual mutator).
- **Rest** — weaker beats **between** spikes so accents stay legible (“sensitize audience to accents”).
- **Motif** — short repeating sequence (e.g. Speed → Wide → Breather).
- **Variation** — same motif with different pair bands or symbol sets.

A **set piece** in this vocabulary is a memorable, elaborate beat ([same source](https://book.leveldesignbook.com/process/preproduction/pacing)). For this game, a set piece need not be a cinematic: it can be a **named floor combo** (`glass_floor` + `short_memorize`) with distinct HUD copy and audio sting.

### Tension and release at run scale

Tension is “mental or emotional strain”; release comes from **mechanics** that let the player resolve it ([Game Developer — Tension and release](https://www.gamedeveloper.com/design/addressing-conflict-tension-and-release-in-games)). The article stresses that tension must be managed **below** narrative—moment-to-moment and between encounters. Applied here:

- **Tension sources**: memorize countdown, parasite cadence, sticky index blocking a planned flip, decoy risk, split attention (`distraction_channel` when enabled).
- **Release sources**: successful match cadence, breather floors, earning a shard heal, completing a “cursed” bonus safely.

High-tension moments are **remembered better**—so scripting identity makes runs *story-like* even without plot.

### Cognitive load: rotate *type* of load, not only amount

**Cognitive Load Theory** (Sweller) splits load into **intrinsic** (inherent rule complexity), **extraneous** (bad UX, clutter), and **germane** (effort that builds a useful mental model). Game UX summaries apply this to tutorials and systems ([e.g. cognitive load in game design](https://medium.com/@somogybourizk/game-design-and-cognitive-load-4a6dfaa949f2), [minimizing load in complex UX](https://coreyhobson.com/minimizing-cognitive-load-strategies-for-simplifying-complex-systems-in-game-ux/)).

**Floor identity** is a way to keep **intrinsic** load high enough to be interesting while **varying which subsystem** is taxed:

- `short_memorize` → time pressure / encoding speed.
- `wide_recall` + `category_letters` → semantic + label decoding.
- `n_back_anchor` → **updating working memory** over a sequence (cognate to [n-back tasks](https://en.wikipedia.org/wiki/N-back), which continuously compare current stimuli to prior positions in a stream—your anchor rule is a *game-native* variant, not a lab protocol).

If every floor increases **only** pair count, you mostly stack the **same** intrinsic load. Rotating mutator *families* swaps the “shape” of attention.

### Teach → test → twist (Portal-style) on a run

The same pacing chapter describes **teach, test, twist**: introduce a skill, verify it, then reframe with less prompting ([Level Design Book](https://book.leveldesignbook.com/process/preproduction/pacing)). Map to endless:

| Phase | Memory-game translation |
|-------|-------------------------|
| **Teach** | Early floors with **one** mutator at a time; generous memorize; FTUE copy ties mutator name to player action. |
| **Test** | Repeat that mutator with tighter timer or more pairs **before** adding a second mutator. |
| **Twist** | Combine mutators into a named archetype (“Reading room” = `wide_recall` + `category_letters`) or add a secondary objective (see doc 04). |

This avoids dumping the full ruleset at once—a common source of **extraneous** load.

## Design goal

Each floor (or short **segment** of floors) should telegraph **which skill is primary**:

- **Speed memorize** — time-to-study is the boss; recall in play is normal.
- **Spatial / wide recall** — board footprint or label-first reads dominate (`wide_recall` already pushes label-first presentation per `MUTATORS.md`).
- **Sequential / working memory** — cadence and “what was the anchor?” (`n_back_anchor`).
- **Low information** — harder visual discrimination (`silhouette_twist`, or future partial-reveal rules).
- **Breather** — fewer mutators, gentler timer decay, or smaller pair delta so the player recovers attention.

Pair count can still rise **across a chapter**, but within a chapter you **rotate identity** so the curve is lumpy on purpose.

## Mapping shipped mutators to archetypes

Current `MutatorId` values (`contracts.ts`) and rough archetype fit:

| Archetype | Strong mutator hooks | Notes |
|-----------|----------------------|--------|
| Speed memorize | `short_memorize` | Obvious; stack with timer decay carefully (floor `MEMORIZE_DECAY_EVERY_N_LEVELS` already decouples pairs vs timer a bit). |
| Spatial / wide recall | `wide_recall` | Presentation-heavy; identity is clear if HUD names the floor. |
| Sequential pressure | `n_back_anchor` | Every-two-matches anchor cadence is already a distinct cognitive load. |
| Low information | `silhouette_twist` | Visual read difficulty; pairs with art direction. |
| Board friction | `sticky_fingers` | Changes **flip planning**, not just memory; good “spice” on non-breather floors. |
| Risk / economy | `score_parasite`, `glass_floor` | Tension layers; use when you want “this floor hurts if you autopilot.” |
| Set diversity | `category_letters` | Changes symbol space; distinct **content** identity. |
| Optional noise | `distraction_channel` | Settings-gated; use as opt-in identity for dailies or challenges. |

Breather floors are often defined by **absence**: e.g. only one mild mutator, or mutators that do not stack time pressure (`short_memorize` off, parasite off).

## Cadence patterns (theory)

These are pacing templates, not prescriptions:

1. **Rotate three identities, then breather**  
   Example cycle: Speed → Spatial → Low-info → Breather (repeat with different pair band).

2. **Spike then valley**  
   After a floor with `short_memorize` + `sticky_fingers`, follow with a breather or single-mutator floor so the player feels relief **by design**, not only by luck.

3. **Boss floor**  
   One floor per “tier” with **named combo** (declared in UI): e.g. “Glass + Short memorize” as a set piece. Players remember the combo name.

4. **Daily as single-identity**  
   Daily already picks one mutator from `DAILY_MUTATOR_TABLE` (`mutators.ts`). That run **is** that identity; endless can be more varied.

## Implementation directions (code-shaped)

Today, `activeMutators` is largely set at run creation (`game.ts` paths for daily vs payload). To script archetypes for **endless**:

1. **Floor → mutator set function**  
   Deterministic function of `(runSeed, level)` (or segment index) that returns `MutatorId[]`, instead of “all mutators on” or a single global list.

2. **Archetype table**  
   Small data file: `{ archetypeId, mutatorIds[], minLevel, maxLevel?, weight }` chosen by RNG seeded per run.

3. **HUD contract**  
   One string line: “Floor theme: Silhouette” sourced from archetype id so identity is **visible** without reading mutator tooltips.

4. **Tests**  
   Property tests: breather floors never combine two “hard timer” mutators; boss floors always pass softlock matrix from `RELIC_SYNERGY_PLAYTEST.md`.

## Risks

- **Learability**: too many unique combos early → cognitive overload. Front-load **single-mutator** identities; add pairs of mutators after floor N.
- **Balance**: identity shifts can feel unfair if pair count jumps on the same floor as a new mutator. Stagger **either** pair growth **or** new mutator introduction.
- **Accessibility**: `silhouette_twist` + `short_memorize` may be brutal; keep settings / reduce motion / optional assists in mind.

## Open questions

- Should archetype be **player-visible** always, or only after floor 1 tutorial?
- Do puzzle / gauntlet modes ignore archetype tables and use authored levels only?

## Practical tooling (design ops)

- **Intensity plot (paper is fine)** — Y axis: subjective 0–5 “cognitive intensity”; X axis: floor index. Plot pair count, mutator count, and `short_memorize` as separate lines. Aim for **rest** dips after spikes ([pacing graphs](https://book.leveldesignbook.com/process/preproduction/pacing)).
- **Beat sheet per chapter** — One row per floor: `archetypeName`, `mutatorIds[]`, `pairCount`, `notes` (“breather”, “boss”, “twist”).
- **“Pile of beats” prototype** — Author 10–20 standalone floor configs in a spreadsheet; playtest in isolation; **then** sequence them (same workflow recommended for puzzle games in the Level Design Book).

## Further reading

- [Portal test-chamber teach/test examples](https://book.leveldesignbook.com/process/preproduction/pacing) (embedded in pacing chapter).
- [Game Optimization through Large-Scale Experimentation](http://grail.cs.washington.edu/projects/game-abtesting/) (UW) — if you later A/B archetype visibility or breather cadence.

**Repo backlog:** concrete tickets **F-01–F-03**, **M-*** → [05-app-specific-idea-backlog.md](./05-app-specific-idea-backlog.md).
