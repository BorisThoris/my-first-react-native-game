# Relic draft UI — per-phase tasks

Scoped backlog for [UI ultra-refinement](../05-ui-ultra-refinement.md). IDs use prefix **RDUI** (not `REF-*`) so they stay epic-local and do not collide with [`docs/refinement-tasks/`](../../../refinement-tasks/).

**Epic status:** RDUI-001–RDUI-008 are **shipped** in the codebase (see `Status` line atop each task file). Optional Playwright for the relic overlay remains deferred per RDUI-008.

| ID | Phase | Title | Spec |
|----|-------|--------|------|
| [RDUI-001](./RDUI-001.md) | P1 | Information architecture (progress, header, optional bonus row) | [P1 §](../05-ui-ultra-refinement.md#p1--information-architecture) |
| [RDUI-002](./RDUI-002.md) | P2 | Card presentation (tier chrome, density) | [P2 §](../05-ui-ultra-refinement.md#p2--card-presentation) |
| [RDUI-003](./RDUI-003.md) | P3 | Multi-pick flow (focus, live region) | [P3 §](../05-ui-ultra-refinement.md#p3--multi-pick-flow) |
| [RDUI-004](./RDUI-004.md) | P4 | Motion (stagger, active state) | [P4 §](../05-ui-ultra-refinement.md#p4--motion) |
| [RDUI-005](./RDUI-005.md) | P5 | Responsive (grid, max-width, safe-area) | [P5 §](../05-ui-ultra-refinement.md#p5--responsive) |
| [RDUI-006](./RDUI-006.md) | P6 | Input (arrows, no-dismiss, REF-010 alignment) | [P6 §](../05-ui-ultra-refinement.md#p6--input) |
| [RDUI-007](./RDUI-007.md) | P7 | Copy centralization (`relicDraftOffer.ts`) | [P7 §](../05-ui-ultra-refinement.md#p7--copy-centralization) |
| [RDUI-008](./RDUI-008.md) | P8 | QA checklist + optional Playwright | [P8 §](../05-ui-ultra-refinement.md#p8--qa) |

**How to use:** Implement in dependency order where it helps (P1 before copy polish; P3/P6 before P8 sign-off). Close or annotate tasks in-repo when shipped.

**50-agent delegation map:** [EXPLICIT_50_RDUI_AGENTS.md](./EXPLICIT_50_RDUI_AGENTS.md) — atomic rows RDUI-A01–A50, five controller batches, prompt templates.
