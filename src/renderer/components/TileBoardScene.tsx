import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import {
    CanvasTexture,
    DoubleSide,
    LinearFilter,
    MathUtils,
    MultiplyBlending,
    PlaneGeometry,
    Raycaster,
    SRGBColorSpace,
    Vector2,
    Vector3,
    type BufferAttribute,
    type Group
} from 'three';
import type { BoardState, RunStatus, Tile } from '../../shared/contracts';
import {
    applyAnisotropyToCachedTileTextures,
    getCardBackStaticTexture,
    getTileFaceOverlayTexture,
    subscribeTextureImageUpdates,
    type FaceVariant
} from './tileTextures';
import {
    CORE_SCALE,
    SHELL_SCALE,
    TILE_DEPTH,
    TILE_SPACING
} from './tileShatter';
import type { TiltVector } from '../platformTilt/platformTiltTypes';
import { RENDERER_THEME } from '../styles/theme';
import { getTileFieldAmplification } from './tileFieldTilt';
import { isTilePickable, noopMeshRaycast, pickableMeshRaycast } from './tileBoardPick';
import { getResolvingSelectionState, type ResolvingSelectionState } from './tileResolvingSelection';
import type { TileBoardViewportState } from './tileBoardViewport';

interface TileBoardSceneProps {
    board: BoardState;
    boardViewport: TileBoardViewportState;
    compact: boolean;
    debugPeekActive: boolean;
    fieldTiltRef: MutableRefObject<TiltVector>;
    hoverTiltRef: MutableRefObject<TileHoverTiltState>;
    interactionSuppressed: boolean;
    interactive: boolean;
    onTilePick: (tileId: string) => void;
    onViewportMetricsChange: (viewport: { width: number; height: number }) => void;
    pinnedTileIds: string[];
    previewActive: boolean;
    reduceMotion: boolean;
    runStatus: RunStatus;
    /** Wall-clock ms; while `now < deadline`, tile groups ease XY toward layout targets (shuffle). */
    shuffleMotionDeadlineMs: number;
}

interface TileBezelProps {
    faceUp: boolean;
    fieldAmp: number;
    fieldTiltRef: MutableRefObject<TiltVector>;
    flipLocked: boolean;
    hoverTiltRef: MutableRefObject<TileHoverTiltState>;
    interactionSuppressed: boolean;
    interactive: boolean;
    isPinned: boolean;
    onTilePick: (tileId: string) => void;
    reduceMotion: boolean;
    resolvingSelection: ResolvingSelectionState;
    shuffleMotionDeadlineMs: number;
    textureRevision: number;
    tile: Tile;
    transform: TileTransform;
}

export interface TileHoverTiltState {
    tileId: string | null;
    x: number;
    y: number;
}

export interface TileBoardSceneHandle {
    pickTileAtClientPoint: (clientX: number, clientY: number) => boolean;
}

interface TileTransform {
    baseX: number;
    baseY: number;
    baseScale: number;
    bezelScale: number;
    panelScale: number;
    imperfectionRotationX: number;
    imperfectionRotationZ: number;
    imperfectionX: number;
    imperfectionY: number;
    targetRotation: number;
    seed: number;
}

const CARD_WIDTH = 0.74;
const CARD_HEIGHT = 1.08;
const CARD_FACE_INSET = 0.016;
const CARD_FACE_WIDTH = CARD_WIDTH - CARD_FACE_INSET * 2;
const CARD_FACE_HEIGHT = CARD_HEIGHT - CARD_FACE_INSET * 2;

/** Segments per card face for soft bend deformation. */
const CARD_BEND_SEGMENTS = 22;
/** Base bulge depth (world units); tuned so a single click is clearly visible. */
const CARD_BEND_MAX_DEPTH = 0.038;
const CARD_BEND_RADIUS = 0.52 * Math.min(CARD_WIDTH, CARD_HEIGHT);
/** Extra depth multiplier from repeated presses near the same UV (same face). */
const BEND_BUILDUP_PER_PRESS = 0.5;
const BEND_BUILDUP_MAX = 2.75;
const BEND_UV_SAME_SPOT = 0.14;
/** Wear mask resolution (canvas); drawn on each bend commit. */
const WEAR_TEX_SIZE = 128;
const BOARD_VIEWPORT_IDLE_DAMPING = 5.2;
const BOARD_VIEWPORT_ACTIVE_DAMPING = 7.4;
const BOARD_VIEWPORT_IDLE_SCALE_DAMPING = 4.8;
const BOARD_VIEWPORT_ACTIVE_SCALE_DAMPING = 6.8;

