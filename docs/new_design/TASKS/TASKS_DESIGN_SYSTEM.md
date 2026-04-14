# Tasks: Design system & tokens (`DS-*`)

**Research pass:** Compare `VISUAL_SYSTEM_SPEC.md` to `theme.ts`, `global.css`, `App.module.css`, `src/renderer/ui/*.module.css` rgba usage; typography; semantic color rules.

**Finding:** Core palette mostly mapped; **brass/bronze** unnamed; **danger** coral vs “blood red”; **cyan** major in code, not in spec palette table; **body = Source Sans 3** ( **`DS-001`** resolved — spec amended); **Segoe** drift removed from tile DOM/canvas (**`DS-008`**); heavy **literal rgba** duplication outside `theme.ts`.

**Cross-links:** All screen task files; **`DS-009`** (meta scrims / stage wash in `theme.ts`) shipped — prioritize **`DS-010`** before large META/OVR rgba sweeps for less rework.

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| DS-002 | P2 | Spec ↔ token glossary | Parchment/dust/etc. map to `--theme-*`. | Doc table. | — |
| DS-003 | P2 | Brass/bronze token | Secondary frame tone. | Used in ≥2 components. | — |
| DS-004 | P2 | Danger red tuning | Deeper red for life/fail **or** spec update. | Contrast check. | — |
| DS-005 | P1 | Cyan vs smoke blue | Promote/demote cyan in design story. | COMPONENT_CATALOG note. | — |
| DS-006 | P2 | Typography role vars | Display XL/L/M, Label S, Body M/S as CSS aliases. | Map from existing `--ui-type-*`. | — |
| DS-007 | P1 | CTA vs body font audit | Long labels on UiButton / HUD → utility sans per spec. | Spot-fix worst offenders. | — |
| DS-010 | P1 | De-dupe UI rgba | Panel, UiButton, StatTile literals → semantic vars. | Grep reduction in `ui/`. | — |
| DS-011 | P2 | Tap highlight token | `global.css` webkit tap → `var(--theme-focus-soft)`. | — | — |
| DS-012 | P2 | Semantic color audit | Success/danger not ambient decor per spec. | Fix misuse. | — |
| DS-013 | P3 | Hero radius token | Sharper/beveled surfaces if art direction requires. | — | — |
| DS-014 | P2 | Components rgba sweep | `components/**/*.module.css` duplicate tuples → vars. | Phased PRs. | DS-010 |
