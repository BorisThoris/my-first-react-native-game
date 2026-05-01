# UC-003 — Side help strip too small and feels detached from the board

**Source:** Pavel (`300 konq Average bobi gameplay pov`)  
**Status:** Done

## Comment (verbatim)

> taq lenta otstrani s help neshtata e mn malka i dalech ot poleto  
> ne se useshta kato chast ot igrata

## Summary

The **side strip / lane with help UI** is **too small** and **too far from the playing field** — it does **not feel like part of the game** (Chrome feels disconnected from the core board).

## Notes

- Increased desktop action/help dock scale, spacing, icon size, rules affordance size, and visual contrast.
- Pulled the dock closer to the board with a slight negative top margin while preserving the existing mobile action dock layout.
- Verified with focused renderer tests; visual tuning is intentionally scoped to the existing gameplay shell.
