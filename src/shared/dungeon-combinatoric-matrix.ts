export type DungeonCombinatoricPriority = 'P0' | 'P1';
export type DungeonCombinatoricStatus = 'covered' | 'excluded' | 'future';

export interface DungeonCombinatoricMatrixRow {
    id: string;
    priority: DungeonCombinatoricPriority;
    status: DungeonCombinatoricStatus;
    mode: string;
    node: string;
    archetype: string;
    objective: string;
    mutator: string;
    relicOrEconomy: string;
    cardFamily: string;
    enemy: string;
    input: string;
    viewport: string;
    evidence: readonly string[];
    rationale: string;
}

export const DUNGEON_COMBINATORIC_MATRIX_VERSION = 'dng-070-v2' as const;

export const DUNGEON_COMBINATORIC_MATRIX: readonly DungeonCombinatoricMatrixRow[] = [
    {
        id: 'route_safe_locked_exit_patrol_keyboard_mobile',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run',
        node: 'Safe route',
        archetype: 'route-aware floor',
        objective: 'find_exit / locked exit',
        mutator: 'none required',
        relicOrEconomy: 'iron key / guard token',
        cardFamily: 'Safe Ward + exit cards',
        enemy: 'moving enemy patrol',
        input: 'keyboard/controller focus contract',
        viewport: 'mobile board-primary shell',
        evidence: ['src/shared/game.test.ts', 'src/renderer/components/TileBoard.test.tsx'],
        rationale: 'Locks, exits, route cards, occupied patrol tiles, and non-pointer selection are release-critical.'
    },
    {
        id: 'route_greed_shop_treasure_exploit_bounds',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run',
        node: 'Greed route',
        archetype: 'shop / treasure economy floor',
        objective: 'loot_cache',
        mutator: 'none required',
        relicOrEconomy: 'shop gold + treasure reward pacing',
        cardFamily: 'Greed Cache + treasure cache',
        enemy: 'optional patrol pressure',
        input: 'pointer or keyboard confirm',
        viewport: 'desktop and compact HUD',
        evidence: ['src/shared/game.test.ts', 'src/shared/bonus-rewards.test.ts', 'src/shared/exploit-surface.test.ts'],
        rationale: 'Greed rewards must be claimable, bounded, and not farmable through repeated room/shop actions.'
    },
    {
        id: 'route_mystery_reveal_omen_observer',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run',
        node: 'Mystery route',
        archetype: 'unknown/reveal floor',
        objective: 'reveal_unknowns',
        mutator: 'n-back or mystery veil pressure',
        relicOrEconomy: 'Favor / peek charge',
        cardFamily: 'Mystery Veil + Omen Seal',
        enemy: 'observer patrol',
        input: 'tile a11y focus',
        viewport: 'desktop WebGL',
        evidence: ['src/shared/game.test.ts', 'src/shared/dungeon-cards.test.ts', 'src/renderer/components/TileBoard.test.tsx'],
        rationale: 'Mystery floors combine hidden card knowledge, protected anchors, and observer targeting.'
    },
    {
        id: 'boss_floor_defeat_exit_reward_audio_visual',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run',
        node: 'Boss route / boss floor',
        archetype: 'boss pacing',
        objective: 'defeat_boss',
        mutator: 'presentation pressure allowed',
        relicOrEconomy: 'boss reward hook + Favor',
        cardFamily: 'Keystone Pair / boss cards',
        enemy: 'boss patrol or boss card pair',
        input: 'keyboard and pointer',
        viewport: 'desktop and mobile',
        evidence: [
            'src/shared/boss-encounters.test.ts',
            'src/shared/game.test.ts',
            'src/renderer/audio/dungeonAudioEventCoverage.test.ts',
            'src/renderer/components/TileBoard.test.tsx'
        ],
        rationale: 'Boss identity, defeat-gated exits, rewards, audio coverage, and distinct marker presentation must stay aligned.'
    },
    {
        id: 'trap_hall_disarm_glass_decoy_objective',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run',
        node: 'Hazard/trap floor',
        archetype: 'trap_hall',
        objective: 'disarm_traps / glass_witness',
        mutator: 'glass_floor',
        relicOrEconomy: 'destroy / peek restrictions',
        cardFamily: 'Trap cards + glass decoy',
        enemy: 'non-boss patrol optional',
        input: 'keyboard and pointer',
        viewport: 'desktop board',
        evidence: ['src/shared/game.test.ts', 'src/shared/softlock-fairness.test.ts', 'src/shared/dungeon-cards.test.ts'],
        rationale: 'Trap cards and decoys are the highest-risk vocabulary/objective overlap.'
    },
    {
        id: 'elite_route_anchor_no_boss_identity',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run',
        node: 'Hard non-boss route',
        archetype: 'elite anchor',
        objective: 'claim_route / pacify_floor',
        mutator: 'route pressure',
        relicOrEconomy: 'elite reward budget',
        cardFamily: 'Elite Cache / Final Ward / Omen Seal',
        enemy: 'elite encounter, not boss',
        input: 'tile a11y focus',
        viewport: 'desktop or mobile',
        evidence: ['src/shared/game.test.ts', 'src/shared/dungeon-cards.test.ts'],
        rationale: 'Elite anchors must not inherit boss IDs or boss defeat gates.'
    },
    {
        id: 'room_shop_rest_event_one_shot',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run',
        node: 'Room / shop / rest / event',
        archetype: 'utility floor',
        objective: 'utility side objective',
        mutator: 'none required',
        relicOrEconomy: 'shop gold, Favor, guard, heal services',
        cardFamily: 'room cards',
        enemy: 'enemy contact precedence over utility action',
        input: 'prompt confirm/back',
        viewport: 'mobile prompt policy',
        evidence: [
            'src/shared/game.test.ts',
            'src/shared/rest-shrine.test.ts',
            'src/shared/run-events.test.ts',
            'src/shared/exploit-surface.test.ts'
        ],
        rationale: 'One-shot services must stay usable without becoming repeatable farms or focus traps.'
    },
    {
        id: 'relic_mutator_contract_forbidden_offer',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run / contract run',
        node: 'Relic draft',
        archetype: 'milestone shrine',
        objective: 'featured objective streak',
        mutator: 'scholar/no-shuffle/no-destroy constraints',
        relicOrEconomy: 'relic draft filtering',
        cardFamily: 'not card-family specific',
        enemy: 'not enemy-specific',
        input: 'relic pick confirm',
        viewport: 'overlay',
        evidence: ['src/shared/relics.test.ts', 'src/shared/mechanics-encyclopedia.test.ts'],
        rationale: 'Relic offers must not contradict active contracts or mutator rules.'
    },
    {
        id: 'ppi009_fixture_route_choices_seeded_floor_clear',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run / playable path fixture',
        node: 'Floor clear route choice',
        archetype: 'deterministic route fork',
        objective: 'choose safe / greed / mystery next route',
        mutator: 'seeded fixture path',
        relicOrEconomy: 'route reward preview / pending route card plan',
        cardFamily: 'Safe Ward + Greed Cache + Mystery Veil',
        enemy: 'post-clear board has no active enemy blocker',
        input: 'route choice confirm',
        viewport: 'fixture-ready interlude',
        evidence: ['src/shared/playable-path-fixtures.test.ts', 'src/shared/dungeon-combinatoric-matrix.test.ts'],
        rationale: 'PPI-009 needs route-state proof that does not depend on random first-floor route availability.'
    },
    {
        id: 'ppi009_fixture_shop_wallet_compatible_offer',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run / playable path fixture',
        node: 'Shop interlude',
        archetype: 'deterministic vendor floor',
        objective: 'buy or skip without blocking next floor',
        mutator: 'seeded fixture path',
        relicOrEconomy: 'shop gold, low-gold offer disabled state, compatible stock',
        cardFamily: 'shop service cards',
        enemy: 'none during vendor prompt',
        input: 'shop buy/skip confirm',
        viewport: 'fixture-ready shop overlay',
        evidence: [
            'src/shared/playable-path-fixtures.test.ts',
            'src/shared/shop-rules.test.ts',
            'src/shared/dungeon-combinatoric-matrix.test.ts'
        ],
        rationale: 'Playable-path shop proof must cover both spendable stock and low-wallet non-purchase states without creating a dead end.'
    },
    {
        id: 'ppi009_fixture_side_room_then_shop_handoff',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run / playable path fixture',
        node: 'Side room into optional shop',
        archetype: 'rest / event / bonus reward side room',
        objective: 'resolve or skip side room and preserve continuation',
        mutator: 'seeded safe / greed / mystery route branch',
        relicOrEconomy: 'heal, event choice, bonus reward, shop offers',
        cardFamily: 'room cards + route reward cards',
        enemy: 'enemy contact deferred until next board',
        input: 'side-room choice and continue confirm',
        viewport: 'fixture-ready side-room overlay',
        evidence: [
            'src/shared/playable-path-fixtures.test.ts',
            'src/shared/rest-shrine.test.ts',
            'src/shared/run-events.test.ts',
            'src/shared/bonus-rewards.test.ts',
            'src/shared/dungeon-combinatoric-matrix.test.ts'
        ],
        rationale: 'The side-room handoff is a high-risk playable-path transition because it can combine one-shot rewards, shop state, and next-floor routing.'
    },
    {
        id: 'ppi009_fixture_relic_draft_before_next_floor',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run / playable path fixture',
        node: 'Milestone relic draft',
        archetype: 'deterministic post-floor draft',
        objective: 'pick or inspect relic before continuing',
        mutator: 'seeded milestone path',
        relicOrEconomy: 'relic offer options and Favor reset',
        cardFamily: 'not card-family specific',
        enemy: 'none during relic draft',
        input: 'relic pick confirm',
        viewport: 'fixture-ready relic overlay',
        evidence: [
            'src/shared/playable-path-fixtures.test.ts',
            'src/shared/relics.test.ts',
            'src/shared/dungeon-combinatoric-matrix.test.ts'
        ],
        rationale: 'Relic drafts must remain reproducible as a non-terminal state with an obvious legal pick before the next generated board.'
    },
    {
        id: 'ppi009_fixture_game_over_terminal_explained',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run / playable path fixture',
        node: 'Game over',
        archetype: 'terminal post-run state',
        objective: 'show final summary and restart/menu actions',
        mutator: 'seeded zero-life terminal state',
        relicOrEconomy: 'run summary score and rewards',
        cardFamily: 'not card-family specific',
        enemy: 'terminal state after failure',
        input: 'restart or menu confirm',
        viewport: 'fixture-ready game-over screen',
        evidence: [
            'src/shared/playable-path-fixtures.test.ts',
            'src/shared/softlock-fairness.test.ts',
            'src/shared/dungeon-combinatoric-matrix.test.ts'
        ],
        rationale: 'PPI-009 allows terminal states only when they are explicit, summarized, and no longer pretend to have a board completion route.'
    },
    {
        id: 'ppi009_high_risk_board_completion_timing',
        priority: 'P0',
        status: 'covered',
        mode: 'Classic Run / board fairness',
        node: 'High-risk active board',
        archetype: 'trap, decoy, locked exit, boss objective, wild edge',
        objective: 'complete final actionable pair or report unreachable objective',
        mutator: 'glass_floor / route lock / wild singleton edge',
        relicOrEconomy: 'destroy, peek, stray, key or no-key exit state',
        cardFamily: 'trap cards + glass decoy + exit + objective cards',
        enemy: 'final hazard pair, boss route, stale hazard references',
        input: 'tile flip / power targeting / exit activation',
        viewport: 'active board',
        evidence: ['src/shared/softlock-fairness.test.ts', 'src/shared/dungeon-combinatoric-matrix.test.ts'],
        rationale: 'Board timing proof owns the cases most likely to strand a player near completion: final traps, decoys, locked exits, missing boss routes, and orphaned wilds.'
    },
    {
        id: 'forbidden_stray_remove_protected_route_anchors',
        priority: 'P0',
        status: 'excluded',
        mode: 'Classic Run',
        node: 'Any protected route/boss node',
        archetype: 'protected anchor',
        objective: 'defeat_boss / claim_route',
        mutator: 'stray remove power',
        relicOrEconomy: 'stray charge',
        cardFamily: 'Keystone Pair / Final Ward / Omen Seal',
        enemy: 'boss or elite anchor',
        input: 'power targeting',
        viewport: 'all',
        evidence: ['src/shared/game.test.ts'],
        rationale: 'Protected anchors are intentionally not legal Stray remove targets; test coverage owns the exclusion.'
    },
    {
        id: 'future_visual_fixture_screenshot_matrix',
        priority: 'P1',
        status: 'future',
        mode: 'Classic Run',
        node: 'All major dungeon states',
        archetype: 'visual fixtures',
        objective: 'all objectives',
        mutator: 'representative presentation mutators',
        relicOrEconomy: 'representative HUD economy',
        cardFamily: 'enemy/trap/treasure/shop/exit',
        enemy: 'all enemy kinds + boss',
        input: 'Playwright smoke',
        viewport: 'desktop and mobile screenshots',
        evidence: ['DNG-072'],
        rationale: 'Visual fixture breadth belongs to the dedicated E2E/screenshot ticket after layer/UI stabilization.'
    }
] as const;

export const getDungeonCombinatoricMatrix = (): readonly DungeonCombinatoricMatrixRow[] =>
    DUNGEON_COMBINATORIC_MATRIX;

export const dungeonCombinatoricRowsByStatus = (
    status: DungeonCombinatoricStatus
): DungeonCombinatoricMatrixRow[] => DUNGEON_COMBINATORIC_MATRIX.filter((row) => row.status === status);
