# FBL-004: Audio semantic cue map

## Status
Done

## Priority
P2

## Source Theory
- Pass 7: audio semantic cue rules.

## Player Decision
Use audio to reinforce state changes without becoming the only source of information.

## Current System Connection
- Existing audio matrix and placeholder cues.
- Match, mismatch, reward, trap, route, and modal sounds.

## Proposed Behavior
Map semantic moments to audio families: arm, commit, reveal, reward, fail, disarm, lock, resolve, floor clear, and route choice.

## UI / Visual / Audio
Audio cues must align with visual tokens and have silent-mode visual parity.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 0, UI load 1. Total 1.

## Risks
Audio can become noisy if every token has a unique sound without priority rules.

## Acceptance Criteria
- Cue map names which events deserve sound and which stay silent.
- Priority rules prevent overlapping cue spam.
- Silent/reduced-audio mode keeps full visual/copy parity.

## Verification
- Runtime and dungeon audio coverage rows now include semantic moments such as arm, commit, reveal, reward, fail, disarm, lock, floor clear, and route choice.
- `yarn test src/renderer/audio/audioInteractionCoverage.test.ts src/renderer/audio/dungeonAudioEventCoverage.test.ts`

## Cross-links
- `../../passes/07-ui-and-feedback-language.md`
