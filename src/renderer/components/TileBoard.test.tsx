import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BoardState } from '../../shared/contracts';
import { PlatformTiltProvider } from '../platformTilt/PlatformTiltProvider';
import TileBoard, { type TileBoardHandle } from './TileBoard';

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
        expect(screen.getByTestId('tile-board-frame')).toHaveAttribute('data-hidden-tile-count', '4');
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

    it('announces keyboard focus in the live region', () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: false,
            reduceMotion: false
        });

        expect(screen.getByText(/Focus: Hidden tile, row 1, column 1/i)).toBeInTheDocument();
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
