import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { FrontSide, MathUtils, type Group } from 'three';
import type { BoardState, Tile } from '../../shared/contracts';
import { getTileFaceRoughnessTexture, getTileFaceTexture, type CubeFace, type FaceVariant } from './tileTextures';

interface TileBoardSceneProps {
    board: BoardState;
    compact: boolean;
    debugPeekActive: boolean;
    previewActive: boolean;
    reduceMotion: boolean;
}

interface TileCubeProps {
    compact: boolean;
    faceUp: boolean;
    index: number;
    reduceMotion: boolean;
    row: number;
    tile: Tile;
    totalColumns: number;
    totalRows: number;
}

interface FaceMaterialConfig {
    attach: 'material-0' | 'material-1' | 'material-2' | 'material-3' | 'material-4' | 'material-5';
    color: string;
    clearcoat: number;
    clearcoatRoughness: number;
    displacementBias?: number;
    displacementScale?: number;
    emissive: string;
    emissiveIntensity: number;
    envMapIntensity: number;
    face: CubeFace;
    ior?: number;
    metalness: number;
    opacity?: number;
    specularColor?: string;
    specularIntensity?: number;
    roughness: number;
    thicknessMap?: boolean;
    transmission?: number;
    transparent?: boolean;
    thickness?: number;
    attenuationColor?: string;
    attenuationDistance?: number;
    depthWrite?: boolean;
    bumpScale: number;
}

const TILE_SPACING = 1.18;
const TILE_DEPTH = 0.72;
const SHELL_SCALE = 1.12;
const CORE_SCALE = 0.84;

const FACE_ORDER: Array<{ attach: FaceMaterialConfig['attach']; face: CubeFace }> = [
    { attach: 'material-0', face: 'right' },
    { attach: 'material-1', face: 'left' },
    { attach: 'material-2', face: 'top' },
    { attach: 'material-3', face: 'bottom' },
    { attach: 'material-4', face: 'front' },
    { attach: 'material-5', face: 'back' }
];

const hashString = (value: string): number => {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) | 0;
    }

    return Math.abs(hash);
};

const getSurfaceVariant = (tile: Tile, faceUp: boolean): FaceVariant =>
    tile.state === 'matched' ? 'matched' : faceUp ? 'active' : 'hidden';

