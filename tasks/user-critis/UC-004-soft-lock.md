# UC-004 — Soft lock (run stuck, can’t progress)

**Source:** Pavel (`300 konq Average bobi gameplay pov`)  
**Status:** Open

## Comment (verbatim / context)

> wtf is this  
> soft lock

(From Average bobi / gameplay POV context in thread.)

## Summary

Player hit a **soft lock**—run or screen state with **no way to continue** (or it was so confusing it read as a lock). Needs **repro** and a **fix** or **escape hatch** (e.g. forfeit, detect dead state, fix transition).

## Notes

- Collect: build, floor, last action, mode, whether board was completable.
- Check for known soft-lock tickets in `match` / `run` / `GameScreen` / power resolution.
