export interface TileBoardWorldMetrics {
    boardHeight: number;
    boardWidth: number;
    viewportHeight: number;
    viewportWidth: number;
}

export interface TileBoardViewportState {
    fitZoom: number;
    panX: number;
    panY: number;
    zoom: number;
}

export interface TileBoardViewportMetrics extends TileBoardWorldMetrics {
    fitZoom: number;
}

export interface TileBoardPanBounds {
    maxPanX: number;
    maxPanY: number;
}

export interface TileBoardScreenPoint {
    clientX: number;
    clientY: number;
}

export const BOARD_CAMERA_FIT_ZOOM = 1;
export const MOBILE_CAMERA_MIN_ZOOM = 0.01;
export const MOBILE_CAMERA_MAX_ZOOM = 2.8;
export const MOBILE_CAMERA_FIT_MARGIN = 0.92;
export const COMPACT_BOARD_FIT_MARGIN = 0.72;
export const ROOMY_BOARD_FIT_MARGIN = 0.85;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const getBoardFitZoom = ({
    boardHeight,
    boardWidth,
    margin,
    viewportHeight,
    viewportWidth
}: TileBoardWorldMetrics & {
    margin: number;
}): number => {
    if (boardHeight <= 0 || boardWidth <= 0 || viewportHeight <= 0 || viewportWidth <= 0) {
        return 1;
    }

    return Math.min((viewportWidth * margin) / boardWidth, (viewportHeight * margin) / boardHeight);
};

export const createFittedBoardViewport = (fitZoom: number): TileBoardViewportState => ({
    fitZoom,
    panX: 0,
    panY: 0,
    zoom: BOARD_CAMERA_FIT_ZOOM
});

export const clampBoardZoom = (zoom: number): number => clamp(zoom, MOBILE_CAMERA_MIN_ZOOM, MOBILE_CAMERA_MAX_ZOOM);

export const getBoardPanBounds = ({
    boardHeight,
    boardWidth,
    fitZoom,
    viewportHeight,
    viewportWidth,
    zoom
}: TileBoardWorldMetrics & Pick<TileBoardViewportState, 'fitZoom' | 'zoom'>): TileBoardPanBounds => {
    const activeScale = Math.max(fitZoom * clampBoardZoom(zoom), 0);
    const scaledBoardWidth = boardWidth * activeScale;
    const scaledBoardHeight = boardHeight * activeScale;

    return {
        // Board span includes one full card footprint at the outer edges, so edge-lock bounds keep at least one card visible.
        maxPanX: Math.max(0, (scaledBoardWidth - viewportWidth) / 2),
        maxPanY: Math.max(0, (scaledBoardHeight - viewportHeight) / 2)
    };
};

export const clampBoardPan = ({
    boardHeight,
    boardWidth,
    fitZoom,
    panX,
    panY,
    viewportHeight,
    viewportWidth,
    zoom
}: TileBoardWorldMetrics &
    Pick<TileBoardViewportState, 'fitZoom' | 'panX' | 'panY' | 'zoom'>): Pick<TileBoardViewportState, 'panX' | 'panY'> => {
    const { maxPanX, maxPanY } = getBoardPanBounds({
        boardHeight,
        boardWidth,
        fitZoom,
        viewportHeight,
        viewportWidth,
        zoom
    });

    return {
        panX: clamp(panX, -maxPanX, maxPanX),
        panY: clamp(panY, -maxPanY, maxPanY)
    };
};

export const clampBoardViewport = ({
    boardHeight,
    boardWidth,
    fitZoom,
    panX,
    panY,
    viewportHeight,
    viewportWidth,
    zoom
}: TileBoardWorldMetrics & TileBoardViewportState): TileBoardViewportState => {
    const clampedZoom = clampBoardZoom(zoom);
    const clampedPan = clampBoardPan({
        boardHeight,
        boardWidth,
        fitZoom,
        panX,
        panY,
        viewportHeight,
        viewportWidth,
        zoom: clampedZoom
    });

    return {
        fitZoom,
        panX: clampedPan.panX,
        panY: clampedPan.panY,
        zoom: clampedZoom
    };
};

const normalizePanAxis = (pan: number, maxPan: number): number => {
    if (maxPan <= 0) {
        return 0;
    }

    return pan / maxPan;
};

export const carryBoardViewportForward = ({
    nextMetrics,
    previousMetrics,
    previousViewport
}: {
    nextMetrics: TileBoardViewportMetrics;
    previousMetrics: TileBoardViewportMetrics;
    previousViewport: TileBoardViewportState;
}): TileBoardViewportState => {
    const previousZoom = clampBoardZoom(previousViewport.zoom);
    const previousBounds = getBoardPanBounds({
        boardHeight: previousMetrics.boardHeight,
        boardWidth: previousMetrics.boardWidth,
        fitZoom: previousViewport.fitZoom,
        viewportHeight: previousMetrics.viewportHeight,
        viewportWidth: previousMetrics.viewportWidth,
        zoom: previousZoom
    });
    const nextBounds = getBoardPanBounds({
        boardHeight: nextMetrics.boardHeight,
        boardWidth: nextMetrics.boardWidth,
        fitZoom: nextMetrics.fitZoom,
        viewportHeight: nextMetrics.viewportHeight,
        viewportWidth: nextMetrics.viewportWidth,
        zoom: previousZoom
    });

    return clampBoardViewport({
        boardHeight: nextMetrics.boardHeight,
        boardWidth: nextMetrics.boardWidth,
        fitZoom: nextMetrics.fitZoom,
        panX: normalizePanAxis(previousViewport.panX, previousBounds.maxPanX) * nextBounds.maxPanX,
        panY: normalizePanAxis(previousViewport.panY, previousBounds.maxPanY) * nextBounds.maxPanY,
        viewportHeight: nextMetrics.viewportHeight,
        viewportWidth: nextMetrics.viewportWidth,
        zoom: previousZoom
    });
};

export const screenPointToWorld = (
    point: TileBoardScreenPoint,
    rect: DOMRect | Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>,
    viewportWidth: number,
    viewportHeight: number
): Pick<TileBoardViewportState, 'panX' | 'panY'> => {
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    const normalizedX = (point.clientX - rect.left) / width - 0.5;
    const normalizedY = 0.5 - (point.clientY - rect.top) / height;

    return {
        panX: normalizedX * viewportWidth,
        panY: normalizedY * viewportHeight
    };
};
