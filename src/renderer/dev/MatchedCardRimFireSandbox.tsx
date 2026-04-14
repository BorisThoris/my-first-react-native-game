import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { PlaneGeometry, ShaderMaterial } from 'three';
import { createMatchedCardRimFireMaterial } from '../components/matchedCardRimFireMaterial';
import { getResolvingRoundedRectRingGeometry } from '../components/tileBoardRimGeometry';
import { CARD_PLANE_HEIGHT, CARD_PLANE_WIDTH } from '../components/tileShatter';
import styles from './MatchedCardRimFireSandbox.module.css';

const CARD_GEOMETRY = new PlaneGeometry(CARD_PLANE_WIDTH, CARD_PLANE_HEIGHT);
const RIM_GEOMETRY = getResolvingRoundedRectRingGeometry();

interface RimFireSceneProps {
    intensity: number;
    reduceMotion: boolean;
    seed: number;
}

const RimFireScene = ({ intensity, reduceMotion, seed }: RimFireSceneProps): ReactElement => {
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
        const u = m.uniforms;
        u.uTime.value = state.clock.elapsedTime;
        u.uIntensity.value = intensity;
        u.uReduceMotion.value = reduceMotion ? 1 : 0;
        u.uSeed.value = (seed % 1000) * 0.001;
    });

    return (
        <group>
            <mesh geometry={CARD_GEOMETRY} position={[0, 0, -0.001]}>
                <meshBasicMaterial color="#1e1e2a" />
            </mesh>
            <mesh geometry={RIM_GEOMETRY} position={[0, 0, 0.024]} renderOrder={2}>
                <primitive ref={matRef} object={material} attach="material" />
            </mesh>
        </group>
    );
};

/**
 * DEV-only isolated view for tuning `matchedCardRimFireMaterial` (rounded-rect rim + noise).
 * Open: `/?devSandbox=1&fx=matchedRimFire`
 */
const MatchedCardRimFireSandbox = (): ReactElement => {
    const [intensity, setIntensity] = useState(0.55);
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
            aria-label="Matched card rim fire shader sandbox"
        >
            <div className={styles.canvasWrap}>
                <Canvas
                    camera={{ position: [0, 0, 2.35], fov: 42, near: 0.1, far: 40 }}
                    dpr={[1, 2]}
                    gl={{ alpha: false, antialias: true, preserveDrawingBuffer: true }}
                >
                    <color attach="background" args={['#0b0b10']} />
                    <RimFireScene intensity={intensity} reduceMotion={reduceMotion} seed={seed} />
                </Canvas>
            </div>
            <aside className={styles.panel} data-testid="rim-fire-sandbox-controls">
                <h1>Matched rim fire (shader)</h1>
                <label>
                    Intensity
                    <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.01}
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                    />
                    <span>{intensity.toFixed(2)}</span>
                </label>
                <label>
                    Seed (rebuilds material)
                    <input
                        type="range"
                        min={0}
                        max={999}
                        step={1}
                        value={seed}
                        onChange={(e) => setSeed(Number(e.target.value))}
                    />
                    <span>{seed}</span>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={reduceMotion}
                        onChange={(e) => setReduceMotion(e.target.checked)}
                    />{' '}
                    Reduce motion (shader slows / dampens)
                </label>
                <p className={styles.hint}>
                    In-game, this pass is hidden on <strong>low</strong> graphics; use this page to tune medium/high.
                    Screenshot: <span className={styles.code}>yarn capture:matched-flame</span> →{' '}
                    <span className={styles.code}>test-results/matched-flame-capture/</span>
                </p>
                <p className={styles.hint}>
                    URL: <span className={styles.code}>{urlLine}</span>
                </p>
            </aside>
        </div>
    );
};

export default MatchedCardRimFireSandbox;
