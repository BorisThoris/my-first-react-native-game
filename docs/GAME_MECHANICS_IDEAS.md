# Game mechanics ideas (memory / pair-matching)

**Implementation sequencing, charge defaults, edge cases, and engineering phases:** [GAME_MECHANICS_PLAN.md](./GAME_MECHANICS_PLAN.md)

**What successful similar games do (market / delegate research):** [MARKET_SIMILAR_GAMES_RESEARCH.md](./MARKET_SIMILAR_GAMES_RESEARCH.md)

Design reference for adding interest and player agency on top of the core loop: **memorize phase → flip two → match pairs**, with lives and the existing forgiveness economy (grace, guards, combo shards, chain heal, soft streak, bonus memorize after life loss — see `src/shared/game.ts` and [GAME_FORGIVENESS_DEEP_DIVE.md](./GAME_FORGIVENESS_DEEP_DIVE.md)).

---

## Research themes (second pass)

- **Commercial tile / word hybrids** often pair the board with **limited reveals** and **shuffles** when the surface is the main puzzle (e.g. reveal + shuffle as earnable or purchasable helps).
- **Classic Concentration** stays fresh through **rule and layout variants** (one flip per turn, different match rules, messy layouts, two decks) rather than a single flat rule forever — [Concentration (card game)](https://en.wikipedia.org/wiki/Concentration_(card_game)), [variation writeups](https://playpartygame.com/card-games/how-to-play-concentration/).
- **Roguelite puzzles** add depth with **consumable or deck-built abilities** and **modifiers** that change board behavior; the transferable lesson is **charges, cooldowns, and score or life tradeoffs** so power does not erase skill expression.
- **Mahjong solitaire** (different game, similar “stuck on a grid” feeling) normalized **hint**, **shuffle**, and **undo** as standard assists — [Mahjong solitaire](https://en.wikipedia.org/wiki/Mahjong_solitaire).

---

## Research themes (third pass) — more angles

- **Cognitive load**: Learning-product guidance often pushes **one concept per card**, minimal extraneous UI, and high contrast so working memory stays on the task — useful when adding new symbol sets or “busy” tile skins ([spaced repetition / flashcard discipline](https://dev.to/alphashark/spaced-repetition-works-here-is-how-to-build-better-flashcards-1gg5), general memory-match tutorials such as [grid + lock pattern](https://www.bomberbot.com/lessons/vanilla-javascript-tutorial-how-to-build-a-memory-matching-game/)).
- **Picture superiority**: Visual symbols tend to stick better than abstract glyphs alone; mixing **icon + label** (you already have `label`) can be tuned per difficulty — see discussion in memory-training contexts ([picture superiority effect](https://en.wikipedia.org/wiki/Picture_superiority_effect)).
- **N-back adjacent**: [N-back](https://en.wikipedia.org/wiki/N-back) tasks stress *updating* working memory, not just storage. Game hooks inspired by that: **“match to the tile you saw *k* flips ago”** floors, or a **running anchor** symbol that must be included in the next match — high concept, high risk; best as a **mutator**, not core.
- **Roguelite modifier culture**: Games like **RoGlass** ship **named challenge modes** (low score, adjacency rules, RNG-heavy rulesets) as replay hooks — [PCGamesN on RoGlass](https://www.pcgamesn.com/roglass/steam-demo), [Infinite Start update notes](https://infinitestart.com/2025/02/roglass-updates-the-game-with-more-stuff/). Same pattern for you: **daily seed + one mutator** without new art.
- **Match-genre twists**: Commercial twists include **speed / silhouette** focus ([Twist & Match](https://www.nintendo.com/games/detail/twist-and-match-switch)), **theme + atmosphere** as the differentiator ([Twisted Pairs](https://yancharkin.itch.io/twisted-pairs)), and **versus / attack pressure** ([Re;MATCH](https://www.kickstarter.com/projects/brotherminggames/rematch)) — not all fit a chill memory run, but **timed gauntlet** or **ghost score** are lighter versions.
- **Fixed puzzles**: Hearthstone’s **Puzzle Lab** style ([overview](https://hearthstone.fandom.com/wiki/Puzzle_Lab)) is “known board + win condition” (lethal, mirror, clear) — you could ship **hand-crafted floors** with **no RNG** as a separate mode for content creators.

---

## Cognitive & meta-memory hooks (lightweight → heavy)

| Idea | Pitch | Fit for your loop |
|------|--------|-------------------|
| **Spaced encore** | A symbol that **reappears** on floor N+2 with a tiny **bonus** if matched first try | Meta only; needs tracking across runs in save data |
| **Distraction channel** | Optional **audio pulse** or **peripheral number** that must be ignored (dual-task) | Niche; accessibility conflict — optional mutator only |
| **Category floors** | “Only match **letters** / **numbers**” as a mutator | You already rotate sets every 3 levels — could expose as **player-picked filter** |
| **Atomic pairs** | Ensure each pair is **visually distinct** at a glance (shape + symbol) | Art/UI pipeline, not a new rule |
| **Meditation mode** | No streak rewards; longer memorize; **high score = fewest powers** | Bracket for streamers / chill players |

---

## Modifier & challenge mode ideas (replay without new assets)

- **Glass floor**: One random **decoy** tile (no partner) — flipping it wastes a flip or costs time; **destroy** cannot target it (or costs double).
- **Sticky fingers**: After a **match**, you may **not** flip the **same grid index** next turn (forces new search paths).
- **Wide recall**: Memorize shows **symbols** but play uses **labels only** (or grayscale symbols) — extreme; mutator only.
- **Score parasite**: +multiplier per match but **−1 life** every 4 floors (RoGlass “low score / pressure” [echo](https://infinitestart.com/2025/02/roglass-updates-the-game-with-more-stuff/)).
- **Daily seed**: Same board order for everyone that day; leaderboard on **time** or **moves** (async “versus”).
- **Mirror craft**: Start from a **half-revealed** symmetric pattern — player must **complete symmetry** of matches (puzzle-lab [mirror](https://hearthstone.fandom.com/wiki/Puzzle_Lab) vibe, simplified).

---

## Social, async, and content

- **Ghost run**: Replay another player’s **flip sequence** as a translucent overlay (race or compare).
- **Floor of the week**: One curated `level` + `seed` in JSON; community submits in Discord.
- **Undo once per floor** — classic digital affordance ([Mahjong feature lists](https://en.wikipedia.org/wiki/Mahjong_solitaire)); overlaps forgiveness; if added, **disable streak** for that floor or charge a shard.

---

## Presentation & layout (feel, not new rules)

- **Spaghetti layout**: Scatter tiles in a **loose cloud** with collision bounds instead of strict grid — same rules, harder spatial memory ([Concentration layout variants](https://playpartygame.com/card-games/how-to-play-concentration/)).
- **Breathing grid**: Tiles **slowly drift** 1–2 px (reduce-motion off) — subtle difficulty knob.
- **Focus cone**: Dim tiles outside a **radius** until matched pairs rise — channels attention; strong look.

---

## Board manipulation (high impact)

| Idea | Why it is interesting | Main design risk | Tuning knobs |
|------|------------------------|------------------|--------------|
| **Shuffle remaining tiles** | Breaks a bad spatial pattern; classic “unstick” action; strong player fantasy | Wipes **positional** memory built in the memorize phase — can feel unfair or like a hard reset | Charges per floor or per run; **no shuffle during memorize**; optional **weaker shuffle** (e.g. swap rows only); score multiplier penalty |
| **Remove / “destroy” one pair** | Big tempo swing; reduces cognitive load | Can trivialize levels if it is too cheap | Only **unmatched** pairs; higher cost (**2 charges**, **−1 life**, or **score tax**); hard cap per run |
| **Remove one stray tile** | Weird, memorable decisions; shrinks the board asymmetrically | Harder to explain; must define behavior for the partner tile | Only from **unmatched** tiles; choose one rule: partner becomes unusable “dead” weight until rules say otherwise, or **pair is removed together** — document clearly |

---

## Information (memory-friendly)

- **Peek**: Reveal **one** hidden tile briefly (e.g. 300–500 ms) or until the next flip. Strong overlap with the memorize phase unless peek is **post-memorize only** or **expensive**.
- **Pin / mark**: Player places a small number of **markers** on tiles without revealing symbols — planning aid, low power, high skill ceiling.
- **Echo**: After a mismatch, reinforce feedback (e.g. slightly longer visibility or a short “ghost” outline) so mistakes feel readable without adding a full new system.

---

## Stakes and pacing

- **Gambit flip**: Allow a **third** flip once per floor (or at a cost) — high variance; should cost something clear (shard, life on failure, or floor score).
- **Slow time**: Extend **resolve** timing only (not memorize) to reduce mis-click pressure — orthogonal to streak-based recovery.
- **Wild / joker tile**: One tile matches **any** partner **once** — run-defining power; keep rare or strictly run-limited.

---

## Progression / meta (long-term hooks)

- **Relics** (pick one of several after certain levels): e.g. +1 shuffle charge per run; first shuffle each floor free; destroy-pair costs one fewer charge.
- **Mutators** (opt-in): e.g. shorter memorize window in exchange for **+1** charge — supports build variety without only scaling raw difficulty.

---

## How this fits existing forgiveness

Current systems already cover **single mistakes** (grace), **repeat mistakes** (guards), **sustained good play** (shards, chain heal), **streak recovery** (soft streak), and **comeback after life loss** (banked memorize bonus). New tools should **not** duplicate those jobs:

- **Shuffle** targets **layout / search** frustration, not raw symbol load.
- **Destroy pair** targets **overload and tempo**, not one-off slips.
- **Peek** targets **recall** and overlaps memorize most — gate it (charges, post-memorize only, or high cost).

Goal: each lever stays **readable** (“when do I use which safety net?”).

---

## Suggested implementation order

1. **Shuffle (limited charges)** — easy to explain, widely understood, fits the grid.
2. **Pin / mark (very cheap)** — adds strategy with minimal balance risk.
3. **Destroy / remove pair (expensive)** — high fantasy; needs the strongest cost (score, life, or rare pickup).

---

## Open decisions (before coding)

Many **board-power** defaults are **locked** in [GAME_MECHANICS_PLAN.md](./GAME_MECHANICS_PLAN.md). Remaining open areas for *new* ideas above:

- Which **mutators** ship first (daily seed vs glass floor vs sticky fingers).
- Whether **undo** or **ghost** belongs in v1 or stays backlog.
- **Spaced encore** / cross-run memory: needs **save schema** and privacy thought (no PII in seeds).
- **UI surface** for powers: buttons vs radial — see [OBSIDIAN_RELIC_THEORY.md](./OBSIDIAN_RELIC_THEORY.md) for visual language.

---

## Code touchpoints (when implementing)

- Core rules: `src/shared/game.ts`, `src/shared/contracts.ts`
- Timers and input: `src/renderer/store/useAppStore.ts`
- Player-facing copy: `src/renderer/components/GameScreen.tsx` (and related UI components)
