# Research log (theory-craft loop)

Rolling synthesis from the **question → search → note → fit → promote/kill** workflow described in [GAME_MECHANICS_IDEAS.md](../GAME_MECHANICS_IDEAS.md). Each entry stays short so the log stays scannable.

**Fit** references cognitive jobs in [gameplay-depth/02-helper-tiers-and-cognitive-jobs.md](../gameplay-depth/02-helper-tiers-and-cognitive-jobs.md). **Conflict** references overlap with the forgiveness stack in [GAME_FORGIVENESS_DEEP_DIVE.md](../GAME_FORGIVENESS_DEEP_DIVE.md).

---

## Entry template (copy per sprint)

Use **at most ~15 lines** per entry.

1. **Question:** …
2. **Sources (URLs):** …
3. **Claim:** …
4. **Implication_for_loop:** … (memorize → flip two → match; powers vs grace/shards)
5. **Promote_or_Reject:** Promote | Reject — reason; if Promote, link backlog id (e.g. RP-01 in [05-app-specific-idea-backlog.md](../gameplay-depth/05-app-specific-idea-backlog.md))

---

## 2026-04 — Sprint 1 (three buckets: cognitive, roguelite modifier, accessibility)

### Entry 1 — Target–distractor similarity vs difficulty

1. **Question:** Does increasing visual similarity among on-board symbols predict “too hard / not fun” for a memory grid?
2. **Sources (URLs):** [Examining target–distractor similarity in a working memory game (White Rose ePrint)](https://eprints.whiterose.ac.uk/id/eprint/234719/); [Springer — oculomotor capture and target–distractor similarity](https://link.springer.com/article/10.3758/s13414-020-02007-0)
3. **Claim:** In at least one working-memory game paradigm, higher target–distractor similarity during encoding correlated with lower performance; enjoyment linked to challenge level (see paper discussion).
4. **Implication_for_loop:** Treat **within-level symbol band** as a tuning knob: `category_letters`, silhouette, and atomic variants should avoid “all same silhouette, tiny label diff” spikes unless mutator-intentional. Supports existing **atomic pairs** / dual coding (symbol + label) in [GAME_MECHANICS_IDEAS.md](../GAME_MECHANICS_IDEAS.md).
5. **Promote_or_Reject:** **Promote** → **RP-02** (symbol-band / distractor-similarity pass) in [05-app-specific-idea-backlog.md](../gameplay-depth/05-app-specific-idea-backlog.md).

### Entry 2 — Metrics-driven modifier pacing (commercial language)

1. **Question:** How do successful roguelites talk about balancing “extra rules” without erasing skill?
2. **Sources (URLs):** [GDC Vault — Slay the Spire: Metrics Driven Design and Balance](https://gdcvault.com/play/1025731/Slay-the-Spire-Metrics-Driven-Design-and-Balance) (vault contact gate may apply); [Ars Technica — roguelike deckbuilder surge](https://arstechnica.com/gaming/2024/04/why-there-are-861-roguelike-deckbuilders-on-steam-all-of-a-sudden/)
3. **Claim:** Genre leaders emphasize **data + clear player-facing tradeoffs** (charges, paths not taken) so power does not flatten decision space.
4. **Implication_for_loop:** New mutators/relics should ship with **one sentence tradeoff** in codex/HUD and a **telemetry or playtest hook** (even manual spreadsheet) for win-rate / power usage — aligns with existing GP-style phased delivery.
5. **Promote_or_Reject:** **Promote** → **RP-01** (playtest protocol) in [05-app-specific-idea-backlog.md](../gameplay-depth/05-app-specific-idea-backlog.md).

### Entry 3 — Assist affordances (shuffle / undo norms)

1. **Question:** What player expectations exist for “unstick” actions on tile grids?
2. **Sources (URLs):** [Mahjong solitaire — Wikipedia (hint/shuffle/undo culture)](https://en.wikipedia.org/wiki/Mahjong_solitaire); [Concentration (card game) — Wikipedia (variants)](https://en.wikipedia.org/wiki/Concentration_(card_game))
3. **Claim:** Digital solitaire-like games normalized **shuffle** and **undo** as safety valves; classic Concentration stays fresh via **rule/layout variants**, not one flat rule forever.
4. **Implication_for_loop:** Row shuffle + global shuffle + destroy already map to **layout vs load** jobs; **undo once per floor** (idea in GAME_MECHANICS_IDEAS) still risks overlapping **grace** — keep rejected unless it costs a shard or disables streak for the floor (as already noted in ideas doc).
5. **Promote_or_Reject:** **Reject** for new v1 work — **duplicate job** with forgiveness; doc already captures variant; no new backlog id.

### Entry 4 — Motion / distraction vs optional difficulty

1. **Question:** What guardrails should any new “dual-task” or motion-heavy mutator use?
2. **Sources (URLs):** [WCAG 2.2 Understanding — Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html); [Game Accessibility Guidelines — essential info not by colour alone](https://gameaccessibilityguidelines.com/ensure-no-essential-information-is-conveyed-by-a-fixed-colour-alone/)
3. **Claim:** Motion that responds to user input should be suppressible or reducible; essential pair identity must not rely on hue alone.
4. **Implication_for_loop:** `distraction_channel` and **breathing grid** ideas must stay behind **`reduceMotion`** and existing contrast/pattern language; cursed / N-back markers already require non–color-only affordances.
5. **Promote_or_Reject:** **Reject** as separate feature — **already encoded** in renderer settings + design rules; reinforce in mutator specs only when touching those systems.

---

## Query buckets (rotate next sprint)

| Bucket | Example queries |
|--------|------------------|
| Cognitive / perception | `working memory game distractor similarity`, `picture superiority effect UI` |
| Assist affordances | `tile puzzle shuffle undo hint design`, `concentration card game variants` |
| Roguelite / modifiers | `Slay the Spire metrics driven balance GDC`, `roguelike daily challenge mutator` |
| Puzzle craft | `fixed puzzle seed leaderboard`, `handcrafted puzzle objectives` |
| Accessibility | `WCAG motion games reduce`, `colorblind pattern not color alone puzzle` |

---

## Promotions index

| Log period | Backlog id | Where |
|------------|------------|--------|
| 2026-04 sprint | RP-01, RP-02 | [05-app-specific-idea-backlog.md](../gameplay-depth/05-app-specific-idea-backlog.md) |
