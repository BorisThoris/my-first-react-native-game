import { useEffect, useId, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { BoardPresentationMode, DisplayMode, Settings, WeakerShuffleMode } from '../../shared/contracts';
import { DEFAULT_SETTINGS } from '../../shared/save-data';
import { Eyebrow, Panel, ScreenTitle, UiButton } from '../ui';
import packageJson from '../../../package.json';
import { useAppStore } from '../store/useAppStore';
import styles from './SettingsScreen.module.css';

interface SettingsScreenProps {
    presentation?: 'page' | 'modal';
}

type SettingsCategory = 'gameplay' | 'audio' | 'video' | 'accessibility' | 'controls' | 'about';

const SETTINGS_CATEGORIES: ReadonlyArray<{ id: SettingsCategory; label: string; note: string }> = [
    { id: 'gameplay', label: 'Gameplay', note: 'Run rules, board flow, and helper systems.' },
    { id: 'controls', label: 'Controls', note: 'Input reference and future tuning (UI-only).' },
    { id: 'audio', label: 'Audio', note: 'Master, music, and effect mix.' },
    { id: 'video', label: 'Video', note: 'Display mode and interface scale.' },
    { id: 'accessibility', label: 'Accessibility', note: 'Motion, clarity, and tutorial support.' },
    { id: 'about', label: 'About', note: 'Build info, credits, and reset.' }
];

interface ToggleRowProps {
    label: string;
    hint: string;
    checked: boolean;
    onChange: (next: boolean) => void;
}

const ToggleRow = ({ label, hint, checked, onChange }: ToggleRowProps) => (
    <label className={styles.toggleRow}>
        <div className={styles.fieldText}>
            <strong>{label}</strong>
            <span>{hint}</span>
        </div>
        <span className={styles.toggleShell}>
            <input checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} type="checkbox" />
            <span className={styles.toggleTrack} />
        </span>
    </label>
);

interface SliderRowProps {
    label: string;
    hint: string;
    valueLabel: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (next: number) => void;
}

const SliderRow = ({ label, hint, valueLabel, min, max, step, value, onChange }: SliderRowProps) => (
    <div className={styles.fieldCard}>
        <div className={styles.fieldText}>
            <strong>{label}</strong>
            <span>{hint}</span>
        </div>
        <div className={styles.sliderField}>
            <div className={styles.sliderValue}>{valueLabel}</div>
            <input
                aria-label={label}
                className={styles.rangeInput}
                max={String(max)}
                min={String(min)}
                onChange={(event) => onChange(Number(event.currentTarget.value))}
                step={String(step)}
                type="range"
                value={value}
            />
        </div>
    </div>
);

interface SegmentOption<T extends string> {
    label: string;
    value: T;
}

interface SegmentedControlProps<T extends string> {
    label: string;
    hint: string;
    value: T;
    options: ReadonlyArray<SegmentOption<T>>;
    onChange: (next: T) => void;
}

