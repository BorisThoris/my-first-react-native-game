import { useRef, useState } from 'react';
import { ACHIEVEMENTS } from '../../shared/achievements';
import type { MutatorId, RelicId, RunState } from '../../shared/contracts';
import { serializeRunPayloadFromSummary } from '../../shared/run-export';
import { useShallow } from 'zustand/react/shallow';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { Eyebrow, ScreenTitle, StatTile, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import MainMenuBackground from './MainMenuBackground';
import styles from './GameOverScreen.module.css';

interface GameOverScreenProps {
    run: RunState;
}

const MUTATOR_LABELS: Record<MutatorId, string> = {
    glass_floor: 'Glass floor',
    sticky_fingers: 'Sticky fingers',
    score_parasite: 'Score parasite',
    category_letters: 'Category: letters',
    short_memorize: 'Short memorize',
    wide_recall: 'Wide recall',
    silhouette_twist: 'Silhouette twist',
    n_back_anchor: 'N-back anchor',
    distraction_channel: 'Distraction channel'
};

const RELIC_LABELS: Record<RelicId, string> = {
    extra_shuffle_charge: 'Extra shuffle charge',
    first_shuffle_free_per_floor: 'First shuffle free / floor',
    memorize_bonus_ms: 'Longer memorize',
    destroy_bank_plus_one: 'Destroy bank +1',
    combo_shard_plus_step: 'Combo shard head start'
};

const GameOverScreen = ({ run }: GameOverScreenProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const [copyHint, setCopyHint] = useState<string | null>(null);
    const { height, width } = useViewportSize();
    const { goToMenu, restartRun, settings } = useAppStore(
        useShallow((state) => ({
            goToMenu: state.goToMenu,
            restartRun: state.restartRun,
            settings: state.settings
        }))
    );
    const { tiltRef: fieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion: settings.reduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
    const summary = run.lastRunSummary;
    const isCompact = width <= 760 || height <= 760;

    if (!summary) {
        return null;
    }

    const unlockedAchievements = summary.unlockedAchievements
        .map((achievementId) => ACHIEVEMENTS.find((achievement) => achievement.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));

    const sharePayload = serializeRunPayloadFromSummary(summary);
    const flipCount = run.flipHistory?.length ?? 0;

    const buildNextRunHint = (): string | null => {
        const parts: string[] = [];
        if (summary.gameMode === 'daily' && summary.dailyDateKeyUtc) {
            parts.push(`Tomorrow’s daily will use a new seed (today was ${summary.dailyDateKeyUtc} UTC).`);
        }
        if (summary.activeMutators?.length) {
            const names = summary.activeMutators.map((m) => MUTATOR_LABELS[m] ?? m);
            parts.push(`Mutators this run: ${names.join(', ')}.`);
        }
        if (summary.relicIds?.length) {
            const names = summary.relicIds.map((r) => RELIC_LABELS[r] ?? r);
            parts.push(`Relics: ${names.join(', ')}.`);
        }
        return parts.length ? parts.join(' ') : null;
    };

    const nextRunHint = buildNextRunHint();

    const copyRunSeed = async (): Promise<void> => {
        if (!sharePayload) {
            setCopyHint('No seed payload for this run summary.');
            return;
        }
        try {
            await navigator.clipboard.writeText(sharePayload);
            setCopyHint('Copied run JSON to clipboard.');
        } catch {
            setCopyHint('Clipboard unavailable — select the text below manually.');
        }
    };

    return (
        <section className={styles.shell} ref={shellRef}>
            <MainMenuBackground
                fieldTiltRef={fieldTiltRef}
                height={height}
                reduceMotion={settings.reduceMotion}
                width={width}
            />
            <div className={styles.foreground}>
                <div className={styles.layout}>
                    <div className={styles.main}>
                        <div className={styles.lead}>
                            <Eyebrow>Run Complete</Eyebrow>
                            <ScreenTitle role="screenLg">Expedition Over</ScreenTitle>
                        </div>
                        <p className={styles.copy}>
                            You reached level {summary.highestLevel} and banked{' '}
                            {summary.totalScore.toLocaleString()} points.
                        </p>

                        {nextRunHint ? <p className={styles.hintLine}>{nextRunHint}</p> : null}

                        <div className={styles.shareBlock}>
                            <UiButton variant="secondary" onClick={() => void copyRunSeed()}>
                                Copy run seed (JSON)
                            </UiButton>
                            {copyHint ? <p className={styles.copyHint}>{copyHint}</p> : null}
                            {sharePayload ? (
                                <pre className={styles.sharePre} tabIndex={0}>
                                    {sharePayload}
                                </pre>
                            ) : (
                                <p className={styles.copyHint}>Seed export is unavailable for this legacy summary.</p>
                            )}
                            {flipCount > 0 ? (
                                <p className={styles.ghostLine}>Flips this run (local ghost): {flipCount}</p>
                            ) : null}
                            {run.flipHistory.length > 0 ? (
                                <details className={styles.ghostTimeline}>
                                    <summary>Flip timeline (newest last)</summary>
                                    <ol className={styles.ghostSteps}>
                                        {run.flipHistory.map((id, i) => (
                                            <li key={`${id}-${i}`}>
                                                <span className={styles.ghostStepIndex}>{i + 1}</span>
                                                <code>{id}</code>
                                            </li>
                                        ))}
                                    </ol>
                                </details>
                            ) : null}
                        </div>

                        <div className={styles.summaryGrid}>
                            <StatTile density="minimal" label="Total Score" value={summary.totalScore.toLocaleString()} />
                            <StatTile density="minimal" label="Highest Level" value={summary.highestLevel} />
                            <StatTile density="minimal" label="Best Streak" value={summary.bestStreak} />
                            <StatTile density="minimal" label="Perfect Floors" value={summary.perfectClears} />
                            {!isCompact && (
                                <>
                                    <StatTile density="minimal" label="Best Score" value={summary.bestScore.toLocaleString()} />
                                    <StatTile density="minimal" label="Floors Cleared" value={summary.levelsCleared} />
                                </>
                            )}
                        </div>

                        <p className={styles.note}>
                            {summary.achievementsEnabled
                                ? 'Achievements were enabled for this run.'
                                : 'Debug tools were used, so achievements were disabled for this run.'}
                        </p>

                        {unlockedAchievements.length > 0 && (
                            <div className={styles.achievementBlock}>
                                <ScreenTitle as="h2" className={styles.unlockedHeading} role="section">
                                    Unlocked
                                </ScreenTitle>
                                <ul className={styles.achievementList}>
                                    {unlockedAchievements.map((achievement) => (
                                        <li className={styles.achievementItem} key={achievement.id}>
                                            <strong>{achievement.title}</strong>
                                            <span>{achievement.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className={styles.actionRail} role="group" aria-label="Run summary actions">
                        <UiButton variant="primary" onClick={restartRun}>
                            Play Again
                        </UiButton>
                        <UiButton variant="secondary" onClick={goToMenu}>
                            Main Menu
                        </UiButton>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GameOverScreen;
