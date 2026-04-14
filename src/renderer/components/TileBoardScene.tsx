import { useFrame, useThree, type RootState, type ThreeEvent } from '@react-three/fiber';
import {
    createContext,
    forwardRef,
    memo,
    useContext,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type MutableRefObject,
    type RefObject
} from 'react';
import {
    CanvasTexture,
    Color,
    DoubleSide,
    LinearFilter,
    MathUtils,
    MultiplyBlending,
    PlaneGeometry,
    Raycaster,
    RingGeometry,
    SRGBColorSpace,
    Vector2,
    Vector3,
    type BufferAttribute,
    type BufferGeometry,
    type Group,
    type Mesh,
    type MeshBasicMaterial,
    type MeshStandardMaterial
} from 'three';
import type { BoardState, GraphicsQualityPreset, RunStatus, Tile } from '../../shared/contracts';
import { getBoardAnisotropyCap } from '../../shared/graphicsQuality';
import {
    applyAnisotropyToCachedTileTextures,
    getCardBackRasterNormalMapTexture,
    getCardBackStaticTexture,
    getCardFaceRasterNormalMapTexture,
    getCardFaceStaticTexture,
    getCardPanelDisplacementTexture,
    getCardPanelNormalTexture,
    getTileFaceOverlayTexture,
    subscribeTextureImageUpdates,
    type FaceVariant
} from './tileTextures';
import {
    CARD_PLANE_HEIGHT,
    CARD_PLANE_WIDTH,
    CORE_SCALE,
    SHELL_SCALE,
    TILE_DEPTH,
    TILE_SPACING
} from './tileShatter';
import type { TiltVector } from '../platformTilt/platformTiltTypes';
import { RENDERER_THEME } from '../styles/theme';
import { boardWebglPerfSampleAccumulate, boardWebglPerfSampleEnabled } from '../dev/boardWebglPerfSample';
import { readTileStepLegacy } from '../dev/tileStepLegacy';
import { getTileFieldAmplification } from './tileFieldTilt';
import { isTilePickable, noopMeshRaycast, pickableMeshRaycast } from './tileBoardPick';
import {
    getMatchResolvingPairTileIds,
    getResolvingSelectionState,
    type ResolvingSelectionState
} from './tileResolvingSelection';
import cardBackSvgUrl from '../assets/textures/cards/back.svg?url';
import cardFrontSvgUrl from '../assets/textures/cards/front.svg?url';
import { loadSharedCardSvgPlaneGeometry } from './cardSvgPlaneGeometry';
import type { TileBoardViewportState } from './tileBoardViewport';
import { computeStaggeredShuffleDealZ } from './shuffleFlipAnimation';

/** FX-006 / HOVER_DOM_WEBGL_TOKENS: border emphasis → warm tint lerp (~20% toward `#fff0d4` in sRGB mix space). */
const HOVER_RIM_TINT = new Color('#fff0d4');
const HOVER_RIM_TINT_LERP = 0.2;
/** Emissive base (theme `goldBright`); intensity scaled by graphics quality when DOM-hover-parity applies. */
const HOVER_GOLD_EMISSIVE = new Color('#f2d39d');
/** CARD-018: warm pin read blended on top of resolving face tints. */
const PIN_STACK_TINT = new Color('#d4b870');
const scratchCardTint = new Color();

const getHoverGoldQualityScales = (
    quality: GraphicsQualityPreset
): { emissiveIntensity: number; rimOpacity: number } => {
    switch (quality) {
        case 'low':
            return { emissiveIntensity: 0.09, rimOpacity: 0.4 };
        case 'high':
            return { emissiveIntensity: 0.22, rimOpacity: 0.74 };
        case 'medium':
        default:
            return { emissiveIntensity: 0.15, rimOpacity: 0.58 };
    }
};

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
    peekRevealedTileIds?: string[];
    cursedPairKey?: string | null;
    wardPairKey?: string | null;
    bountyPairKey?: string | null;
    /** Wall-clock ms; while `now < deadline`, tile groups ease XY toward layout targets (shuffle). */
    shuffleMotionDeadlineMs: number;
    /** Motion budget that produced `shuffleMotionDeadlineMs` (FX-013 staggered deal-Z). */
    shuffleMotionBudgetMs: number;
    /** Tile count used for `computeShuffleMotionBudgetMs` when shuffle started (reading-order stagger). */
    shuffleStaggerTileCount: number;
    /** Hidden tiles to de-emphasize when focus-assist is on (matches 2D `.tileFocusDim`). */
    dimmedTileIds?: ReadonlySet<string>;
    /** When true with two flips, allow picking a third tile (gambit) instead of locking hidden tiles. */
    allowGambitThirdFlip?: boolean;
    /** PERF-007: caps texture anisotropy vs device max. */
    graphicsQuality?: GraphicsQualityPreset;
    /** Keyboard focus ring target (canvas `role="application"`). */
    focusedTileId?: string | null;
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
    shuffleMotionBudgetMs: number;
    shuffleStaggerTileCount: number;
    shuffleBoardOrderIndex: number;
    textureRevision: number;
    tile: Tile;
    transform: TileTransform;
    /** PERF-007 + FX-006: scales hover emissive / rim strip opacity. */
    graphicsQuality: GraphicsQualityPreset;
    /** Merged SVG mesh at card plane size; when set, replaces front texture and front-plane bend/wear. */
    sharedCardFrontGeometry: BufferGeometry | null;
    /** Merged SVG mesh for hidden side; when set, replaces back texture and back-plane bend/wear. */
    sharedCardBackGeometry: BufferGeometry | null;
    memorizeCurseHighlight?: boolean;
    findableFaceHighlight?: boolean;
    spotlightWardHighlight?: boolean;
    spotlightBountyHighlight?: boolean;
    /** Dims card materials when focus-assist targets this hidden tile (not when peek shows face). */
    focusDimmed?: boolean;
    /**
     * When true (default), tile motion is stepped from `TileBoardScene`’s consolidated `useFrame`.
     * When false (dev `tileStepLegacy`), this tile registers its own `useFrame` for A/B comparison.
     */
    hostConsolidatesTileFrames?: boolean;
    /** Keyboard focus from canvas application (arrow keys). */
    keyboardFocused?: boolean;
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

const CARD_WIDTH = CARD_PLANE_WIDTH;
const CARD_HEIGHT = CARD_PLANE_HEIGHT;
const CARD_FACE_INSET = 0.016;
const CARD_FACE_WIDTH = CARD_WIDTH - CARD_FACE_INSET * 2;
const CARD_FACE_HEIGHT = CARD_HEIGHT - CARD_FACE_INSET * 2;

/** FX-006: thin quads approximating DOM `0 0 0 2px` gold ring on the visible back face while hidden. */
const HOVER_GOLD_RIM_STRIP = 0.0036;
const hoverGoldRimGeomH = new PlaneGeometry(CARD_WIDTH, HOVER_GOLD_RIM_STRIP, 1, 1);
const hoverGoldRimGeomV = new PlaneGeometry(HOVER_GOLD_RIM_STRIP, CARD_HEIGHT, 1, 1);

/** GPU tile chrome (replaces DOM `.hitButton*` resolving / focus / burst / matched check). */
const RESOLVING_RING_GEOM = new RingGeometry(CARD_WIDTH * 0.37, CARD_WIDTH * 0.505, 64);
const FOCUS_RING_GEOM = new RingGeometry(CARD_WIDTH * 0.35, CARD_WIDTH * 0.52, 64);
const BURST_RING_GEOM = new RingGeometry(CARD_WIDTH * 0.32, CARD_WIDTH * 0.54, 40);
const MATCH_CHECK_GEOM = new PlaneGeometry(CARD_WIDTH * 0.2, CARD_HEIGHT * 0.2, 1, 1);

let matchedCheckTextureSingleton: CanvasTexture | null = null;

const getMatchedCheckTexture = (): CanvasTexture | null => {
    if (typeof document === 'undefined') {
        return null;
    }
    if (!matchedCheckTextureSingleton) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }
        ctx.clearRect(0, 0, 128, 128);
        ctx.fillStyle = RENDERER_THEME.colors.emeraldBright;
        ctx.font = '900 92px system-ui, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', 64, 58);
        matchedCheckTextureSingleton = new CanvasTexture(canvas);
        matchedCheckTextureSingleton.colorSpace = SRGBColorSpace;
        matchedCheckTextureSingleton.needsUpdate = true;
    }
    return matchedCheckTextureSingleton;
};

