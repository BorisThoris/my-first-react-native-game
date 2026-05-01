import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BoardState } from '../../shared/contracts';
import { PlatformTiltProvider } from '../platformTilt/PlatformTiltProvider';
import TileBoard, { type TileBoardHandle } from './TileBoard';
import {
    DUNGEON_BOARD_STAGE_LAYER_POLICY,
    getDungeonBoardStageLod,
    getDungeonEnemyMarkerAnchor,
    getDungeonEnemyMarkerVisualProfile
} from './tileBoardStageLayers';

/** jsdom has no GPU; stub a minimal WebGL context so the board mounts the canvas path. */
const mockWebGL2Context = (): object => ({
    canvas: document.createElement('canvas'),
    getExtension: () => null,
    loseContext: () => ({ loseContext: (): void => undefined })
});

const installWebGLMock = (): void => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
        ((contextId: string): RenderingContext | null => {
            if (contextId === 'webgl2' || contextId === 'webgl' || contextId === 'experimental-webgl') {
                return mockWebGL2Context() as unknown as WebGLRenderingContext;
            }
            return null;
        }) as typeof HTMLCanvasElement.prototype.getContext
    );
};

const renderBoard = (props: {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    mobileCameraMode?: boolean;
    onTileSelect: (id: string) => void;
    previewActive: boolean;
    reduceMotion: boolean;
    viewportResetToken?: number;
    guidedTargetTileIds?: string[];
}): ReturnType<typeof render> =>
    render(
        <PlatformTiltProvider>
            <TileBoard mobileCameraMode={props.mobileCameraMode ?? false} viewportResetToken={props.viewportResetToken ?? 0} {...props} />
        </PlatformTiltProvider>
    );

