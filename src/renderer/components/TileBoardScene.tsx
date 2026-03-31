import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { FrontSide, MathUtils, type Group } from 'three';
import type { BoardState, Tile } from '../../shared/contracts';
import {
    getCardBackStaticTexture,
    getTileFaceOverlayTexture,
    getTileFaceRoughnessTexture,
    getTileFaceTexture,
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

interface TileBoardSceneProps {
    board: BoardState;
    compact: boolean;
    debugPeekActive: boolean;
    fieldTiltRef: MutableRefObject<TiltVector>;
    hoverTiltRef: MutableRefObject<TileHoverTiltState>;
    previewActive: boolean;
    reduceMotion: boolean;
}

interface TileBezelProps {
    compact: boolean;
    faceUp: boolean;
    fieldAmp: number;
    fieldTiltRef: MutableRefObject<TiltVector>;
    hoverTiltRef: MutableRefObject<TileHoverTiltState>;
    reduceMotion: boolean;
    textureRevision: number;
    tile: Tile;
    transform: TileTransform;
}

export interface TileHoverTiltState {
    tileId: string | null;
    x: number;
    y: number;
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

const hashString = (value: string): number => {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) | 0;
    }

    return Math.abs(hash);
};

const getSurfaceVariant = (tile: Tile, faceUp: boolean): FaceVariant =>
    tile.state === 'matched' ? 'matched' : faceUp ? 'active' : 'hidden';

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

const getEdgeMaterialProfile = (surfaceVariant: FaceVariant): {
    color: string;
    emissive: string;
    emissiveIntensity: number;
    roughness: number;
    metalness: number;
    specularColor: string;
    specularIntensity: number;
} => {
    const { colors } = RENDERER_THEME;

    if (surfaceVariant === 'matched') {
        return {
            color: colors.goldDeep,
            emissive: colors.goldDeep,
            emissiveIntensity: 0.12,
            roughness: 0.34,
            metalness: 0.56,
            specularColor: colors.goldBright,
            specularIntensity: 0.9
        };
    }

    if (surfaceVariant === 'active') {
        return {
            color: colors.stoneEdge,
            emissive: colors.cyanDeep,
            emissiveIntensity: 0.12,
            roughness: 0.38,
            metalness: 0.44,
            specularColor: colors.cyanBright,
            specularIntensity: 0.82
        };
    }

    return {
        color: colors.smokeDeep,
        emissive: colors.goldDeep,
        emissiveIntensity: 0.06,
        roughness: 0.44,
        metalness: 0.34,
        specularColor: colors.gold,
        specularIntensity: 0.7
    };
};

const TileBezel = ({
    compact,
    faceUp,
    fieldAmp,
    fieldTiltRef,
    hoverTiltRef,
    reduceMotion,
    textureRevision,
    tile,
    transform
}: TileBezelProps) => {
    const groupRef = useRef<Group | null>(null);
    const isMatched = tile.state === 'matched';

    useFrame((state, delta) => {
        const group = groupRef.current;

        if (!group) {
            return;
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
        group.position.x = transform.baseX + transform.imperfectionX;
        group.position.y = transform.baseY + transform.imperfectionY + targetLift + hoverLift + fieldLift + idleDrift + settle;
        group.position.z = targetDepth + hoverDepth + fieldDepth;
        group.scale.x = group.scale.y = group.scale.z = transform.baseScale;
    });

    const surfaceVariant = getSurfaceVariant(tile, faceUp);
    const edgeMaterialProfile = getEdgeMaterialProfile(surfaceVariant);
    const edgeTexture = getTileFaceTexture(tile, 'left', surfaceVariant, 'bezel');
    const edgeRoughnessTexture = getTileFaceRoughnessTexture(tile, 'left', surfaceVariant, 'bezel');
    const hiddenBackTexture = surfaceVariant === 'hidden' ? getCardBackStaticTexture() : null;
    const frontDisplayTexture = hiddenBackTexture ?? getTileFaceTexture(tile, 'front', surfaceVariant, 'panel');
    const backDisplayTexture = hiddenBackTexture ?? getTileFaceTexture(tile, 'back', surfaceVariant, 'panel');
    const overlayTexture = surfaceVariant === 'hidden' ? null : getTileFaceOverlayTexture(tile, surfaceVariant === 'matched' ? 'matched' : 'active');
    const forceTextureRefreshKey = textureRevision;

    return (
        <group ref={groupRef}>
            <mesh
                castShadow={!compact && !reduceMotion}
                key={`card-body-${tile.id}-${forceTextureRefreshKey}`}
                receiveShadow={!compact && !reduceMotion}
                scale={[transform.bezelScale, transform.bezelScale, transform.bezelScale]}
            >
                <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, TILE_DEPTH]} />
                <meshPhysicalMaterial
                    attach="material-0"
                    clearcoat={0.48}
                    clearcoatRoughness={0.34}
                    color={edgeMaterialProfile.color}
                    emissive={edgeMaterialProfile.emissive}
                    emissiveIntensity={edgeMaterialProfile.emissiveIntensity}
                    map={edgeTexture ?? undefined}
                    metalness={edgeMaterialProfile.metalness}
                    roughness={edgeMaterialProfile.roughness}
                    roughnessMap={edgeRoughnessTexture ?? undefined}
                    side={FrontSide}
                    specularColor={edgeMaterialProfile.specularColor}
                    specularIntensity={edgeMaterialProfile.specularIntensity}
                />
                <meshPhysicalMaterial
                    attach="material-1"
                    clearcoat={0.48}
                    clearcoatRoughness={0.34}
                    color={edgeMaterialProfile.color}
                    emissive={edgeMaterialProfile.emissive}
                    emissiveIntensity={edgeMaterialProfile.emissiveIntensity}
                    map={edgeTexture ?? undefined}
                    metalness={edgeMaterialProfile.metalness}
                    roughness={edgeMaterialProfile.roughness}
                    roughnessMap={edgeRoughnessTexture ?? undefined}
                    side={FrontSide}
                    specularColor={edgeMaterialProfile.specularColor}
                    specularIntensity={edgeMaterialProfile.specularIntensity}
                />
                <meshPhysicalMaterial
                    attach="material-2"
                    clearcoat={0.48}
                    clearcoatRoughness={0.34}
                    color={edgeMaterialProfile.color}
                    emissive={edgeMaterialProfile.emissive}
                    emissiveIntensity={edgeMaterialProfile.emissiveIntensity}
                    map={edgeTexture ?? undefined}
                    metalness={edgeMaterialProfile.metalness}
                    roughness={edgeMaterialProfile.roughness}
                    roughnessMap={edgeRoughnessTexture ?? undefined}
                    side={FrontSide}
                    specularColor={edgeMaterialProfile.specularColor}
                    specularIntensity={edgeMaterialProfile.specularIntensity}
                />
                <meshPhysicalMaterial
                    attach="material-3"
                    clearcoat={0.48}
                    clearcoatRoughness={0.34}
                    color={edgeMaterialProfile.color}
                    emissive={edgeMaterialProfile.emissive}
                    emissiveIntensity={edgeMaterialProfile.emissiveIntensity}
                    map={edgeTexture ?? undefined}
                    metalness={edgeMaterialProfile.metalness}
                    roughness={edgeMaterialProfile.roughness}
                    roughnessMap={edgeRoughnessTexture ?? undefined}
                    side={FrontSide}
                    specularColor={edgeMaterialProfile.specularColor}
                    specularIntensity={edgeMaterialProfile.specularIntensity}
                />
                <meshBasicMaterial
                    attach="material-4"
                    color="#ffffff"
                    map={frontDisplayTexture ?? undefined}
                    toneMapped={false}
                />
                <meshBasicMaterial
                    attach="material-5"
                    color="#ffffff"
                    map={backDisplayTexture ?? undefined}
                    toneMapped={false}
                />
            </mesh>

            {overlayTexture ? (
                <mesh position={[0, 0, TILE_DEPTH * 0.56]} renderOrder={10}>
                    <planeGeometry args={[CARD_FACE_WIDTH, CARD_FACE_HEIGHT]} />
                    <meshBasicMaterial
                        alphaTest={0.08}
                        depthTest={false}
                        depthWrite={false}
                        map={overlayTexture}
                        toneMapped={false}
                        transparent={true}
                    />
                </mesh>
            ) : null}
        </group>
    );
};

