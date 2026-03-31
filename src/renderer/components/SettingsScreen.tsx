import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Settings } from '../../shared/contracts';
import { useViewportSize } from '../hooks/useViewportSize';
import { Eyebrow, Panel, ScreenTitle, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import styles from './SettingsScreen.module.css';

const SettingsScreen = () => {
    const { closeSettings, settings, updateSettings } = useAppStore(
        useShallow((state) => ({
            closeSettings: state.closeSettings,
            settings: state.settings,
            updateSettings: state.updateSettings
        }))
    );
    const [draft, setDraft] = useState<Settings>(settings);
    const isDev = import.meta.env.DEV;
    const { height, width } = useViewportSize();
    const isCompact = width <= 760 || height <= 760;

    useEffect(() => {
        setDraft(settings);
    }, [settings]);

    const patchSettings = <Key extends keyof Settings>(key: Key, value: Settings[Key]): void => {
        setDraft((current) => ({
            ...current,
            [key]: value
        }));
    };

    const patchDebugFlags = (key: keyof Settings['debugFlags'], value: boolean): void => {
        setDraft((current) => ({
            ...current,
            debugFlags: {
                ...current.debugFlags,
                [key]: value
            }
        }));
    };

    const handleSave = (): void => {
        void updateSettings(draft).then(() => {
            closeSettings();
        });
    };

    return (
        <section className={styles.shell}>
            <Panel className={styles.panel} maxViewportHeight padding="lg" scrollable variant="strong">
                <header className={styles.header}>
                    <div>
                        <Eyebrow>Desktop Settings</Eyebrow>
                        <ScreenTitle as="h2" role="screenMd">
                            Tune the run for Steam desktop play.
                        </ScreenTitle>
                    </div>
                    <UiButton variant="ghost" onClick={closeSettings}>
                        Back
                    </UiButton>
                </header>

                <div className={styles.grid}>
                    <Panel as="section" className={styles.sectionInner} padding="section" variant="muted">
                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                            Display
                        </ScreenTitle>

                        <label className={styles.selectField}>
                            <span>Window Mode</span>
                            <select
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

                        <label className={styles.field}>
                            <span>UI Scale</span>
                            <strong>{Math.round(draft.uiScale * 100)}%</strong>
                            <input
                                max="1.2"
                                min="0.9"
                                onChange={(event) => patchSettings('uiScale', Number(event.currentTarget.value))}
                                step="0.05"
                                type="range"
                                value={draft.uiScale}
                            />
                        </label>

                        <label className={styles.checkboxRow}>
                            <input
                                checked={draft.reduceMotion}
                                onChange={(event) => patchSettings('reduceMotion', event.currentTarget.checked)}
                                type="checkbox"
                            />
                            <span>Reduce hover lift, board transitions, and ambient motion.</span>
                        </label>
                    </Panel>

                    <Panel as="section" className={styles.sectionInner} padding="section" variant="muted">
                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                            Controls and Save
                        </ScreenTitle>
                        <p className={styles.copy}>This demo is built for touch and mouse play.</p>
                        {!isCompact && (
                            <p className={styles.copy}>
                                Audio sliders stay in the save schema for future compatibility, but this build does
                                not ship live audio controls yet.
                            </p>
                        )}
                        <p className={styles.copy}>Settings persist locally through the desktop bridge.</p>
                    </Panel>

                    {isDev && (
                        <Panel
                            as="section"
                            className={`${styles.sectionInner} ${styles.sectionWide}`}
                            padding="section"
                            variant="muted"
                        >
                            <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                Debug Tools
                            </ScreenTitle>

                            <label className={styles.checkboxRow}>
                                <input
                                    checked={draft.debugFlags.showDebugTools}
                                    onChange={(event) =>
                                        patchDebugFlags('showDebugTools', event.currentTarget.checked)
                                    }
                                    type="checkbox"
                                />
                                <span>Show dev-only debug controls in the run HUD.</span>
                            </label>

                            <label className={styles.checkboxRow}>
                                <input
                                    checked={draft.debugFlags.allowBoardReveal}
                                    onChange={(event) =>
                                        patchDebugFlags('allowBoardReveal', event.currentTarget.checked)
                                    }
                                    type="checkbox"
                                />
                                <span>Allow a short board reveal for local development.</span>
                            </label>

                            <label className={styles.checkboxRow}>
                                <input
                                    checked={draft.debugFlags.disableAchievementsOnDebug}
                                    onChange={(event) =>
                                        patchDebugFlags('disableAchievementsOnDebug', event.currentTarget.checked)
                                    }
                                    type="checkbox"
                                />
                                <span>Disable achievements when debug reveal is used.</span>
                            </label>
                        </Panel>
                    )}
                </div>

                <footer className={styles.footer}>
                    <p className={styles.note}>Only active demo controls are exposed in this screen.</p>
                    <div className={styles.footerActions}>
                        <UiButton variant="secondary" onClick={closeSettings}>
                            Cancel
                        </UiButton>
                        <UiButton variant="primary" onClick={handleSave}>
                            Save Changes
                        </UiButton>
                    </div>
                </footer>
            </Panel>
        </section>
    );
};

export default SettingsScreen;
