# User critiques (`user-critis`)

Discrete feedback items (often design/review notes) tracked as individual markdown files—one comment or bullet cluster per task.

## File naming

- Prefer `UC-001-short-slug.md`, `UC-002-short-slug.md`, … using zero-padded numbers so sorting stays lexical.
- If you only have free text first, numbers alone (`UC-001.md`) are fine.

## Task body (suggested sections)

Each file should contain at least:

- **Source** — who raised it (e.g. Pavel).
- **Status** — `Open` / `Done` / `Won't do` / …
- **Comment** — the verbatim feedback or a faithful summary.
- **Notes** — optional implementation hints or links (issues, PRs, Figma).

## Adding Pavel’s comments

Paste or attach Pavel’s comments in chat (or drop raw text files into this folder); split each distinct point into its own `UC-*.md` file as above.

## Current tasks

| File | Topic |
|------|--------|
| [`UC-001-lives-between-levels.md`](UC-001-lives-between-levels.md) | Lives not resetting between levels / expectation |
| [`UC-002-drag-tiles-outside-board.md`](UC-002-drag-tiles-outside-board.md) | Dragging interaction outside board; obscure UX |
| [`UC-003-side-help-strip-too-small-detached.md`](UC-003-side-help-strip-too-small-detached.md) | Side help strip scale + distance from board |
| [`UC-004-soft-lock.md`](UC-004-soft-lock.md) | Soft lock / stuck run (needs repro) |
| [`UC-005-traps-when-last-pairs-edge-case.md`](UC-005-traps-when-last-pairs-edge-case.md) | Trap/decoy tiles when last pairs — edge cases |

*(Casual chat lines without actionable feedback omitted.)*

---

Older note: previously there were no files here—the folder is the canonical place for these tasks.
