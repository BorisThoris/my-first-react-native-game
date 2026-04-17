# Multiple agents: keeping the internal wiki honest

Use this when several people—or several **Cursor agents in parallel**—touch docs at once. The goal is **no drift** and **no duplicate sources of truth**.

## Roles you can split

| Track | Typical owner | Updates when |
|--------|----------------|--------------|
| **Gameplay catalog** | Rules-focused agent or dev | Any change to `contracts.ts`, run lifecycle, scoring, powers, mutators surfaced in play |
| **Epics** | Same or second pass | Narrative/detail that must match the catalog |
| **Engineering map** | Architecture-focused pass | New top-level modules, IPC, persistence, Steam |
| **Design / UI tasks** | UX parity pass | `docs/new_design/`, `docs/UI_TASKS/`, visual capture |

Only one track should **invent numbers or IDs**; others **link** to the catalog or `contracts.ts`.

## Parallel agent workflow (suggested)

1. **Assign scope up front** — e.g. Agent A: `docs/gameplay/` + `contracts.ts` references; Agent B: `docs/new_design/TASKS/` only; Agent C: `docs/internal-wiki/README.md` link fixes only. For a **full-app orientation pass**, split into **many narrow slices** (entry + store + `game.ts` + main/preload + major screens + e2e + wiki cross-checks)—e.g. **50 scoped passes**—then merge into one rollup ([APP_ANALYSIS.md](./APP_ANALYSIS.md)) so indexes stay single-source-of-truth and agents do not each invent new narrative docs. **Stacking two 50-pass rounds ≈ 100 scoped topics** before merge is the usual “turbo analyze” cadence; avoid publishing 100 separate narrative docs—fold into SOURCE_MAP + [APP_ANALYSIS.md](./APP_ANALYSIS.md) + authoritative topic files. A **second 50-pass** round works well for **refinement**: doc/code drift (class names, comment typos, missing test-file callouts), cross-doc consistency (`MUTATORS` vs `mutators.ts`, `NAVIGATION_MODEL` vs `ViewState`), and small mechanical fixes (e2e schema version constants). A **third 50-pass** can target deeper slices: store subscription patterns (`useShallow`), gauntlet interval lifecycle, `flipTile` guards, roster/catalog parity ([RELIC_ROSTER.md](../RELIC_ROSTER.md) vs `RelicId`), dead-code paths (unused DOM FLIP exports), and constants duplicated across modules (e.g. decoy `pairKey` strings)—then fold results into authoritative docs rather than new parallel writeups. A **fourth pass** is often a **wiki/tree sync** after large feature landings (new `src/` subtrees, E2E additions, doc counts). **REF-backed parallel runs:** for the card deck **REF-051–REF-100** (50 units), use [EXPLICIT_50_AGENTS.md](../refinement-tasks/EXPLICIT_50_AGENTS.md); for **REF-001–REF-050**, use controllers C01–C05 in [EXPLICIT_100_AGENTS.md](../refinement-tasks/EXPLICIT_100_AGENTS.md).
2. **Single PR or sequential merge** — If two agents both edit [GAMEPLAY_MECHANICS_CATALOG.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.md), merge one branch first, then rebase the second and resolve conflicts **in favor of the catalog** as mechanics authority.
3. **After mechanics change** — Order: update `src/shared/contracts.ts` + tests → catalog §14 / appendices → relevant epic → [gameplay/README.md](../gameplay/README.md) index if a new epic row is needed → [README.md](./README.md) quick links only if a new top-level doc was added.

## Anti-patterns

- **Duplicating** the mechanics matrix in this wiki — link [GAMEPLAY_MECHANICS_CATALOG.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.md) instead.
- **Paraphrasing** numeric balance without pointing at [BALANCE_NOTES.md](../BALANCE_NOTES.md) or code.
- **Adding** a second “start here” that contradicts [docs/README.md](../README.md) or this file — consolidate into one portal.

## Checklist before merging doc-heavy PRs

- [x] Authoritative file for the topic exists and was updated (not only the wiki index). — *Process:* verify each PR (not a one-time completion).
- [x] [internal-wiki/README.md](./README.md) links still resolve (relative paths). — *Process:* CI / manual link check on doc PRs.
- [x] New `docs/**/*.md` files have a one-line row in [DOCS_CATALOG.md](./DOCS_CATALOG.md). — *Process:* contributor responsibility.
- [x] Gameplay [README.md](../gameplay/README.md) epic table matches new/changed epics. — *Process:* update when adding epics.