const createIceShaderPatch = (seed: number, layer: 'shell' | 'core') => (shader: {
    fragmentShader: string;
    uniforms: Record<string, { value: number }>;
}): void => {
    const roughnessBoost = layer === 'shell' ? 0.34 : 0.18;
    const frequency = layer === 'shell' ? 'vec2(26.0, 22.0)' : 'vec2(18.0, 16.0)';

    shader.uniforms.uIceSeed = { value: seed % 997 };
    shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
            uniform float uIceSeed;

            float iceHash(vec2 p) {
                vec2 q = p + vec2(uIceSeed * 0.0017, uIceSeed * 0.0023);
                return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453123);
            }

            void main() {
        `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <roughnessmap_fragment>',
        `
            #include <roughnessmap_fragment>
            float iceNoise = iceHash(vRoughnessMapUv * ${frequency});
            roughnessFactor = clamp(roughnessFactor + (iceNoise - 0.5) * ${roughnessBoost}, 0.0, 1.0);
        `
    );
};

const getMaterialConfigs = (surfaceVariant: FaceVariant, layer: 'shell' | 'core'): FaceMaterialConfig[] => {
    const shell = layer === 'shell';

    if (shell) {
        return [
            {
                attach: 'material-0',
                attenuationColor: surfaceVariant === 'matched' ? '#e7fff7' : '#daf4ff',
                attenuationDistance: 1.85,
                bumpScale: 0.09,
                clearcoat: 0.16,
                clearcoatRoughness: 0.84,
                color: surfaceVariant === 'matched' ? '#f5ffff' : surfaceVariant === 'active' ? '#edf9ff' : '#e8f7ff',
                depthWrite: false,
                displacementBias: -0.018,
                displacementScale: 0.058,
                emissive: surfaceVariant === 'matched' ? '#183f32' : '#12314d',
                emissiveIntensity: surfaceVariant === 'matched' ? 0.015 : 0.011,
                envMapIntensity: 0.24,
                face: 'right',
                ior: 1.31,
                metalness: 0,
                opacity: 1,
                roughness: 0.74,
                specularColor: surfaceVariant === 'matched' ? '#f8fffd' : '#ecf8ff',
                specularIntensity: 0.92,
                transmission: 0.9,
                transparent: true,
                thickness: 0.94,
                thicknessMap: true
            },
            {
                attach: 'material-1',
                attenuationColor: surfaceVariant === 'matched' ? '#e7fff7' : '#daf4ff',
                attenuationDistance: 1.92,
                bumpScale: 0.088,
                clearcoat: 0.14,
                clearcoatRoughness: 0.86,
                color: surfaceVariant === 'matched' ? '#f5ffff' : surfaceVariant === 'active' ? '#e9f6ff' : '#e2f1fc',
                depthWrite: false,
                displacementBias: -0.02,
                displacementScale: 0.054,
                emissive: surfaceVariant === 'matched' ? '#183f32' : '#12314d',
                emissiveIntensity: surfaceVariant === 'matched' ? 0.013 : 0.009,
                envMapIntensity: 0.22,
                face: 'left',
                ior: 1.31,
                metalness: 0,
                opacity: 1,
                roughness: 0.78,
                specularColor: surfaceVariant === 'matched' ? '#f8fffd' : '#ecf8ff',
                specularIntensity: 0.9,
                transmission: 0.91,
                transparent: true,
                thickness: 0.96,
                thicknessMap: true
            },
            {
                attach: 'material-2',
                attenuationColor: surfaceVariant === 'matched' ? '#e7fff7' : '#daf4ff',
                attenuationDistance: 1.88,
                bumpScale: 0.1,
                clearcoat: 0.18,
                clearcoatRoughness: 0.8,
                color: surfaceVariant === 'matched' ? '#f7ffff' : surfaceVariant === 'active' ? '#f0fbff' : '#e8f7ff',
                depthWrite: false,
                displacementBias: -0.016,
                displacementScale: 0.06,
                emissive: surfaceVariant === 'matched' ? '#184235' : '#132e48',
                emissiveIntensity: surfaceVariant === 'matched' ? 0.016 : 0.01,
                envMapIntensity: 0.28,
                face: 'top',
                ior: 1.31,
                metalness: 0,
                opacity: 1,
                roughness: 0.72,
                specularColor: surfaceVariant === 'matched' ? '#f9fffe' : '#eef9ff',
                specularIntensity: 0.95,
                transmission: 0.88,
                transparent: true,
                thickness: 1.02,
                thicknessMap: true
            },
            {
                attach: 'material-3',
                attenuationColor: surfaceVariant === 'matched' ? '#e7fff7' : '#daf4ff',
                attenuationDistance: 1.98,
                bumpScale: 0.08,
                clearcoat: 0.12,
                clearcoatRoughness: 0.9,
                color: surfaceVariant === 'matched' ? '#f3fff9' : surfaceVariant === 'active' ? '#ebf7ff' : '#e1effb',
                depthWrite: false,
                displacementBias: -0.018,
                displacementScale: 0.05,
                emissive: surfaceVariant === 'matched' ? '#183f32' : '#12314d',
                emissiveIntensity: surfaceVariant === 'matched' ? 0.012 : 0.007,
                envMapIntensity: 0.2,
                face: 'bottom',
                ior: 1.31,
                metalness: 0,
                opacity: 1,
                roughness: 0.8,
                specularColor: surfaceVariant === 'matched' ? '#f8fffd' : '#ecf8ff',
                specularIntensity: 0.88,
                transmission: 0.92,
                transparent: true,
                thickness: 0.88,
                thicknessMap: true
            },
            {
                attach: 'material-4',
                attenuationColor: surfaceVariant === 'matched' ? '#e7fff7' : '#daf4ff',
                attenuationDistance: 1.82,
                bumpScale: 0.1,
                clearcoat: 0.18,
                clearcoatRoughness: 0.8,
                color: surfaceVariant === 'matched' ? '#f8ffff' : surfaceVariant === 'active' ? '#effaff' : '#e7f6ff',
                depthWrite: false,
                displacementBias: -0.014,
                displacementScale: 0.06,
                emissive: surfaceVariant === 'matched' ? '#1b5e46' : '#163755',
                emissiveIntensity: surfaceVariant === 'matched' ? 0.018 : 0.011,
                envMapIntensity: 0.26,
                face: 'front',
                ior: 1.31,
                metalness: 0,
                opacity: 1,
                roughness: 0.7,
                specularColor: surfaceVariant === 'matched' ? '#fafffe' : '#eef9ff',
                specularIntensity: 1,
                transmission: 0.87,
                transparent: true,
                thickness: 1.08,
                thicknessMap: true
            },
            {
                attach: 'material-5',
                attenuationColor: surfaceVariant === 'matched' ? '#e7fff7' : '#daf4ff',
                attenuationDistance: 1.95,
                bumpScale: 0.084,
                clearcoat: 0.14,
                clearcoatRoughness: 0.86,
                color: surfaceVariant === 'matched' ? '#f4ffff' : surfaceVariant === 'active' ? '#eaf7ff' : '#e3f1fd',
                depthWrite: false,
                displacementBias: -0.016,
                displacementScale: 0.052,
                emissive: surfaceVariant === 'matched' ? '#183f32' : '#12314d',
                emissiveIntensity: surfaceVariant === 'matched' ? 0.012 : 0.007,
                envMapIntensity: 0.22,
                face: 'back',
                ior: 1.31,
                metalness: 0,
                opacity: 1,
                roughness: 0.76,
                specularColor: surfaceVariant === 'matched' ? '#f8fffd' : '#ecf8ff',
                specularIntensity: 0.9,
                transmission: 0.9,
                transparent: true,
                thickness: 0.94,
                thicknessMap: true
            }
        ];
    }

    return [
        {
            attach: 'material-0',
            bumpScale: 0.06,
            clearcoat: 0.08,
            clearcoatRoughness: 0.92,
            color: surfaceVariant === 'matched' ? '#e8f8ff' : surfaceVariant === 'active' ? '#dfeffa' : '#d7e8f5',
            displacementBias: -0.01,
            displacementScale: 0.028,
            emissive: surfaceVariant === 'matched' ? '#16392f' : '#10213a',
            emissiveIntensity: surfaceVariant === 'matched' ? 0.012 : 0.008,
            envMapIntensity: 0.1,
            face: 'right',
            metalness: 0.02,
            roughness: 0.94,
            specularColor: surfaceVariant === 'matched' ? '#f5fffe' : '#edf9ff',
            specularIntensity: 0.68
        },
        {
            attach: 'material-1',
            bumpScale: 0.058,
            clearcoat: 0.08,
            clearcoatRoughness: 0.94,
            color: surfaceVariant === 'matched' ? '#ecfbff' : surfaceVariant === 'active' ? '#daecf8' : '#d2e4f0',
            displacementBias: -0.012,
            displacementScale: 0.026,
            emissive: surfaceVariant === 'matched' ? '#16392f' : '#10213a',
            emissiveIntensity: surfaceVariant === 'matched' ? 0.01 : 0.006,
            envMapIntensity: 0.09,
            face: 'left',
            metalness: 0.02,
            roughness: 0.96,
            specularColor: surfaceVariant === 'matched' ? '#f5fffe' : '#edf9ff',
            specularIntensity: 0.64
        },
        {
            attach: 'material-2',
            bumpScale: 0.064,
            clearcoat: 0.1,
            clearcoatRoughness: 0.88,
            color: surfaceVariant === 'matched' ? '#f2fff8' : surfaceVariant === 'active' ? '#e6f4ff' : '#d9e9f5',
            displacementBias: -0.008,
            displacementScale: 0.03,
            emissive: surfaceVariant === 'matched' ? '#163d33' : '#11243d',
            emissiveIntensity: surfaceVariant === 'matched' ? 0.014 : 0.008,
            envMapIntensity: 0.12,
            face: 'top',
            metalness: 0.02,
            roughness: 0.92,
            specularColor: surfaceVariant === 'matched' ? '#f7fffe' : '#edf9ff',
            specularIntensity: 0.7
        },
        {
            attach: 'material-3',
            bumpScale: 0.05,
            clearcoat: 0.06,
            clearcoatRoughness: 0.96,
            color: surfaceVariant === 'matched' ? '#e3f4ff' : surfaceVariant === 'active' ? '#d8e7f4' : '#cfdeeb',
            displacementBias: -0.014,
            displacementScale: 0.022,
            emissive: surfaceVariant === 'matched' ? '#16392f' : '#10213a',
            emissiveIntensity: surfaceVariant === 'matched' ? 0.008 : 0.005,
            envMapIntensity: 0.06,
            face: 'bottom',
            metalness: 0.015,
            roughness: 0.98,
            specularColor: surfaceVariant === 'matched' ? '#f5fffe' : '#edf9ff',
            specularIntensity: 0.56
        },
        {
            attach: 'material-4',
            bumpScale: 0.074,
            clearcoat: 0.1,
            clearcoatRoughness: 0.88,
            color: surfaceVariant === 'matched' ? '#f3fffc' : surfaceVariant === 'active' ? '#e9f6ff' : '#e0eef8',
            displacementBias: -0.01,
            displacementScale: 0.03,
            emissive: surfaceVariant === 'matched' ? '#1a5f48' : '#17365a',
            emissiveIntensity: surfaceVariant === 'matched' ? 0.018 : 0.012,
            envMapIntensity: 0.12,
            face: 'front',
            metalness: 0.02,
            roughness: 0.9,
            specularColor: surfaceVariant === 'matched' ? '#f8fffe' : '#edf9ff',
            specularIntensity: 0.76
        },
        {
            attach: 'material-5',
            bumpScale: 0.056,
            clearcoat: 0.08,
            clearcoatRoughness: 0.94,
            color: surfaceVariant === 'matched' ? '#e6f5ff' : surfaceVariant === 'active' ? '#dceaf5' : '#d3e3ef',
            displacementBias: -0.012,
            displacementScale: 0.024,
            emissive: surfaceVariant === 'matched' ? '#16392f' : '#10213a',
            emissiveIntensity: surfaceVariant === 'matched' ? 0.008 : 0.005,
            envMapIntensity: 0.08,
            face: 'back',
            metalness: 0.015,
            roughness: 0.96,
            specularColor: surfaceVariant === 'matched' ? '#f5fffe' : '#edf9ff',
            specularIntensity: 0.58
        }
    ];
};

const TileCube = ({
    compact,
    faceUp,
    index,
    reduceMotion,
    row,
    tile,
    totalColumns,
    totalRows
}: TileCubeProps) => {
    const groupRef = useRef<Group | null>(null);
    const seed = hashString(tile.id);
    const column = index % totalColumns;
    const baseX = (column - (totalColumns - 1) / 2) * TILE_SPACING;
    const baseY = ((totalRows - 1) / 2 - row) * TILE_SPACING;
    const isMatched = tile.state === 'matched';
    const targetRotation = faceUp ? 0 : Math.PI;
    const surfaceVariant = getSurfaceVariant(tile, faceUp);
    const shellFaceTextures = FACE_ORDER.reduce<Partial<Record<CubeFace, ReturnType<typeof getTileFaceTexture>>>>((textures, { face }) => {
        textures[face] = getTileFaceTexture(tile, face, surfaceVariant, 'shell');
        return textures;
    }, {});
    const shellRoughnessTextures = FACE_ORDER.reduce<Partial<Record<CubeFace, ReturnType<typeof getTileFaceRoughnessTexture>>>>((textures, { face }) => {
        textures[face] = getTileFaceRoughnessTexture(tile, face, surfaceVariant, 'shell');
        return textures;
    }, {});
    const coreFaceTextures = FACE_ORDER.reduce<Partial<Record<CubeFace, ReturnType<typeof getTileFaceTexture>>>>((textures, { face }) => {
        textures[face] = getTileFaceTexture(tile, face, surfaceVariant, 'core');
        return textures;
    }, {});
    const coreRoughnessTextures = FACE_ORDER.reduce<Partial<Record<CubeFace, ReturnType<typeof getTileFaceRoughnessTexture>>>>((textures, { face }) => {
        textures[face] = getTileFaceRoughnessTexture(tile, face, surfaceVariant, 'core');
        return textures;
    }, {});
    const shellMaterials = getMaterialConfigs(surfaceVariant, 'shell');
    const coreMaterials = getMaterialConfigs(surfaceVariant, 'core');
    const imperfectionX = (((seed % 19) - 9) * 0.0034) / (compact ? 1.25 : 1);
    const imperfectionY = ((((seed >> 3) % 19) - 9) * 0.0032) / (compact ? 1.25 : 1);
    const imperfectionRotationX = (((seed >> 5) % 11) - 5) * 0.0035;
    const imperfectionRotationZ = (((seed >> 7) % 11) - 5) * 0.0032;
    const baseScale = 0.975 + ((seed % 7) * 0.0035);
    const shellScale = SHELL_SCALE + ((seed % 5) * 0.004);
    const coreScale = CORE_SCALE + ((seed % 5) * 0.0025);

    useFrame((state, delta) => {
        const group = groupRef.current;

        if (!group) {
            return;
        }

        const time = state.clock.elapsedTime;
        const idleDrift = reduceMotion ? 0 : Math.sin(time * 0.08 + seed * 0.019) * (isMatched ? 0.00045 : 0.00028);
        const settle = reduceMotion ? 0 : Math.sin(time * 0.07 + seed * 0.011) * (isMatched ? 0.0007 : 0.00038);
        const targetLift = isMatched ? 0.016 : faceUp ? 0.005 : 0;
        const targetDepth = isMatched ? 0.04 : faceUp ? 0.012 : 0;
        const rotationDamp = reduceMotion ? 32 : isMatched ? 0.92 : 0.72;

        group.rotation.x = imperfectionRotationX;
        group.rotation.z = imperfectionRotationZ;
        group.rotation.y = reduceMotion ? targetRotation : MathUtils.damp(group.rotation.y, targetRotation, rotationDamp, delta);
        group.position.x = baseX + imperfectionX;
        group.position.y = baseY + imperfectionY + targetLift + idleDrift + settle;
        group.position.z = targetDepth;
        group.scale.x = group.scale.y = group.scale.z = baseScale;
    });

    return (
        <group ref={groupRef}>
            <mesh castShadow={false} receiveShadow={!compact && !reduceMotion} scale={[shellScale, shellScale, shellScale]}>
                <boxGeometry args={[1, 1, TILE_DEPTH * 1.08, 8, 8, 4]} />
                {shellMaterials.map((config) => {
                    const shaderSeed = hashString(`${tile.id}:shell:${config.face}:${surfaceVariant}`);

                    return (
                        <meshPhysicalMaterial
                            attach={config.attach}
                            attenuationColor={config.attenuationColor}
                            attenuationDistance={config.attenuationDistance}
                            bumpMap={shellRoughnessTextures[config.face] ?? undefined}
                            bumpScale={config.bumpScale}
                            clearcoat={config.clearcoat}
                            clearcoatRoughness={config.clearcoatRoughness}
                            color={config.color}
                            depthWrite={config.depthWrite}
                            displacementBias={config.displacementBias}
                            displacementMap={shellRoughnessTextures[config.face] ?? undefined}
                            displacementScale={config.displacementScale}
                            emissive={config.emissive}
                            emissiveIntensity={config.emissiveIntensity}
                            envMapIntensity={config.envMapIntensity}
                            key={`shell-${config.face}`}
                            ior={config.ior}
                            map={shellFaceTextures[config.face] ?? undefined}
                            metalness={config.metalness}
                            opacity={config.opacity}
                            onBeforeCompile={createIceShaderPatch(shaderSeed, 'shell')}
                            specularColor={config.specularColor}
                            specularIntensity={config.specularIntensity}
                            roughness={config.roughness}
                            roughnessMap={shellRoughnessTextures[config.face] ?? undefined}
                            side={FrontSide}
                            thickness={config.thickness}
                            thicknessMap={config.thicknessMap ? (shellRoughnessTextures[config.face] ?? undefined) : undefined}
                            transmission={config.transmission}
                            transparent={config.transparent}
                        />
                    );
                })}
            </mesh>

            <mesh castShadow={!compact && !reduceMotion} receiveShadow={!compact && !reduceMotion} scale={[coreScale, coreScale, coreScale]}>
                <boxGeometry args={[1, 1, TILE_DEPTH * 0.82, 6, 6, 3]} />
                {coreMaterials.map((config) => {
                    const shaderSeed = hashString(`${tile.id}:core:${config.face}:${surfaceVariant}`);

                    return (
                        <meshPhysicalMaterial
                            attach={config.attach}
                            bumpMap={coreRoughnessTextures[config.face] ?? undefined}
                            bumpScale={config.bumpScale}
                            clearcoat={config.clearcoat}
                            clearcoatRoughness={config.clearcoatRoughness}
                            color={config.color}
                            depthWrite={config.depthWrite}
                            displacementBias={config.displacementBias}
                            displacementMap={coreRoughnessTextures[config.face] ?? undefined}
                            displacementScale={config.displacementScale}
                            emissive={config.emissive}
                            emissiveIntensity={config.emissiveIntensity}
                            envMapIntensity={config.envMapIntensity}
                            key={`core-${config.face}`}
                            map={coreFaceTextures[config.face] ?? undefined}
                            metalness={config.metalness}
                            onBeforeCompile={createIceShaderPatch(shaderSeed, 'core')}
                            specularColor={config.specularColor}
                            specularIntensity={config.specularIntensity}
                            roughness={config.roughness}
                            roughnessMap={coreRoughnessTextures[config.face] ?? undefined}
                            side={FrontSide}
                        />
                    );
                })}
            </mesh>
        </group>
    );
};

const TileBoardScene = ({ board, compact, debugPeekActive, previewActive, reduceMotion }: TileBoardSceneProps) => {
    const { viewport } = useThree();
    const totalColumns = board.columns;
    const totalRows = board.rows;
    const boardWidth = (totalColumns - 1) * TILE_SPACING + 1;
    const boardHeight = (totalRows - 1) * TILE_SPACING + 1;
    const margin = compact ? 0.72 : 0.85;
    const fitScale = Math.min((viewport.width * margin) / boardWidth, (viewport.height * margin) / boardHeight);

    return (
        <>
            <ambientLight intensity={compact ? 1.04 : 1.12} color="#e8f3ff" />
            <directionalLight
                castShadow={!compact && !reduceMotion}
                color="#dff0ff"
                intensity={compact ? 0.9 : 1.14}
                position={[5.5, 7.5, 9]}
            />
            <directionalLight color="#9bc7ff" intensity={compact ? 0.24 : 0.34} position={[-6, 2, 7]} />
            <pointLight color="#f3fbff" intensity={compact ? 0.16 : 0.24} position={[0, 0, 7]} />

            <mesh position={[0, 0, -1.68]} receiveShadow={!compact && !reduceMotion}>
                <planeGeometry args={[boardWidth * 2, boardHeight * 2]} />
                <meshStandardMaterial color="#08111b" metalness={0.02} roughness={1} />
            </mesh>

            <group rotation={[-0.1, 0.08, 0]} scale={[fitScale, fitScale, fitScale]}>
                {board.tiles.map((tile, index) => {
                    const row = Math.floor(index / totalColumns);
                    const faceUp = tile.state !== 'hidden' || previewActive || debugPeekActive;

                    return (
                        <TileCube
                            compact={compact}
                            faceUp={faceUp}
                            index={index}
                            key={tile.id}
                            reduceMotion={reduceMotion}
                            row={row}
                            tile={tile}
                            totalColumns={totalColumns}
                            totalRows={totalRows}
                        />
                    );
                })}
            </group>
        </>
    );
};

export default TileBoardScene;
