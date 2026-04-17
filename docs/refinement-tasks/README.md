# Refinement task backlog

**Origin:** Turbo-research pass using **100 parallel scoped agents** (each produced **one** candidate task). These are **ideas for refinement**, not committed roadmap—triage, merge duplicates, and close items that are obsolete or out of scope.

**How to use**

| Step | Action |
|------|--------|
| 1 | Skim [INDEX.md](./INDEX.md) (table of all tasks by ID, category, priority). |
| 2 | Open `REF-NNN.md` for detail; link to authoritative docs/code from each file. |
| 3 | For rollup status of the full 1–100 set, see [COMPLETION.md](./COMPLETION.md). |
| 4 | When done, delete the task file or mark status at top (optional frontmatter later). |
| 5 | Prefer implementing fixes in **authoritative** locations ([internal wiki](../internal-wiki/README.md), gameplay catalog, `contracts.ts`) per [multiple-agents.md](../internal-wiki/multiple-agents.md). |

**Naming:** `REF-001.md` … `REF-100.md` — stable IDs for references in PRs and issues.

**REF-100 (hygiene):** [REF-100](./REF-100.md) is **closed** — acceptance satisfied (compact INDEX, hygiene links). Optional calendar re-triage of [INDEX.md](./INDEX.md) is process, not an open task.

**Last hygiene snapshot:** 2026-04-17 — [COMPLETION.md](./COMPLETION.md) rollup; per-card `Rollup:` / **Status** aligned with shipped code; INDEX unchanged. **`yarn ci`** / **`yarn verify`** green (see [TOOLING.md](../internal-wiki/TOOLING.md)).

**Parallel runs:** [EXPLICIT_100_AGENTS.md](./EXPLICIT_100_AGENTS.md) (full REF-001–100). To continue with **only the back 50** (REF-051–100, agents 51–100), see [EXPLICIT_50_AGENTS.md](./EXPLICIT_50_AGENTS.md).

**Related:** [APP_ANALYSIS.md](../internal-wiki/APP_ANALYSIS.md), [GAMEPLAY_POLISH_AND_GAPS.md](../gameplay/GAMEPLAY_POLISH_AND_GAPS.md).
