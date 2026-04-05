import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { formatNextUtcReset } from '../../shared/utc-countdown';
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

    useEffect(() => {
        const id = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <section aria-label="Choose Your Path" className={metaStyles.shell} role="region">
            <header className={metaStyles.header}>
                <div className={metaStyles.headerText}>
                    <Eyebrow tone="menu">Start a run</Eyebrow>
                    <ScreenTitle as="h1" role="display">
                        Choose Your Path
                    </ScreenTitle>
                    <p className={metaStyles.subtitle}>
                        Classic Run uses the standard descent. Daily Challenge uses the rotating UTC seed. Endless Mode is
                        still in design.
                    </p>
                </div>
                <UiButton size="md" variant="secondary" onClick={closeSubscreen} type="button">
                    Back
                </UiButton>
            </header>

            <div className={metaStyles.body}>
                <div className={styles.cardGrid}>
                    <button
                        className={`${styles.card} ${styles.cardClassic}`}
                        onClick={startRun}
                        type="button"
                    >
                        <span className={styles.cardTitle}>Classic Run</span>
                        <p className={styles.cardBody}>Procedural floors, relic milestones, and escalating pair counts.</p>
                        <div className={styles.cardFooter}>
                            Best score: {bestScore > 0 ? bestScore.toLocaleString() : 'Unranked'}
                        </div>
                    </button>

                    <button
                        className={`${styles.card} ${styles.cardDaily}`}
                        onClick={startDailyRun}
                        type="button"
                    >
                        <span className={styles.badge}>Featured</span>
                        <span className={styles.cardTitle}>Daily Challenge</span>
                        <p className={styles.cardBody}>Shared daily mutators and seed. Resets at UTC midnight.</p>
                        <div className={styles.cardFooter}>Next rotation in {dailyCountdown}</div>
                    </button>

                    <button
                        aria-disabled="true"
                        className={`${styles.card} ${styles.cardEndless} ${styles.cardDisabled}`}
                        disabled
                        type="button"
                    >
                        <span className={`${styles.badge} ${styles.lockedBadge}`}>Locked</span>
                        <span className={styles.cardTitle}>Endless Mode</span>
                        <p className={styles.cardBody}>
                            Future ruleset for ultra-long descents. Not playable yet—no start action is wired.
                        </p>
                        <div className={styles.cardFooter}>Best floor: —</div>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ChooseYourPathScreen;
