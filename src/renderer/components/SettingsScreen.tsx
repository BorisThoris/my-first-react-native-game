import { useEffect, useId, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Settings } from '../../shared/contracts';
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
