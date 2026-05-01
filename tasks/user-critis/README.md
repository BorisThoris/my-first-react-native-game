# User critiques (`user-critis`)

Discrete feedback items (often design/review notes) tracked as individual markdown files, one comment or bullet cluster per task.

## File naming

- Prefer `UC-001-short-slug.md`, `UC-002-short-slug.md`, etc. using zero-padded numbers so sorting stays lexical.
- If you only have free text first, numbers alone (`UC-001.md`) are fine.

## Task body (suggested sections)

Each file should contain at least:

- **Source** - who raised it (e.g. Pavel).
- **Status** - `Open` / `Done` / `Won't do` / etc.
- **Comment** - the verbatim feedback or a faithful summary.
- **Notes** - optional implementation hints or links (issues, PRs, Figma).

## Adding Pavel's comments

Paste or attach Pavel's comments in chat (or drop raw text files into this folder); split each distinct point into its own `UC-*.md` file as above.

## Current tasks

| File | Status | Topic |
|------|--------|--------|
| [`UC-001-lives-between-levels.md`](UC-001-lives-between-levels.md) | Done | Lives carry across floors; UI/Codex now explain run-wide recovery |
| [`UC-002-drag-tiles-outside-board.md`](UC-002-drag-tiles-outside-board.md) | Done | Board pan/zoom clamp keeps the playfield contained |
| [`UC-003-side-help-strip-too-small-detached.md`](UC-003-side-help-strip-too-small-detached.md) | Done | Desktop action/help dock is larger, closer, and more attached |
| [`UC-004-soft-lock.md`](UC-004-soft-lock.md) | Done | Late trap/decoy soft-lock path covered by fairness regressions |
| [`UC-005-traps-when-last-pairs-edge-case.md`](UC-005-traps-when-last-pairs-edge-case.md) | Done | Trap/decoy last-pair edge cases covered |

*(Casual chat lines without actionable feedback omitted.)*

---

Older note: previously there were no files here; the folder is the canonical place for these tasks.
