# UC-005 — Trap / decoy tiles when few or last pairs remain (risky or confusing state)

**Source:** Pavel (`300 konq Average bobi gameplay pov`), thread with local chat  
**Status:** Open

## Comment (verbatim / fragments)

> ima trap carti  
> deto  
> ako sa posledni  
> moe se oserat  

## Summary

When **trap/decoy-type tiles** are involved and they’re among the **last pairs left**, outcomes can **break expectations**—possible **dead ends**, wasted flips, or frustration. Worth auditing **pair resolution**, **win detection**, and **tutorial clarity** when traps remain late.

## Notes

- Map to concrete mechanics (`decoy`, traps, gambit edges) in `contracts` / `game.ts` / objectives.
- Cross-check UC-004 if this scenario **caused** or **felt like** a soft lock.
- Follow-up from same thread included dismissive wording about traps; treat as **sentiment**, not spec—focus on behaviour and UX.
