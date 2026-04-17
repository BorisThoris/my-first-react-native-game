import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { drawProceduralIllustrationInCanvasOverlay } from '../cardFace/cardIllustrationDraw';
import { getCardFaceOverlayColors } from '../cardFace/cardFaceOverlayPalette';
import type { OverlayDrawTier } from '../cardFace/overlayDrawTier';
import { getStaticCardTexturePixelSize } from '../components/tileTextures';
import { ILLUSTRATION_REGRESSION_PAIR_KEYS } from './illustrationRegressionPairKeys';
import styles from './ProceduralIllustrationGallerySandbox.module.css';

const TIERS: OverlayDrawTier[] = ['minimal', 'standard', 'full'];

const TierCell = ({
    pairKey,
    tier
}: {
    pairKey: string;
    tier: OverlayDrawTier;
}): ReactElement => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return undefined;
        }
        const context = canvas.getContext('2d');
        if (!context) {
            return undefined;
        }
        const { height, width } = getStaticCardTexturePixelSize();
        canvas.width = width;
        canvas.height = height;
        const palette = getCardFaceOverlayColors('active');
        drawProceduralIllustrationInCanvasOverlay(context, canvas, pairKey, tier, palette, {
            matFeatherStrength: 0.92
        });
        return undefined;
    }, [pairKey, tier]);

    return (
        <div className={styles.cell}>
            <div className={styles.canvasWrap}>
                <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
            </div>
            <span className={styles.label}>{pairKey}</span>
        </div>
    );
};

const ProceduralIllustrationGallerySandbox = (): ReactElement => {
    const [tier, setTier] = useState<OverlayDrawTier>('full');
    const pairKeys = useMemo(() => [...ILLUSTRATION_REGRESSION_PAIR_KEYS], []);

    useEffect(() => {
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === '1') {
                setTier('minimal');
            } else if (event.key === '2') {
                setTier('standard');
            } else if (event.key === '3') {
                setTier('full');
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <div className={styles.shell} data-e2e-procedural-gallery>
            <header className={styles.header}>
                <h1 className={styles.title}>Procedural illustration gallery</h1>
                <p className={styles.hint}>
                    DEV-only sandbox. Regression pair keys from{' '}
                    <code>e2e/fixtures/tile-card-face-illustration-regression.json</code>; uses the same overlay draw path
                    as Playwright hashes.
                </p>
                <div className={styles.tiers} role="toolbar" aria-label="Overlay tier">
                    {TIERS.map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={styles.tierBtn}
                            data-active={t === tier ? 'true' : 'false'}
                            onClick={() => setTier(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className={styles.meta}>
                    Showing {pairKeys.length} illustrations · tier <strong>{tier}</strong> · keys <kbd>1</kbd> / <kbd>2</kbd> /{' '}
                    <kbd>3</kbd>
                </div>
            </header>
            <section className={styles.grid} aria-label={`Illustration thumbnails, ${tier} tier`}>
                {pairKeys.map((pairKey) => (
                    <TierCell key={`${tier}-${pairKey}`} pairKey={pairKey} tier={tier} />
                ))}
            </section>
        </div>
    );
};

export default ProceduralIllustrationGallerySandbox;
