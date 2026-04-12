import { useEffect, useRef, useState } from 'react';
import { useFitShellZoom } from '../hooks/useFitShellZoom';
import { isNarrowShortLandscapeForMenuStack, isShortLandscapeViewport, VIEWPORT_MOBILE_MAX } from '../breakpoints';
import { useViewportSize } from '../hooks/useViewportSize';
import { useShallow } from 'zustand/react/shallow';
import { formatNextUtcReset } from '../../shared/utc-countdown';
import { MODE_CARD_ART } from '../assets/ui';
import { Eyebrow, ScreenTitle, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import metaStyles from './MetaScreen.module.css';
import styles from './ChooseYourPathScreen.module.css';

const ChooseYourPathScreen = () => {
    const { bestScore, closeSubscreen, startDailyRun, startRun } = useAppStore(
        useShallow((state) => ({
            bestScore: state.saveData.bestScore,
            closeSubscreen: state.closeSubscreen,
            startDailyRun: state.startDailyRun,
            startRun: state.startRun
        }))
    );
    const [nowMs, setNowMs] = useState(() => Date.now());
    const dailyCountdown = formatNextUtcReset(nowMs);
    const pathFitMeasureRef = useRef<HTMLDivElement | null>(null);
    const { height: vpH, width: vpW } = useViewportSize();
    const isPhoneViewport = vpW <= VIEWPORT_MOBILE_MAX;
    const isShortLandscapeShell = isShortLandscapeViewport(vpW, vpH);
    const pathFitPadding = vpW >= 1024 && vpH <= 760 ? 8 : 14;
    const pathTouchCompact = isPhoneViewport || isNarrowShortLandscapeForMenuStack(vpW, vpH);
    const { fitZoom: rawPathFitZoom } = useFitShellZoom({
        enabled: true,
        measureRef: pathFitMeasureRef,
        viewportWidth: vpW,
        viewportHeight: vpH,
        padding: pathFitPadding
    });
    const pathShellFitZoom = rawPathFitZoom;

    useEffect(() => {
        const id = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <section
            aria-label="Choose Your Path"
            className={`${metaStyles.shell} ${metaStyles.shellMetaStage} ${pathTouchCompact ? styles.compactPathShell : ''} ${isShortLandscapeShell ? styles.shortTouchLandscapeShell : ''}`.trim()}
            role="region"
        >
            <div className={styles.pathFitViewport}>
                <div ref={pathFitMeasureRef} className={styles.pathFitMeasureOuter}>
                    <div className={styles.pathFitZoomInner} style={{ zoom: pathShellFitZoom }}>
                        <div className={styles.pathFitStack}>
            <header className={`${metaStyles.header} ${styles.pathStackHeader}`}>
                <div className={metaStyles.headerText}>
                    <Eyebrow tone="menu">Start a run</Eyebrow>
                    <ScreenTitle as="h1" role="display">
                        Choose Your Path
                    </ScreenTitle>
                    <p className={`${metaStyles.subtitle} ${styles.pathSubtitle}`}>
                        Classic Run uses the standard descent. Daily Challenge uses the rotating UTC seed. Endless Mode is
                        still in design.
                    </p>
                </div>
                <UiButton size="md" variant="secondary" onClick={closeSubscreen} type="button">
                    Back
                </UiButton>
            </header>

            <div className={`${metaStyles.body} ${styles.pathBody}`}>
                <div className={styles.cardGrid}>
                    <button
                        className={`${styles.card} ${styles.cardClassic}`}
                        onClick={startRun}
                        type="button"
                    >
                        <span className={styles.cardPoster} aria-hidden="true">
                            <img alt="" src={MODE_CARD_ART.classic} />
                        </span>
                        <span className={styles.cardBodyWrap}>
                        <span className={styles.cardTitle}>Classic Run</span>
                        <p className={styles.cardBody}>Procedural floors, relic milestones, and escalating pair counts.</p>
                        <div className={styles.cardFooter}>
                            Best score: {bestScore > 0 ? bestScore.toLocaleString() : 'Unranked'}
                        </div>
                        </span>
                    </button>

                    <button
                        className={`${styles.card} ${styles.cardDaily}`}
                        onClick={startDailyRun}
                        type="button"
                    >
                        <span className={styles.cardPoster} aria-hidden="true">
                            <img alt="" src={MODE_CARD_ART.daily} />
                        </span>
                        <span className={styles.cardBodyWrap}>
                        <span className={styles.badge}>Featured</span>
                        <span className={styles.cardTitle}>Daily Challenge</span>
                        <p className={styles.cardBody}>Shared daily mutators and seed. Resets at UTC midnight.</p>
                        <div className={styles.cardFooter}>Next rotation in {dailyCountdown}</div>
                        </span>
                    </button>

                    <button
                        aria-disabled="true"
                        className={`${styles.card} ${styles.cardEndless} ${styles.cardDisabled}`}
                        data-testid="choose-path-low-cta"
                        disabled
                        type="button"
                    >
                        <span className={styles.cardPoster} aria-hidden="true">
                            <img alt="" src={MODE_CARD_ART.endless} />
                        </span>
                        <span className={styles.cardBodyWrap}>
                        <span className={`${styles.badge} ${styles.lockedBadge}`}>Locked</span>
                        <span className={styles.cardTitle}>Endless Mode</span>
                        <p className={styles.cardBody}>
                            Future ruleset for ultra-long descents. Not playable yet—no start action is wired.
                        </p>
                        <div className={styles.cardFooter}>Best floor: —</div>
                        </span>
                    </button>
                </div>
            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChooseYourPathScreen;
