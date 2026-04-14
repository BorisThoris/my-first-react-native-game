/**
 * Barrel for read-only UI copy: re-exports **mechanics encyclopedia** (single source of truth) + achievements.
 * Gameplay logic stays in `game.ts` / `relics.ts`; player-facing strings for relics/mutators/modes live in `mechanics-encyclopedia.ts`.
 */
import type { RelicId } from './contracts';
import { ACHIEVEMENT_BY_ID, type AchievementDefinition } from './achievements';
import type { MutatorDefinition, RelicDefinition } from './mechanics-encyclopedia';
import { MUTATOR_CATALOG, RELIC_CATALOG } from './mechanics-encyclopedia';

export { ACHIEVEMENT_BY_ID, ACHIEVEMENTS } from './achievements';
export { MUTATOR_CATALOG } from './mechanics-encyclopedia';

export type { AchievementCodexEntry, CodexCoreTopic, GameModeCodexEntry, RelicDefinition } from './mechanics-encyclopedia';
export {
    ACHIEVEMENT_CATALOG,
    CODEX_CORE_TOPICS,
    ENCYCLOPEDIA_CONTRACT_TOPICS,
    ENCYCLOPEDIA_FEATURED_RUN_TOPICS,
    ENCYCLOPEDIA_PICKUP_AND_BOARD_TOPICS,
    ENCYCLOPEDIA_POWER_TOPICS,
    ENCYCLOPEDIA_SCORING_AND_SURVIVAL_TOPICS,
    ENCYCLOPEDIA_SETTINGS_AND_ASSISTS_TOPICS,
    ENCYCLOPEDIA_VERSION,
    GAME_MODE_CODEX,
    RELIC_CATALOG,
    VISUAL_ENDLESS_MODE_LOCKED
} from './mechanics-encyclopedia';

export const getAchievementMeta = (id: keyof typeof ACHIEVEMENT_BY_ID): AchievementDefinition => ACHIEVEMENT_BY_ID[id];

export const getRelicMeta = (id: RelicId): RelicDefinition => RELIC_CATALOG[id];

export const getMutatorMeta = (id: keyof typeof MUTATOR_CATALOG): MutatorDefinition => MUTATOR_CATALOG[id];
