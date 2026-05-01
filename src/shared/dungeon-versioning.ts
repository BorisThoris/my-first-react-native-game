export type DungeonRulesChangeKind =
    | 'board_recipe'
    | 'enemy_movement'
    | 'reward_payout'
    | 'scoring'
    | 'objective_completion'
    | 'route_graph'
    | 'shop_or_room_offer'
    | 'copy_only'
    | 'visual_telegraph'
    | 'codex_wording'
    | 'reduced_motion_rendering';

export interface DungeonRulesVersionDecision {
    changeKind: DungeonRulesChangeKind;
    replayAffecting: boolean;
    requiresGameRulesVersion: boolean;
    requiresSaveMigrationReview: boolean;
    requiredVerification: readonly string[];
}

export const DUNGEON_RULES_VERSION_POLICY_VERSION = 'dng-003-dng-004-v1';

export const DUNGEON_REPLAY_AFFECTING_CHANGES: readonly DungeonRulesChangeKind[] = [
    'board_recipe',
    'enemy_movement',
    'reward_payout',
    'scoring',
    'objective_completion',
    'route_graph',
    'shop_or_room_offer'
];

export const DUNGEON_NON_REPLAY_CHANGES: readonly DungeonRulesChangeKind[] = [
    'copy_only',
    'visual_telegraph',
    'codex_wording',
    'reduced_motion_rendering'
];

export const DUNGEON_DETERMINISM_CONTRACT = {
    requiredSeedInputs: [
        'runSeed',
        'runRulesVersion',
        'gameMode',
        'floor',
        'route choice id',
        'shop/event/rest choice id',
        'shuffleNonce'
    ],
    forbiddenRulesSources: ['Math.random', 'Date.now', 'performance.now', 'current locale time', 'renderer state'],
    allowedNondeterminism: ['animation timing', 'pointer hover tilt', 'audio scheduling jitter', 'GPU frame pacing']
} as const;

export const classifyDungeonRulesChange = (changeKind: DungeonRulesChangeKind): DungeonRulesVersionDecision => {
    const replayAffecting = DUNGEON_REPLAY_AFFECTING_CHANGES.includes(changeKind);
    return {
        changeKind,
        replayAffecting,
        requiresGameRulesVersion: replayAffecting,
        requiresSaveMigrationReview: replayAffecting || changeKind === 'route_graph',
        requiredVerification: replayAffecting
            ? [
                  'yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts',
                  'yarn test src/shared/run-map.test.ts src/shared/balance-simulation.test.ts',
                  'yarn test src/shared/save-data.test.ts src/shared/version-gate.test.ts'
              ]
            : ['yarn test src/shared/version-gate.test.ts']
    };
};
