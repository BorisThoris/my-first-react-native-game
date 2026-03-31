import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type MutableRefObject,
    type PointerEvent as ReactPointerEvent,
    type RefObject
} from 'react';
import {
    AdditiveBlending,
    Color,
    DoubleSide,
    MathUtils,
    type BufferAttribute,
    type BufferGeometry,
    type Group,
    type PointLight
} from 'three';
import relicSvgUrl from '../../../VECFINAL.svg?url';
import type { TiltVector } from '../platformTilt/platformTiltTypes';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { RENDERER_THEME } from '../styles/theme';
import {
    createSeededRandom,
    getIntroEnterDurationMs,
    getIntroExitDurationMs,
    resolveIntroVariant,
    type IntroPreset
} from './startupIntroConfig';
import { hasWebGLSupport, loadRelicTextures, type RelicTextureSet } from './startupIntroTextures';
import styles from './StartupIntro.module.css';

interface StartupIntroProps {
    onComplete: () => void;
    reduceMotion: boolean;
}

type IntroRenderMode = 'loading' | 'three' | 'fallback';
type IntroPhase = 'enter' | 'idle' | 'exit';

interface ParticleDefinition {
    baseX: number;
    baseY: number;
    color: Color;
    drift: number;
    phase: number;
    speed: number;
    z: number;
}

interface IntroFootprint {
    height: number;
    width: number;
}

interface SurfaceProfile {
    backColor: string;
    frontColor: string;
    glowColor: string;
    glowOpacity: number;
    highlightColor: string;
}

const { colors } = RENDERER_THEME;
const RELIC_FILL_WIDTH_RATIO = 0.92;
const RELIC_FILL_HEIGHT_RATIO = 0.88;

const toHex = (color: Color): string => `#${color.getHexString()}`;

const getPresetPalette = (preset: IntroPreset): { accent: string; glow: string; halo: string; highlight: string } => {
    switch (preset) {
        case 'ember-fire':
            return {
                accent: colors.emberSoft,
                glow: colors.ember,
                halo: colors.emberSoft,
                highlight: colors.goldBright
            };
        case 'molten-liquify':
            return {
                accent: colors.goldBright,
                glow: colors.amber,
                halo: colors.gold,
                highlight: colors.rune
            };
        case 'arcane-pulse':
            return {
                accent: colors.cyanBright,
                glow: colors.cyan,
                halo: colors.cyanBright,
                highlight: colors.text
            };
        case 'royal-sheen':
        default:
            return {
                accent: colors.goldBright,
                glow: colors.rune,
                halo: colors.gold,
                highlight: colors.text
            };
    }
};

const buildParticleDefinitions = (preset: IntroPreset, sessionSeed: number, reduceMotion: boolean): ParticleDefinition[] => {
    const random = createSeededRandom(sessionSeed ^ 0x9e3779b9);
    const count = reduceMotion ? 10 : preset === 'ember-fire' ? 24 : 18;
    const warm = new Color(colors.goldBright);
    const ember = new Color(colors.emberSoft);
    const cool = new Color(colors.cyanBright);

    return Array.from({ length: count }, (_unused, index) => {
        const x = MathUtils.lerp(-3.8, 3.8, random());
        const y = random() * 6.2;
        const z = MathUtils.lerp(-1.6, 1.15, random());
        const speed = MathUtils.lerp(0.18, preset === 'ember-fire' ? 0.92 : 0.54, random());
        const drift = MathUtils.lerp(0.04, 0.22, random());
        const phase = random() * Math.PI * 2;
        const paletteBucket = (index + Math.round(random() * 5)) % 6;

        return {
            baseX: x,
            baseY: y,
            color:
                preset === 'arcane-pulse'
                    ? paletteBucket % 2 === 0
                        ? cool.clone()
                        : warm.clone()
                    : paletteBucket < 2
                      ? warm.clone()
                      : paletteBucket < 4
                        ? ember.clone()
                        : cool.clone(),
            drift,
            phase,
            speed,
            z
        };
    });
};

