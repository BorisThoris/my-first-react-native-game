import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import { AdditiveBlending, DoubleSide, FrontSide, type Group, type Mesh } from 'three';
import { getNowMs, getTileShatterFrameState, TILE_DEPTH, type TileShatterEffectData } from './tileShatter';
import { RENDERER_THEME } from '../styles/theme';

interface TileShatterEffectProps {
    effect: TileShatterEffectData;
    onComplete: (tileId: string) => void;
}

const TileShatterEffect = ({ effect, onComplete }: TileShatterEffectProps) => {
    const { colors } = RENDERER_THEME;
    const groupRef = useRef<Group | null>(null);
    const pulseRefs = useRef<Array<Mesh | null>>([]);
    const pulseBloomRefs = useRef<Array<Mesh | null>>([]);
    const flashRef = useRef<Mesh | null>(null);
    const shellRef = useRef<Mesh | null>(null);
    const coreRef = useRef<Mesh | null>(null);
    const completedRef = useRef(false);

    useLayoutEffect(() => {
        completedRef.current = false;
        pulseRefs.current = [];
        pulseBloomRefs.current = [];
    }, [effect.startedAtMs, effect.tileId]);

    useFrame(() => {
        const frame = getTileShatterFrameState(effect, getNowMs());

        if (groupRef.current) {
            const group = groupRef.current;
            group.position.set(effect.position[0], effect.position[1], effect.position[2]);
            group.rotation.set(effect.rotation[0], effect.rotation[1], effect.rotation[2]);
            group.scale.set(frame.groupScale[0], frame.groupScale[1], frame.groupScale[2]);
        }

        frame.pulseStates.forEach((pulseState, index) => {
            const mesh = pulseRefs.current[index];
            const bloom = pulseBloomRefs.current[index];

            if (!mesh || !mesh.material || Array.isArray(mesh.material)) {
                return;
            }

            mesh.position.set(pulseState.position[0], pulseState.position[1], pulseState.position[2]);
            mesh.scale.setScalar(pulseState.scale);
            mesh.material.opacity = pulseState.opacity;

            if (bloom && bloom.material && !Array.isArray(bloom.material)) {
                bloom.position.set(pulseState.position[0], pulseState.position[1], pulseState.position[2] - 0.002);
                bloom.scale.setScalar(pulseState.scale * 0.74);
                bloom.material.opacity = pulseState.opacity * 0.32;
            }
        });

        if (flashRef.current) {
            const flashMesh = flashRef.current;
            flashMesh.scale.setScalar(frame.flashScale);

            if (flashMesh.material && !Array.isArray(flashMesh.material)) {
                flashMesh.material.opacity = frame.flashOpacity;
            }
        }

        if (coreRef.current) {
            const coreMesh = coreRef.current;

            if (coreMesh.material && !Array.isArray(coreMesh.material)) {
                coreMesh.material.opacity = frame.coreOpacity;
            }
        }

        if (shellRef.current) {
            const shellMesh = shellRef.current;

            if (shellMesh.material && !Array.isArray(shellMesh.material)) {
                shellMesh.material.opacity = frame.shellOpacity;
            }
        }

        if (frame.completed && !completedRef.current) {
            completedRef.current = true;
            onComplete(effect.tileId);
        }
    });

    const flashPosition: [number, number, number] = [
        effect.impactPoint[0] + effect.impactNormal[0] * 0.024,
        effect.impactPoint[1] + effect.impactNormal[1] * 0.024,
        effect.impactPoint[2] + effect.impactNormal[2] * 0.03
    ];

    return (
        <group ref={groupRef} position={effect.position} rotation={effect.rotation} scale={[effect.shellScale, effect.shellScale, effect.shellScale]}>
            {effect.mode === 'pulse' && (
                <>
                    <mesh castShadow={false} position={flashPosition} ref={flashRef} receiveShadow={false} renderOrder={3}>
                        <sphereGeometry args={[0.18, 18, 18]} />
                        <meshBasicMaterial
                            blending={AdditiveBlending}
                            color={effect.flashTint}
                            depthWrite={false}
                            opacity={0}
                            toneMapped={false}
                            transparent={true}
                        />
                    </mesh>

                    {effect.pulses.map((pulse, index) => (
                        <group key={`${effect.tileId}-pulse-${index}`}>
                            <mesh
                                castShadow={false}
                                position={pulse.offset}
                                receiveShadow={false}
                                ref={(mesh) => {
                                    pulseRefs.current[index] = mesh;
                                }}
                                renderOrder={2}
                                scale={[pulse.scaleFrom, pulse.scaleFrom, 1]}
                            >
                                <ringGeometry args={[0.24, 0.32, 52]} />
                                <meshBasicMaterial
                                    blending={AdditiveBlending}
                                    color={pulse.tint}
                                    depthWrite={false}
                                    opacity={0}
                                    toneMapped={false}
                                    transparent={true}
                                />
                            </mesh>

                            <mesh
                                castShadow={false}
                                position={pulse.offset}
                                receiveShadow={false}
                                ref={(mesh) => {
                                    pulseBloomRefs.current[index] = mesh;
                                }}
                                renderOrder={1}
                                scale={[pulse.scaleFrom * 0.74, pulse.scaleFrom * 0.74, 1]}
                            >
                                <circleGeometry args={[0.3, 40]} />
                                <meshBasicMaterial
                                    blending={AdditiveBlending}
                                    color={pulse.tint}
                                    depthWrite={false}
                                    opacity={0}
                                    side={DoubleSide}
                                    toneMapped={false}
                                    transparent={true}
                                />
                            </mesh>
                        </group>
                    ))}
                </>
            )}

            <mesh castShadow={false} receiveShadow={false} ref={shellRef} renderOrder={0}>
                <boxGeometry args={[0.74, 1.08, TILE_DEPTH * 1.08, 7, 9, 2]} />
                <meshPhysicalMaterial
                    clearcoat={0.58}
                    clearcoatRoughness={0.34}
                    color={effect.shellTint}
                    depthWrite={false}
                    emissive={colors.goldDeep}
                    emissiveIntensity={0.08}
                    metalness={0.52}
                    opacity={effect.coreOpacity}
                    roughness={0.42}
                    side={FrontSide}
                    specularColor={colors.goldBright}
                    specularIntensity={0.86}
                    transparent={true}
                />
            </mesh>

            <mesh
                castShadow={false}
                receiveShadow={false}
                ref={coreRef}
                renderOrder={1}
                scale={[effect.coreScale / effect.shellScale, effect.coreScale / effect.shellScale, effect.coreScale / effect.shellScale]}
            >
                <boxGeometry args={[0.69, 1, TILE_DEPTH * 0.7, 5, 7, 2]} />
                <meshPhysicalMaterial
                    clearcoat={0.42}
                    clearcoatRoughness={0.24}
                    color={effect.coreTint}
                    depthWrite={false}
                    emissive={colors.cyanDeep}
                    emissiveIntensity={0.09}
                    metalness={0.26}
                    opacity={effect.coreOpacity}
                    roughness={0.36}
                    side={FrontSide}
                    specularColor={colors.cyanBright}
                    specularIntensity={0.8}
                    transparent={true}
                />
            </mesh>
        </group>
    );
};

export default TileShatterEffect;