/**
 * Segments per card face: bend deformation + enough tessellation for
 * `displacementMap` (real height — needs dense grid or ridges look blocky).
 */
const CARD_BEND_SEGMENTS = 48;
/** World units: height map × scale + bias displaces vertices along normals (see `getCardPanelDisplacementTexture`). */
const CARD_DISPLACEMENT_SCALE = 0.0082;
const CARD_DISPLACEMENT_BIAS = -CARD_DISPLACEMENT_SCALE * 0.5;
/** Keep wear multiply layer above peak displacement (front/back). */
const CARD_WEAR_Z_SLIVER = 0.0052;
/** Shared tangent-space strength for authored + procedural normal maps (front and back). */
const CARD_NORMAL_SCALE: [number, number] = [0.14, 0.14];
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
const matchLinkWorldA = new Vector3();
const matchLinkWorldB = new Vector3();
/** FX-017: ribbon tint (theme `emeraldBright`); opacity pulsed in `useFrame`. */
const matchLinkColor = new Color(RENDERER_THEME.colors.emeraldBright);
/** Unit-length X ribbon; thickness from plane height × optional `scale.y`. */
const MATCH_PAIR_LINK_PLANE_GEOM = new PlaneGeometry(1, 0.0036, 1, 1);

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

    if (faceUp && resolving === 'gambitNeutral') {
        return 'active';
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

interface TileBezelFramePropsSnapshot {
    faceUp: boolean;
    fieldAmp: number;
    flipLocked: boolean;
    focusDimmed: boolean;
    interactionSuppressed: boolean;
    interactive: boolean;
    isPinned: boolean;
    pickable: boolean;
    reduceMotion: boolean;
    resolvingSelection: ResolvingSelectionState;
    shuffleMotionDeadlineMs: number;
    shuffleMotionBudgetMs: number;
    shuffleStaggerTileCount: number;
    shuffleBoardOrderIndex: number;
    textureRevision: number;
    tile: Tile;
    transform: TileTransform;
    useSvgMeshBack: boolean;
    useSvgMeshFront: boolean;
    graphicsQuality: GraphicsQualityPreset;
    fieldTiltRef: MutableRefObject<TiltVector>;
    hoverTiltRef: MutableRefObject<TileHoverTiltState>;
    keyboardFocused: boolean;
}

interface TileBezelPlaneGeometries {
    front: PlaneGeometry;
    back: PlaneGeometry;
    overlay: PlaneGeometry;
}

interface TileBezelFrameBag {
    groupRef: RefObject<Group | null>;
    propsRef: MutableRefObject<TileBezelFramePropsSnapshot>;
    planeGeometries: TileBezelPlaneGeometries;
    frontBaseRef: MutableRefObject<Float32Array | null>;
    backBaseRef: MutableRefObject<Float32Array | null>;
    overlayBaseRef: MutableRefObject<Float32Array | null>;
    frontPersistentRef: MutableRefObject<Float32Array>;
    backPersistentRef: MutableRefObject<Float32Array>;
    overlayPersistentRef: MutableRefObject<Float32Array>;
    prevFaceUpRef: MutableRefObject<boolean>;
    flipPopT0Ref: MutableRefObject<number | null>;
    /** CARD-010: 0→1 ease over ~200ms on face-up edge (structural lift/depth); instant when `reduceMotion`. */
    faceUpStructBlendRef: MutableRefObject<number>;
    faceUpStructT0Ref: MutableRefObject<number | null>;
    prevResolvingRef: MutableRefObject<ResolvingSelectionState | null>;
    matchPulseRef: MutableRefObject<number>;
    liftSmoothRef: MutableRefObject<number>;
    frontCardMatRef: MutableRefObject<MeshStandardMaterial | null>;
    backCardMatRef: MutableRefObject<MeshStandardMaterial | null>;
    focusDimBlendRef: MutableRefObject<number>;
    bendURef: MutableRefObject<number>;
    bendVRef: MutableRefObject<number>;
    bendBuildupRef: MutableRefObject<number>;
    lastBumpURef: MutableRefObject<number | null>;
    lastBumpVRef: MutableRefObject<number | null>;
    pressingOnCardRef: MutableRefObject<boolean>;
    hoverRimTopMatRef: MutableRefObject<MeshBasicMaterial | null>;
    hoverRimBottomMatRef: MutableRefObject<MeshBasicMaterial | null>;
    hoverRimRightMatRef: MutableRefObject<MeshBasicMaterial | null>;
    hoverRimLeftMatRef: MutableRefObject<MeshBasicMaterial | null>;
    resolvingRimMatRef: MutableRefObject<MeshBasicMaterial | null>;
    focusRimMatRef: MutableRefObject<MeshBasicMaterial | null>;
    burstRingMatRef: MutableRefObject<MeshBasicMaterial | null>;
    burstRingMeshRef: MutableRefObject<Mesh | null>;
    matchedCheckMatRef: MutableRefObject<MeshBasicMaterial | null>;
    matchedCheckMeshRef: MutableRefObject<Mesh | null>;
    matchBurstT0Ref: MutableRefObject<number | null>;
    matchedCheckPopT0Ref: MutableRefObject<number | null>;
    prevTileMatchedRef: MutableRefObject<boolean>;
}

const advanceTileBezelFrame = (bag: TileBezelFrameBag, state: RootState, delta: number): void => {
    if (typeof document !== 'undefined' && document.hidden) {
        return;
    }

    const p = bag.propsRef.current;
    const group = bag.groupRef.current;

    if (!group) {
        return;
    }

    const clock = state.clock;
    const prevFace = bag.prevFaceUpRef.current;
    if (p.reduceMotion) {
        bag.flipPopT0Ref.current = null;
    } else if (p.faceUp && !prevFace) {
        /** CARD-003: face-up edge impulse (scale + Z); skipped when `reduceMotion`. */
        bag.flipPopT0Ref.current = clock.elapsedTime;
    }
    bag.prevFaceUpRef.current = p.faceUp;

    /** CARD-010: structural lift/depth follows face-up over ~200ms (aligned with CARD-003 ~0.22s pop). */
    const CARD_FACE_UP_SURFACE_S = 0.2;
    if (p.reduceMotion) {
        bag.faceUpStructT0Ref.current = null;
        bag.faceUpStructBlendRef.current = p.faceUp ? 1 : 0;
    } else if (!p.faceUp) {
        bag.faceUpStructT0Ref.current = null;
        bag.faceUpStructBlendRef.current = 0;
    } else if (!prevFace) {
        bag.faceUpStructT0Ref.current = clock.elapsedTime;
        bag.faceUpStructBlendRef.current = 0;
    } else {
        const t0 = bag.faceUpStructT0Ref.current;
        if (t0 != null) {
            const u = Math.min(1, (clock.elapsedTime - t0) / CARD_FACE_UP_SURFACE_S);
            const eased = 1 - (1 - u) * (1 - u);
            bag.faceUpStructBlendRef.current = eased;
            if (u >= 1) {
                bag.faceUpStructT0Ref.current = null;
                bag.faceUpStructBlendRef.current = 1;
            }
        } else {
            bag.faceUpStructBlendRef.current = 1;
        }
    }

    const prevR = bag.prevResolvingRef.current;
    if (p.resolvingSelection === 'match' && prevR !== 'match' && !p.reduceMotion) {
        bag.matchPulseRef.current = 1;
        bag.matchBurstT0Ref.current = clock.elapsedTime;
    }
    bag.prevResolvingRef.current = p.resolvingSelection;

    const wasMatched = bag.prevTileMatchedRef.current;
    if (p.tile.state === 'matched' && !wasMatched && !p.reduceMotion) {
        bag.matchedCheckPopT0Ref.current = clock.elapsedTime;
    }
    bag.prevTileMatchedRef.current = p.tile.state === 'matched';
    bag.matchPulseRef.current = Math.max(0, bag.matchPulseRef.current - delta * 2.8);
    const matchPulse = bag.matchPulseRef.current;

    let flipPopMul = 1;
    let flipPopZ = 0;
    const fp0 = bag.flipPopT0Ref.current;
    if (fp0 != null && !p.reduceMotion) {
        const td = clock.elapsedTime - fp0;
        if (td < 0.22) {
            const envelope = Math.sin((td / 0.22) * Math.PI);
            flipPopMul = 1 + envelope * 0.065;
            flipPopZ = envelope * 0.014;
        } else {
            bag.flipPopT0Ref.current = null;
        }
    }

    const frontBase = bag.frontBaseRef.current;
    const backBase = bag.backBaseRef.current;
    const overlayBase = bag.overlayBaseRef.current;

    if (frontBase && backBase && overlayBase) {
        const bu = bag.bendURef.current;
        const bv = bag.bendVRef.current;
        const bendOverlay = getSurfaceVariant(p.tile, p.faceUp, p.resolvingSelection) !== 'hidden';
        const depthMultiplier = 1 + bag.bendBuildupRef.current * 0.52;
        const pressing = !p.reduceMotion && p.pickable && bag.pressingOnCardRef.current;
        const live = pressing ? depthMultiplier : 0;
        const liveOverlay = pressing && bendOverlay ? live : 0;

        const { front: frontGeometry, back: backGeometry, overlay: overlayGeometry } = bag.planeGeometries;
        const frontPos = frontGeometry.attributes.position as BufferAttribute;
        const backPos = backGeometry.attributes.position as BufferAttribute;
        const overlayPos = overlayGeometry.attributes.position as BufferAttribute;

        if (!p.useSvgMeshFront) {
            composeCardPositions(
                frontPos,
                frontBase,
                bag.frontPersistentRef.current,
                bu,
                bv,
                CARD_WIDTH,
                CARD_HEIGHT,
                live
            );
        }
        if (!p.useSvgMeshBack) {
            composeCardPositions(
                backPos,
                backBase,
                bag.backPersistentRef.current,
                bu,
                bv,
                CARD_WIDTH,
                CARD_HEIGHT,
                live
            );
        }
        composeCardPositions(
            overlayPos,
            overlayBase,
            bag.overlayPersistentRef.current,
            bu,
            bv,
            CARD_WIDTH,
            CARD_HEIGHT,
            liveOverlay
        );
    }

    const isMatched = p.tile.state === 'matched';
    const time = state.clock.elapsedTime;
    const idleDrift = p.reduceMotion ? 0 : Math.sin(time * 0.09 + p.transform.seed * 0.017) * (isMatched ? 0.00038 : 0.00024);
    const settle = p.reduceMotion ? 0 : Math.sin(time * 0.08 + p.transform.seed * 0.013) * (isMatched ? 0.00048 : 0.0003);
    const field = p.fieldTiltRef.current;
    const fieldRotX = p.reduceMotion ? 0 : MathUtils.clamp(-field.y, -1, 1) * p.fieldAmp * (isMatched ? 0.042 : 0.074);
    const fieldRotZ = p.reduceMotion ? 0 : MathUtils.clamp(field.x, -1, 1) * p.fieldAmp * (isMatched ? 0.038 : 0.068);
    const fieldLift = p.reduceMotion ? 0 : MathUtils.clamp(Math.hypot(field.x, field.y), 0, 1) * p.fieldAmp * (isMatched ? 0.00035 : 0.00062);
    const fieldDepth = p.reduceMotion ? 0 : MathUtils.clamp(Math.hypot(field.x, field.y), 0, 1) * p.fieldAmp * (isMatched ? 0.0005 : 0.00095);
    const hoverTilt = p.hoverTiltRef.current;
    const hovered = !p.reduceMotion && hoverTilt.tileId === p.tile.id;
    /** Mirrors `.fallbackTile:hover:not(.faceUp):not(.matched)` — gold rim / lift / tilt only on hidden backs. */
    const hoverDomParity = hovered && !p.faceUp && p.tile.state !== 'matched';
    const hoverTiltX = hoverDomParity ? MathUtils.clamp(-hoverTilt.y, -1, 1) * (isMatched ? 0.046 : 0.1) : 0;
    const hoverTiltZ = hoverDomParity ? MathUtils.clamp(hoverTilt.x, -1, 1) * (isMatched ? 0.042 : 0.092) : 0;
    const hoverLift = hoverDomParity ? (isMatched ? 0.001 : 0.00265) : 0;
    const hoverDepth = hoverDomParity ? (isMatched ? 0.0014 : 0.00385) : 0;
    const structBlend = bag.faceUpStructBlendRef.current;
    const baseLiftFull = isMatched ? 0.0024 : p.faceUp ? 0.0012 : 0;
    const baseDepthFull = isMatched ? 0.0036 : p.faceUp ? 0.0018 : 0;
    const structLift = baseLiftFull * structBlend;
    const structDepth = baseDepthFull * structBlend;
    const liftGoal = structLift + hoverLift;
    const liftLambda = p.reduceMotion ? 400 : p.faceUp && !isMatched ? 48 : 200;
    bag.liftSmoothRef.current = MathUtils.damp(bag.liftSmoothRef.current, liftGoal, liftLambda, delta);
    const rotationDamp = p.reduceMotion ? 42 : p.faceUp ? 18 : 16;

    group.rotation.x = MathUtils.damp(
        group.rotation.x,
        p.transform.imperfectionRotationX + fieldRotX + hoverTiltX,
        p.reduceMotion ? 42 : 22,
        delta
    );
    group.rotation.z = MathUtils.damp(
        group.rotation.z,
        p.transform.imperfectionRotationZ + fieldRotZ + hoverTiltZ,
        p.reduceMotion ? 42 : 22,
        delta
    );
    group.rotation.y = p.reduceMotion
        ? p.transform.targetRotation
        : MathUtils.damp(group.rotation.y, p.transform.targetRotation, rotationDamp, delta);
    const targetX = p.transform.baseX + p.transform.imperfectionX;
    const targetY =
        p.transform.baseY + p.transform.imperfectionY + bag.liftSmoothRef.current + fieldLift + idleDrift + settle;
    const now = performance.now();
    const shuffleLayoutActive =
        !p.reduceMotion && p.shuffleMotionDeadlineMs > 0 && now < p.shuffleMotionDeadlineMs;
    const shuffleDealZ =
        shuffleLayoutActive && p.shuffleMotionBudgetMs > 0 && p.shuffleStaggerTileCount > 0
            ? computeStaggeredShuffleDealZ(
                  now,
                  p.shuffleMotionDeadlineMs,
                  p.shuffleMotionBudgetMs,
                  p.shuffleBoardOrderIndex,
                  p.shuffleStaggerTileCount
              )
            : 0;
    const targetZ = structDepth + hoverDepth + fieldDepth + shuffleDealZ;
    const wobbleT = clock.elapsedTime;
    const mismatchShakeX =
        !p.reduceMotion && p.resolvingSelection === 'mismatch' ? Math.sin(wobbleT * 36) * 0.017 : 0;
    const mismatchShakeY =
        !p.reduceMotion && p.resolvingSelection === 'mismatch' ? Math.cos(wobbleT * 29) * 0.014 : 0;
    const posX = targetX + mismatchShakeX;
    const posY = targetY + mismatchShakeY;
    const posLambda = shuffleLayoutActive ? 9 : 200;

    const zWithFlipPop = targetZ + flipPopZ;
    if (shuffleLayoutActive) {
        group.position.x = MathUtils.damp(group.position.x, posX, posLambda, delta);
        group.position.y = MathUtils.damp(group.position.y, posY, posLambda, delta);
        group.position.z = MathUtils.damp(group.position.z, zWithFlipPop, posLambda, delta);
    } else {
        group.position.x = posX;
        group.position.y = posY;
        group.position.z = zWithFlipPop;
    }
    const matchPulseMul = p.resolvingSelection === 'match' ? 0.13 : 0.085;
    const scaleMul = p.transform.baseScale * flipPopMul * (1 + matchPulse * matchPulseMul);
    group.scale.x = group.scale.y = group.scale.z = scaleMul;

    const hiddenPinned = p.isPinned && p.tile.state === 'hidden';
    scratchCardTint.set('#ffffff');
    if (hiddenPinned) {
        scratchCardTint.set('#d4b870');
    } else if (p.resolvingSelection === 'mismatch' && p.faceUp) {
        scratchCardTint.set('#ffb4a6');
    } else if (p.resolvingSelection === 'gambitNeutral' && p.faceUp) {
        scratchCardTint.set('#cfe8f2');
    }
    const pinnedFaceResolving = p.isPinned && p.faceUp && p.resolvingSelection !== null;
    if (pinnedFaceResolving) {
        const pinLerp =
            p.resolvingSelection === 'match' ? 0.36 : p.resolvingSelection === 'gambitNeutral' ? 0.3 : 0.26;
        scratchCardTint.lerp(PIN_STACK_TINT, pinLerp);
    }
    if (hoverDomParity) {
        scratchCardTint.lerp(HOVER_RIM_TINT, HOVER_RIM_TINT_LERP);
    }
    const { emissiveIntensity: hoverEmissiveMul, rimOpacity: hoverRimOpacity } = getHoverGoldQualityScales(
        p.graphicsQuality
    );
    const hoverEmissiveIntensity = hoverDomParity ? hoverEmissiveMul : 0;
    const hoverRimOpacityTarget = hoverDomParity ? hoverRimOpacity : 0;
    for (const matRef of [
        bag.hoverRimTopMatRef,
        bag.hoverRimBottomMatRef,
        bag.hoverRimRightMatRef,
        bag.hoverRimLeftMatRef
    ]) {
        const m = matRef.current;
        if (m) {
            m.opacity = hoverRimOpacityTarget;
        }
    }

    const { colors } = RENDERER_THEME;
    const resolvingRim = bag.resolvingRimMatRef.current;
    const focusRim = bag.focusRimMatRef.current;
    const burstMat = bag.burstRingMatRef.current;
    const burstMesh = bag.burstRingMeshRef.current;
    const checkMat = bag.matchedCheckMatRef.current;
    const checkMesh = bag.matchedCheckMeshRef.current;

    const resolvingActive = p.resolvingSelection !== null && p.faceUp;
    const pinnedFaceResolvingFx = p.isPinned && p.faceUp && p.resolvingSelection !== null;
    if (resolvingRim) {
        if (p.resolvingSelection === 'mismatch') {
            resolvingRim.color.set(colors.danger);
        } else if (p.resolvingSelection === 'gambitNeutral') {
            resolvingRim.color.set(colors.cyanBright);
        } else {
            resolvingRim.color.set(colors.emeraldBright);
        }
        const pulse = p.reduceMotion
            ? 0.62
            : 0.38 +
              0.32 *
                  Math.sin(
                      clock.elapsedTime * (p.resolvingSelection === 'mismatch' ? 5.1 : 4.05)
                  );
        const baseOp = resolvingActive ? (pinnedFaceResolvingFx ? Math.min(1, pulse + 0.2) : pulse) : 0;
        resolvingRim.opacity = baseOp;
    }

    if (focusRim) {
        const fk = p.keyboardFocused && p.pickable;
        focusRim.opacity = fk ? (p.reduceMotion ? 0.68 : 0.88) : 0;
    }

    const bT0 = bag.matchBurstT0Ref.current;
    if (burstMat && burstMesh) {
        if (bT0 != null && !p.reduceMotion) {
            const u = (clock.elapsedTime - bT0) / 0.45;
            if (u <= 1) {
                const ease = 1 - (1 - u) * (1 - u);
                burstMesh.visible = true;
                burstMesh.scale.setScalar(0.22 + ease * 0.9);
                burstMat.opacity = 0.85 * (1 - ease);
            } else {
                burstMesh.visible = false;
                bag.matchBurstT0Ref.current = null;
            }
        } else {
            burstMesh.visible = false;
            if (bT0 != null && p.reduceMotion) {
                bag.matchBurstT0Ref.current = null;
            }
        }
    }

    const showCheck = p.tile.state === 'matched';
    if (checkMat && checkMesh) {
        checkMesh.visible = showCheck;
        const popT0 = bag.matchedCheckPopT0Ref.current;
        if (showCheck && popT0 != null && !p.reduceMotion) {
            const t = clock.elapsedTime - popT0;
            if (t <= 0.42) {
                const u = t / 0.42;
                const scale = u < 0.58 ? 0.35 + (1.12 - 0.35) * (u / 0.58) : 1 - ((u - 0.58) / 0.42) * 0.1;
                checkMesh.scale.setScalar(MathUtils.clamp(scale, 0.35, 1.08));
                checkMat.opacity = 1;
            } else {
                checkMesh.scale.setScalar(1);
                checkMat.opacity = 1;
                bag.matchedCheckPopT0Ref.current = null;
            }
        } else if (showCheck) {
            checkMesh.scale.setScalar(1);
            checkMat.opacity = 1;
        }
    }

    const dimTarget = p.focusDimmed && !p.faceUp && p.tile.state === 'hidden' ? 1 : 0;
    bag.focusDimBlendRef.current = MathUtils.damp(
        bag.focusDimBlendRef.current,
        dimTarget,
        p.reduceMotion ? 400 : 32,
        delta
    );
    const dimBrightness = MathUtils.lerp(1, 0.52, bag.focusDimBlendRef.current);
    const dimOpacity = MathUtils.lerp(1, 0.88, bag.focusDimBlendRef.current);
    scratchCardTint.multiplyScalar(dimBrightness);
    bag.frontCardMatRef.current?.color.copy(scratchCardTint);
    bag.backCardMatRef.current?.color.copy(scratchCardTint);
    if (bag.frontCardMatRef.current) {
        bag.frontCardMatRef.current.opacity = dimOpacity;
        bag.frontCardMatRef.current.emissive.copy(HOVER_GOLD_EMISSIVE);
        bag.frontCardMatRef.current.emissiveIntensity = hoverEmissiveIntensity;
    }
    if (bag.backCardMatRef.current) {
        bag.backCardMatRef.current.opacity = dimOpacity;
        bag.backCardMatRef.current.emissive.copy(HOVER_GOLD_EMISSIVE);
        bag.backCardMatRef.current.emissiveIntensity = hoverEmissiveIntensity;
    }
};

const TileBezelFrameRegistryContext = createContext<{
    register(id: string, bag: TileBezelFrameBag): void;
    unregister(id: string): void;
} | null>(null);

/** Dev legacy path only: per-tile `useFrame` so consolidated mode avoids N no-op subscriptions. */
const TileBezelLegacyFrameDriver = ({ bagRef }: { bagRef: RefObject<TileBezelFrameBag | null> }) => {
    useFrame((state, delta) => {
        const bag = bagRef.current;

        if (bag) {
            advanceTileBezelFrame(bag, state, delta);
        }
    });

    return null;
};

const TileBezelInner = ({
    faceUp,
    fieldAmp,
    fieldTiltRef,
    flipLocked,
    graphicsQuality,
    hoverTiltRef,
    interactionSuppressed,
    interactive,
    isPinned,
    onTilePick,
    reduceMotion,
    resolvingSelection,
    shuffleMotionDeadlineMs,
    shuffleMotionBudgetMs,
    shuffleStaggerTileCount,
    shuffleBoardOrderIndex,
    textureRevision,
    tile,
    transform,
    sharedCardFrontGeometry,
    sharedCardBackGeometry,
    memorizeCurseHighlight = false,
    findableFaceHighlight = false,
    spotlightWardHighlight = false,
    spotlightBountyHighlight = false,
    focusDimmed = false,
    hostConsolidatesTileFrames = true,
    keyboardFocused = false
}: TileBezelProps) => {
    const { gl } = useThree();
    const frameRegistry = useContext(TileBezelFrameRegistryContext);
    const groupRef = useRef<Group | null>(null);
    const propsRef = useRef<TileBezelFramePropsSnapshot>({} as TileBezelFramePropsSnapshot);
    const bagRef = useRef<TileBezelFrameBag | null>(null);
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
    const curseRingGeometry = useMemo(() => {
        const maxR = Math.max(CARD_WIDTH, CARD_HEIGHT) * 0.48;
        return new RingGeometry(maxR * 0.86, maxR, 36);
    }, []);
    const findableCornerRingGeometry = useMemo(() => new RingGeometry(0.02, 0.032, 22), []);
    const useSvgMeshFront = sharedCardFrontGeometry != null;
    const useSvgMeshBack = sharedCardBackGeometry != null;

    propsRef.current = {
        faceUp,
        fieldAmp,
        flipLocked,
        focusDimmed,
        interactionSuppressed,
        interactive,
        isPinned,
        pickable,
        reduceMotion,
        resolvingSelection,
        shuffleMotionDeadlineMs,
        shuffleMotionBudgetMs,
        shuffleStaggerTileCount,
        shuffleBoardOrderIndex,
        textureRevision,
        tile,
        transform,
        useSvgMeshBack,
        useSvgMeshFront,
        graphicsQuality,
        fieldTiltRef,
        hoverTiltRef,
        keyboardFocused
    };

    const cardPanelNormalMap = useMemo(() => getCardPanelNormalTexture(), []);
    const cardPanelDisplacementMap = useMemo(() => getCardPanelDisplacementTexture(), []);
    const frontNormalMapEffective = useMemo(() => {
        void textureRevision;
        if (useSvgMeshFront) {
            return cardPanelNormalMap;
        }
        return getCardFaceRasterNormalMapTexture() ?? cardPanelNormalMap;
    }, [useSvgMeshFront, cardPanelNormalMap, textureRevision]);
    const backNormalMapEffective = useMemo(() => {
        void textureRevision;
        if (useSvgMeshBack) {
            return cardPanelNormalMap;
        }
        return getCardBackRasterNormalMapTexture() ?? cardPanelNormalMap;
    }, [useSvgMeshBack, cardPanelNormalMap, textureRevision]);

    const frontBaseRef = useRef<Float32Array | null>(null);
    const backBaseRef = useRef<Float32Array | null>(null);
    const overlayBaseRef = useRef<Float32Array | null>(null);

    const vertexCount = (CARD_BEND_SEGMENTS + 1) * (CARD_BEND_SEGMENTS + 1);
    const frontPersistentRef = useRef<Float32Array>(new Float32Array(vertexCount));
    const backPersistentRef = useRef<Float32Array>(new Float32Array(vertexCount));
    const overlayPersistentRef = useRef<Float32Array>(new Float32Array(vertexCount));

    const prevFaceUpRef = useRef(faceUp);
    const flipPopT0Ref = useRef<number | null>(null);
    const faceUpStructBlendRef = useRef(faceUp ? 1 : 0);
    const faceUpStructT0Ref = useRef<number | null>(null);
    const prevResolvingRef = useRef<ResolvingSelectionState | null>(null);
    /** FX-005 WebGL: brief match scale pulse (DOM hit layer adds CSS spark ring in `TileBoard.module.css`). */
    const matchPulseRef = useRef(0);
    const liftSmoothRef = useRef(0);
    const frontCardMatRef = useRef<MeshStandardMaterial | null>(null);
    const backCardMatRef = useRef<MeshStandardMaterial | null>(null);
    const focusDimBlendRef = useRef(0);

    const bendURef = useRef(0.5);
    const bendVRef = useRef(0.5);
    const bendBuildupRef = useRef(0);
    const lastBumpURef = useRef<number | null>(null);
    const lastBumpVRef = useRef<number | null>(null);
    const pressingOnCardRef = useRef(false);
    const hoverRimTopMatRef = useRef<MeshBasicMaterial | null>(null);
    const hoverRimBottomMatRef = useRef<MeshBasicMaterial | null>(null);
    const hoverRimRightMatRef = useRef<MeshBasicMaterial | null>(null);
    const hoverRimLeftMatRef = useRef<MeshBasicMaterial | null>(null);
    const resolvingRimMatRef = useRef<MeshBasicMaterial | null>(null);
    const focusRimMatRef = useRef<MeshBasicMaterial | null>(null);
    const burstRingMatRef = useRef<MeshBasicMaterial | null>(null);
    const burstRingMeshRef = useRef<Mesh | null>(null);
    const matchedCheckMatRef = useRef<MeshBasicMaterial | null>(null);
    const matchedCheckMeshRef = useRef<Mesh | null>(null);
    const matchBurstT0Ref = useRef<number | null>(null);
    const matchedCheckPopT0Ref = useRef<number | null>(null);
    const prevTileMatchedRef = useRef(false);

    useLayoutEffect(() => {
        if (bagRef.current === null) {
            bagRef.current = {
                groupRef,
                propsRef,
                planeGeometries: { front: frontGeometry, back: backGeometry, overlay: overlayGeometry },
                frontBaseRef,
                backBaseRef,
                overlayBaseRef,
                frontPersistentRef,
                backPersistentRef,
                overlayPersistentRef,
                prevFaceUpRef,
                flipPopT0Ref,
                faceUpStructBlendRef,
                faceUpStructT0Ref,
                prevResolvingRef,
                matchPulseRef,
                liftSmoothRef,
                frontCardMatRef,
                backCardMatRef,
                focusDimBlendRef,
                bendURef,
                bendVRef,
                bendBuildupRef,
                lastBumpURef,
                lastBumpVRef,
                pressingOnCardRef,
                hoverRimTopMatRef,
                hoverRimBottomMatRef,
                hoverRimRightMatRef,
                hoverRimLeftMatRef,
                resolvingRimMatRef,
                focusRimMatRef,
                burstRingMatRef,
                burstRingMeshRef,
                matchedCheckMatRef,
                matchedCheckMeshRef,
                matchBurstT0Ref,
                matchedCheckPopT0Ref,
                prevTileMatchedRef
            };
        } else {
            bagRef.current.planeGeometries = { front: frontGeometry, back: backGeometry, overlay: overlayGeometry };
        }

        if (!frameRegistry || !hostConsolidatesTileFrames) {
            return undefined;
        }

        frameRegistry.register(tile.id, bagRef.current);

        return () => {
            frameRegistry.unregister(tile.id);
        };
    }, [backGeometry, frameRegistry, frontGeometry, hostConsolidatesTileFrames, overlayGeometry, tile.id]);

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
        for (const geom of [frontGeometry, backGeometry]) {
            if (geom.index) {
                try {
                    geom.computeTangents();
                } catch {
                    /* bend-deformed planes still approximate OK for subtle normal map */
                }
            }
        }
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

        if (!useSvgMeshFront) {
            addPersistentBendStamp(frontPersistentRef.current, frontBase, bu, bv, CARD_WIDTH, CARD_HEIGHT, depthScale);
        }
        if (!useSvgMeshBack) {
            addPersistentBendStamp(backPersistentRef.current, backBase, bu, bv, CARD_WIDTH, CARD_HEIGHT, depthScale);
        }

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
            if (!useSvgMeshFront) {
                drawWearStamp(wearAssets.front.context, bu, bv, depthScale);
            }
            if (!useSvgMeshBack) {
                drawWearStamp(wearAssets.back.context, bu, bv, depthScale);
            }
            /* eslint-disable react-hooks/immutability */
            if (!useSvgMeshFront) {
                wearAssets.front.texture.needsUpdate = true;
            }
            if (!useSvgMeshBack) {
                wearAssets.back.texture.needsUpdate = true;
            }
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

    const surfaceVariant = getSurfaceVariant(tile, faceUp, resolvingSelection);
    const hiddenPinned = isPinned && tile.state === 'hidden';
    const cardTint =
        hiddenPinned
            ? '#d4b870'
            : resolvingSelection === 'mismatch' && faceUp
              ? '#ffb4a6'
              : resolvingSelection === 'gambitNeutral' && faceUp
                ? '#cfe8f2'
                : '#ffffff';
    /** Hidden side: shared SVG mesh when loaded, else raster fallback. Face-up: same for front. */
    const cardBackArtTexture = useSvgMeshBack ? null : getCardBackStaticTexture();
    const cardFrontArtTexture = useSvgMeshFront ? null : getCardFaceStaticTexture();
    const overlayTexture =
        surfaceVariant === 'hidden' ? null : getTileFaceOverlayTexture(tile, surfaceVariant);
    const matchedCheckMap = useMemo(() => getMatchedCheckTexture(), []);
    const forceTextureRefreshKey = textureRevision;

    const halfDepth = TILE_DEPTH * 0.5;
    const faceZ = halfDepth + 0.0004;
    const overlayZ = halfDepth + 0.004;

    return (
        <>
            {!hostConsolidatesTileFrames ? <TileBezelLegacyFrameDriver bagRef={bagRef} /> : null}
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
                {useSvgMeshFront && sharedCardFrontGeometry ? (
                    <mesh geometry={sharedCardFrontGeometry} position={[0, 0, faceZ]} raycast={noopMeshRaycast}>
                        <meshStandardMaterial
                            ref={frontCardMatRef}
                            alphaTest={0.06}
                            color={cardTint}
                            depthWrite
                            displacementBias={CARD_DISPLACEMENT_BIAS}
                            displacementMap={cardPanelDisplacementMap ?? undefined}
                            displacementScale={CARD_DISPLACEMENT_SCALE}
                            metalness={0.02}
                            normalMap={frontNormalMapEffective ?? undefined}
                            normalScale={CARD_NORMAL_SCALE}
                            roughness={0.84}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                            vertexColors
                        />
                    </mesh>
                ) : (
                    <mesh geometry={frontGeometry} position={[0, 0, faceZ]} raycast={noopMeshRaycast}>
                        <meshStandardMaterial
                            ref={frontCardMatRef}
                            alphaTest={0.06}
                            color={cardTint}
                            depthWrite
                            displacementBias={CARD_DISPLACEMENT_BIAS}
                            displacementMap={cardPanelDisplacementMap ?? undefined}
                            displacementScale={CARD_DISPLACEMENT_SCALE}
                            map={cardFrontArtTexture ?? undefined}
                            metalness={0.02}
                            normalMap={frontNormalMapEffective ?? undefined}
                            normalScale={CARD_NORMAL_SCALE}
                            roughness={0.84}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                )}
                {wearAssets && !useSvgMeshFront ? (
                    <mesh
                        geometry={frontGeometry}
                        position={[0, 0, faceZ + CARD_WEAR_Z_SLIVER]}
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
                {useSvgMeshBack && sharedCardBackGeometry ? (
                    <mesh
                        geometry={sharedCardBackGeometry}
                        position={[0, 0, -faceZ]}
                        rotation={[0, Math.PI, 0]}
                        raycast={noopMeshRaycast}
                    >
                        <meshStandardMaterial
                            ref={backCardMatRef}
                            alphaTest={0.06}
                            color={cardTint}
                            depthWrite
                            displacementBias={CARD_DISPLACEMENT_BIAS}
                            displacementMap={cardPanelDisplacementMap ?? undefined}
                            displacementScale={CARD_DISPLACEMENT_SCALE}
                            metalness={0.02}
                            normalMap={backNormalMapEffective ?? undefined}
                            normalScale={CARD_NORMAL_SCALE}
                            roughness={0.84}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                            vertexColors
                        />
                    </mesh>
                ) : (
                    <mesh geometry={backGeometry} position={[0, 0, -faceZ]} rotation={[0, Math.PI, 0]} raycast={noopMeshRaycast}>
                        <meshStandardMaterial
                            ref={backCardMatRef}
                            alphaTest={0.06}
                            color={cardTint}
                            depthWrite
                            displacementBias={CARD_DISPLACEMENT_BIAS}
                            displacementMap={cardPanelDisplacementMap ?? undefined}
                            displacementScale={CARD_DISPLACEMENT_SCALE}
                            map={cardBackArtTexture ?? undefined}
                            metalness={0.02}
                            normalMap={backNormalMapEffective ?? undefined}
                            normalScale={CARD_NORMAL_SCALE}
                            roughness={0.84}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                )}
                {wearAssets && !useSvgMeshBack ? (
                    <mesh
                        geometry={backGeometry}
                        position={[0, 0, -faceZ - CARD_WEAR_Z_SLIVER]}
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
                {/*
                  FX-006: gold frame strips on the pickable hidden face (same transform stack as `.fallbackTile:hover` rim).
                  Opacity driven in `advanceTileBezelFrame`; shared geometry keeps perf sane across tiles.
                */}
                <group position={[0, 0, -faceZ - 0.00028]} rotation={[0, Math.PI, 0]}>
                    <mesh
                        geometry={hoverGoldRimGeomH}
                        position={[0, CARD_HEIGHT * 0.5 - HOVER_GOLD_RIM_STRIP * 0.5, 0.00045]}
                        raycast={noopMeshRaycast}
                        renderOrder={7}
                    >
                        <meshBasicMaterial
                            ref={hoverRimTopMatRef}
                            color={RENDERER_THEME.colors.goldBright}
                            depthWrite={false}
                            opacity={0}
                            polygonOffset
                            polygonOffsetFactor={-1}
                            polygonOffsetUnits={-1}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                    <mesh
                        geometry={hoverGoldRimGeomH}
                        position={[0, -CARD_HEIGHT * 0.5 + HOVER_GOLD_RIM_STRIP * 0.5, 0.00045]}
                        raycast={noopMeshRaycast}
                        renderOrder={7}
                    >
                        <meshBasicMaterial
                            ref={hoverRimBottomMatRef}
                            color={RENDERER_THEME.colors.goldBright}
                            depthWrite={false}
                            opacity={0}
                            polygonOffset
                            polygonOffsetFactor={-1}
                            polygonOffsetUnits={-1}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                    <mesh
                        geometry={hoverGoldRimGeomV}
                        position={[CARD_WIDTH * 0.5 - HOVER_GOLD_RIM_STRIP * 0.5, 0, 0.00045]}
                        raycast={noopMeshRaycast}
                        renderOrder={7}
                    >
                        <meshBasicMaterial
                            ref={hoverRimRightMatRef}
                            color={RENDERER_THEME.colors.goldBright}
                            depthWrite={false}
                            opacity={0}
                            polygonOffset
                            polygonOffsetFactor={-1}
                            polygonOffsetUnits={-1}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                    <mesh
                        geometry={hoverGoldRimGeomV}
                        position={[-CARD_WIDTH * 0.5 + HOVER_GOLD_RIM_STRIP * 0.5, 0, 0.00045]}
                        raycast={noopMeshRaycast}
                        renderOrder={7}
                    >
                        <meshBasicMaterial
                            ref={hoverRimLeftMatRef}
                            color={RENDERER_THEME.colors.goldBright}
                            depthWrite={false}
                            opacity={0}
                            polygonOffset
                            polygonOffsetFactor={-1}
                            polygonOffsetUnits={-1}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                </group>
                {memorizeCurseHighlight ? (
                    <mesh geometry={curseRingGeometry} position={[0, 0, faceZ + 0.014]} raycast={noopMeshRaycast} renderOrder={9}>
                        <meshBasicMaterial
                            color="#c49cff"
                            depthTest
                            depthWrite={false}
                            opacity={0.88}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                ) : null}
                {findableFaceHighlight ? (
                    <mesh
                        geometry={findableCornerRingGeometry}
                        position={[CARD_WIDTH * 0.36, CARD_HEIGHT * 0.4, faceZ + 0.017]}
                        raycast={noopMeshRaycast}
                        renderOrder={9}
                    >
                        <meshBasicMaterial
                            color={tile.findableKind === 'score_glint' ? '#7ec8e8' : '#e8c058'}
                            depthTest
                            depthWrite={false}
                            opacity={0.92}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                ) : null}
                {spotlightWardHighlight ? (
                    <mesh
                        geometry={findableCornerRingGeometry}
                        position={[-CARD_WIDTH * 0.36, CARD_HEIGHT * 0.4, faceZ + 0.018]}
                        raycast={noopMeshRaycast}
                        renderOrder={9}
                    >
                        <meshBasicMaterial
                            color="#ff7a6a"
                            depthTest
                            depthWrite={false}
                            opacity={0.9}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                ) : null}
                {spotlightBountyHighlight ? (
                    <mesh
                        geometry={findableCornerRingGeometry}
                        position={[CARD_WIDTH * 0.36, -CARD_HEIGHT * 0.4, faceZ + 0.018]}
                        raycast={noopMeshRaycast}
                        renderOrder={9}
                    >
                        <meshBasicMaterial
                            color="#5ee0c8"
                            depthTest
                            depthWrite={false}
                            opacity={0.9}
                            side={DoubleSide}
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
                <mesh geometry={RESOLVING_RING_GEOM} position={[0, 0, faceZ + 0.024]} raycast={noopMeshRaycast} renderOrder={13}>
                    <meshBasicMaterial
                        ref={resolvingRimMatRef}
                        color={RENDERER_THEME.colors.emeraldBright}
                        depthTest
                        depthWrite={false}
                        opacity={0}
                        polygonOffset
                        polygonOffsetFactor={-1}
                        polygonOffsetUnits={-1}
                        side={DoubleSide}
                        toneMapped={false}
                        transparent
                    />
                </mesh>
                <mesh geometry={FOCUS_RING_GEOM} position={[0, 0, faceZ + 0.027]} raycast={noopMeshRaycast} renderOrder={15}>
                    <meshBasicMaterial
                        ref={focusRimMatRef}
                        color={RENDERER_THEME.colors.goldBright}
                        depthTest
                        depthWrite={false}
                        opacity={0}
                        polygonOffset
                        polygonOffsetFactor={-1}
                        polygonOffsetUnits={-1}
                        side={DoubleSide}
                        toneMapped={false}
                        transparent
                    />
                </mesh>
                <mesh
                    ref={burstRingMeshRef}
                    geometry={BURST_RING_GEOM}
                    position={[0, 0, faceZ + 0.018]}
                    raycast={noopMeshRaycast}
                    renderOrder={12}
                    visible={false}
                >
                    <meshBasicMaterial
                        ref={burstRingMatRef}
                        color={RENDERER_THEME.colors.emeraldBright}
                        depthTest
                        depthWrite={false}
                        opacity={0}
                        side={DoubleSide}
                        toneMapped={false}
                        transparent
                    />
                </mesh>
                {matchedCheckMap ? (
                    <mesh
                        ref={matchedCheckMeshRef}
                        geometry={MATCH_CHECK_GEOM}
                        position={[0, CARD_HEIGHT * 0.06, faceZ + 0.03]}
                        raycast={noopMeshRaycast}
                        renderOrder={16}
                        visible={false}
                    >
                        <meshBasicMaterial
                            ref={matchedCheckMatRef}
                            depthTest
                            depthWrite={false}
                            map={matchedCheckMap}
                            opacity={0}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent
                        />
                    </mesh>
                ) : null}
            </group>
        </group>
        </>
    );
};

TileBezelInner.displayName = 'TileBezel';
const TileBezel = memo(TileBezelInner);

interface MatchResolvingPairLinkProps {
    board: BoardState;
    boardGroupRef: RefObject<Group | null>;
    graphicsQuality: GraphicsQualityPreset;
    reduceMotion: boolean;
    runStatus: RunStatus;
    tileFrameBagsRef: RefObject<Map<string, TileBezelFrameBag>>;
}

/**
 * FX-017: thin emerald ribbon between the two tiles in `match` resolving state.
 * Sits slightly behind card depth so faces / overlay symbols stay readable; off when `reduceMotion` or `low` quality.
 */
const MatchResolvingPairLink = ({
    board,
    boardGroupRef,
    graphicsQuality,
    reduceMotion,
    runStatus,
    tileFrameBagsRef
}: MatchResolvingPairLinkProps) => {
    const meshRef = useRef<Mesh | null>(null);
    const matRef = useRef<MeshBasicMaterial | null>(null);
    const pairIds = useMemo(() => getMatchResolvingPairTileIds(board, runStatus), [board, runStatus]);

    useFrame((state) => {
        const mesh = meshRef.current;
        const mat = matRef.current;
        const boardRoot = boardGroupRef.current;

        if (!mesh || !mat || !boardRoot) {
            return;
        }

        if (reduceMotion || graphicsQuality === 'low' || !pairIds) {
            mesh.visible = false;

            return;
        }

        const [idA, idB] = pairIds;
        const groupA = tileFrameBagsRef.current.get(idA)?.groupRef.current;
        const groupB = tileFrameBagsRef.current.get(idB)?.groupRef.current;

        if (!groupA || !groupB) {
            mesh.visible = false;

            return;
        }

        groupA.getWorldPosition(matchLinkWorldA);
        groupB.getWorldPosition(matchLinkWorldB);
        boardRoot.worldToLocal(matchLinkWorldA);
        boardRoot.worldToLocal(matchLinkWorldB);

        const dx = matchLinkWorldB.x - matchLinkWorldA.x;
        const dy = matchLinkWorldB.y - matchLinkWorldA.y;
        const len = Math.hypot(dx, dy);

        if (len < 1e-5) {
            mesh.visible = false;

            return;
        }

        mesh.visible = true;
        const midX = (matchLinkWorldA.x + matchLinkWorldB.x) * 0.5;
        const midY = (matchLinkWorldA.y + matchLinkWorldB.y) * 0.5;
        const zUnder = Math.min(matchLinkWorldA.z, matchLinkWorldB.z) - 0.007;
        mesh.position.set(midX, midY, zUnder);
        mesh.rotation.set(0, 0, Math.atan2(dy, dx));
        const thickMul = graphicsQuality === 'high' ? 1.35 : 1;
        mesh.scale.set(len, thickMul, 1);

        const pulse = 0.34 + 0.24 * Math.sin(state.clock.elapsedTime * 4.05);
        mat.opacity = pulse;
        mat.color.copy(matchLinkColor);
    });

    return (
        <mesh
            ref={meshRef}
            frustumCulled={false}
            geometry={MATCH_PAIR_LINK_PLANE_GEOM}
            raycast={noopMeshRaycast}
            renderOrder={-8}
        >
            <meshBasicMaterial
                ref={matRef}
                color={matchLinkColor}
                depthTest
                depthWrite={false}
                opacity={0}
                polygonOffset
                polygonOffsetFactor={1}
                polygonOffsetUnits={1}
                side={DoubleSide}
                toneMapped={false}
                transparent
            />
        </mesh>
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
    peekRevealedTileIds = [],
    cursedPairKey = null,
    wardPairKey = null,
    bountyPairKey = null,
    shuffleMotionDeadlineMs,
    shuffleMotionBudgetMs,
    shuffleStaggerTileCount,
    dimmedTileIds,
    allowGambitThirdFlip = false,
    graphicsQuality = 'medium',
    focusedTileId = null
}: TileBoardSceneProps, ref) => {
    const { camera, gl, viewport } = useThree();
    const { colors } = RENDERER_THEME;
    const totalColumns = board.columns;
    const totalRows = board.rows;
    const [textureRevision, setTextureRevision] = useState(0);
    const [sharedCardFrontGeometry, setSharedCardFrontGeometry] = useState<BufferGeometry | null>(null);
    const [sharedCardBackGeometry, setSharedCardBackGeometry] = useState<BufferGeometry | null>(null);
    const flippedN = board.flippedTileIds.length;
    const flipLocked = flippedN >= 2 && !(allowGambitThirdFlip && flippedN === 2);
    const pinnedSet = useMemo(() => new Set(pinnedTileIds), [pinnedTileIds]);
    const peekSet = useMemo(() => new Set(peekRevealedTileIds), [peekRevealedTileIds]);
    const tileStepLegacy = useMemo(() => readTileStepLegacy(), []);
    const hostConsolidatesTileFrames = !tileStepLegacy;
    const tileBezelRows = useMemo(() => {
        return board.tiles.map((tile, index) => {
            const faceUp =
                tile.state !== 'hidden' || previewActive || debugPeekActive || peekSet.has(tile.id);
            const memorizeCurseHighlight =
                Boolean(previewActive) &&
                Boolean(cursedPairKey) &&
                tile.pairKey === cursedPairKey &&
                tile.state === 'hidden';
            const findableFaceHighlight = Boolean(tile.findableKind) && faceUp && tile.state !== 'matched';
            const spotlightWardHighlight =
                Boolean(wardPairKey) && faceUp && tile.state !== 'matched' && tile.pairKey === wardPairKey;
            const spotlightBountyHighlight =
                Boolean(bountyPairKey) && faceUp && tile.state !== 'matched' && tile.pairKey === bountyPairKey;
            return {
                faceUp,
                fieldAmp: getTileFieldAmplification(index, totalColumns, totalRows),
                findableFaceHighlight,
                focusDimmed: Boolean(dimmedTileIds?.has(tile.id)),
                isPinned: pinnedSet.has(tile.id),
                memorizeCurseHighlight,
                resolvingSelection: getResolvingSelectionState(board, runStatus, tile.id),
                shuffleBoardOrderIndex: index,
                spotlightBountyHighlight,
                spotlightWardHighlight,
                tile,
                transform: getTileTransform(tile, index, totalColumns, totalRows, compact, faceUp)
            };
        });
    }, [
        board,
        bountyPairKey,
        compact,
        cursedPairKey,
        debugPeekActive,
        dimmedTileIds,
        peekSet,
        pinnedSet,
        previewActive,
        runStatus,
        totalColumns,
        totalRows,
        wardPairKey
    ]);
    const boardGroupRef = useRef<Group | null>(null);
    const pickRaycasterRef = useRef<Raycaster>(new Raycaster());
    const pickPointerRef = useRef<Vector2>(new Vector2());
    const tileFrameBagsRef = useRef(new Map<string, TileBezelFrameBag>());
    const tileFrameRegistry = useMemo(
        () => ({
            register(id: string, bag: TileBezelFrameBag): void {
                tileFrameBagsRef.current.set(id, bag);
            },
            unregister(id: string): void {
                tileFrameBagsRef.current.delete(id);
            }
        }),
        []
    );

    useEffect(() => subscribeTextureImageUpdates(() => setTextureRevision((current) => current + 1)), []);

    const overlayPrewarmKey = `${board.level}:${board.tiles.map((tile) => tile.id).join(',')}`;
    useEffect(() => {
        let cancelled = false;
        const tiles = board.tiles;
        /** Only `active`: prewarming all variants was 3× canvas allocations per tile on every board. */
        let index = 0;
        const pump = (): void => {
            if (cancelled) {
                return;
            }
            if (index >= tiles.length) {
                return;
            }
            getTileFaceOverlayTexture(tiles[index], 'active');
            index += 1;
            requestAnimationFrame(pump);
        };
        requestAnimationFrame(pump);
        return () => {
            cancelled = true;
        };
    }, [overlayPrewarmKey]); // eslint-disable-line react-hooks/exhaustive-deps -- overlayPrewarmKey encodes level + tile ids

    /** Chain front → back so two huge SVGLoader.parse passes never run in parallel (main-thread + memory). */
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            const frontG = await loadSharedCardSvgPlaneGeometry(cardFrontSvgUrl);
            if (cancelled) {
                return;
            }
            setSharedCardFrontGeometry(frontG);
            const backG = await loadSharedCardSvgPlaneGeometry(cardBackSvgUrl);
            if (cancelled) {
                return;
            }
            setSharedCardBackGeometry(backG);
        })();
        return () => {
            cancelled = true;
        };
    }, []);
    useEffect(() => {
        onViewportMetricsChange({ height: viewport.height, width: viewport.width });
    }, [onViewportMetricsChange, viewport.height, viewport.width]);

    useLayoutEffect(() => {
        const tierCap = getBoardAnisotropyCap(graphicsQuality);
        applyAnisotropyToCachedTileTextures(Math.min(tierCap, gl.capabilities.getMaxAnisotropy()));
    }, [gl, graphicsQuality, textureRevision]);

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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- mount-only; useFrame updates boardGroup each frame

    useFrame((state, delta) => {
        const perfOn = boardWebglPerfSampleEnabled();
        const t0 = perfOn ? performance.now() : 0;

        if (!tileStepLegacy) {
            for (const bag of tileFrameBagsRef.current.values()) {
                advanceTileBezelFrame(bag, state, delta);
            }
        }

        const boardGroup = boardGroupRef.current;

        if (boardGroup) {
            const targetScale = boardViewport.fitZoom * boardViewport.zoom;

            if (reduceMotion) {
                boardGroup.position.x = boardViewport.panX;
                boardGroup.position.y = boardViewport.panY;
                boardGroup.scale.setScalar(targetScale);
            } else {
                const panDamping = interactionSuppressed ? BOARD_VIEWPORT_ACTIVE_DAMPING : BOARD_VIEWPORT_IDLE_DAMPING;
                const scaleDamping = interactionSuppressed
                    ? BOARD_VIEWPORT_ACTIVE_SCALE_DAMPING
                    : BOARD_VIEWPORT_IDLE_SCALE_DAMPING;

                boardGroup.position.x = MathUtils.damp(boardGroup.position.x, boardViewport.panX, panDamping, delta);
                boardGroup.position.y = MathUtils.damp(boardGroup.position.y, boardViewport.panY, panDamping, delta);
                boardGroup.scale.x = MathUtils.damp(boardGroup.scale.x, targetScale, scaleDamping, delta);
                boardGroup.scale.y = MathUtils.damp(boardGroup.scale.y, targetScale, scaleDamping, delta);
                boardGroup.scale.z = MathUtils.damp(boardGroup.scale.z, targetScale, scaleDamping, delta);
            }
        }

        if (perfOn) {
            boardWebglPerfSampleAccumulate(performance.now() - t0);
        }
    });

    return (
        <TileBezelFrameRegistryContext.Provider value={tileFrameRegistry}>
        <>
            <ambientLight color={colors.text} intensity={compact ? 0.62 : 0.72} />
            <hemisphereLight
                color={colors.text}
                groundColor={colors.smokeDeep}
                intensity={compact ? 0.26 : 0.32}
            />
            <directionalLight
                castShadow={false}
                color={colors.text}
                intensity={compact ? 0.24 : 0.3}
                position={[0, 2.2, 12]}
            />
            <directionalLight
                castShadow={false}
                color={colors.goldBright}
                intensity={compact ? 0.9 : 1.02}
                position={[5.4, 7.2, 8.5]}
            />
            <directionalLight color={colors.cyan} intensity={compact ? 0.14 : 0.18} position={[-5.8, 2.2, 6.8]} />
            <pointLight color={colors.gold} intensity={compact ? 0.14 : 0.2} position={[0, -2.2, 5.4]} />

            <group ref={boardGroupRef} rotation={[0, 0, 0]}>
                <MatchResolvingPairLink
                    board={board}
                    boardGroupRef={boardGroupRef}
                    graphicsQuality={graphicsQuality}
                    reduceMotion={reduceMotion}
                    runStatus={runStatus}
                    tileFrameBagsRef={tileFrameBagsRef}
                />
                {tileBezelRows.map(
                    ({
                        faceUp,
                        fieldAmp,
                        findableFaceHighlight,
                        focusDimmed,
                        isPinned,
                        memorizeCurseHighlight,
                        resolvingSelection,
                        shuffleBoardOrderIndex,
                        spotlightBountyHighlight,
                        spotlightWardHighlight,
                        tile,
                        transform
                    }) => (
                        <TileBezel
                            key={tile.id}
                            faceUp={faceUp}
                            fieldAmp={fieldAmp}
                            fieldTiltRef={fieldTiltRef}
                            flipLocked={flipLocked}
                            focusDimmed={focusDimmed}
                            hostConsolidatesTileFrames={hostConsolidatesTileFrames}
                            hoverTiltRef={hoverTiltRef}
                            findableFaceHighlight={findableFaceHighlight}
                            keyboardFocused={focusedTileId === tile.id}
                            spotlightBountyHighlight={spotlightBountyHighlight}
                            spotlightWardHighlight={spotlightWardHighlight}
                            interactionSuppressed={interactionSuppressed}
                            interactive={interactive}
                            isPinned={isPinned}
                            memorizeCurseHighlight={memorizeCurseHighlight}
                            onTilePick={onTilePick}
                            reduceMotion={reduceMotion}
                            resolvingSelection={resolvingSelection}
                            shuffleBoardOrderIndex={shuffleBoardOrderIndex}
                            shuffleMotionBudgetMs={shuffleMotionBudgetMs}
                            shuffleMotionDeadlineMs={shuffleMotionDeadlineMs}
                            shuffleStaggerTileCount={shuffleStaggerTileCount}
                            sharedCardBackGeometry={sharedCardBackGeometry}
                            sharedCardFrontGeometry={sharedCardFrontGeometry}
                            textureRevision={textureRevision}
                            tile={tile}
                            transform={transform}
                            graphicsQuality={graphicsQuality}
                        />
                    )
                )}
            </group>
        </>
        </TileBezelFrameRegistryContext.Provider>
    );
});

TileBoardScene.displayName = 'TileBoardScene';

export default TileBoardScene;
