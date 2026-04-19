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
    tier,
    footerLabel
}: {
    pairKey: string;
    tier: OverlayDrawTier;
    /** Defaults to `pairKey` under the canvas */
    footerLabel?: string;
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
            <span className={styles.label}>{footerLabel ?? pairKey}</span>
        </div>
    );
};

const ProceduralIllustrationGallerySandbox = (): ReactElement => {
    const [tier, setTier] = useState<OverlayDrawTier>('full');
    const [pairKeyFilter, setPairKeyFilter] = useState('');
    const [compareEnabled, setCompareEnabled] = useState(false);
    const [compareLeftTier, setCompareLeftTier] = useState<OverlayDrawTier>('minimal');
    const [compareRightTier, setCompareRightTier] = useState<OverlayDrawTier>('full');

    const pairKeys = useMemo(() => [...ILLUSTRATION_REGRESSION_PAIR_KEYS], []);
    const visiblePairKeys = useMemo(() => {
        const q = pairKeyFilter.trim().toLowerCase();
        if (!q) {
            return pairKeys;
        }
        return pairKeys.filter((k) => k.toLowerCase().includes(q));
    }, [pairKeys, pairKeyFilter]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent): void => {
            if (compareEnabled) {
                return;
            }
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
    }, [compareEnabled]);

    const sectionLabel = compareEnabled
        ? `Tier comparison, ${compareLeftTier} vs ${compareRightTier}`
        : `Illustration thumbnails, ${tier} tier`;

    return (
        <div className={styles.shell} data-e2e-procedural-gallery>
            <header className={styles.header}>
                <h1 className={styles.title}>Procedural illustration gallery</h1>
                <p className={styles.hint}>
                    DEV-only sandbox. Regression pair keys from{' '}
                    <code>e2e/fixtures/tile-card-face-illustration-regression.json</code>; uses the same overlay draw path
                    as Playwright hashes.
                </p>
                <div className={styles.compareToggleRow}>
                    <button
                        type="button"
                        className={styles.compareToggle}
                        aria-pressed={compareEnabled}
                        onClick={() => setCompareEnabled((v) => !v)}
                    >
                        Compare tiers
                    </button>
                </div>
                {compareEnabled ? (
                    <div className={styles.compareControls} role="group" aria-label="Tier columns for comparison">
                        <label className={styles.compareControl}>
                            <span className={styles.compareControlLabel}>Left column</span>
                            <select
                                className={styles.tierSelect}
                                value={compareLeftTier}
                                onChange={(e) => setCompareLeftTier(e.target.value as OverlayDrawTier)}
                                aria-label="Left comparison tier"
                            >
                                {TIERS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={styles.compareControl}>
                            <span className={styles.compareControlLabel}>Right column</span>
                            <select
                                className={styles.tierSelect}
                                value={compareRightTier}
                                onChange={(e) => setCompareRightTier(e.target.value as OverlayDrawTier)}
                                aria-label="Right comparison tier"
                            >
                                {TIERS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                ) : (
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
                )}
                <label className={styles.filterRow}>
                    <span className={styles.filterLabel}>Filter pair keys</span>
                    <input
                        type="search"
                        className={styles.filterInput}
                        value={pairKeyFilter}
                        onChange={(e) => setPairKeyFilter(e.target.value)}
                        placeholder="Substring (e.g. tarot, vault)"
                        aria-label="Filter pair keys by substring"
                    />
                </label>
                <div className={styles.meta}>
                    {compareEnabled ? (
                        <>
                            Showing {visiblePairKeys.length} of {pairKeys.length} pair keys ·{' '}
                            <strong>
                                {compareLeftTier}
                            </strong>{' '}
                            vs <strong>{compareRightTier}</strong>
                        </>
                    ) : (
                        <>
                            Showing {visiblePairKeys.length} of {pairKeys.length} illustrations · tier <strong>{tier}</strong>{' '}
                            · keys <kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd>
                        </>
                    )}
                </div>
            </header>
            <section
                className={compareEnabled ? styles.gridCompare : styles.grid}
                aria-label={sectionLabel}
            >
                {compareEnabled
                    ? visiblePairKeys.map((pairKey) => (
                          <div key={`compare-${pairKey}`} className={styles.compareBlock}>
                              <div className={styles.pairKeyHeader}>{pairKey}</div>
                              <div className={styles.compareColumns}>
                                  <div className={styles.compareColumn}>
                                      <TierCell
                                          pairKey={pairKey}
                                          tier={compareLeftTier}
                                          footerLabel={compareLeftTier}
                                      />
                                  </div>
                                  <div className={styles.compareColumn}>
                                      <TierCell
                                          pairKey={pairKey}
                                          tier={compareRightTier}
                                          footerLabel={compareRightTier}
                                      />
                                  </div>
                              </div>
                          </div>
                      ))
                    : visiblePairKeys.map((pairKey) => (
                          <TierCell key={`${tier}-${pairKey}`} pairKey={pairKey} tier={tier} />
                      ))}
            </section>
        </div>
    );
};

export default ProceduralIllustrationGallerySandbox;
