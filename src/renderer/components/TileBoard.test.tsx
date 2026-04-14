import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BoardState } from '../../shared/contracts';
import { PlatformTiltProvider } from '../platformTilt/PlatformTiltProvider';
import TileBoard, { type TileBoardHandle } from './TileBoard';

const renderBoard = (props: {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    mobileCameraMode?: boolean;
    onTileSelect: (id: string) => void;
    previewActive: boolean;
    reduceMotion: boolean;
    viewportResetToken?: number;
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

    it('flips a tile when clicked on the DOM fallback board', () => {
        const onTileSelect = vi.fn();
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);

        try {
            renderBoard({
                board,
                debugPeekActive: false,
                interactive: true,
                onTileSelect,
                previewActive: false,
                reduceMotion: false
            });

            const hiddenTiles = screen.getAllByRole('button', { name: /hidden tile/i });
            fireEvent.click(hiddenTiles[1]);

            expect(onTileSelect).toHaveBeenCalledWith('a2');
        } finally {
            getContext.mockRestore();
        }
    });

    it('reveals the board during the memorize preview', () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: true,
            reduceMotion: false
        });

        expect(screen.getAllByRole('button', { name: /tile/i })).toHaveLength(4);
    });

    it('falls back to the DOM board when WebGL support is unavailable', () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
        try {
            renderBoard({
                board,
                debugPeekActive: false,
                interactive: true,
                onTileSelect: vi.fn(),
                previewActive: false,
                reduceMotion: false
            });

            expect(screen.getAllByRole('button', { name: /hidden tile/i })).toHaveLength(4);
        } finally {
            getContext.mockRestore();
        }
    });

    it('runs shuffle FLIP chrome on the DOM fallback board (CARD-020)', async () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
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

        try {
            const { container } = render(<ShuffleHarness />);
            const frame = container.querySelector('[data-testid="tile-board-frame"]');

            expect(frame).not.toBeNull();
            fireEvent.click(screen.getByTestId('trigger-shuffle-flip'));

            await waitFor(() => {
                expect(frame?.getAttribute('data-shuffle-animating')).toBe('true');
            });
        } finally {
            getContext.mockRestore();
        }
    });

    it('applies resolving mismatch chrome on DOM fallback tiles (CARD-020)', () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
        const resolvingBoard: BoardState = {
            ...board,
            flippedTileIds: ['a1', 'b1'],
            tiles: board.tiles.map((tile) =>
                tile.id === 'a1' || tile.id === 'b1' ? { ...tile, state: 'flipped' as const } : tile
            )
        };

        try {
            render(
                <PlatformTiltProvider>
                    <TileBoard
                        board={resolvingBoard}
                        debugPeekActive={false}
                        interactive={false}
                        mobileCameraMode={false}
                        onTileSelect={vi.fn()}
                        previewActive={false}
                        reduceMotion={false}
                        runStatus="resolving"
                        viewportResetToken={0}
                    />
                </PlatformTiltProvider>
            );

            const a1 = screen.getByRole('button', { name: /tile A.*row 1.*column 1/i });
            const b1 = screen.getByRole('button', { name: /tile B.*row 2.*column 1/i });

            expect(a1.className).toContain('resolvingMismatch');
            expect(b1.className).toContain('resolvingMismatch');
        } finally {
            getContext.mockRestore();
        }
    });

    it('writes nonzero field tilt CSS on the frame after viewport pointer move', async () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);

        try {
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
        } finally {
            getContext.mockRestore();
        }
    });

    it('exposes data-pair-marker on hidden DOM tiles only when showTutorialPairMarkers is true', () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
        const boardWithAtomic: BoardState = {
            ...board,
            tiles: board.tiles.map((t, i) => ({ ...t, atomicVariant: i % 4 }))
        };

        try {
            const { rerender } = render(
                <PlatformTiltProvider>
                    <TileBoard
                        board={boardWithAtomic}
                        debugPeekActive={false}
                        interactive
                        mobileCameraMode={false}
                        onTileSelect={vi.fn()}
                        previewActive={false}
                        reduceMotion={false}
                        showTutorialPairMarkers
                        viewportResetToken={0}
                    />
                </PlatformTiltProvider>
            );

            const shown = screen.getAllByRole('button', { name: /hidden tile/i });
            expect(shown.every((el) => el.getAttribute('data-pair-marker') !== null)).toBe(true);

            rerender(
                <PlatformTiltProvider>
                    <TileBoard
                        board={boardWithAtomic}
                        debugPeekActive={false}
                        interactive
                        mobileCameraMode={false}
                        onTileSelect={vi.fn()}
                        previewActive={false}
                        reduceMotion={false}
                        showTutorialPairMarkers={false}
                        viewportResetToken={0}
                    />
                </PlatformTiltProvider>
            );

            const hidden = screen.getAllByRole('button', { name: /hidden tile/i });
            expect(hidden.every((el) => el.getAttribute('data-pair-marker') === null)).toBe(true);
        } finally {
            getContext.mockRestore();
        }
    });

    it('does not set field tilt CSS when reduced motion is enabled', async () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);

        try {
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
        } finally {
            getContext.mockRestore();
        }
    });
});