const SegmentedControl = <T extends string,>({
    label,
    hint,
    value,
    options,
    onChange
}: SegmentedControlProps<T>) => (
    <div className={styles.fieldCard}>
        <div className={styles.fieldText}>
            <strong>{label}</strong>
            <span>{hint}</span>
        </div>
        <div className={styles.segmented}>
            {options.map((option) => (
                <button
                    aria-pressed={value === option.value}
                    className={`${styles.segmentButton} ${value === option.value ? styles.segmentButtonActive : ''}`.trim()}
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    type="button"
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);

interface PlaceholderControlProps {
    label: string;
    hint: string;
    options: string[];
}

const PlaceholderControl = ({ label, hint, options }: PlaceholderControlProps) => (
    <div className={`${styles.fieldCard} ${styles.placeholderField}`}>
        <div className={styles.fieldText}>
            <strong>{label}</strong>
            <span>{hint}</span>
        </div>
        <div className={styles.segmented}>
            {options.map((option) => (
                <button className={styles.segmentButtonDisabled} disabled key={option} type="button">
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const SettingsScreen = ({ presentation = 'page' }: SettingsScreenProps) => {
    const { closeSettings, settings, updateSettings } = useAppStore(
        useShallow((state) => ({
            closeSettings: state.closeSettings,
            settings: state.settings,
            updateSettings: state.updateSettings
        }))
    );
    const [draft, setDraft] = useState<Settings>(settings);
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('gameplay');
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

    const handleResetToDefaults = (): void => {
        const next: Settings = {
            ...DEFAULT_SETTINGS,
            debugFlags: { ...DEFAULT_SETTINGS.debugFlags }
        };
        setDraft(next);
        void updateSettings(next);
    };

    const activeCategoryMeta = SETTINGS_CATEGORIES.find((item) => item.id === activeCategory) ?? SETTINGS_CATEGORIES[0];

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
                padding="none"
                scrollable
                variant="strong"
            >
                <div className={styles.frame}>
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <Eyebrow>{eyebrow}</Eyebrow>
                            <ScreenTitle as="h2" id={titleId} role="screenMd">
                                {title}
                            </ScreenTitle>
                        </div>

                        <nav className={styles.categoryNav}>
                            {SETTINGS_CATEGORIES.map((category) => (
                                <button
                                    aria-pressed={activeCategory === category.id}
                                    className={`${styles.categoryButton} ${activeCategory === category.id ? styles.categoryButtonActive : ''}`.trim()}
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    type="button"
                                >
                                    <span className={styles.categoryLabel}>{category.label}</span>
                                    <span className={styles.categoryNote}>{category.note}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <div className={styles.contentPane}>
                        <header className={styles.contentHeader}>
                            <Eyebrow tone="tight">{activeCategoryMeta.label}</Eyebrow>
                            <ScreenTitle as="h3" role="screen">
                                {activeCategoryMeta.label}
                            </ScreenTitle>
                            <p className={styles.headerCopy}>{activeCategoryMeta.note}</p>
                        </header>

                        <div className={styles.contentScroll}>
                            {activeCategory === 'gameplay' ? (
                                <>
                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Board Presentation
                                        </ScreenTitle>
                                        <SegmentedControl<BoardPresentationMode>
                                            hint="Choose the current live board framing mode."
                                            label="Layout Style"
                                            onChange={(next) => patchSettings('boardPresentation', next)}
                                            options={[
                                                { label: 'Standard', value: 'standard' },
                                                { label: 'Spaghetti', value: 'spaghetti' },
                                                { label: 'Breathing', value: 'breathing' }
                                            ]}
                                            value={draft.boardPresentation}
                                        />
                                    </Panel>

                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Run Timing
                                        </ScreenTitle>
                                        <SliderRow
                                            hint="Controls mismatch and resolve pacing for new runs."
                                            label="Resolve Delay"
                                            max={2.5}
                                            min={0.5}
                                            onChange={(next) => patchSettings('resolveDelayMultiplier', next)}
                                            step={0.05}
                                            value={draft.resolveDelayMultiplier}
                                            valueLabel={`${draft.resolveDelayMultiplier.toFixed(2)}x`}
                                        />
                                        <SegmentedControl<WeakerShuffleMode>
                                            hint="Full shuffle preserves the original challenge. Rows only is the softer live option."
                                            label="Shuffle Strength"
                                            onChange={(next) => patchSettings('weakerShuffleMode', next)}
                                            options={[
                                                { label: 'Full Shuffle', value: 'full' },
                                                { label: 'Rows Only', value: 'rows_only' }
                                            ]}
                                            value={draft.weakerShuffleMode}
                                        />
                                    </Panel>

                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Assist Layers
                                        </ScreenTitle>
                                        <div className={styles.toggleStack}>
                                            <ToggleRow
                                                checked={draft.tileFocusAssist}
                                                hint="Dims non-adjacent hidden tiles after the first pick on the fallback board."
                                                label="Focus Assist"
                                                onChange={(next) => patchSettings('tileFocusAssist', next)}
                                            />
                                            <ToggleRow
                                                checked={draft.echoFeedbackEnabled}
                                                hint="Keeps mismatched faces visible a little longer."
                                                label="Echo Feedback"
                                                onChange={(next) => patchSettings('echoFeedbackEnabled', next)}
                                            />
                                            <ToggleRow
                                                checked={draft.distractionChannelEnabled}
                                                hint="Enables the distraction mutator overlay when the daily includes it."
                                                label="Distraction Channel"
                                                onChange={(next) => patchSettings('distractionChannelEnabled', next)}
                                            />
                                            <ToggleRow
                                                checked={draft.shuffleScoreTaxEnabled}
                                                hint="Applies the current live score penalty after each shuffle."
                                                label="Shuffle Score Tax"
                                                onChange={(next) => patchSettings('shuffleScoreTaxEnabled', next)}
                                            />
                                        </div>
                                    </Panel>
                                </>
                            ) : null}

                            {activeCategory === 'controls' ? (
                                <>
                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Input
                                        </ScreenTitle>
                                        <p className={styles.headerCopy}>
                                            Primary control is pointer or touch: tap a hidden tile to flip it. When only one
                                            tile is face-up, the next tap attempts a match. Board powers (shuffle, destroy,
                                            peek, stray remove, pins) use the left rail or the in-game utility menu. Pause
                                            freezes timers; settings opened from a run opens the modal shell without ending
                                            the descent.
                                        </p>
                                    </Panel>
                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Future tuning (not wired)
                                        </ScreenTitle>
                                        <PlaceholderControl
                                            hint="No live setting yet—the run always uses the shipped balance curve."
                                            label="Difficulty"
                                            options={['Easy', 'Normal', 'Hard', 'Nightmare']}
                                        />
                                        <PlaceholderControl
                                            hint="Timer mode is not connected to save data or rules in this build."
                                            label="Timer Mode"
                                            options={['Classic', 'Countdown', 'Relentless']}
                                        />
                                        <PlaceholderControl
                                            hint="Max lives are fixed by game rules until a future settings schema."
                                            label="Max Lives"
                                            options={['2', '3', '4', '5']}
                                        />
                                        <PlaceholderControl
                                            hint="Alternate card art sets are not selectable yet; asset slots only."
                                            label="Card Theme"
                                            options={['Crimson', 'Violet', 'Emerald', 'Steel']}
                                        />
                                    </Panel>
                                </>
                            ) : null}

                            {activeCategory === 'about' ? (
                                <>
                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Memory Dungeon
                                        </ScreenTitle>
                                        <p className={styles.headerCopy}>
                                            Version {packageJson.version}. Windows-first Steam desktop build. For support and
                                            updates, use your storefront or developer channels.
                                        </p>
                                        <p className={styles.headerCopy}>
                                            Built with React, Pixi/Three render paths, and Electron for the desktop shell.
                                        </p>
                                    </Panel>
                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Reset
                                        </ScreenTitle>
                                        <p className={styles.headerCopy}>
                                            Restore all settings to application defaults (volumes, video, gameplay helpers,
                                            debug flags). Save data and runs are not deleted.
                                        </p>
                                        <UiButton variant="secondary" onClick={handleResetToDefaults}>
                                            Reset to defaults
                                        </UiButton>
                                    </Panel>
                                </>
                            ) : null}

                            {activeCategory === 'audio' ? (
                                <>
                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Volume
                                        </ScreenTitle>
                                        <SliderRow
                                            hint="Overall mix applied across the whole run."
                                            label="Master Volume"
                                            max={1}
                                            min={0}
                                            onChange={(next) => patchSettings('masterVolume', next)}
                                            step={0.05}
                                            value={draft.masterVolume}
                                            valueLabel={`${Math.round(draft.masterVolume * 100)}%`}
                                        />
                                        <SliderRow
                                            hint="Menu and ambient music level."
                                            label="Music"
                                            max={1}
                                            min={0}
                                            onChange={(next) => patchSettings('musicVolume', next)}
                                            step={0.05}
                                            value={draft.musicVolume}
                                            valueLabel={`${Math.round(draft.musicVolume * 100)}%`}
                                        />
                                        <SliderRow
                                            hint="Tile flips, rewards, and hit feedback."
                                            label="SFX"
                                            max={1}
                                            min={0}
                                            onChange={(next) => patchSettings('sfxVolume', next)}
                                            step={0.05}
                                            value={draft.sfxVolume}
                                            valueLabel={`${Math.round(draft.sfxVolume * 100)}%`}
                                        />
                                    </Panel>
                                </>
                            ) : null}

                            {activeCategory === 'video' ? (
                                <>
                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Display
                                        </ScreenTitle>
                                        <SegmentedControl<DisplayMode>
                                            hint="Switch between current supported desktop display modes."
                                            label="Window Mode"
                                            onChange={(next) => patchSettings('displayMode', next)}
                                            options={[
                                                { label: 'Windowed', value: 'windowed' },
                                                { label: 'Fullscreen', value: 'fullscreen' }
                                            ]}
                                            value={draft.displayMode}
                                        />
                                        <SliderRow
                                            hint="Scales the renderer UI on desktop and tablet viewports."
                                            label="UI Scale"
                                            max={1.4}
                                            min={0.8}
                                            onChange={(next) => patchSettings('uiScale', next)}
                                            step={0.05}
                                            value={draft.uiScale}
                                            valueLabel={`${draft.uiScale.toFixed(2)}x`}
                                        />
                                    </Panel>
                                </>
                            ) : null}

                            {activeCategory === 'accessibility' ? (
                                <>
                                    <Panel className={styles.section} padding="lg" variant="muted">
                                        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
                                            Accessibility
                                        </ScreenTitle>
                                        <div className={styles.toggleStack}>
                                            <ToggleRow
                                                checked={draft.reduceMotion}
                                                hint="Disables board breathing, tilt-heavy UI motion, and visual drift where possible."
                                                label="Reduce Motion"
                                                onChange={(next) => patchSettings('reduceMotion', next)}
                                            />
                                            <ToggleRow
                                                checked={draft.tileFocusAssist}
                                                hint="Repeats the live focus assist toggle here for faster access."
                                                label="Board Focus Assist"
                                                onChange={(next) => patchSettings('tileFocusAssist', next)}
                                            />
                                        </div>
                                        <PlaceholderControl
                                            hint="Tutorial hint visibility is presented here for layout fidelity only."
                                            label="Tutorial Hints"
                                            options={['Off', 'On']}
                                        />
                                    </Panel>
                                </>
                            ) : null}
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
                    </div>
                </div>
            </Panel>
        </section>
    );
};

export default SettingsScreen;
