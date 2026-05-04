export type DungeonE2EFixtureId =
    | 'dungeon_enemy_floor'
    | 'dungeon_boss_floor'
    | 'dungeon_trap_room'
    | 'dungeon_shop'
    | 'dungeon_rest'
    | 'dungeon_treasure'
    | 'dungeon_event'
    | 'dungeon_exit_lock'
    | 'dungeon_floor_clear'
    | 'dungeon_game_over';

export interface DungeonE2EFixtureRecipe {
    id: DungeonE2EFixtureId;
    label: string;
    screen: 'playing' | 'shop' | 'gameOver';
    fixture: string;
    seed: number;
    floor: number;
    selectors: readonly string[];
    desktopCapture: string;
    mobileCapture: string;
    notes: string;
}

export const DUNGEON_E2E_FIXTURE_RECIPES: readonly DungeonE2EFixtureRecipe[] = [
    {
        id: 'dungeon_enemy_floor',
        label: 'Enemy floor',
        screen: 'playing',
        fixture: 'dungeonEnemy',
        seed: 72_001,
        floor: 5,
        selectors: ['[data-testid="tile-board-frame"]', '[data-dungeon-comfort-focus-order]'],
        desktopCapture: 'dungeon-enemy-floor-desktop.png',
        mobileCapture: 'dungeon-enemy-floor-mobile.png',
        notes: 'Combat board with moving patrol overlays and occupied/next-target focus copy.'
    },
    {
        id: 'dungeon_boss_floor',
        label: 'Boss floor',
        screen: 'playing',
        fixture: 'dungeonBoss',
        seed: 72_002,
        floor: 9,
        selectors: ['[data-testid="tile-board-frame"]', '[data-dungeon-stage-layer-policy]'],
        desktopCapture: 'dungeon-boss-floor-desktop.png',
        mobileCapture: 'dungeon-boss-floor-mobile.png',
        notes: 'Boss node with boss marker VFX and defeat-boss objective state.'
    },
    {
        id: 'dungeon_trap_room',
        label: 'Trap room',
        screen: 'playing',
        fixture: 'dungeonTrapRoom',
        seed: 72_003,
        floor: 7,
        selectors: ['[data-testid="tile-board-frame"]', '[data-dungeon-stage-layer-policy]'],
        desktopCapture: 'dungeon-trap-room-desktop.png',
        mobileCapture: 'dungeon-trap-room-mobile.png',
        notes: 'Trap-hall board with trap cards and glass-floor vocabulary pressure.'
    },
    {
        id: 'dungeon_shop',
        label: 'Shop node',
        screen: 'shop',
        fixture: 'shop',
        seed: 0x5150,
        floor: 3,
        selectors: ['[data-testid="game-hud"]'],
        desktopCapture: 'dungeon-shop-desktop.png',
        mobileCapture: 'dungeon-shop-mobile.png',
        notes: 'Existing floor-clear vendor fixture for purchase/confirmation smoke.'
    },
    {
        id: 'dungeon_rest',
        label: 'Rest shrine',
        screen: 'playing',
        fixture: 'dungeonRest',
        seed: 72_004,
        floor: 6,
        selectors: ['[data-testid="tile-board-frame"]'],
        desktopCapture: 'dungeon-rest-desktop.png',
        mobileCapture: 'dungeon-rest-mobile.png',
        notes: 'Rest node board with shrine/room service cards available for follow-up prompt captures.'
    },
    {
        id: 'dungeon_treasure',
        label: 'Treasure node',
        screen: 'playing',
        fixture: 'dungeonTreasure',
        seed: 72_005,
        floor: 10,
        selectors: ['[data-testid="tile-board-frame"]'],
        desktopCapture: 'dungeon-treasure-desktop.png',
        mobileCapture: 'dungeon-treasure-mobile.png',
        notes: 'Treasure node board with cache/lock reward card families.'
    },
    {
        id: 'dungeon_event',
        label: 'Event node',
        screen: 'playing',
        fixture: 'dungeonEvent',
        seed: 72_006,
        floor: 4,
        selectors: ['[data-testid="tile-board-frame"]'],
        desktopCapture: 'dungeon-event-desktop.png',
        mobileCapture: 'dungeon-event-mobile.png',
        notes: 'Event node board recipe; synthetic event prompt screenshots remain a future extension.'
    },
    {
        id: 'dungeon_exit_lock',
        label: 'Locked exit',
        screen: 'playing',
        fixture: 'dungeonExitLock',
        seed: 72_007,
        floor: 6,
        selectors: ['[data-testid="tile-board-frame"]'],
        desktopCapture: 'dungeon-exit-lock-desktop.png',
        mobileCapture: 'dungeon-exit-lock-mobile.png',
        notes: 'Exit node board with lock/lever exit state for HUD and tile a11y smoke.'
    },
    {
        id: 'dungeon_floor_clear',
        label: 'Floor clear',
        screen: 'shop',
        fixture: 'shop',
        seed: 0x5150,
        floor: 1,
        selectors: ['[role="dialog"]', '[data-testid="game-hud"]'],
        desktopCapture: 'dungeon-floor-clear-desktop.png',
        mobileCapture: 'dungeon-floor-clear-mobile.png',
        notes: 'Existing level-complete vendor fixture doubles as deterministic floor-clear screenshot state.'
    },
    {
        id: 'dungeon_game_over',
        label: 'Game over',
        screen: 'gameOver',
        fixture: 'gameOver',
        seed: 0xdead,
        floor: 1,
        selectors: ['text=Expedition Over'],
        desktopCapture: 'dungeon-game-over-desktop.png',
        mobileCapture: 'dungeon-game-over-mobile.png',
        notes: 'Existing game-over fixture avoids mismatch-burn flake for screenshot smoke.'
    }
] as const;

export const getDungeonE2EFixtureRecipes = (): readonly DungeonE2EFixtureRecipe[] => DUNGEON_E2E_FIXTURE_RECIPES;
