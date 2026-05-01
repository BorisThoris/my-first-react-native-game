# UC-004 — Soft lock (run stuck, can’t progress)

**Source:** Pavel (`300 konq Average bobi gameplay pov`)  
**Status:** Done

## Comment (verbatim / context)

> wtf is this  
> soft lock

(From Average bobi / gameplay POV context in thread.)

## Summary

Player hit a **soft lock**—run or screen state with **no way to continue** (or it was so confusing it read as a lock). Needs **repro** and a **fix** or **escape hatch** (e.g. forfeit, detect dead state, fix transition).

## Notes

- Audited the likely concrete repro path from UC-005: late trap/decoy states that could read as no-progress.
- Added fairness regression coverage for late hidden decoys and final trap pairs, confirming they remain complete or actionable as intended.
- No separate reproducible transition lock appeared during this pass; future reports should include seed/mode/floor/last action for a targeted fixture.
