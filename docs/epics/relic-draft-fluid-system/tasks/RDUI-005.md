# RDUI-005: Responsive (grid, max-width, safe-area)

> **Status:** Shipped — `.panelRoot` max-width + grid tuning + safe-area in [`RelicDraftOffer.module.css`](../../../../src/renderer/components/RelicDraftOffer.module.css); breakpoint pass manual per [QA](../05-ui-ultra-refinement.md#qa-checklist-manual).

**Epic:** [UI ultra-refinement § P5](../05-ui-ultra-refinement.md#p5--responsive)

## Problem

The draft grid uses `auto-fit`/`minmax` but ultra-wide and narrow-landscape layouts can still feel awkward (over-wide cards, tight gaps, or horizontal scroll). Modal body layout must stay **body-only** (no phantom action column).

## Proposed work

- Keep **empty actions** pattern for relic overlay; confirm [`OverlayModal.module.css`](../../../../src/renderer/components/OverlayModal.module.css) body-only comment still holds.
- Tune `RelicDraftOffer.module.css` grid: `gap`, `minmax`, optional `max-width` on the panel container for very wide viewports.
- Narrow landscape + phone: verify tap targets and no horizontal overflow; align safe-area with gameplay shell if modals already inset.

## Files

| Action | Path |
|--------|------|
| Edit | `src/renderer/components/RelicDraftOffer.module.css` |
| Read-only | `src/renderer/components/OverlayModal.module.css`, `src/renderer/breakpoints.ts` |

## Acceptance

Visual pass at project breakpoints; no horizontal scroll in draft body.

## Category

**ui**

## Priority

**P2**