const getSurfaceProfile = (preset: IntroPreset, palette: ReturnType<typeof getPresetPalette>): SurfaceProfile => {
    switch (preset) {
        case 'ember-fire':
            return {
                backColor: '#6a3416',
                frontColor: '#ffe3a1',
                glowColor: palette.glow,
                glowOpacity: 0.26,
                highlightColor: '#fff0c5'
            };
        case 'molten-liquify':
            return {
                backColor: '#704d12',
                frontColor: '#ffe3b2',
                glowColor: palette.highlight,
                glowOpacity: 0.18,
                highlightColor: '#fff6d8'
            };
        case 'arcane-pulse':
            return {
                backColor: '#174050',
                frontColor: '#eefcff',
                glowColor: palette.glow,
                glowOpacity: 0.2,
                highlightColor: '#dffcff'
            };
        case 'royal-sheen':
        default:
            return {
                backColor: '#5f4311',
                frontColor: '#fff1c3',
                glowColor: palette.halo,
                glowOpacity: 0.16,
                highlightColor: '#fff8e1'
            };
    }
};

const useElementSize = <T extends HTMLElement>(): [RefObject<T | null>, IntroFootprint | null] => {
    const elementRef = useRef<T | null>(null);
    const [size, setSize] = useState<IntroFootprint | null>(null);

    useEffect(() => {
        const element = elementRef.current;

        if (!element) {
            return;
        }

        let frameId = 0;
        const updateSize = (): void => {
            frameId = 0;
            const nextRect = element.getBoundingClientRect();

            if (nextRect.width < 1 || nextRect.height < 1) {
                return;
            }

            setSize((previousSize) => {
                const nextSize = {
                    height: nextRect.height,
                    width: nextRect.width
                };

                if (
                    previousSize &&
                    Math.abs(previousSize.width - nextSize.width) < 0.5 &&
                    Math.abs(previousSize.height - nextSize.height) < 0.5
                ) {
                    return previousSize;
                }

                return nextSize;
            });
        };
        const scheduleUpdate = (): void => {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }

            frameId = window.requestAnimationFrame(updateSize);
        };
        const resizeObserver =
            typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => scheduleUpdate());

        resizeObserver?.observe(element);

        if (element.parentElement) {
            resizeObserver?.observe(element.parentElement);
        }

        scheduleUpdate();
        window.addEventListener('resize', scheduleUpdate);

        return () => {
            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }

            resizeObserver?.disconnect();
            window.removeEventListener('resize', scheduleUpdate);
        };
    }, []);

    return [elementRef, size];
};