const TileBoardScene = ({
    board,
    compact,
    debugPeekActive,
    fieldTiltRef,
    hoverTiltRef,
    previewActive,
    reduceMotion
}: TileBoardSceneProps) => {
    const { viewport } = useThree();
    const { colors } = RENDERER_THEME;
    const totalColumns = board.columns;
    const totalRows = board.rows;
    const boardWidth = (totalColumns - 1) * TILE_SPACING + 1;
    const boardHeight = (totalRows - 1) * TILE_SPACING + 1;
    const margin = compact ? 0.72 : 0.85;
    const fitScale = Math.min((viewport.width * margin) / boardWidth, (viewport.height * margin) / boardHeight);
    const [textureRevision, setTextureRevision] = useState(0);

    useEffect(() => subscribeTextureImageUpdates(() => setTextureRevision((current) => current + 1)), []);

    return (
        <>
            <ambientLight color={colors.text} intensity={compact ? 0.56 : 0.64} />
            <directionalLight
                castShadow={!compact && !reduceMotion}
                color={colors.goldBright}
                intensity={compact ? 0.9 : 1.02}
                position={[5.4, 7.2, 8.5]}
            />
            <directionalLight color={colors.cyan} intensity={compact ? 0.14 : 0.18} position={[-5.8, 2.2, 6.8]} />
            <pointLight color={colors.gold} intensity={compact ? 0.14 : 0.2} position={[0, -2.2, 5.4]} />

            <mesh position={[0, 0, -1.42]} receiveShadow={!compact && !reduceMotion}>
                <planeGeometry args={[boardWidth * 2, boardHeight * 2]} />
                <meshStandardMaterial color={colors.voidAlt} metalness={0.12} roughness={0.96} />
            </mesh>

            <group rotation={[-0.1, 0.08, 0]} scale={[fitScale, fitScale, fitScale]}>
                {board.tiles.map((tile, index) => {
                    const faceUp = tile.state !== 'hidden' || previewActive || debugPeekActive;
                    const transform = getTileTransform(tile, index, totalColumns, totalRows, compact, faceUp);

                    return (
                        <TileBezel
                            compact={compact}
                            faceUp={faceUp}
                            fieldAmp={getTileFieldAmplification(index, totalColumns, totalRows)}
                            fieldTiltRef={fieldTiltRef}
                            hoverTiltRef={hoverTiltRef}
                            key={tile.id}
                            reduceMotion={reduceMotion}
                            textureRevision={textureRevision}
                            tile={tile}
                            transform={transform}
                        />
                    );
                })}
            </group>
        </>
    );
};

export default TileBoardScene;
