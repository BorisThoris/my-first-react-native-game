# UC-002 — Tiles can be dragged outside the playfield

**Source:** Pavel (`300 konq Average bobi gameplay pov`)  
**Status:** Done

## Comment (verbatim)

> мога да драгна картите извън полето лол

## Summary

**Pan/drag** (or tile interaction) allows moving content **outside the board area** — likely should clamp viewport or block drag so the field stays visually coherent.

## Related thread

> не, ма някой може да не забележи и да се обърка  
> bad UX type shi  
> тва даже не знаех, че е така лол  

Hidden / non-obvious behaviour → players may not notice and get confused.

## Notes

- Tightened the shared board viewport clamp so a fitted board stays contained in the stage and a zoomed board keeps the camera inside board bounds.
- Existing mouse pan, touch pan, wheel zoom, fit/reset, and viewport carry-forward all flow through the same clamp.
- Added `tileBoardViewport` regression tests and reran `TileBoard` coverage.