const board: BoardState = {
    level: 1,
    pairCount: 2,
    columns: 2,
    rows: 2,
    matchedPairs: 0,
    flippedTileIds: [],
    floorArchetypeId: null,
    featuredObjectiveId: null,
    tiles: [
        { id: 'a1', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden' },
        { id: 'a2', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden' },
        { id: 'b1', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' },
        { id: 'b2', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' }
    ]
};

describe('TileBoard touch and click controls', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        installWebGLMock();
    });

    it('mounts the canvas application when WebGL is available', () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        expect(screen.getByTestId('tile-board-application')).toHaveAttribute('role', 'application');
        const frame = screen.getByTestId('tile-board-frame');
        expect(frame).toHaveAttribute('data-hidden-tile-count', '4');
        expect(frame).toHaveAttribute('data-board-run-status', 'playing');
    });

    it('arms deal-in motion on mount when motion is enabled', async () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        await waitFor(
            () => {
                expect(screen.getByTestId('tile-board-frame').getAttribute('data-shuffle-animating')).toBe('true');
            },
            { timeout: 5000 }
        );
    });

    it('skips pre-board loading overlay when reduced motion is enabled', () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: true
        });

        const frame = screen.getByTestId('tile-board-frame');
        expect(frame.getAttribute('data-board-prestage')).toBe('idle');
        expect(screen.queryByTestId('tile-board-prestage-overlay')).toBeNull();
    });

    it('does not arm deal-in motion when reduced motion is enabled', () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: true
        });

        expect(screen.getByTestId('tile-board-frame').getAttribute('data-shuffle-animating')).toBe('false');
    });

    it('shows WebGL required copy when the browser cannot create a GL context', () => {
        vi.restoreAllMocks();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);

        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        expect(screen.getByTestId('tile-board-webgl-required')).toBeInTheDocument();
        expect(screen.queryByTestId('tile-board-application')).toBeNull();
    });

    it('announces keyboard focus in the live region', async () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        fireEvent.focus(screen.getByTestId('tile-board-application'));
        await waitFor(() => {
            expect(screen.getByText(/Focus: Hidden tile, row 1, column 1/i)).toBeInTheDocument();
        });
    });

    it('announces decoy trap language for face-up decoy tiles', async () => {
        const decoyBoard: BoardState = {
            ...board,
            tiles: [
                { id: 'd1', pairKey: '__decoy__', symbol: 'X', label: 'Decoy', state: 'hidden' },
                { id: 'a1', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden' },
                { id: 'a2', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden' },
                { id: 'b1', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' }
            ]
        };

        renderBoard({
            board: decoyBoard,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: true,
            reduceMotion: false
        });

        fireEvent.focus(screen.getByTestId('tile-board-application'));
        await waitFor(() => {
            expect(screen.getByText(/Focus: Decoy trap tile, row 1, column 1/i)).toBeInTheDocument();
        });
    });

    it('announces pickup reward details for visible pickup carriers', async () => {
        const pickupBoard: BoardState = {
            ...board,
            tiles: [
                { id: 'a1', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden', findableKind: 'shard_spark' },
                { id: 'a2', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden', findableKind: 'shard_spark' },
                { id: 'b1', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' },
                { id: 'b2', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' }
            ]
        };

        renderBoard({
            board: pickupBoard,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: true,
            reduceMotion: false
        });

        fireEvent.focus(screen.getByTestId('tile-board-application'));
        await waitFor(() => {
            expect(screen.getByText(/Shard spark pickup: \+1 combo shard/i)).toBeInTheDocument();
        });
    });

    it('announces route card details for route-stamped cards', async () => {
        const routeBoard: BoardState = {
            ...board,
            tiles: [
                { id: 'a1', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden', routeCardKind: 'greed_cache' },
                { id: 'a2', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden', routeCardKind: 'greed_cache' },
                { id: 'b1', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' },
                { id: 'b2', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' }
            ]
        };

        renderBoard({
            board: routeBoard,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: true,
            reduceMotion: false
        });

        fireEvent.focus(screen.getByTestId('tile-board-application'));
        await waitFor(() => {
            expect(screen.getByText(/Route card: Greed cache/i)).toBeInTheDocument();
        });
    });

    it('announces moving enemy patrol occupancy and next-target telegraphs', async () => {
        const enemyBoard: BoardState = {
            ...board,
            enemyHazards: [
                {
                    id: 'hazard-1',
                    kind: 'sentinel',
                    label: 'Patrol Sentry',
                    currentTileId: 'a2',
                    nextTileId: 'a1',
                    pattern: 'patrol',
                    state: 'revealed',
                    damage: 1,
                    hp: 1,
                    maxHp: 2
                }
            ]
        };

        const rendered = renderBoard({
            board: enemyBoard,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        fireEvent.focus(screen.getByTestId('tile-board-application'));
        await waitFor(() => {
            expect(screen.getByText(/Next target of moving enemy patrol Patrol Sentry, 1\/2 HP, 1 damage/i)).toBeInTheDocument();
        });
        rendered.unmount();

        renderBoard({
            board: {
                ...enemyBoard,
                enemyHazards: enemyBoard.enemyHazards!.map((hazard) => ({
                    ...hazard,
                    currentTileId: 'a1',
                    nextTileId: 'a2'
                }))
            },
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });
        fireEvent.focus(screen.getByTestId('tile-board-application'));

        await waitFor(() => {
            expect(screen.getByText(/Occupied by revealed moving enemy patrol Patrol Sentry, 1\/2 HP, 1 damage/i)).toBeInTheDocument();
        });
    });

    it('exposes board grid dimensions on the frame for tests and assistive tech', () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        const frame = screen.getByTestId('tile-board-frame');
        expect(frame.getAttribute('data-board-columns')).toBe('2');
        expect(frame.getAttribute('data-board-rows')).toBe('2');
    });

    it('exposes the dungeon stage layer policy version on the frame', () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        expect(screen.getByTestId('tile-board-frame')).toHaveAttribute(
            'data-dungeon-stage-layer-policy',
            DUNGEON_BOARD_STAGE_LAYER_POLICY.version
        );
    });

    it('keeps dungeon encounter markers above objective chrome without covering card center text', () => {
        expect(DUNGEON_BOARD_STAGE_LAYER_POLICY.nextThreatTelegraph.renderOrder).toBeGreaterThan(
            DUNGEON_BOARD_STAGE_LAYER_POLICY.objectiveGlyph.renderOrder
        );
        expect(DUNGEON_BOARD_STAGE_LAYER_POLICY.currentThreat.renderOrder).toBeGreaterThan(
            DUNGEON_BOARD_STAGE_LAYER_POLICY.resolvingMatch.renderOrder
        );
        expect(DUNGEON_BOARD_STAGE_LAYER_POLICY.keyboardFocus.renderOrder).toBeGreaterThan(
            DUNGEON_BOARD_STAGE_LAYER_POLICY.currentThreat.renderOrder
        );

        const baseTransform = {
            baseX: 0,
            baseY: 0,
            imperfectionX: 0,
            imperfectionY: 0,
            layoutJitterX: 0,
            layoutJitterY: 0
        };
        const [currentX, currentY] = getDungeonEnemyMarkerAnchor(baseTransform, 'currentThreat');
        const [nextX, nextY] = getDungeonEnemyMarkerAnchor(baseTransform, 'nextThreatTelegraph');

        expect(currentX).toBeGreaterThan(0);
        expect(currentY).toBeGreaterThan(0);
        expect(nextX).toBeLessThan(0);
        expect(nextY).toBeLessThan(0);
    });

    it('keeps low-quality and reduced-motion dungeon threat indicators readable', () => {
        const low = getDungeonBoardStageLod('low', false);
        const reduced = getDungeonBoardStageLod('high', true);

        expect(low.strongEffectBudget).toBe('critical-only');
        expect(low.currentMarkerOpacity).toBeGreaterThanOrEqual(0.88);
        expect(low.nextTelegraphOpacity).toBeGreaterThan(0.3);
        expect(reduced.markerMotionEnabled).toBe(false);
        expect(reduced.nextTelegraphOpacity).toBeGreaterThan(0.3);
    });

    it('assigns non-color-only visual identities to each enemy kind and bosses', () => {
        const hazards = [
            { kind: 'sentinel' as const, bossId: undefined, expectedShape: 'sentinel-diamond' },
            { kind: 'stalker' as const, bossId: undefined, expectedShape: 'stalker-spear' },
            { kind: 'warden' as const, bossId: undefined, expectedShape: 'warden-shield' },
            { kind: 'observer' as const, bossId: undefined, expectedShape: 'observer-eye' },
            { kind: 'sentinel' as const, bossId: 'rush_sentinel' as const, expectedShape: 'boss-crown' }
        ];

        for (const hazard of hazards) {
            expect(getDungeonEnemyMarkerVisualProfile(hazard, 'medium', false).shape).toBe(hazard.expectedShape);
        }

        const boss = getDungeonEnemyMarkerVisualProfile({ kind: 'sentinel', bossId: 'rush_sentinel' }, 'high', false);
        const sentinel = getDungeonEnemyMarkerVisualProfile({ kind: 'sentinel', bossId: undefined }, 'high', false);
        expect(boss.mainScale[0]).toBeGreaterThan(sentinel.mainScale[0]);
        expect(boss.secondaryOpacity).toBeGreaterThan(0);
    });

    it('keeps enemy marker VFX within static reduced-motion and low-quality LOD bounds', () => {
        const low = getDungeonEnemyMarkerVisualProfile({ kind: 'stalker', bossId: undefined }, 'low', false);
        const reduced = getDungeonEnemyMarkerVisualProfile({ kind: 'stalker', bossId: undefined }, 'high', true);
        const high = getDungeonEnemyMarkerVisualProfile({ kind: 'stalker', bossId: undefined }, 'high', false);

        expect(low.haloOpacity).toBeLessThan(high.haloOpacity);
        expect(low.motionHz).toBeLessThan(high.motionHz);
        expect(reduced.motionHz).toBe(0);
        expect(reduced.secondaryOpacity).toBeGreaterThan(0.5);
    });

    it('sets shuffle animating on the frame while the WebGL stagger window is active', async () => {
        const tileBoardRef = createRef<TileBoardHandle>();

        const ShuffleHarness = (): ReactElement => {
            const [tiles, setTiles] = useState(board.tiles);

            return (
                <PlatformTiltProvider>
                    <TileBoard
                        ref={tileBoardRef}
                        board={{ ...board, tiles }}
                        debugPeekActive={false}
                        interactive
                        mobileCameraMode={false}
                        onTileSelect={vi.fn()}
                        previewActive={false}
                        reduceMotion={false}
                        viewportResetToken={0}
                    />
                    <button
                        data-testid="trigger-shuffle-flip"
                        onClick={() => {
                            tileBoardRef.current?.runShuffleAnimation(() => {
                                setTiles((current) => [...current].reverse());
                            });
                        }}
                        type="button"
                    >
                        Shuffle
                    </button>
                </PlatformTiltProvider>
            );
        };

        const { container } = render(<ShuffleHarness />);
        const frame = container.querySelector('[data-testid="tile-board-frame"]');

        expect(frame).not.toBeNull();
        fireEvent.click(screen.getByTestId('trigger-shuffle-flip'));

        await waitFor(() => {
            expect(frame?.getAttribute('data-shuffle-animating')).toBe('true');
        });
    });

    it('does not set field tilt CSS on the frame when reduced motion is enabled', async () => {
        const { container } = renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: true
        });

        const frame = container.firstElementChild as HTMLElement;

        fireEvent.pointerMove(window, {
            clientX: Math.round(window.innerWidth * 0.84),
            clientY: Math.round(window.innerHeight * 0.22),
            pointerType: 'mouse'
        });

        await new Promise((r) => {
            setTimeout(r, 30);
        });

        expect(frame.style.getPropertyValue('--tilt-x')).toBe('');
    });

    it('writes nonzero field tilt CSS on the frame after viewport pointer move when motion is on', async () => {
        const { container } = renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        const frame = container.firstElementChild as HTMLElement;

        fireEvent.pointerMove(window, {
            clientX: Math.round(window.innerWidth * 0.84),
            clientY: Math.round(window.innerHeight * 0.22),
            pointerType: 'mouse'
        });

        await waitFor(() => {
            const tx = frame.style.getPropertyValue('--tilt-x').trim();

            expect(tx).not.toBe('');
            expect(Math.abs(Number.parseFloat(tx))).toBeGreaterThan(0.01);
        });
    });
});
