import { useShallow } from 'zustand/react/shallow';
import { ACHIEVEMENT_BY_ID } from '../../shared/achievements';
import type { RelicId } from '../../shared/contracts';
import {
    eligibleHonorUnlockIds,
    HONOR_UNLOCK_CATALOG,
    HONOR_UNLOCK_ORDER
} from '../../shared/honorUnlocks';
import { RELIC_CATALOG } from '../../shared/game-catalog';
import { ACHIEVEMENT_IDS } from '../../shared/save-data';
import { CALLSIGN_SYMBOLS, LETTER_SYMBOLS as LETTER_TILES, NUMBER_SYMBOLS } from '../../shared/tile-symbol-catalog';
import { Eyebrow, MetaFrame, Panel, ScreenTitle, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import metaStyles from './MetaScreen.module.css';
import styles from './CollectionScreen.module.css';

const CollectionScreen = () => {
    const { closeSubscreen, saveData } = useAppStore(
        useShallow((state) => ({
            closeSubscreen: state.closeSubscreen,
            saveData: state.saveData
        }))
    );
    const ps = saveData.playerStats;
    const summary = saveData.lastRunSummary;
    const honorEarned = new Set(eligibleHonorUnlockIds(saveData));

    return (
        <section aria-label="Collection" className={`${metaStyles.shell} ${metaStyles.shellMetaStage}`} role="region">
            <header className={metaStyles.header}>
                <div className={metaStyles.headerText}>
                    <Eyebrow tone="menu">Archive</Eyebrow>
                    <ScreenTitle as="h1" role="display">
                        Collection
                    </ScreenTitle>
                    <p className={metaStyles.subtitle}>
                        Read-only progress from your save: achievements, relic picks, bests, dailies, and the symbol sets
                        used on the board.
                    </p>
                </div>
                <UiButton size="md" variant="secondary" onClick={closeSubscreen} type="button">
                    Back
                </UiButton>
            </header>

            <div className={metaStyles.body}>
                <nav aria-label="Collection sections" className={metaStyles.inPageToc}>
                    <a href="#collection-achievements">Achievements</a>
                    <a href="#collection-honors">Honors</a>
                    <a href="#collection-relics">Relics</a>
                    <a href="#collection-bests">Bests</a>
                    <a href="#collection-daily">Daily</a>
                    <a href="#collection-symbols">Symbols</a>
                </nav>
                <MetaFrame data-testid="collection-meta-frame-achievements">
                    <Panel padding="lg" variant="strong">
                        <div className={`${styles.section} ${metaStyles.sectionAnchor}`} id="collection-achievements">
                            <h2 className={styles.sectionTitle}>Achievements</h2>
                            <div className={`${styles.grid} ${metaStyles.metaLongList}`}>
                                {ACHIEVEMENT_IDS.map((id) => {
                                    const def = ACHIEVEMENT_BY_ID[id];
                                    const unlocked = saveData.achievements[id];
                                    return (
                                        <div
                                            className={`${styles.achievementCard} ${unlocked ? styles.achievementUnlocked : styles.achievementLocked}`}
                                            key={id}
                                        >
                                            <strong>{def.title}</strong>
                                            <p className={metaStyles.subtitle}>{def.description}</p>
                                            <span className={styles.symbolMeta}>{unlocked ? 'Unlocked' : 'Locked'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Panel>
                </MetaFrame>

                <MetaFrame data-testid="collection-meta-frame-honors">
                    <Panel padding="lg" variant="default">
                        <div className={`${styles.section} ${metaStyles.sectionAnchor}`} id="collection-honors">
                            <h2 className={styles.sectionTitle}>Honors</h2>
                            <p className={metaStyles.subtitle}>
                                Local archive titles — no Steam slot required. Earned from dailies, no-powers floors,
                                score, relic picks, and gauntlet clears.
                            </p>
                            <div className={`${styles.grid} ${metaStyles.metaLongList}`}>
                                {HONOR_UNLOCK_ORDER.map((id) => {
                                    const def = HONOR_UNLOCK_CATALOG[id];
                                    const unlocked = honorEarned.has(id);
                                    return (
                                        <div
                                            className={`${styles.achievementCard} ${unlocked ? styles.achievementUnlocked : styles.achievementLocked}`}
                                            key={id}
                                        >
                                            <strong>{def.title}</strong>
                                            <p className={metaStyles.subtitle}>{def.description}</p>
                                            <span className={styles.symbolMeta}>{unlocked ? 'Earned' : 'Locked'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Panel>
                </MetaFrame>

                <MetaFrame data-testid="collection-meta-frame-relics">
                    <Panel padding="lg" variant="default">
                        <div className={`${styles.section} ${metaStyles.sectionAnchor}`} id="collection-relics">
                            <h2 className={styles.sectionTitle}>Relic catalog</h2>
                            <p className={metaStyles.subtitle}>
                                Tier tint reflects how often each relic has been picked across runs (cosmetic only).
                            </p>
                            <div className={`${styles.grid} ${metaStyles.metaLongList}`}>
                                {(Object.keys(RELIC_CATALOG) as RelicId[]).map((id) => {
                                    const def = RELIC_CATALOG[id];
                                    const picks = ps?.relicPickCounts[id] ?? 0;
                                    const tierClass =
                                        picks >= 3 ? styles.relicTierForged : picks >= 1 ? styles.relicTierKnown : styles.relicTierLatent;
                                    return (
                                        <div className={`${styles.achievementCard} ${tierClass}`} key={id}>
                                            <strong>{def.title}</strong>
                                            <p className={metaStyles.subtitle}>{def.description}</p>
                                            <span className={styles.symbolMeta}>Times picked: {picks}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Panel>
                </MetaFrame>

                <Panel padding="lg" variant="default">
                    <div className={`${styles.section} ${metaStyles.sectionAnchor}`} id="collection-bests">
                        <h2 className={styles.sectionTitle}>Bests and last run</h2>
                        <div className={styles.statRow}>
                            <span>
                                Best score<strong>{saveData.bestScore > 0 ? saveData.bestScore.toLocaleString() : '—'}</strong>
                            </span>
                            <span>
                                Best no-powers floor<strong>{ps?.bestFloorNoPowers ?? 0}</strong>
                            </span>
                        </div>
                        {summary ? (
                            <p className={metaStyles.subtitle}>
                                Last run: {summary.totalScore.toLocaleString()} pts · Floor {summary.highestLevel} ·{' '}
                                {summary.levelsCleared} clears · Streak {summary.bestStreak}
                            </p>
                        ) : (
                            <p className={metaStyles.subtitle}>No completed run summary stored yet.</p>
                        )}
                    </div>
                </Panel>

                <Panel padding="lg" variant="default">
                    <div className={`${styles.section} ${metaStyles.sectionAnchor}`} id="collection-daily">
                        <h2 className={styles.sectionTitle}>Daily stats</h2>
                        <div className={styles.statRow}>
                            <span>
                                Dailies cleared<strong>{ps?.dailiesCompleted ?? 0}</strong>
                            </span>
                            <span>
                                Streak (cosmetic)<strong>{ps?.dailyStreakCosmetic ?? 0}</strong>
                            </span>
                        </div>
                    </div>
                </Panel>

                <Panel padding="lg" variant="default">
                    <div className={`${styles.section} ${metaStyles.sectionAnchor}`} id="collection-symbols">
                        <h2 className={styles.sectionTitle}>Symbol gallery</h2>
                        <p className={metaStyles.subtitle}>
                            Tiles rotate through these sets by floor band. Letter-only mutator uses the hybrid letter band.
                        </p>
                        <p className={styles.setLabel}>Band A — letters + digits</p>
                        <div className={styles.symbolGrid}>
                            {LETTER_TILES.map((entry) => (
                                <div className={styles.symbolChip} key={entry.symbol}>
                                    {entry.symbol}
                                    <span className={styles.symbolMeta}>{entry.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className={styles.setLabel}>Band B — two-digit numbers</p>
                        <div className={styles.symbolGrid}>
                            {NUMBER_SYMBOLS.slice(0, 18).map((entry) => (
                                <div className={styles.symbolChip} key={entry.symbol}>
                                    {entry.symbol}
                                </div>
                            ))}
                            <span className={styles.symbolMeta}>…and {NUMBER_SYMBOLS.length - 18} more</span>
                        </div>
                        <p className={styles.setLabel}>Band C — callsigns</p>
                        <div className={styles.symbolGrid}>
                            {CALLSIGN_SYMBOLS.slice(0, 16).map((entry) => (
                                <div className={styles.symbolChip} key={entry.symbol}>
                                    {entry.symbol}
                                    <span className={styles.symbolMeta}>{entry.label}</span>
                                </div>
                            ))}
                            <span className={styles.symbolMeta}>…and {CALLSIGN_SYMBOLS.length - 16} more</span>
                        </div>
                    </div>
                </Panel>
            </div>
        </section>
    );
};

export default CollectionScreen;