type CardBendFace = 'front' | 'back';

type BendSourceEvent = ThreeEvent<PointerEvent | MouseEvent>;

const scratchHitLocal = new Vector3();

const cloneBasePositions = (geometry: PlaneGeometry): Float32Array =>
    new Float32Array((geometry.attributes.position as BufferAttribute).array);

/**
 * Plane vertex (px, py) → same UV convention as Three.js PlaneGeometry / box face (v = 1 at +Y side of plane).
 */
const planeVertexToUv = (px: number, py: number, width: number, height: number): { u: number; v: number } => ({
    u: px / width + 0.5,
    v: py / height + 0.5
});

const bendFalloffAtUv = (u: number, v: number, bendU: number, bendV: number, width: number, height: number): number => {
    const dx = (u - bendU) * width;
    const dy = (v - bendV) * height;
    const dist = Math.hypot(dx, dy);
    const t = MathUtils.clamp(1 - dist / CARD_BEND_RADIUS, 0, 1);

    return t * t * (3 - 2 * t);
};

/** Map raycast UV to shared card UV so front + back planes bulge at the same spot (back mesh is Y-flipped π). */
const hitUvToCanonicalBendUv = (face: CardBendFace, u: number, v: number): { u: number; v: number } =>
    face === 'front' ? { u, v } : { u: 1 - u, v };

/** Add permanent Z offsets (into persistent) for one bend stamp. */
const addPersistentBendStamp = (
    persistent: Float32Array,
    base: Float32Array,
    bendU: number,
    bendV: number,
    width: number,
    height: number,
    depthScale: number
): void => {
    const depth = CARD_BEND_MAX_DEPTH * depthScale;
    const vertexCount = persistent.length;

    for (let index = 0; index < vertexCount; index += 1) {
        const offset = index * 3;
        const px = base[offset];
        const py = base[offset + 1];
        const { u, v } = planeVertexToUv(px, py, width, height);
        const wgt = bendFalloffAtUv(u, v, bendU, bendV, width, height);
        persistent[index] += depth * wgt;
    }
};

const composeCardPositions = (
    positions: BufferAttribute,
    base: Float32Array,
    persistentZ: Float32Array,
    bendU: number,
    bendV: number,
    width: number,
    height: number,
    liveDepthScale: number
): void => {
    const array = positions.array as Float32Array;
    const vertexCount = array.length / 3;
    const liveDepth = CARD_BEND_MAX_DEPTH * liveDepthScale;

    for (let index = 0; index < vertexCount; index += 1) {
        const offset = index * 3;
        const px = base[offset];
        const py = base[offset + 1];
        const z0 = base[offset + 2];
        const { u, v } = planeVertexToUv(px, py, width, height);
        const wgt = bendFalloffAtUv(u, v, bendU, bendV, width, height);
        array[offset] = px;
        array[offset + 1] = py;
        array[offset + 2] = z0 + persistentZ[index] + liveDepth * wgt;
    }

    positions.needsUpdate = true;
};

const createWearTextureAndContext = (): {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    texture: CanvasTexture;
} => {
    const canvas = document.createElement('canvas');
    canvas.width = WEAR_TEX_SIZE;
    canvas.height = WEAR_TEX_SIZE;
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('2D canvas context required for card wear texture');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, WEAR_TEX_SIZE, WEAR_TEX_SIZE);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.premultiplyAlpha = true;
    texture.needsUpdate = true;

    return { canvas, context, texture };
};

