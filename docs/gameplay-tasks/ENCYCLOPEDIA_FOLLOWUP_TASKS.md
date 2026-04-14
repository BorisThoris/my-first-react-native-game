# Encyclopedia & Codex — follow-up tasks

**Purpose:** Actionable backlog for **documentation drift**, **player-facing gaps** in the mechanics encyclopedia, **UI/IA**, and **cross-checks** with `game.ts` / settings. Check items off as you complete them.

**Source of truth for codex copy:** `src/shared/mechanics-encyclopedia.ts` (version `ENCYCLOPEDIA_VERSION`). `game-catalog.ts` re-exports for UI + achievements.

---

## A. Internal docs — point at the encyclopedia (stale references)

Many files still say codex copy lives only in `game-catalog.ts`. Update them to name **`mechanics-encyclopedia.ts`** as canonical text and `game-catalog` as the barrel.

- [x] `docs/internal-wiki/SOURCE_MAP.md` — add row for `mechanics-encyclopedia.ts`; clarify `game-catalog.ts` re-exports only.
- [x] `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.md` — § Codex row (~line 177): reference encyclopedia + barrel, not `game-catalog` alone.
- [x] `docs/gameplay/epic-onboarding-codex-copy.md` — update file list, SoT line, checklist item about periodic sync (tie to `ENCYCLOPEDIA_VERSION`).
- [x] `docs/gameplay/epic-readonly-meta-ui.md` — list all exported topic groups (powers, scoring & survival, pickups, contracts, featured runs).
- [x] `docs/gameplay/epic-relics.md` — `RELIC_CATALOG` path → encyclopedia.
- [x] `docs/gameplay/epic-modes-and-runs.md` — `VISUAL_ENDLESS_MODE_LOCKED` path → encyclopedia.
- [x] `docs/gameplay/epic-contracts-challenge-runs.md` — scholar / contract copy: note encyclopedia contract topics.
- [x] Root `README.md` — “see `game-catalog.ts` for codex copy” → encyclopedia + barrel (or “codex copy” only if you want shorter README).

---

## B. Encyclopedia content — obvious coverage gaps

These mechanics appear in `GAMEPLAY_MECHANICS_CATALOG.md` / code but have **no** (or only partial) player-facing article in `mechanics-encyclopedia.ts`. Add a short `EncyclopediaTopic` (or extend core topics) and bump **`ENCYCLOPEDIA_VERSION`** when merged.

- [x] **Pair proximity hints** — settings flag `pairProximityHintsEnabled`; Manhattan distance assist (`pairProximityHint.ts`). Clarify informational only / does not affect scoring or perfect-clear flags.
- [x] **Focus dim assist** — `focusDimmedTileIds` behavior in one sentence (read-only assist).
- [x] **Weaker shuffle mode** — settings `weakerShuffleMode`: full Fisher–Yates vs **rows-only** hidden shuffle; interaction with relics that mention shuffle.
- [x] **Resolve timing / echo** — `resolveDelayMultiplier`, `echoFeedbackEnabled` (accessibility + feel; not score rules).
- [x] **Daily challenge seed** — one paragraph: shared UTC day key, mutator rotation table (`DAILY_MUTATOR_TABLE` + hash), without exposing implementation details players don’t need.
- [x] **Gauntlet timer** — run-wide deadline, expiry → game over; link to mode codex entry or expand mode line.
- [x] **Memorize curve** — high level: base/step/min, decay every N levels, life-lost bank (`MEMORIZE_BONUS_*`) — optional “Systems” blurb if you want parity with `contracts.ts` constants.
- [x] **Floor tags / boss schedule** — how `floorTag === 'boss'` surfaces and ties to multiplier (encyclopedia mentions multiplier; optional: when bosses appear in endless schedule).
- [x] **Sticky fingers (presentation)** — one sentence: block index is **flip-order** constraint; may be HUD-highlighted only.
- [x] **Debug peek** (dev) — optional footnote: dev-only face reveal does not ship to players / or omit if not product-relevant.
- [x] **Clear-life on level clear** — `ClearLifeReason` perfect vs clean (+1 life when under cap) — fits **Scoring & survival** or core lives topic.

---

## C. Copy alignment & clarity (refine existing entries)

- [x] **Achievement `ACH_PERFECT_CLEAR`** vs encyclopedia “perfect floor vs Perfect Memory” — ensure `achievements.ts` wording matches the encyclopedia split (same list of forbidden powers).
- [x] **Relic offers** — epic-relics open item: one line in relic core topic or inventory UI copy that relics apply **for the current run**, not permanent meta.
- [x] **Score parasite mutator** — `epic-lives-and-pressure.md` asks for HUD/Codex reinforcement; add mutator blurb cross-check with `game.ts` pressure math or add HUD chip task separately.
- [x] **Numeric constants in encyclopedia** — optional pass: add **approximate** numbers only where it helps (e.g. flip par formula already described vaguely; boss 1.15× stated). Avoid duplicating every constant from `contracts.ts` unless players need them.

---

## D. Tests & guardrails

- [x] **Export coverage test** — optional: assert `game-catalog` re-exports every `ENCYCLOPEDIA_*` array intended for UI (snapshot or explicit list) so a renamed export does not silently drop a Codex section.
- [x] **Achievement catalog** — optional: test every `AchievementId` has non-empty title/description (mirror encyclopedia relic/mutator tests).

---

## E. Codex UI / IA (product + design epics)

- [x] **Wall of text** — `TASKS_META_AND_SHELL.md` **META-005**: tabs/rail, collapsible sections, or section summaries for long encyclopedia pages. *(Shipped: `<details>` collapsible sections + keyword filter in `CodexScreen`.)*
- [x] **Search / filter** — find topic by keyword within Codex (nice-to-have). *(Shipped: filter input.)*
- [x] **In-run Codex** — **META-010**: visual framing consistent with “desk/grimoire” shell vs plain `Panel` stack. *(See `App.tsx` + `MetaScreen.module.css` `.modalOverlayDesk` / `.modalInnerDesk`; `CodexScreen` `data-codex-context`.)*
- [x] **Update visual baseline** — `docs/visual-capture/**/AUDIT.md` Codex sections document expected UI (Apr 2026) + re-capture note for `01e-codex`. *(PNG stills are refreshed on demand when art changes.)*

---

## F. Workflow (recurring)

- [x] Add a **PR checklist** item or CONTRIBUTING note: *New `RelicId` / `MutatorId` / new player-visible mechanic → update `mechanics-encyclopedia.ts` and bump `ENCYCLOPEDIA_VERSION`.* *(See root `CONTRIBUTING.md`.)*

---

## G. Automation (shipped)

- [x] **Achievement copy from encyclopedia** — `ACHIEVEMENT_CATALOG` in `mechanics-encyclopedia.ts`; `achievements.ts` re-exports as `ACHIEVEMENT_BY_ID`.
- [x] **Machine appendix** — `yarn docs:mechanics-appendix` writes `docs/gameplay/GAMEPLAY_MECHANICS_CATALOG.auto-appendix.md` (versions + counts). The main `GAMEPLAY_MECHANICS_CATALOG.md` remains hand-authored; full doc codegen still deferred.
