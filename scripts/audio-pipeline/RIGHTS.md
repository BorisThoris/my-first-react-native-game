# Reference audio — rights strategy for this repo

Pick **one** primary workflow. Do not use copyrighted commercial game rips as references unless you have a written license.

## A. Text-only ACE-Step (default for style exploration)

- Use [`batch_ace_step.py`](batch_ace_step.py) with `task_type: "text2music"` and **captions only**—no `reference_audio` / `src_audio`.
- Lowest rights risk for references; output is still AI-generated—verify originality and disclosure policies for your ship channel.
- Prompt ideas: [`PROMPTS.md`](PROMPTS.md).

## B. Licensed or permissioned reference audio

1. Sources you may use: **your recordings**, **royalty-free packs** with a license matching your distribution (Steam/commercial), **CC0**, or **CC-BY** (keep attribution—use [`samples/ATTRIBUTION.template.txt`](samples/ATTRIBUTION.template.txt)).
2. Place short WAVs under [`samples/`](samples/) (or another folder you document).
3. In jobs JSON, use `reference_audio` with **low** `audio_cover_strength` (about 0.2–0.4) for gentle style steering, not cloning a whole track.

## C. Commercial “sound-alike” to an existing published game

- **No** unofficial bulk downloads from the internet as a substitute for clearance.
- If you need identifiable similarity to a specific title’s soundtrack: obtain **permission or license** from rights holders first; repo tooling cannot replace legal clearance.
