import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { PlaneGeometry, type ShaderMaterial } from 'three';
import { createMatchedCardRimFireMaterial } from '../components/matchedCardRimFireMaterial';
import { GAMEPLAY_BOARD_VISUALS } from '../components/gameplayVisualConfig';
import { getMatchedRoundedRectRingGeometry } from '../components/tileBoardRimGeometry';
import { CARD_PLANE_HEIGHT, CARD_PLANE_WIDTH } from '../components/tileShatter';
import styles from './MatchedCardRimFireSandbox.module.css';

const CARD_GEOMETRY = new PlaneGeometry(CARD_PLANE_WIDTH, CARD_PLANE_HEIGHT);
const RIM_GEOMETRY = getMatchedRoundedRectRingGeometry();

type RimQuality = 'high' | 'medium';

interface RimFireSceneProps {
    burst: number;
    edgeWidth: number;
    intensity: number;
    quality: RimQuality;
    reduceMotion: boolean;
    seed: number;
}

const RimFireScene = ({
    burst,
    edgeWidth,
    intensity,
    quality,
    reduceMotion,
    seed
}: RimFireSceneProps): ReactElement => {
    const material = useMemo(() => createMatchedCardRimFireMaterial(seed), [seed]);
    const matRef = useRef<ShaderMaterial | null>(null);

    useEffect(() => {
        return () => {
            material.dispose();
        };
    }, [material]);

    useFrame((state) => {
        const m = matRef.current;
        if (!m?.uniforms) {
            return;
        }
        const tier = reduceMotion
            ? GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect.tiers.reduceMotion
            : GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect.tiers[quality];
        const band = GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect.band;
        const u = m.uniforms;
        u.uTime.value = state.clock.elapsedTime;
        u.uSeed.value = (seed % 1000) * 0.001;
        u.uBurst.value = burst;
        u.uMotion.value = tier.motion;
        u.uSoftness.value = band.softness;
        u.uInnerWidth.value = band.innerWidth * edgeWidth * tier.innerWidthMul;
        u.uOuterWidth.value = band.outerWidth * edgeWidth * tier.outerWidthMul;
        u.uEmberStrength.value = tier.emberStrength;
        u.uIntensity.value = intensity * (tier.baseIntensity + burst * tier.burstIntensity);
    });

    return (
        <group>
            <mesh geometry={CARD_GEOMETRY} position={[0, 0, -0.001]}>
                <meshBasicMaterial color="#16161f" />
            </mesh>
            <mesh geometry={RIM_GEOMETRY} position={[0, 0, 0.024]} renderOrder={2}>
                <primitive ref={matRef} object={material} attach="material" />
            </mesh>
        </group>
    );
};

const MatchedCardRimFireSandbox = (): ReactElement => {
    const [burst, setBurst] = useState(1);
    const [edgeWidth, setEdgeWidth] = useState(1);
    const [intensity, setIntensity] = useState(1);
    const [quality, setQuality] = useState<RimQuality>('high');
    const [seed, setSeed] = useState(42);
    const [reduceMotion, setReduceMotion] = useState(false);

    const urlLine =
        typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}?devSandbox=1&fx=matchedRimFire`
            : '?devSandbox=1&fx=matchedRimFire';

    return (
        <div
            className={styles.root}
            data-testid="matched-rim-fire-sandbox"
            role="application"
            aria-label="Matched card ember rim shader sandbox"
        >
            <div className={styles.canvasWrap}>
                <Canvas
                    camera={{ position: [0, 0, 2.35], fov: 42, near: 0.1, far: 40 }}
                    dpr={[1, 2]}
                    gl={{ alpha: false, antialias: true, preserveDrawingBuffer: true }}
                >
                    <color attach="background" args={['#0b0b10']} />
                    <RimFireScene
                        burst={burst}
                        edgeWidth={edgeWidth}
                        intensity={intensity}
                        quality={quality}
                        reduceMotion={reduceMotion}
                        seed={seed}
                    />
                </Canvas>
            </div>
            <aside className={styles.panel} data-testid="rim-fire-sandbox-controls">
                <h1>Matched ember rim</h1>
                <label>
                    Burst
                    <input
                        aria-label="Burst"
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={burst}
                        onChange={(e) => setBurst(Number(e.target.value))}
                    />
                    <span>{burst.toFixed(2)}</span>
                </label>
                <label>
                    Intensity
                    <input
                        aria-label="Intensity"
                        type="range"
                        min={0.6}
                        max={1.4}
                        step={0.01}
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                    />
                    <span>{intensity.toFixed(2)}</span>
                </label>
                <label>
                    Edge width
                    <input
                        aria-label="Edge width"
                        type="range"
                        min={0.8}
                        max={1.3}
                        step={0.01}
                        value={edgeWidth}
                        onChange={(e) => setEdgeWidth(Number(e.target.value))}
                    />
                    <span>{edgeWidth.toFixed(2)}</span>
                </label>
                <label>
                    Quality
                    <select
                        aria-label="Quality"
                        value={quality}
                        onChange={(e) => setQuality(e.target.value as RimQuality)}
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                    </select>
                </label>
                <label>
                    Seed (rebuilds material)
                    <input
                        aria-label="Seed"
                        type="range"
                        min={0}
                        max={999}
                        step={1}
                        value={seed}
                        onChange={(e) => setSeed(Number(e.target.value))}
                    />
                    <span>{seed}</span>
                </label>
                <label className={styles.checkbox}>
                    <input
                        aria-label="Reduce motion"
                        type="checkbox"
                        checked={reduceMotion}
                        onChange={(e) => setReduceMotion(e.target.checked)}
                    />
                    <span>Reduce motion</span>
                </label>
                <p className={styles.hint}>
                    Use burst near <strong>1.00</strong> for the match confirm and near <strong>0.00</strong> for the
                    settled matched state. Low graphics keeps the non-shader fallback in-game.
                </p>
                <p className={styles.hint}>
                    Screenshot: <span className={styles.code}>yarn capture:matched-flame</span> to refresh isolated and
                    in-game captures.
                </p>
                <p className={styles.hint}>
                    URL: <span className={styles.code}>{urlLine}</span>
                </p>
            </aside>
        </div>
    );
};

export default MatchedCardRimFireSandbox;
