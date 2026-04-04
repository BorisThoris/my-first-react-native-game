import { useEffect, useId, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { BoardPresentationMode, Settings, WeakerShuffleMode } from '../../shared/contracts';
import { Eyebrow, Panel, ScreenTitle, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import styles from './SettingsScreen.module.css';

interface SettingsScreenProps {
    presentation?: 'page' | 'modal';
}

const SettingsScreen = ({ presentation = 'page' }: SettingsScreenProps) => {
    const { closeSettings, settings, updateSettings } = useAppStore(
        useShallow((state) => ({
            closeSettings: state.closeSettings,
            settings: state.settings,
            updateSettings: state.updateSettings
        }))
    );
    const [draft, setDraft] = useState<Settings>(settings);
    const isModal = presentation === 'modal';
    const titleId = useId();
    const title = isModal ? 'Run Settings' : 'Settings';
    const eyebrow = isModal ? 'Paused' : 'Preferences';
    const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);

    useEffect(() => {
        setDraft(settings);
    }, [settings]);

    const patchSettings = <Key extends keyof Settings>(key: Key, value: Settings[Key]): void => {
        setDraft((current) => ({
            ...current,
            [key]: value
        }));
    };

    const handleSave = (): void => {
        void updateSettings(draft);
    };

    return (
        <section
            aria-labelledby={isModal ? titleId : undefined}
            aria-modal={isModal ? 'true' : undefined}
            className={`${styles.shell} ${isModal ? styles.shellModal : ''}`}
            role={isModal ? 'dialog' : undefined}
        >
            <Panel
                className={`${styles.panel} ${isModal ? styles.panelModal : ''}`}
                maxViewportHeight
                padding="lg"
                scrollable
                variant="strong"
            >
                <header className={styles.header}>
                    <div className={styles.titleWrap}>
                        <Eyebrow>{eyebrow}</Eyebrow>
                        <ScreenTitle as="h2" id={titleId} role="screenMd">
                            {title}
                        </ScreenTitle>
                    </div>
                </header>

                <div className={styles.grid}>
                    <Panel as="section" className={styles.sectionInner} padding="section" variant="muted">
                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                            Display
                        </ScreenTitle>

                        <label className={styles.selectField}>
                            <select
                                aria-label="Display"
                                onChange={(event) =>
                                    patchSettings(
                                        'displayMode',
                                        event.currentTarget.value as Settings['displayMode']
                                    )
                                }
                                value={draft.displayMode}
                            >
                                <option value="windowed">Windowed</option>
                                <option value="fullscreen">Fullscreen</option>
                            </select>
                        </label>
                    </Panel>

                    <Panel as="section" className={styles.sectionInner} padding="section" variant="muted">
                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                            Volume
                        </ScreenTitle>

                        <label className={styles.sliderField}>
                            <div className={styles.sliderHeader}>
                                <strong>{Math.round(draft.masterVolume * 100)}%</strong>
                            </div>
                            <input
                                aria-label="Volume"
                                className={styles.rangeInput}
                                max="1"
                                min="0"
                                onChange={(event) => patchSettings('masterVolume', Number(event.currentTarget.value))}
                                step="0.05"
                                type="range"
                                value={draft.masterVolume}
                            />
                        </label>
                    </Panel>

                    <Panel as="section" className={styles.sectionInner} padding="section" variant="muted">
                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                            Board (experimental)
                        </ScreenTitle>
                        <p className={styles.helpText}>
                            Presentation tweaks for the tile field. Reduce motion disables the breathing scale.
                        </p>
                        <label className={styles.selectField}>
                            <span className={styles.fieldLabel}>Layout style</span>
                            <select
                                aria-label="Board layout style"
                                onChange={(event) =>
                                    patchSettings(
                                        'boardPresentation',
                                        event.currentTarget.value as BoardPresentationMode
                                    )
                                }
                                value={draft.boardPresentation}
                            >
                                <option value="standard">Standard</option>
                                <option value="spaghetti">Spaghetti tilt</option>
                                <option value="breathing">Breathing grid</option>
                            </select>
                        </label>
                        <label className={styles.checkboxField}>
                            <input
                                checked={draft.tileFocusAssist}
                                onChange={(event) => patchSettings('tileFocusAssist', event.currentTarget.checked)}
                                type="checkbox"
                            />
                            <span>Focus assist — dim tiles away from your open pick (2D / fallback board)</span>
                        </label>
                    </Panel>

                    <Panel as="section" className={styles.sectionInner} padding="section" variant="muted">
                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                            Gameplay timing & shuffle
                        </ScreenTitle>
                        <p className={styles.helpText}>
                            Affects new runs. Resolve delay scales mismatch/match pauses. Weaker shuffle keeps row order.
                            Distraction overlay respects reduce motion when off below.
                        </p>
                        <label className={styles.sliderField}>
                            <div className={styles.sliderHeader}>
                                <span>Resolve delay multiplier</span>
                                <strong>{draft.resolveDelayMultiplier.toFixed(2)}×</strong>
                            </div>
                            <input
                                aria-label="Resolve delay multiplier"
                                className={styles.rangeInput}
                                max="2.5"
                                min="0.5"
                                onChange={(event) =>
                                    patchSettings('resolveDelayMultiplier', Number(event.currentTarget.value))
                                }
                                step="0.05"
                                type="range"
                                value={draft.resolveDelayMultiplier}
                            />
                        </label>
                        <label className={styles.selectField}>
                            <span className={styles.fieldLabel}>Shuffle strength</span>
                            <select
                                aria-label="Weaker shuffle mode"
                                onChange={(event) =>
                                    patchSettings('weakerShuffleMode', event.currentTarget.value as WeakerShuffleMode)
                                }
                                value={draft.weakerShuffleMode}
                            >
                                <option value="full">Full shuffle</option>
                                <option value="rows_only">Weaker (rows only)</option>
                            </select>
                        </label>
                        <label className={styles.checkboxField}>
                            <input
                                checked={draft.echoFeedbackEnabled}
                                onChange={(event) => patchSettings('echoFeedbackEnabled', event.currentTarget.checked)}
                                type="checkbox"
                            />
                            <span>Echo — slightly longer face-up time after a mismatch</span>
                        </label>
                        <label className={styles.checkboxField}>
                            <input
                                checked={draft.shuffleScoreTaxEnabled}
                                onChange={(event) =>
                                    patchSettings('shuffleScoreTaxEnabled', event.currentTarget.checked)
                                }
                                type="checkbox"
                            />
                            <span>Shuffle score tax — small score multiplier hit per shuffle (new runs)</span>
                        </label>
                        <label className={styles.checkboxField}>
                            <input
                                checked={draft.distractionChannelEnabled}
                                onChange={(event) =>
                                    patchSettings('distractionChannelEnabled', event.currentTarget.checked)
                                }
                                type="checkbox"
                            />
                            <span>Distraction channel — faint numeric overlay when daily mutator includes it</span>
                        </label>
                    </Panel>
                </div>

                <footer className={styles.footer}>
                    <div className={styles.footerActions}>
                        <UiButton autoFocus={isModal} variant="secondary" onClick={closeSettings}>
                            Back
                        </UiButton>
                        <UiButton disabled={!isDirty} variant={isDirty ? 'primary' : 'secondary'} onClick={handleSave}>
                            Save
                        </UiButton>
                    </div>
                </footer>
            </Panel>
        </section>
    );
};

export default SettingsScreen;
