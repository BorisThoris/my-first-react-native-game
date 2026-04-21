# Memory Dungeon gameplay audio → generation strategy

Gameplay **one-shot SFX** today live in [`src/renderer/audio/gameSfx.ts`](../../src/renderer/audio/gameSfx.ts): Web Audio oscillators (**no WAV assets**). Replacing them with ACE-Step renders is usually unnecessary—short tones need low latency and deterministic length; procedural fits well.

Use **ACE-Step** mainly for **longer beds, stingers, or menu/attract loops** exported to files, then wired separately if product adds music assets later.

## Procedural Web Audio (keep unless product asks for sampled SFX)

| Export | Role | Notes |
|--------|------|--------|
| `playFlipSfx` | Tile flip click | Very short sine; procedural. |
| `playGambitCommitSfx` | Gambit third-flip accent | Layered chirp; procedural. |
| `playMatchSfx` | Successful match resolve | Pitch tiers by streak; procedural. |
| `playMismatchSfx` | Failed pair | Saw sweep down; procedural. |
| `playResolveSfx` | Routes match vs mismatch from stats | Delegates to match/mismatch above. |
| `playPowerArmSfx` | Power arm | Procedural. |
| `playDestroyPairSfx` | Destroy resolve | Procedural. |
| `playPeekPowerSfx` | Peek consumed | Procedural. |
| `playStrayPowerSfx` | Stray removed | Procedural. |
| `playShuffleSfx` | Board shuffle motion | Layered tones; procedural. |
| `playFloorClearSfx` | Floor cleared sting | Deferred macrotask; procedural. |

## ACE-Step candidates (batch jobs → `tmp/audio/ace-step/`, then future asset pipeline)

| Use case | Suggested approach | Example job ids |
|----------|-------------------|-----------------|
| Menu / hub idle loop | Text-only `text2music`, instrumental, loopable | See [`jobs.game-ambient.example.json`](jobs.game-ambient.example.json) |
| Run / gameplay tension bed | Short instrumental loop, low intensity | Same file, job `02-run-tension` |
| Victory / floor-complete flourish | Short sting (replace or layer over `playFloorClearSfx` only if design wants music) | Extend PROMPTS + add job |
| Pause / settings atmosphere | Optional pad (product decision) | PROMPTS |

## Renderer integration pointer

End-to-end wiring for **music loops** is not yet in `GameScreen` (settings expose master/music/SFX sliders per [`docs/AUDIO_INTEGRATION.md`](../../docs/AUDIO_INTEGRATION.md)). Treat ACE-Step output as **offline assets** until a playback path exists.
