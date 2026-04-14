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

1. **Assign scope up front** — e.g. Agent A: `docs/gameplay/` + `contracts.ts` references; Agent B: `docs/new_design/TASKS/` only; Agent C: `docs/internal-wiki/README.md` link fixes only.
2. **Single PR or sequential merge** — If two agents both edit [GAMEPLAY_MECHANICS_CATALOG.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.md), merge one branch first, then rebase the second and resolve conflicts **in favor of the catalog** as mechanics authority.
3. **After mechanics change** — Order: update `src/shared/contracts.ts` + tests → catalog §14 / appendices → relevant epic → [gameplay/README.md](../gameplay/README.md) index if a new epic row is needed → [README.md](./README.md) quick links only if a new top-level doc was added.

## Anti-patterns

- **Duplicating** the mechanics matrix in this wiki — link [GAMEPLAY_MECHANICS_CATALOG.md](../gameplay/GAMEPLAY_MECHANICS_CATALOG.md) instead.
- **Paraphrasing** numeric balance without pointing at [BALANCE_NOTES.md](../BALANCE_NOTES.md) or code.
- **Adding** a second “start here” that contradicts [docs/README.md](../README.md) or this file — consolidate into one portal.

## Checklist before merging doc-heavy PRs

- [ ] Authoritative file for the topic exists and was updated (not only the wiki index).
- [ ] [internal-wiki/README.md](./README.md) links still resolve (relative paths).
- [ ] New `docs/**/*.md` files have a one-line row in [DOCS_CATALOG.md](./DOCS_CATALOG.md).
- [ ] Gameplay [README.md](../gameplay/README.md) epic table matches new/changed epics.