const drawWearStamp = (context: CanvasRenderingContext2D, bendU: number, bendV: number, intensity: number): void => {
    const gx = bendU * WEAR_TEX_SIZE;
    const gy = (1 - bendV) * WEAR_TEX_SIZE;
    const radius = WEAR_TEX_SIZE * 0.14;
    const gradient = context.createRadialGradient(gx, gy, 0, gx, gy, radius);
    const a = MathUtils.clamp(0.05 + intensity * 0.07, 0.06, 0.22);
    gradient.addColorStop(0, `rgba(45,35,28,${a})`);
    gradient.addColorStop(0.55, `rgba(55,42,32,${a * 0.45})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.save();
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = gradient;
    context.fillRect(0, 0, WEAR_TEX_SIZE, WEAR_TEX_SIZE);
    context.restore();
};

const hashString = (value: string): number => {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) | 0;
    }

    return Math.abs(hash);
};

const getSurfaceVariant = (tile: Tile, faceUp: boolean, resolving: ResolvingSelectionState): FaceVariant => {
    if (tile.state === 'matched') {
        return 'matched';
    }

    if (faceUp && resolving === 'mismatch') {
        return 'mismatch';
    }

    return faceUp ? 'active' : 'hidden';
};

const getTileTransform = (tile: Tile, index: number, totalColumns: number, totalRows: number, compact: boolean, faceUp: boolean): TileTransform => {
    const seed = hashString(tile.id);
    const column = index % totalColumns;
    const baseX = (column - (totalColumns - 1) / 2) * TILE_SPACING;
    const baseY = ((totalRows - 1) / 2 - Math.floor(index / totalColumns)) * TILE_SPACING;
    const imperfectionX = (((seed % 19) - 9) * 0.0025) / (compact ? 1.2 : 1);
    const imperfectionY = ((((seed >> 3) % 19) - 9) * 0.0024) / (compact ? 1.2 : 1);
    const imperfectionRotationX = (((seed >> 5) % 11) - 5) * 0.0028;
    const imperfectionRotationZ = (((seed >> 7) % 11) - 5) * 0.0026;
    const baseScale = 0.968 + ((seed % 7) * 0.0018);
    const bezelScale = SHELL_SCALE + ((seed % 5) * 0.0028);
    const panelScale = CORE_SCALE + ((seed % 5) * 0.002);
    const targetRotation = faceUp ? 0 : Math.PI;

    return {
        baseScale,
        baseX,
        baseY,
        bezelScale,
        imperfectionRotationX,
        imperfectionRotationZ,
        imperfectionX,
        imperfectionY,
        panelScale,
        seed,
        targetRotation
    };
};

const TileBezel = ({
    faceUp,
    fieldAmp,
    fieldTiltRef,
    flipLocked,
    hoverTiltRef,
    interactionSuppressed,
    interactive,
    isPinned,
    onTilePick,
    reduceMotion,
    resolvingSelection,
    shuffleMotionDeadlineMs,
    textureRevision,
    tile,
    transform
}: TileBezelProps) => {
    const { gl } = useThree();
    const groupRef = useRef<Group | null>(null);
    const isMatched = tile.state === 'matched';
    const pickable = !interactionSuppressed && isTilePickable(tile, interactive, flipLocked);

    const frontGeometry = useMemo(
        () => new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_BEND_SEGMENTS, CARD_BEND_SEGMENTS),
        []
    );
    const backGeometry = useMemo(
        () => new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_BEND_SEGMENTS, CARD_BEND_SEGMENTS),
        []
    );
    const overlayGeometry = useMemo(
        () =>
            new PlaneGeometry(
                CARD_FACE_WIDTH,
                CARD_FACE_HEIGHT,
                CARD_BEND_SEGMENTS,
                CARD_BEND_SEGMENTS
            ),
        []
    );

    const frontBaseRef = useRef<Float32Array | null>(null);
    const backBaseRef = useRef<Float32Array | null>(null);
    const overlayBaseRef = useRef<Float32Array | null>(null);

    const vertexCount = (CARD_BEND_SEGMENTS + 1) * (CARD_BEND_SEGMENTS + 1);
    const frontPersistentRef = useRef<Float32Array>(new Float32Array(vertexCount));
    const backPersistentRef = useRef<Float32Array>(new Float32Array(vertexCount));
    const overlayPersistentRef = useRef<Float32Array>(new Float32Array(vertexCount));

    const bendURef = useRef(0.5);
    const bendVRef = useRef(0.5);
    const bendBuildupRef = useRef(0);
    const lastBumpURef = useRef<number | null>(null);
    const lastBumpVRef = useRef<number | null>(null);
    const pressingOnCardRef = useRef(false);

    const [wearAssets] = useState(() => {
        if (typeof document === 'undefined') {
            return null;
        }

        return {
            back: createWearTextureAndContext(),
            front: createWearTextureAndContext()
        };
    });

    useLayoutEffect(() => {
        frontBaseRef.current = cloneBasePositions(frontGeometry);
        backBaseRef.current = cloneBasePositions(backGeometry);
        overlayBaseRef.current = cloneBasePositions(overlayGeometry);
    }, [backGeometry, frontGeometry, overlayGeometry]);

    useLayoutEffect(() => {
        if (!wearAssets) {
            return;
        }

        const cap = Math.min(8, gl.capabilities.getMaxAnisotropy());
        /* eslint-disable react-hooks/immutability -- Three.js CanvasTexture GPU fields are intentionally mutated */
        wearAssets.front.texture.anisotropy = cap;
        wearAssets.back.texture.anisotropy = cap;
        /* eslint-enable react-hooks/immutability */
    }, [gl, wearAssets]);

    const commitPersistentBend = (): void => {
        if (reduceMotion) {
            return;
        }

        const frontBase = frontBaseRef.current;
        const backBase = backBaseRef.current;
        const overlayBase = overlayBaseRef.current;

        if (!frontBase || !backBase || !overlayBase) {
            return;
        }

        const bu = bendURef.current;
        const bv = bendVRef.current;
        const depthScale = 1 + bendBuildupRef.current * 0.52;
        const bendOverlay = getSurfaceVariant(tile, faceUp, resolvingSelection) !== 'hidden';

        addPersistentBendStamp(frontPersistentRef.current, frontBase, bu, bv, CARD_WIDTH, CARD_HEIGHT, depthScale);
        addPersistentBendStamp(backPersistentRef.current, backBase, bu, bv, CARD_WIDTH, CARD_HEIGHT, depthScale);

        if (bendOverlay) {
            addPersistentBendStamp(
                overlayPersistentRef.current,
                overlayBase,
                bu,
                bv,
                CARD_WIDTH,
                CARD_HEIGHT,
                depthScale
            );
        }

        if (wearAssets) {
            drawWearStamp(wearAssets.front.context, bu, bv, depthScale);
            drawWearStamp(wearAssets.back.context, bu, bv, depthScale);
            /* eslint-disable react-hooks/immutability */
            wearAssets.front.texture.needsUpdate = true;
            wearAssets.back.texture.needsUpdate = true;
            /* eslint-enable react-hooks/immutability */
        }
    };

    const resolveBendFaceFromHit = (event: BendSourceEvent): CardBendFace | null => {
        const hitFace = event.face;

        if (hitFace) {
            const nz = hitFace.normal.z;

            if (Math.abs(nz) > 0.65) {
                return nz > 0 ? 'front' : 'back';
            }
        }

        scratchHitLocal.copy(event.point);
        event.object.worldToLocal(scratchHitLocal);
        const halfDepth = TILE_DEPTH * 0.5;
        const z = scratchHitLocal.z;

        if (z > halfDepth * 0.1) {
            return 'front';
        }

        if (z < -halfDepth * 0.1) {
            return 'back';
        }

        return null;
    };

    const maybeBumpBuildup = (canonicalU: number, canonicalV: number): void => {
        const prevU = lastBumpURef.current;
        const prevV = lastBumpVRef.current;

        if (prevU === null || prevV === null) {
            bendBuildupRef.current = 0;
        } else if (Math.hypot(canonicalU - prevU, canonicalV - prevV) < BEND_UV_SAME_SPOT) {
            bendBuildupRef.current = Math.min(
                BEND_BUILDUP_MAX,
                bendBuildupRef.current + BEND_BUILDUP_PER_PRESS
            );
        } else {
            bendBuildupRef.current = 0;
        }

        lastBumpURef.current = canonicalU;
        lastBumpVRef.current = canonicalV;
    };

    const syncBendFromPointerEvent = (event: BendSourceEvent, bumpRepeat: boolean): void => {
        if (reduceMotion || !pickable) {
            return;
        }

        if (event.type === 'pointermove') {
            const native = event.nativeEvent;

            if (
                native instanceof PointerEvent &&
                native.pointerType === 'mouse' &&
                (native.buttons & 1) === 0
            ) {
                return;
            }
        }

        const face = resolveBendFaceFromHit(event);
        const { uv } = event;

        if (!face || !uv) {
            return;
        }

        const { u: canonicalU, v: canonicalV } = hitUvToCanonicalBendUv(face, uv.x, uv.y);

        if (bumpRepeat) {
            maybeBumpBuildup(canonicalU, canonicalV);
        }

        bendURef.current = canonicalU;
        bendVRef.current = canonicalV;
    };

    const handleCardPointerUp = (event: ThreeEvent<PointerEvent>): void => {
        if (pickable && !reduceMotion) {
            if (event.pointerType !== 'mouse' || event.button === 0) {
                syncBendFromPointerEvent(event, false);
            }
        }

        if (pressingOnCardRef.current && pickable && !reduceMotion) {
            commitPersistentBend();
        }

        pressingOnCardRef.current = false;
        event.stopPropagation();

        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        if (!pickable) {
            return;
        }

        onTilePick(tile.id);
    };

    const handleCardPointerDown = (event: ThreeEvent<PointerEvent>): void => {
        event.stopPropagation();
        pressingOnCardRef.current = true;
        syncBendFromPointerEvent(event, true);
    };

    const handleCardClick = (event: ThreeEvent<MouseEvent>): void => {
        event.stopPropagation();

        if (!pickable || reduceMotion) {
            return;
        }

        syncBendFromPointerEvent(event, false);
    };

    const handleCardPointerMove = (event: ThreeEvent<PointerEvent>): void => {
        syncBendFromPointerEvent(event, false);

        const pointerType = event.nativeEvent.pointerType;

        if (reduceMotion || pointerType === 'touch' || pointerType === 'pen') {
            if (hoverTiltRef.current.tileId === tile.id) {
                hoverTiltRef.current = { tileId: null, x: 0, y: 0 };
            }

            return;
        }

        const { uv } = event;

        if (!uv) {
            return;
        }

        const x = MathUtils.clamp(uv.x * 2 - 1, -1, 1);
        const y = MathUtils.clamp(-(uv.y * 2 - 1), -1, 1);

        hoverTiltRef.current = { tileId: tile.id, x, y };
    };

    const handleCardPointerOut = (): void => {
        if (pressingOnCardRef.current && pickable && !reduceMotion) {
            commitPersistentBend();
        }

        pressingOnCardRef.current = false;

        if (hoverTiltRef.current.tileId === tile.id) {
            hoverTiltRef.current = { tileId: null, x: 0, y: 0 };
        }
    };

    useFrame((state, delta) => {
        const group = groupRef.current;

        if (!group) {
            return;
        }

        const frontBase = frontBaseRef.current;
        const backBase = backBaseRef.current;
        const overlayBase = overlayBaseRef.current;

        if (frontBase && backBase && overlayBase) {
            const bu = bendURef.current;
            const bv = bendVRef.current;
            const bendOverlay = getSurfaceVariant(tile, faceUp, resolvingSelection) !== 'hidden';
            const depthMultiplier = 1 + bendBuildupRef.current * 0.52;
            const pressing = !reduceMotion && pickable && pressingOnCardRef.current;
            const live = pressing ? depthMultiplier : 0;
            const liveOverlay = pressing && bendOverlay ? live : 0;

            const frontPos = frontGeometry.attributes.position as BufferAttribute;
            const backPos = backGeometry.attributes.position as BufferAttribute;
            const overlayPos = overlayGeometry.attributes.position as BufferAttribute;

            composeCardPositions(
                frontPos,
                frontBase,
                frontPersistentRef.current,
                bu,
                bv,
                CARD_WIDTH,
                CARD_HEIGHT,
                live
            );
            composeCardPositions(
                backPos,
                backBase,
                backPersistentRef.current,
                bu,
                bv,
                CARD_WIDTH,
                CARD_HEIGHT,
                live
            );
            composeCardPositions(
                overlayPos,
                overlayBase,
                overlayPersistentRef.current,
                bu,
                bv,
                CARD_WIDTH,
                CARD_HEIGHT,
                liveOverlay
            );
        }

        const time = state.clock.elapsedTime;
        const idleDrift = reduceMotion ? 0 : Math.sin(time * 0.09 + transform.seed * 0.017) * (isMatched ? 0.00038 : 0.00024);
        const settle = reduceMotion ? 0 : Math.sin(time * 0.08 + transform.seed * 0.013) * (isMatched ? 0.00048 : 0.0003);
        const field = fieldTiltRef.current;
        const fieldRotX = reduceMotion ? 0 : MathUtils.clamp(-field.y, -1, 1) * fieldAmp * (isMatched ? 0.042 : 0.074);
        const fieldRotZ = reduceMotion ? 0 : MathUtils.clamp(field.x, -1, 1) * fieldAmp * (isMatched ? 0.038 : 0.068);
        const fieldLift = reduceMotion ? 0 : MathUtils.clamp(Math.hypot(field.x, field.y), 0, 1) * fieldAmp * (isMatched ? 0.00035 : 0.00062);
        const fieldDepth = reduceMotion ? 0 : MathUtils.clamp(Math.hypot(field.x, field.y), 0, 1) * fieldAmp * (isMatched ? 0.0005 : 0.00095);
        const hoverTilt = hoverTiltRef.current;
        const hovered = !reduceMotion && hoverTilt.tileId === tile.id;
        const hoverTiltX = hovered ? MathUtils.clamp(-hoverTilt.y, -1, 1) * (isMatched ? 0.046 : 0.1) : 0;
        const hoverTiltZ = hovered ? MathUtils.clamp(hoverTilt.x, -1, 1) * (isMatched ? 0.042 : 0.092) : 0;
        const hoverLift = hovered ? (isMatched ? 0.001 : 0.0022) : 0;
        const hoverDepth = hovered ? (isMatched ? 0.0014 : 0.0032) : 0;
        const targetLift = isMatched ? 0.0024 : faceUp ? 0.0012 : 0;
        const targetDepth = isMatched ? 0.0036 : faceUp ? 0.0018 : 0;
        const rotationDamp = reduceMotion ? 42 : faceUp ? 18 : 16;

        group.rotation.x = MathUtils.damp(
            group.rotation.x,
            transform.imperfectionRotationX + fieldRotX + hoverTiltX,
            reduceMotion ? 42 : 22,
            delta
        );
        group.rotation.z = MathUtils.damp(
            group.rotation.z,
            transform.imperfectionRotationZ + fieldRotZ + hoverTiltZ,
            reduceMotion ? 42 : 22,
            delta
        );
        group.rotation.y = reduceMotion ? transform.targetRotation : MathUtils.damp(group.rotation.y, transform.targetRotation, rotationDamp, delta);
        const targetX = transform.baseX + transform.imperfectionX;
        const targetY = transform.baseY + transform.imperfectionY + targetLift + hoverLift + fieldLift + idleDrift + settle;
        const targetZ = targetDepth + hoverDepth + fieldDepth;
        const now = performance.now();
        const shuffleLayoutActive =
            !reduceMotion && shuffleMotionDeadlineMs > 0 && now < shuffleMotionDeadlineMs;
        const posLambda = shuffleLayoutActive ? 9 : 200;

        if (shuffleLayoutActive) {
            group.position.x = MathUtils.damp(group.position.x, targetX, posLambda, delta);
            group.position.y = MathUtils.damp(group.position.y, targetY, posLambda, delta);
            group.position.z = MathUtils.damp(group.position.z, targetZ, posLambda, delta);
        } else {
            group.position.x = targetX;
            group.position.y = targetY;
            group.position.z = targetZ;
        }
        group.scale.x = group.scale.y = group.scale.z = transform.baseScale;
    });

    const surfaceVariant = getSurfaceVariant(tile, faceUp, resolvingSelection);
    const hiddenPinned = isPinned && tile.state === 'hidden';
    const cardTint =
        hiddenPinned ? '#d4b870' : resolvingSelection === 'mismatch' && faceUp ? '#ffc8bc' : '#ffffff';
    /** Same bitmap as the face-down side: static reference PNG only. Face-up adds nothing here—only the overlay mesh draws the symbol. */
    const cardArtTexture = getCardBackStaticTexture();
    const overlayTexture =
        surfaceVariant === 'hidden' ? null : getTileFaceOverlayTexture(tile, surfaceVariant);
    const forceTextureRefreshKey = textureRevision;

    const halfDepth = TILE_DEPTH * 0.5;
    const faceZ = halfDepth + 0.0004;
    const overlayZ = halfDepth + 0.004;

    return (
        <group ref={groupRef}>
            {/*
              Rounded card art is transparent in the corners. A box mesh exposes dark side quads there.
              Invisible pick slab + two planes lets corners composite to the scene instead.
            */}
            <group scale={[transform.bezelScale, transform.bezelScale, transform.bezelScale]}>
                <mesh
                    key={`card-pick-${tile.id}-${forceTextureRefreshKey}`}
                    onClick={handleCardClick}
                    onPointerDown={handleCardPointerDown}
                    onPointerMove={handleCardPointerMove}
                    onPointerOut={handleCardPointerOut}
                    onPointerUp={handleCardPointerUp}
                    raycast={pickable ? pickableMeshRaycast : noopMeshRaycast}
                    userData={{ tileId: tile.id }}
                >
                    <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, TILE_DEPTH]} />
                    <meshBasicMaterial colorWrite={false} depthWrite={false} transparent />
                </mesh>
                <mesh geometry={frontGeometry} position={[0, 0, faceZ]} raycast={noopMeshRaycast}>
                    <meshBasicMaterial
                        alphaTest={0.06}
                        color={cardTint}
                        depthWrite
                        map={cardArtTexture ?? undefined}
                        side={DoubleSide}
                        toneMapped={false}
                        transparent
                    />
                </mesh>
                {wearAssets ? (
                    <mesh
                        geometry={frontGeometry}
                        position={[0, 0, faceZ + 0.00045]}
                        raycast={noopMeshRaycast}
                        renderOrder={6}
                    >
                        <meshBasicMaterial
                            blending={MultiplyBlending}
                            depthWrite={false}
                            map={wearAssets.front.texture}
                            polygonOffset
                            polygonOffsetFactor={-1}
                            polygonOffsetUnits={-1}
                            premultipliedAlpha
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                ) : null}
                <mesh geometry={backGeometry} position={[0, 0, -faceZ]} rotation={[0, Math.PI, 0]} raycast={noopMeshRaycast}>
                    <meshBasicMaterial
                        alphaTest={0.06}
                        color={cardTint}
                        depthWrite
                        map={cardArtTexture ?? undefined}
                        side={DoubleSide}
                        toneMapped={false}
                        transparent
                    />
                </mesh>
                {wearAssets ? (
                    <mesh
                        geometry={backGeometry}
                        position={[0, 0, -faceZ - 0.00045]}
                        raycast={noopMeshRaycast}
                        renderOrder={6}
                        rotation={[0, Math.PI, 0]}
                    >
                        <meshBasicMaterial
                            blending={MultiplyBlending}
                            depthWrite={false}
                            map={wearAssets.back.texture}
                            polygonOffset
                            polygonOffsetFactor={-1}
                            polygonOffsetUnits={-1}
                            premultipliedAlpha
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                ) : null}
                {overlayTexture ? (
                    <mesh geometry={overlayGeometry} position={[0, 0, overlayZ]} raycast={noopMeshRaycast} renderOrder={10}>
                        <meshBasicMaterial
                            alphaTest={0.08}
                            depthTest={false}
                            depthWrite={false}
                            map={overlayTexture}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                ) : null}
            </group>
        </group>
    );
};

const TileBoardScene = forwardRef<TileBoardSceneHandle, TileBoardSceneProps>(({
    board,
    boardViewport,
    compact,
    debugPeekActive,
    fieldTiltRef,
    hoverTiltRef,
    interactionSuppressed,
    interactive,
    onTilePick,
    onViewportMetricsChange,
    pinnedTileIds,
    previewActive,
    reduceMotion,
    runStatus,
    shuffleMotionDeadlineMs
}: TileBoardSceneProps, ref) => {
    const { camera, gl, viewport } = useThree();
    const { colors } = RENDERER_THEME;
    const totalColumns = board.columns;
    const totalRows = board.rows;
    const [textureRevision, setTextureRevision] = useState(0);
    const flipLocked = board.flippedTileIds.length === 2;
    const pinnedSet = useMemo(() => new Set(pinnedTileIds), [pinnedTileIds]);
    const boardGroupRef = useRef<Group | null>(null);
    const pickRaycasterRef = useRef<Raycaster>(new Raycaster());
    const pickPointerRef = useRef<Vector2>(new Vector2());

    useEffect(() => subscribeTextureImageUpdates(() => setTextureRevision((current) => current + 1)), []);
    useEffect(() => {
        onViewportMetricsChange({ height: viewport.height, width: viewport.width });
    }, [onViewportMetricsChange, viewport.height, viewport.width]);

    useLayoutEffect(() => {
        applyAnisotropyToCachedTileTextures(Math.min(8, gl.capabilities.getMaxAnisotropy()));
    }, [gl, textureRevision]);

    useImperativeHandle(
        ref,
        () => ({
            pickTileAtClientPoint: (clientX: number, clientY: number): boolean => {
                const boardGroup = boardGroupRef.current;

                if (!boardGroup) {
                    return false;
                }

                const rect = gl.domElement.getBoundingClientRect();

                if (rect.width <= 0 || rect.height <= 0) {
                    return false;
                }

                pickPointerRef.current.set(
                    ((clientX - rect.left) / rect.width) * 2 - 1,
                    -(((clientY - rect.top) / rect.height) * 2 - 1)
                );
                pickRaycasterRef.current.setFromCamera(pickPointerRef.current, camera);

                const hit = pickRaycasterRef.current
                    .intersectObjects(boardGroup.children, true)
                    .find((intersection) => typeof intersection.object.userData?.tileId === 'string');

                if (!hit) {
                    return false;
                }

                onTilePick(String(hit.object.userData.tileId));
                return true;
            }
        }),
        [camera, gl, onTilePick]
    );

    useLayoutEffect(() => {
        const boardGroup = boardGroupRef.current;

        if (!boardGroup) {
            return;
        }

        const initialScale = boardViewport.fitZoom * boardViewport.zoom;
        boardGroup.position.set(boardViewport.panX, boardViewport.panY, 0);
        boardGroup.scale.setScalar(initialScale);
    }, []);

    useFrame((_state, delta) => {
        const boardGroup = boardGroupRef.current;

        if (!boardGroup) {
            return;
        }

        const targetScale = boardViewport.fitZoom * boardViewport.zoom;

        if (reduceMotion) {
            boardGroup.position.x = boardViewport.panX;
            boardGroup.position.y = boardViewport.panY;
            boardGroup.scale.setScalar(targetScale);
            return;
        }

        const panDamping = interactionSuppressed ? BOARD_VIEWPORT_ACTIVE_DAMPING : BOARD_VIEWPORT_IDLE_DAMPING;
        const scaleDamping = interactionSuppressed ? BOARD_VIEWPORT_ACTIVE_SCALE_DAMPING : BOARD_VIEWPORT_IDLE_SCALE_DAMPING;

        boardGroup.position.x = MathUtils.damp(boardGroup.position.x, boardViewport.panX, panDamping, delta);
        boardGroup.position.y = MathUtils.damp(boardGroup.position.y, boardViewport.panY, panDamping, delta);
        boardGroup.scale.x = MathUtils.damp(boardGroup.scale.x, targetScale, scaleDamping, delta);
        boardGroup.scale.y = MathUtils.damp(boardGroup.scale.y, targetScale, scaleDamping, delta);
        boardGroup.scale.z = MathUtils.damp(boardGroup.scale.z, targetScale, scaleDamping, delta);
    });

    return (
        <>
            <ambientLight color={colors.text} intensity={compact ? 0.56 : 0.64} />
            <directionalLight
                castShadow={false}
                color={colors.goldBright}
                intensity={compact ? 0.9 : 1.02}
                position={[5.4, 7.2, 8.5]}
            />
            <directionalLight color={colors.cyan} intensity={compact ? 0.14 : 0.18} position={[-5.8, 2.2, 6.8]} />
            <pointLight color={colors.gold} intensity={compact ? 0.14 : 0.2} position={[0, -2.2, 5.4]} />

            <group ref={boardGroupRef} rotation={[-0.1, 0.08, 0]}>
                {board.tiles.map((tile, index) => {
                    const faceUp = tile.state !== 'hidden' || previewActive || debugPeekActive;
                    const transform = getTileTransform(tile, index, totalColumns, totalRows, compact, faceUp);

                    return (
                        <TileBezel
                            faceUp={faceUp}
                            fieldAmp={getTileFieldAmplification(index, totalColumns, totalRows)}
                            fieldTiltRef={fieldTiltRef}
                            flipLocked={flipLocked}
                            hoverTiltRef={hoverTiltRef}
                            interactionSuppressed={interactionSuppressed}
                            interactive={interactive}
                            isPinned={pinnedSet.has(tile.id)}
                            key={tile.id}
                            onTilePick={onTilePick}
                            reduceMotion={reduceMotion}
                            resolvingSelection={getResolvingSelectionState(board, runStatus, tile.id)}
                            shuffleMotionDeadlineMs={shuffleMotionDeadlineMs}
                            textureRevision={textureRevision}
                            tile={tile}
                            transform={transform}
                        />
                    );
                })}
            </group>
        </>
    );
});

TileBoardScene.displayName = 'TileBoardScene';

export default TileBoardScene;
