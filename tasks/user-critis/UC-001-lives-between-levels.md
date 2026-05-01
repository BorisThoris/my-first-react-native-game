# UC-001 — Lives behaviour between levels / floor transitions

**Source:** Pavel (`300 konq Average bobi gameplay pov`)  
**Status:** Done

## Comment (verbatim)

> малко гейско да не ти се ресетнат животите на следващото ниво

## Summary

Player expectation or tone issue around **lives not resetting** when advancing to the next level/floor — reads as slightly “game-y” or worth revisiting for clarity/balance.

## Notes

- Kept the intended run-wide life model: lives carry between floors and only recover through explicit rewards.
- Added floor-clear modal copy and Codex glossary/core-topic copy explaining that lives carry across the run.
- Added regression coverage for `advanceToNextLevel` preserving the current life total.
