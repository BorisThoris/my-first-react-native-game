import { useShallow } from 'zustand/react/shallow';
import { ACHIEVEMENTS } from '../../shared/achievements';
import {
    CODEX_CORE_TOPICS,
    GAME_MODE_CODEX,
    MUTATOR_CATALOG,
    RELIC_CATALOG,
    VISUAL_ENDLESS_MODE_LOCKED
} from '../../shared/game-catalog';
import type { MutatorId, RelicId } from '../../shared/contracts';
import { Eyebrow, Panel, ScreenTitle, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import metaStyles from './MetaScreen.module.css';
import styles from './CodexScreen.module.css';

const CodexScreen = () => {
    const closeSubscreen = useAppStore(useShallow((state) => state.closeSubscreen));

    return (
        <section aria-label="Codex" className={`${metaStyles.shell} ${metaStyles.shellMetaStage}`} role="region">
            <header className={metaStyles.header}>
                <div className={metaStyles.headerText}>
                    <Eyebrow tone="menu">Reference</Eyebrow>
                    <ScreenTitle as="h1" role="display">
                        Codex
                    </ScreenTitle>
                    <p className={metaStyles.subtitle}>
                        Read-only descriptions for achievements, relics, mutators, and modes. Does not change gameplay.
                    </p>
                </div>
                <UiButton size="md" variant="secondary" onClick={closeSubscreen} type="button">
                    Back
                </UiButton>
            </header>

            <div className={metaStyles.body}>
                <nav aria-label="Codex sections" className={metaStyles.inPageToc}>
                    <a href="#codex-core">Core</a>
                    <a href="#codex-modes">Modes</a>
                    <a href="#codex-achievements">Achievements</a>
                    <a href="#codex-relics">Relics</a>
                    <a href="#codex-mutators">Mutators</a>
                </nav>
                <Panel padding="lg" variant="strong">
                    <div className={`${styles.group} ${metaStyles.sectionAnchor}`} id="codex-core">
                        <h2 className={styles.groupTitle}>Core systems</h2>
                        {CODEX_CORE_TOPICS.map((topic) => (
                            <div className={styles.entry} key={topic.id}>
                                <strong>{topic.title}</strong>
                                <p>{topic.description}</p>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel padding="lg" variant="default">
                    <div className={`${styles.group} ${metaStyles.sectionAnchor}`} id="codex-modes">
                        <h2 className={styles.groupTitle}>Game modes</h2>
                        {GAME_MODE_CODEX.map((m) => (
                            <div className={styles.entry} key={m.id}>
                                <strong>{m.title}</strong>
                                <p>{m.description}</p>
                            </div>
                        ))}
                        <div className={styles.entry}>
                            <strong>{VISUAL_ENDLESS_MODE_LOCKED.title}</strong>
                            <p>{VISUAL_ENDLESS_MODE_LOCKED.description}</p>
                        </div>
                    </div>
                </Panel>

                <Panel padding="lg" variant="default">
                    <div className={`${styles.group} ${metaStyles.sectionAnchor}`} id="codex-achievements">
                        <h2 className={styles.groupTitle}>Achievements</h2>
                        {ACHIEVEMENTS.map((a) => (
                            <div className={styles.entry} key={a.id}>
                                <strong>{a.title}</strong>
                                <p>{a.description}</p>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel padding="lg" variant="default">
                    <div className={`${styles.group} ${metaStyles.sectionAnchor}`} id="codex-relics">
                        <h2 className={styles.groupTitle}>Relics</h2>
                        {(Object.keys(RELIC_CATALOG) as RelicId[]).map((id) => {
                            const r = RELIC_CATALOG[id];
                            return (
                                <div className={styles.entry} key={id}>
                                    <strong>{r.title}</strong>
                                    <p>{r.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </Panel>

                <Panel padding="lg" variant="default">
                    <div className={`${styles.group} ${metaStyles.sectionAnchor}`} id="codex-mutators">
                        <h2 className={styles.groupTitle}>Mutators</h2>
                        {(Object.keys(MUTATOR_CATALOG) as MutatorId[]).map((id) => {
                            const m = MUTATOR_CATALOG[id];
                            return (
                                <div className={styles.entry} key={id}>
                                    <strong>{m.title}</strong>
                                    <p>{m.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            </div>
        </section>
    );
};

export default CodexScreen;
