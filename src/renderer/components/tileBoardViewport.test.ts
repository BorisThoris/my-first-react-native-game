import { describe, expect, it } from 'vitest';
import {
    BOARD_CAMERA_FIT_ZOOM,
    MOBILE_CAMERA_MAX_ZOOM,
    MOBILE_CAMERA_MIN_ZOOM,
    carryBoardViewportForward,
    clampBoardZoom,
    clampBoardViewport,
    createFittedBoardViewport,
    getBoardFitZoom,
    getBoardPanBounds,
    screenPointToWorld
} from './tileBoardViewport';

describe('tile board viewport math', () => {
    it('computes the fit baseline from board and viewport dimensions', () => {
        const fitZoom = getBoardFitZoom({
            boardHeight: 5,
            boardWidth: 8,
            margin: 0.9,
            viewportHeight: 6,
            viewportWidth: 10
        });

        expect(fitZoom).toBeCloseTo(1.08);
    });

    it('clamps zoom and pan to the reachable board bounds', () => {
        const clamped = clampBoardViewport({
            boardHeight: 6,
            boardWidth: 8,
            fitZoom: 1,
            panX: 99,
            panY: -99,
            viewportHeight: 4,
            viewportWidth: 4,
            zoom: MOBILE_CAMERA_MAX_ZOOM + 1
        });

        expect(clamped.zoom).toBe(MOBILE_CAMERA_MAX_ZOOM);
        // Overlap-based bounds: (viewport + scaledBoard) / 2 per axis (wider than the old “fill viewport” cap).
        expect(clamped.panX).toBeCloseTo(13.2);
        expect(clamped.panY).toBeCloseTo(-10.4);
    });

    it('allows zooming out below the fitted view until the safety floor', () => {
        expect(clampBoardZoom(0.4)).toBeCloseTo(0.4);
        expect(clampBoardZoom(0.001)).toBe(MOBILE_CAMERA_MIN_ZOOM);
    });

    it('resets to the centered fit view', () => {
        expect(createFittedBoardViewport(1.34)).toEqual({
            fitZoom: 1.34,
            panX: 0,
            panY: 0,
            zoom: BOARD_CAMERA_FIT_ZOOM
        });
    });

    it('carries the zoom and relative pan framing forward to the next board fit', () => {
        const nextViewport = carryBoardViewportForward({
            previousViewport: {
                fitZoom: 1,
                panX: 1.8,
                panY: -1.2,
                zoom: 1.4
            },
            previousMetrics: {
                boardHeight: 6,
                boardWidth: 8,
                fitZoom: 1,
                viewportHeight: 4,
                viewportWidth: 4
            },
            nextMetrics: {
                boardHeight: 8,
                boardWidth: 12,
                fitZoom: 0.8,
                viewportHeight: 4,
                viewportWidth: 4
            }
        });

        expect(nextViewport.fitZoom).toBeCloseTo(0.8);
        expect(nextViewport.zoom).toBeCloseTo(1.4);
        expect(nextViewport.panX).toBeCloseTo(2.0652631578947367);
        expect(nextViewport.panY).toBeCloseTo(-1.2541935483870967);
    });

    it('keeps the board overlapping the viewport at extreme pan (edge/corner can remain)', () => {
        const fitZoom = 1;
        const zoom = 1.35;
        const viewportWidth = 4;
        const viewportHeight = 4;
        const boardWidth = 8;
        const boardHeight = 6;
        const { maxPanX, maxPanY } = getBoardPanBounds({
            boardHeight,
            boardWidth,
            fitZoom,
            viewportHeight,
            viewportWidth,
            zoom
        });
        const scaledBoardWidth = boardWidth * fitZoom * zoom;
        const scaledBoardHeight = boardHeight * fitZoom * zoom;
        const halfVw = viewportWidth / 2;
        const halfVh = viewportHeight / 2;

        const overlapForPan = (panX: number, panY: number): { w: number; h: number } => {
            const boardLeft = panX - scaledBoardWidth / 2;
            const boardRight = panX + scaledBoardWidth / 2;
            const boardBottom = panY - scaledBoardHeight / 2;
            const boardTop = panY + scaledBoardHeight / 2;
            return {
                w: Math.min(halfVw, boardRight) - Math.max(-halfVw, boardLeft),
                h: Math.min(halfVh, boardTop) - Math.max(-halfVh, boardBottom)
            };
        };

        const corners = [
            overlapForPan(maxPanX, maxPanY),
            overlapForPan(maxPanX, -maxPanY),
            overlapForPan(-maxPanX, maxPanY),
            overlapForPan(-maxPanX, -maxPanY)
        ];

        for (const { w, h } of corners) {
            expect(w).toBeGreaterThanOrEqual(0);
            expect(h).toBeGreaterThanOrEqual(0);
            expect(w * h).toBeGreaterThanOrEqual(0);
        }

        // Slightly inside the limit should leave a non-degenerate on-screen patch.
        const inset = overlapForPan(maxPanX * 0.95, maxPanY * 0.95);
        expect(inset.w).toBeGreaterThan(0);
        expect(inset.h).toBeGreaterThan(0);
    });

    it('maps screen coordinates to board world coordinates', () => {
        const point = screenPointToWorld(
            { clientX: 150, clientY: 50 },
            { height: 100, left: 0, top: 0, width: 200 },
            8,
            4
        );

        expect(point.panX).toBeCloseTo(2);
        expect(point.panY).toBeCloseTo(0);
    });
});
