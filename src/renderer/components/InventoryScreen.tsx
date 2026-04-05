import { useShallow } from 'zustand/react/shallow';
import { GAME_MODE_CODEX, MUTATOR_CATALOG, RELIC_CATALOG } from '../../shared/game-catalog';
import { Eyebrow, Panel, ScreenTitle, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import metaStyles from './MetaScreen.module.css';
import styles from './InventoryScreen.module.css';

const modeTitle = (gameMode: string): string =>
    GAME_MODE_CODEX.find((m) => m.id === gameMode)?.title ?? gameMode;

const InventoryScreen = () => {
    const { closeSubscreen, run } = useAppStore(
        useShallow((state) => ({
            closeSubscreen: state.closeSubscreen,
            run: state.run
        }))
    );

    if (!run) {
        return (
            <section aria-label="Inventory" className={metaStyles.shell} role="region">
                <header className={metaStyles.header}>
                    <div className={metaStyles.headerText}>
                        <Eyebrow tone="menu">Expedition</Eyebrow>
                        <ScreenTitle as="h1" role="display">
                            Inventory
                        </ScreenTitle>
                        <p className={metaStyles.subtitle}>No active expedition. Start a run from the main menu.</p>
                    </div>
                    <UiButton size="md" variant="secondary" onClick={closeSubscreen} type="button">
                        Back
                    </UiButton>
                </header>
            </section>
        );
    }

    const contract = run.activeContract;

    return (
        <section aria-label="Inventory" className={metaStyles.shell} role="region">
            <header className={metaStyles.header}>
                <div className={metaStyles.headerText}>
                    <Eyebrow tone="menu">Active run</Eyebrow>
                    <ScreenTitle as="h1" role="display">
                        Inventory
                    </ScreenTitle>
                    <p className={metaStyles.subtitle}>Read-only snapshot of this descent (charges, relics, mutators).</p>
                </div>
                <UiButton size="md" variant="secondary" onClick={closeSubscreen} type="button">
                    Back
                </UiButton>
            </header>

            <div className={metaStyles.body}>
                <Panel padding="lg" variant="strong">
                    <div className={styles.kv}>
                        <div className={styles.kvRow}>
                            <span>
                                Mode<strong>{modeTitle(run.gameMode)}</strong>
                            </span>
                            <span>
                                Floor<strong>{run.board?.level ?? run.stats.highestLevel}</strong>
                            </span>
                            <span>
                                Lives<strong>{run.lives}</strong>
                            </span>
                        </div>
                        <div className={styles.kvRow}>
                            <span>
                                Practice<strong>{run.practiceMode ? 'Yes' : 'No'}</strong>
                            </span>
                            <span>
                                Achievements enabled<strong>{run.achievementsEnabled ? 'Yes' : 'No'}</strong>
                            </span>
                            <span>
                                Powers used this run<strong>{run.powersUsedThisRun ? 'Yes' : 'No'}</strong>
                            </span>
                        </div>
                        {run.dailyDateKeyUtc ? (
                            <div className={styles.kvRow}>
                                <span>
                                    Daily key (UTC)<strong>{run.dailyDateKeyUtc}</strong>
                                </span>
                            </div>
                        ) : null}
                    </div>
                </Panel>

                <Panel padding="lg" variant="default">
                    <h2 className={metaStyles.subtitle} style={{ margin: '0 0 0.5rem', fontWeight: 650 }}>
                        Relics
                    </h2>
                    {run.relicIds.length > 0 ? (
                        <ul className={styles.list}>
                            {run.relicIds.map((id) => (
                                <li key={id}>{RELIC_CATALOG[id]?.title ?? id}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.empty}>No relics claimed yet this run.</p>
                    )}
                </Panel>

                <Panel padding="lg" variant="default">
                    <h2 className={metaStyles.subtitle} style={{ margin: '0 0 0.5rem', fontWeight: 650 }}>
                        Mutators
                    </h2>
                    {run.activeMutators.length > 0 ? (
                        <ul className={styles.list}>
                            {run.activeMutators.map((id) => (
                                <li key={id}>{MUTATOR_CATALOG[id]?.title ?? id}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.empty}>No mutators on this run.</p>
                    )}
                </Panel>

                <Panel padding="lg" variant="default">
                    <h2 className={metaStyles.subtitle} style={{ margin: '0 0 0.5rem', fontWeight: 650 }}>
                        Charges and tokens
                    </h2>
                    <div className={styles.kv}>
                        <div className={styles.kvRow}>
                            <span>
                                Shuffle charges<strong>{run.shuffleCharges}</strong>
                            </span>
                            <span>
                                Destroy charges<strong>{run.destroyPairCharges}</strong>
                            </span>
                            <span>
                                Peek charges<strong>{run.peekCharges}</strong>
                            </span>
                        </div>
                        <div className={styles.kvRow}>
                            <span>
                                Stray remove<strong>{run.strayRemoveCharges}</strong>
                            </span>
                            <span>
                                Guard tokens<strong>{run.stats.guardTokens}</strong>
                            </span>
                            <span>
                                Combo shards<strong>{run.stats.comboShards}</strong>
                            </span>
                        </div>
                        <div className={styles.kvRow}>
                            <span>
                                Undo this floor<strong>{run.undoUsesThisFloor}</strong>
                            </span>
                            <span>
                                Free shuffle this floor<strong>{run.freeShuffleThisFloor ? 'Available' : 'Used / n/a'}</strong>
                            </span>
                            <span>
                                Match score mult.<strong>{run.matchScoreMultiplier.toFixed(2)}×</strong>
                            </span>
                        </div>
                    </div>
                </Panel>

                <Panel padding="lg" variant="default">
                    <h2 className={metaStyles.subtitle} style={{ margin: '0 0 0.5rem', fontWeight: 650 }}>
                        Contract flags
                    </h2>
                    {contract ? (
                        <ul className={styles.list}>
                            <li>No shuffle: {contract.noShuffle ? 'Yes' : 'No'}</li>
                            <li>No destroy: {contract.noDestroy ? 'Yes' : 'No'}</li>
                            <li>Max mismatches: {contract.maxMismatches === null ? 'None' : contract.maxMismatches}</li>
                        </ul>
                    ) : (
                        <p className={styles.empty}>No scholar contract on this run.</p>
                    )}
                </Panel>
            </div>
        </section>
    );
};

export default InventoryScreen;