const ParticleField = ({
    preset,
    reduceMotion,
    sessionSeed
}: {
    preset: IntroPreset;
    reduceMotion: boolean;
    sessionSeed: number;
}) => {
    const geometryRef = useRef<BufferGeometry | null>(null);
    const particles = useMemo(() => buildParticleDefinitions(preset, sessionSeed, reduceMotion), [preset, reduceMotion, sessionSeed]);
    const positions = useMemo(() => {
        const values = new Float32Array(particles.length * 3);

        particles.forEach((particle, index) => {
            const offset = index * 3;
            values[offset] = particle.baseX;
            values[offset + 1] = particle.baseY - 3.1;
            values[offset + 2] = particle.z;
        });

        return values;
    }, [particles]);
    const particleColors = useMemo(() => {
        const values = new Float32Array(particles.length * 3);

        particles.forEach((particle, index) => {
            const offset = index * 3;
            values[offset] = particle.color.r;
            values[offset + 1] = particle.color.g;
            values[offset + 2] = particle.color.b;
        });

        return values;
    }, [particles]);

    useFrame((state) => {
        const geometry = geometryRef.current;

        if (!geometry) {
            return;
        }

        const attribute = geometry.getAttribute('position') as BufferAttribute | undefined;

        if (!attribute) {
            return;
        }

        const array = attribute.array as Float32Array;
        const elapsed = state.clock.elapsedTime;

        particles.forEach((particle, index) => {
            const offset = index * 3;
            const rise = reduceMotion ? 0 : ((elapsed * particle.speed + particle.baseY) % 6.2) - 3.1;
            array[offset] = particle.baseX + Math.sin(elapsed * (0.45 + particle.drift) + particle.phase) * particle.drift;
            array[offset + 1] = reduceMotion ? particle.baseY - 3.1 : rise;
            array[offset + 2] = particle.z + Math.cos(elapsed * 0.42 + particle.phase) * (reduceMotion ? 0.015 : 0.065);
        });

        attribute.needsUpdate = true;
    });

    return (
        <points position={[0, 0.2, 0.35]}>
            <bufferGeometry ref={geometryRef}>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[particleColors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                blending={AdditiveBlending}
                depthWrite={false}
                opacity={preset === 'ember-fire' ? 0.82 : 0.58}
                size={preset === 'ember-fire' ? 0.095 : 0.075}
                sizeAttenuation={true}
                transparent={true}
                vertexColors={true}
            />
        </points>
    );
};

const RelicMedallion = ({
    fieldTiltRef,
    textureSet,
    preset,
    reduceMotion,
    sessionSeed,
    targetFootprint
}: {
    fieldTiltRef: MutableRefObject<TiltVector>;
    textureSet: RelicTextureSet;
    preset: IntroPreset;
    reduceMotion: boolean;
    sessionSeed: number;
    targetFootprint: IntroFootprint | null;
}) => {
    const motionRef = useRef<Group | null>(null);
    const artworkRef = useRef<Group | null>(null);
    const sheenLightRef = useRef<PointLight | null>(null);
    const { size, viewport } = useThree();
    const palette = useMemo(() => getPresetPalette(preset), [preset]);
    const surface = useMemo(() => getSurfaceProfile(preset, palette), [palette, preset]);
    const modelWidth = textureSet.aspectRatio;
    const modelHeight = 1;
    const stackCount = reduceMotion ? 3 : preset === 'royal-sheen' ? 4 : 5;
    const depthStep = reduceMotion ? 0.018 : 0.022;
    const fitScale = useMemo(() => {
        const targetWidthPx = Math.min(targetFootprint?.width ?? size.width * RELIC_FILL_WIDTH_RATIO, size.width) * RELIC_FILL_WIDTH_RATIO;
        const targetHeightPx = Math.min(targetFootprint?.height ?? size.height * RELIC_FILL_HEIGHT_RATIO, size.height) * RELIC_FILL_HEIGHT_RATIO;
        const targetWidthWorld = viewport.width * (targetWidthPx / size.width);
        const targetHeightWorld = viewport.height * (targetHeightPx / size.height);

        return Math.max(0.1, Math.min(targetWidthWorld / modelWidth, targetHeightWorld / modelHeight) * 0.985);
    }, [modelHeight, modelWidth, size.height, size.width, targetFootprint, viewport.height, viewport.width]);

    useFrame((state, delta) => {
        const motion = reduceMotion ? 0.24 : 1;
        const elapsed = state.clock.elapsedTime;
        const liquify = preset === 'molten-liquify' ? Math.sin(elapsed * 1.55 + sessionSeed * 0.0007) * 0.045 * motion : 0;
        const ft = fieldTiltRef.current;
        const fieldRotX = reduceMotion ? 0 : -ft.y * 0.052 * motion;
        const fieldRotY = reduceMotion ? 0 : ft.x * 0.048 * motion;
        const fieldPosY = reduceMotion ? 0 : ft.x * 0.016 * motion;
        const fieldPosX = reduceMotion ? 0 : -ft.y * 0.014 * motion;

        if (motionRef.current) {
            motionRef.current.rotation.x = MathUtils.damp(
                motionRef.current.rotation.x,
                -0.18 + Math.sin(elapsed * 0.31 + sessionSeed * 0.0009) * 0.035 * motion + fieldRotX,
                3.4,
                delta
            );
            motionRef.current.rotation.y = MathUtils.damp(
                motionRef.current.rotation.y,
                Math.sin(elapsed * 0.27 + sessionSeed * 0.0012) * 0.15 * motion + fieldRotY,
                3.2,
                delta
            );
            motionRef.current.position.y = MathUtils.damp(
                motionRef.current.position.y,
                Math.sin(elapsed * 0.52 + sessionSeed * 0.0004) * 0.08 * motion + fieldPosY,
                2.9,
                delta
            );
            motionRef.current.position.x = MathUtils.damp(motionRef.current.position.x, fieldPosX, 3.2, delta);

            const baseScale = fitScale * (1 + Math.sin(elapsed * 0.22 + sessionSeed * 0.0006) * 0.014 * motion);
            const xScale = baseScale * (1 + liquify * 0.32);
            const yScale = baseScale * (1 - liquify * 0.18);
            const zScale = baseScale * (1 + Math.abs(liquify) * 0.62);

            motionRef.current.scale.x = MathUtils.damp(motionRef.current.scale.x, xScale, 3, delta);
            motionRef.current.scale.y = MathUtils.damp(motionRef.current.scale.y, yScale, 3, delta);
            motionRef.current.scale.z = MathUtils.damp(motionRef.current.scale.z, zScale, 3, delta);
        }

        if (artworkRef.current) {
            const targetRotationZ =
                preset === 'molten-liquify' ? Math.sin(elapsed * 1.35 + sessionSeed * 0.0008) * 0.05 * motion : 0;
            const targetPositionX =
                preset === 'molten-liquify' ? Math.sin(elapsed * 1.9 + sessionSeed * 0.0011) * 0.08 * motion : 0;

            artworkRef.current.rotation.z = MathUtils.damp(artworkRef.current.rotation.z, targetRotationZ, 3.6, delta);
            artworkRef.current.position.x = MathUtils.damp(artworkRef.current.position.x, targetPositionX, 3.4, delta);
        }

        if (sheenLightRef.current) {
            const sweepRange = Math.max(modelWidth, modelHeight) * fitScale * 0.36;
            const sweepSpeed = preset === 'royal-sheen' ? 1.55 : preset === 'ember-fire' ? 0.9 : 0.72;
            const intensity =
                preset === 'royal-sheen'
                    ? reduceMotion
                        ? 1.1
                        : 1.65
                    : preset === 'ember-fire'
                      ? 0.95
                      : preset === 'arcane-pulse'
                        ? 0.9
                        : 0.72;

            sheenLightRef.current.position.x = Math.sin(elapsed * sweepSpeed) * sweepRange;
            sheenLightRef.current.position.y = 0.18 + Math.cos(elapsed * (sweepSpeed * 0.82)) * 0.38;
            sheenLightRef.current.position.z = 3.9 + Math.sin(elapsed * 0.4) * 0.14;
            sheenLightRef.current.intensity = intensity;
        }
    });

    return (
        <group>
            <pointLight
                color={palette.highlight}
                decay={2}
                distance={14}
                intensity={preset === 'royal-sheen' ? 1.6 : 0.84}
                position={[0, 0.24, 3.9]}
                ref={sheenLightRef}
            />

            <group ref={motionRef}>
                <group ref={artworkRef}>
                    <mesh position={[0, 0, -depthStep * (stackCount + 2)]} renderOrder={2} scale={[1.035, 1.035, 1]}>
                        <planeGeometry args={[modelWidth, modelHeight, 144, 144]} />
                        <meshBasicMaterial
                            alphaMap={textureSet.alphaTexture}
                            blending={AdditiveBlending}
                            color={surface.glowColor}
                            opacity={surface.glowOpacity * (preset === 'ember-fire' ? 0.72 : 0.48)}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent={true}
                        />
                    </mesh>

                    {Array.from({ length: stackCount }, (_unused, index) => {
                        const tint = new Color(surface.backColor).lerp(
                            new Color(surface.frontColor),
                            (index + 1) / (stackCount * 1.35)
                        );

                        return (
                            <mesh key={`stack-${index}`} position={[0, 0, -depthStep * (stackCount - index)]} renderOrder={8 + index}>
                                <planeGeometry args={[modelWidth, modelHeight, 144, 144]} />
                                <meshPhysicalMaterial
                                    alphaMap={textureSet.alphaTexture}
                                    alphaTest={0.22}
                                    clearcoat={0.12}
                                    clearcoatRoughness={0.5}
                                    color={toHex(tint)}
                                    displacementMap={textureSet.heightTexture}
                                    displacementScale={0.016 + index * 0.003}
                                    emissive={surface.glowColor}
                                    emissiveIntensity={preset === 'ember-fire' ? 0.12 : 0.03}
                                    metalness={0.42}
                                    roughness={0.56}
                                    side={DoubleSide}
                                    transparent={true}
                                />
                            </mesh>
                        );
                    })}

                    <mesh position={[0, 0, 0.05]} renderOrder={48}>
                        <planeGeometry args={[modelWidth, modelHeight, 196, 196]} />
                        <meshPhysicalMaterial
                            alphaMap={textureSet.alphaTexture}
                            alphaTest={0.16}
                            clearcoat={preset === 'royal-sheen' ? 1 : 0.72}
                            clearcoatRoughness={preset === 'royal-sheen' ? 0.08 : 0.16}
                            color={surface.frontColor}
                            displacementMap={textureSet.heightTexture}
                            displacementScale={preset === 'molten-liquify' ? 0.08 : 0.06}
                            emissive={surface.glowColor}
                            emissiveIntensity={
                                preset === 'ember-fire' ? 0.28 : preset === 'arcane-pulse' ? 0.22 : 0.12
                            }
                            map={textureSet.colorTexture}
                            metalness={0.42}
                            roughness={preset === 'royal-sheen' ? 0.18 : 0.28}
                            sheen={preset === 'royal-sheen' ? 0.8 : preset === 'arcane-pulse' ? 0.22 : 0.08}
                            sheenColor={surface.highlightColor}
                            sheenRoughness={0.18}
                            side={DoubleSide}
                            transparent={true}
                        />
                    </mesh>

                    <mesh position={[0, 0, 0.12]} renderOrder={54} scale={[1.018, 1.018, 1]}>
                        <planeGeometry args={[modelWidth, modelHeight, 120, 120]} />
                        <meshBasicMaterial
                            alphaMap={textureSet.alphaTexture}
                            blending={AdditiveBlending}
                            color={surface.highlightColor}
                            opacity={preset === 'royal-sheen' ? 0.12 : 0.04}
                            side={DoubleSide}
                            toneMapped={false}
                            transparent={true}
                        />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

const RelicIntroScene = ({
    fieldTiltRef,
    textureSet,
    preset,
    reduceMotion,
    sessionSeed,
    targetFootprint
}: {
    fieldTiltRef: MutableRefObject<TiltVector>;
    textureSet: RelicTextureSet;
    preset: IntroPreset;
    reduceMotion: boolean;
    sessionSeed: number;
    targetFootprint: IntroFootprint | null;
}) => {
    const palette = getPresetPalette(preset);
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.75);

    return (
        <Canvas
            camera={{ fov: 26, near: 0.1, far: 40, position: [0, 0, 5.4] }}
            className={styles.canvas}
            dpr={dpr}
            gl={{
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            }}
        >
            <ambientLight color={colors.text} intensity={0.42} />
            <directionalLight color={palette.highlight} intensity={1.05} position={[3.4, 3.8, 6.4]} />
            <directionalLight color={palette.halo} intensity={preset === 'arcane-pulse' ? 0.66 : 0.26} position={[-3.4, 1.4, 5.3]} />
            <pointLight color={palette.glow} intensity={preset === 'ember-fire' ? 0.92 : 0.38} position={[0.24, -0.88, 4.3]} />
            <ParticleField preset={preset} reduceMotion={reduceMotion} sessionSeed={sessionSeed} />
            <RelicMedallion
                fieldTiltRef={fieldTiltRef}
                textureSet={textureSet}
                preset={preset}
                reduceMotion={reduceMotion}
                sessionSeed={sessionSeed}
                targetFootprint={targetFootprint}
            />
        </Canvas>
    );
};

const StartupIntro = ({ onComplete, reduceMotion }: StartupIntroProps) => {
    const [renderMode, setRenderMode] = useState<IntroRenderMode>(() => (hasWebGLSupport() ? 'loading' : 'fallback'));
    const [textureSet, setTextureSet] = useState<RelicTextureSet | null>(null);
    const [phase, setPhase] = useState<IntroPhase>('enter');
    const [variant] = useState(() => resolveIntroVariant({ reduceMotion }));
    const [sceneFrameRef, sceneFrameSize] = useElementSize<HTMLDivElement>();
    const overlayRef = useRef<HTMLElement | null>(null);
    const { tiltRef: introFieldTiltRef, permission, requestMotionPermission } = usePlatformTiltField({
        enabled: true,
        reduceMotion,
        surfaceRef: overlayRef,
        strength: 1
    });
    const [touchPrimary, setTouchPrimary] = useState(false);
    const completedRef = useRef(false);
    const exitStartedRef = useRef(false);
    const autoExitTimeoutRef = useRef<number | null>(null);
    const autoCompleteTimeoutRef = useRef<number | null>(null);
    const manualExitTimeoutRef = useRef<number | null>(null);
    const targetFootprint = sceneFrameSize;
    const enterDurationMs = getIntroEnterDurationMs(reduceMotion);
    const exitDurationMs = getIntroExitDurationMs(reduceMotion);
    const timingStyle = useMemo(
        () =>
            ({
                '--intro-enter-ms': `${enterDurationMs}ms`,
                '--intro-exit-ms': `${exitDurationMs}ms`
            }) as CSSProperties,
        [enterDurationMs, exitDurationMs]
    );
    const completeIntro = useCallback(() => {
        if (completedRef.current) {
            return;
        }

        completedRef.current = true;
        onComplete();
    }, [onComplete]);
    const beginExit = useCallback(() => {
        if (completedRef.current || exitStartedRef.current) {
            return;
        }

        exitStartedRef.current = true;
        if (autoExitTimeoutRef.current !== null) {
            window.clearTimeout(autoExitTimeoutRef.current);
            autoExitTimeoutRef.current = null;
        }
        if (autoCompleteTimeoutRef.current !== null) {
            window.clearTimeout(autoCompleteTimeoutRef.current);
            autoCompleteTimeoutRef.current = null;
        }
        if (manualExitTimeoutRef.current !== null) {
            window.clearTimeout(manualExitTimeoutRef.current);
        }
        setPhase('exit');
        manualExitTimeoutRef.current = window.setTimeout(() => {
            completeIntro();
        }, exitDurationMs);
    }, [completeIntro, exitDurationMs]);

    useEffect(() => {
        return () => {
            if (autoExitTimeoutRef.current !== null) {
                window.clearTimeout(autoExitTimeoutRef.current);
            }
            if (autoCompleteTimeoutRef.current !== null) {
                window.clearTimeout(autoCompleteTimeoutRef.current);
            }
            if (manualExitTimeoutRef.current !== null) {
                window.clearTimeout(manualExitTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        overlayRef.current?.focus({ preventScroll: true });
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mq = window.matchMedia('(pointer: coarse)');
        const sync = (): void => {
            setTouchPrimary(mq.matches);
        };

        sync();
        mq.addEventListener('change', sync);

        return () => {
            mq.removeEventListener('change', sync);
        };
    }, []);

    useEffect(() => {
        if (phase !== 'enter') {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setPhase('idle');
        }, enterDurationMs);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [enterDurationMs, phase]);

    useEffect(() => {
        const autoExitDelay = Math.max(0, variant.durationMs - exitDurationMs);
        autoExitTimeoutRef.current = window.setTimeout(() => {
            beginExit();
        }, autoExitDelay);
        autoCompleteTimeoutRef.current = window.setTimeout(() => {
            completeIntro();
        }, variant.durationMs);

        return () => {
            if (autoExitTimeoutRef.current !== null) {
                window.clearTimeout(autoExitTimeoutRef.current);
                autoExitTimeoutRef.current = null;
            }
            if (autoCompleteTimeoutRef.current !== null) {
                window.clearTimeout(autoCompleteTimeoutRef.current);
                autoCompleteTimeoutRef.current = null;
            }
        };
    }, [beginExit, completeIntro, exitDurationMs, variant.durationMs]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Enter' || event.key === 'Escape' || event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                beginExit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [beginExit]);

    useEffect(() => {
        if (renderMode === 'fallback') {
            return;
        }

        let cancelled = false;

        void loadRelicTextures(relicSvgUrl)
            .then((nextTextureSet) => {
                if (cancelled) {
                    nextTextureSet.dispose();
                    return;
                }

                setTextureSet(nextTextureSet);
                setRenderMode('three');
            })
            .catch(() => {
                if (!cancelled) {
                    setRenderMode('fallback');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [renderMode]);

    useEffect(
        () => () => {
            textureSet?.dispose();
        },
        [textureSet]
    );

    const handlePointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        beginExit();
    };

    const showIntroMotionCta = touchPrimary && !reduceMotion && (permission === 'prompt' || permission === 'denied');

    return (
        <section
            aria-label="Startup relic intro"
            aria-modal="true"
            className={styles.overlay}
            data-phase={phase}
            data-preset={variant.preset}
            data-render-mode={renderMode}
            onPointerDown={handlePointerDown}
            ref={overlayRef}
            role="dialog"
            style={timingStyle}
            tabIndex={-1}
        >
            <div aria-hidden="true" className={styles.chromaticVeil} />
            <div aria-hidden="true" className={styles.edgeNoise} />

            <div className={styles.stage}>
                <div className={styles.sceneFrame} ref={sceneFrameRef}>
                    {renderMode === 'three' && textureSet ? (
                        <div className={styles.canvasViewport}>
                            <RelicIntroScene
                                fieldTiltRef={introFieldTiltRef}
                                textureSet={textureSet}
                                preset={variant.preset}
                                reduceMotion={reduceMotion}
                                sessionSeed={variant.seed.sessionSeed}
                                targetFootprint={targetFootprint}
                            />
                        </div>
                    ) : (
                        <div className={styles.fallbackFrame}>
                            <div aria-hidden="true" className={styles.fallbackAura} />
                            <img alt="Obsidian relic sigil" className={styles.fallbackImage} src={relicSvgUrl} />
                        </div>
                    )}
                </div>
            </div>
            {showIntroMotionCta ? (
                <button
                    aria-label="Enable device motion for this intro"
                    className={styles.motionCta}
                    data-testid="intro-motion-cta"
                    onClick={(event) => {
                        event.stopPropagation();
                        void requestMotionPermission();
                    }}
                    onPointerDown={(event) => {
                        event.stopPropagation();
                    }}
                    type="button"
                >
                    Enable motion
                </button>
            ) : null}
        </section>
    );
};

export default StartupIntro;
