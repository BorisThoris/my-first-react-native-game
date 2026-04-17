# RDUI-008: QA checklist + optional Playwright

> **Status:** Shipped — [QA checklist](../05-ui-ultra-refinement.md#qa-checklist-manual) + [`e2e/README.md`](../../../../e2e/README.md) cross-link; Playwright smoke remains optional (no stable harness to force a relic overlay in e2e).

**Epic:** [UI ultra-refinement § P8](../05-ui-ultra-refinement.md#p8--qa)

## Problem

There is no committed checklist tying together single-pick, multi-pick, motion, breakpoints, and SR—so regressions slip through. Optional e2e coverage for `game-relic-offer-overlay` is unspecified.

## Proposed work

- Add a **manual checklist** (subsection in [05](../05-ui-ultra-refinement.md), this file, or a short section in [`e2e/README.md`](../../../../e2e/README.md) with cross-link): single pick, multi-pick (2+), all three rarities, reduce motion on/off, narrow phone, wide desktop, screen reader round-trip.
- **Optional:** Playwright smoke: `data-testid="game-relic-offer-overlay"` visible + expected card count; skip or mark flaky if timing is bad.

## Files

| Action | Path |
|--------|------|
| Edit | `docs/epics/relic-draft-fluid-system/05-ui-ultra-refinement.md` and/or `e2e/README.md` |
| Optional | `e2e/*.spec.ts` |

## Acceptance

Checklist exists in this repo and is run before shipping the UI tranche; automation remains optional.

## Category

**qa**

## Priority

**P3**
