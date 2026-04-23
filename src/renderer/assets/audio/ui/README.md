# UI and menu SFX (`assets/audio/ui`)

`manifest.json` lists logical keys to filenames. These WAV files are loaded through the shared renderer `AudioContext` and use `masterVolume * sfxVolume`.

| Key | File | Use |
|-----|------|-----|
| ui-click | `ui-click.wav` | Low-stakes menu/settings selection |
| ui-confirm | `ui-confirm.wav` | Save/import/accept actions |
| ui-back | `ui-back.wav` | Back/cancel/discard actions |
| ui-counter | `ui-counter.wav` | Small counter/status ticks |
| menu-open | `menu-open.wav` | Opening menu/meta screens |
| run-start | `run-start.wav` | Starting or restarting a run |
| intro-sting | `intro-sting.wav` | Startup intro completion / skip resolve |
| pause-open | `pause-open.wav` | Pause overlay entry |
| pause-resume | `pause-resume.wav` | Resume from pause |
| game-over-open | `game-over-open.wav` | Game-over screen reveal |
| ui-copy | `ui-copy.wav` | Successful copy/share feedback |

Generated candidates should come from `scripts/audio-pipeline/jobs.memory-dungeon-app-audio.json`, then be trimmed/normalized before replacing these placeholders.
