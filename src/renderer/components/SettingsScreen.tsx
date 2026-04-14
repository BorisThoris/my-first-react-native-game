import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type {
    BoardPresentationMode,
    BoardScreenSpaceAA,
    CameraViewportModePreference,
    DisplayMode,
    GraphicsQualityPreset,
    Settings,
    WeakerShuffleMode
} from '../../shared/contracts';
import { DEFAULT_SETTINGS } from '../../shared/save-data';
import {
    isNarrowShortLandscapeForMenuStack,
    isShortLandscapeViewport,
    VIEWPORT_LANDSCAPE_STACK_MAX_WIDTH,
    VIEWPORT_MOBILE_MAX
} from '../breakpoints';
import { getFocusableElements, handleTabFocusTrapEvent } from '../a11y/focusables';
import { useFitShellZoom } from '../hooks/useFitShellZoom';
import { useViewportSize } from '../hooks/useViewportSize';
import { useAppStore } from '../store/useAppStore';
import { Eyebrow, Panel, ScreenTitle, UiButton } from '../ui';
import packageJson from '../../../package.json';
import styles from './SettingsScreen.module.css';

interface SettingsScreenProps {
    presentation?: 'page' | 'modal';
}

type SettingsCategory = 'gameplay' | 'audio' | 'video' | 'accessibility' | 'controls' | 'about';
type SettingsSubsection =
    | 'board'
    | 'timing'
    | 'assist'
    | 'reference'
    | 'input'
    | 'tuning'
    | 'volume'
    | 'display'
    | 'graphics'
    | 'accessibility'
    | 'build'
    | 'reset';

const SETTINGS_CATEGORIES: ReadonlyArray<{ id: SettingsCategory; label: string; note: string }> = [
    { id: 'gameplay', label: 'Gameplay', note: 'Run rules, board flow, and helper systems.' },
    { id: 'controls', label: 'Controls', note: 'Input reference and future tuning (UI-only).' },
    { id: 'audio', label: 'Audio', note: 'Master, music, and effect mix.' },
    { id: 'video', label: 'Video', note: 'Display mode and interface scale.' },
    { id: 'accessibility', label: 'Accessibility', note: 'Motion, clarity, and tutorial support.' },
    { id: 'about', label: 'About', note: 'Build info, credits, and reset.' }
];

const SETTINGS_SUBSECTIONS: Record<
    SettingsCategory,
    ReadonlyArray<{ id: SettingsSubsection; label: string }>
> = {
    gameplay: [
        { id: 'board', label: 'Board' },
        { id: 'timing', label: 'Timing' },
        { id: 'assist', label: 'Assist' },
        { id: 'reference', label: 'Gameplay reference' }
    ],
    controls: [
        { id: 'input', label: 'Input' },
        { id: 'tuning', label: 'Tuning' }
    ],
    audio: [{ id: 'volume', label: 'Volume' }],
    video: [
        { id: 'display', label: 'Display' },
        { id: 'graphics', label: 'Graphics' }
    ],
    accessibility: [{ id: 'accessibility', label: 'Accessibility' }],
    about: [
        { id: 'build', label: 'Build' },
        { id: 'reset', label: 'Reset' }
    ]
};

const DEFAULT_SUBSECTION_BY_CATEGORY: Record<SettingsCategory, SettingsSubsection> = {
    gameplay: 'board',
    controls: 'input',
    audio: 'volume',
    video: 'display',
    accessibility: 'accessibility',
    about: 'build'
};

interface ToggleRowProps {
    label: string;
    hint: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (next: boolean) => void;
}

const ToggleRow = ({ label, hint, checked, disabled = false, onChange }: ToggleRowProps) => (
    <label className={`${styles.toggleRow} ${disabled ? styles.toggleRowDisabled : ''}`.trim()}>
        <div className={styles.fieldText}>
            <strong>{label}</strong>
            <span>{hint}</span>
        </div>
        <span className={styles.toggleShell}>
            <input
                aria-disabled={disabled ? true : undefined}
                checked={checked}
                disabled={disabled}
                onChange={(event) => onChange(event.currentTarget.checked)}
                type="checkbox"
            />
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
    /** Reference-only: visible “Coming soon” + Steam demo scope (no save keys). */
    honestFuturePlaceholder?: boolean;
}

const PlaceholderControl = ({
    label,
    hint,
    options,
    honestFuturePlaceholder = false
}: PlaceholderControlProps) => (
    <div className={`${styles.fieldCard} ${styles.placeholderField}`}>
        <div className={styles.fieldText}>
            {honestFuturePlaceholder ? (
                <div className={styles.placeholderLabelRow}>
                    <strong>{label}</strong>
                    <span className={styles.futurePill}>Coming soon</span>
                </div>
            ) : (
                <strong>{label}</strong>
            )}
            <span>{hint}</span>
            {honestFuturePlaceholder ? <span className={styles.demoScopeNote}>Not in Steam demo.</span> : null}
        </div>
        <div className={styles.segmented}>
            {options.map((option) => (
                <button
                    aria-disabled="true"
                    className={styles.segmentButtonDisabled}
                    disabled
                    key={option}
                    type="button"
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

interface SettingsSectionProps {
    title: string;
    children: ReactNode;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => (
    <Panel className={styles.section} padding="none" variant="muted">
        <ScreenTitle as="h3" className={styles.sectionHeading} role="section">
            {title}
        </ScreenTitle>
        {children}
    </Panel>
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
    const [activeSubsection, setActiveSubsection] = useState<SettingsSubsection>(
        DEFAULT_SUBSECTION_BY_CATEGORY.gameplay
    );
    const isModal = presentation === 'modal';
    const modalShellRef = useRef<HTMLElement | null>(null);
    const fitViewportRef = useRef<HTMLDivElement | null>(null);
    const settingsFitMeasureRef = useRef<HTMLDivElement | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    /** Inner box inside shell padding; useFitShellZoom must use this, not raw window size, or the panel clips top/bottom on modals. */
    const [fitShellAvail, setFitShellAvail] = useState<{ height: number; width: number } | null>(null);
    const { height: viewportHeight, width: viewportWidth } = useViewportSize();
    const titleId = useId();
    const title = isModal ? 'Run Settings' : 'Settings';
    const eyebrow = isModal ? 'Paused' : 'Preferences';
    const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);
    const isPhoneViewport = viewportWidth <= VIEWPORT_MOBILE_MAX;
    const isShortLandscapeShell = isShortLandscapeViewport(viewportWidth, viewportHeight);
    const stackedSettingsShell = isPhoneViewport || isNarrowShortLandscapeForMenuStack(viewportWidth, viewportHeight);
    const shortLandscapeStackedShell = stackedSettingsShell && isShortLandscapeShell;
    /** Stacked phone / narrow short-landscape: one subsection at a time. */
    const compactDisclosure = shortLandscapeStackedShell;
    /** Non-stacked short-landscape wider than narrow-stack cap (961–1023px, etc.): same shell as 1280×720, not bare desktop. */
    const wideShortDesktopShell =
        !stackedSettingsShell &&
        isShortLandscapeViewport(viewportWidth, viewportHeight) &&
        viewportWidth > VIEWPORT_LANDSCAPE_STACK_MAX_WIDTH;
    const footerButtonSize = stackedSettingsShell ? 'sm' : 'md';
    /* Uncollapsed (non-stacked) two-column shell: allow mild fit zoom whenever intrinsic height exceeds the viewport. Stacked modes keep zoom off (layout + disclosure). */
    const settingsFitEnabled = !stackedSettingsShell;

    useLayoutEffect(() => {
        const node = fitViewportRef.current;
        if (!node) {
            return;
        }
        const w = node.clientWidth;
        const h = node.clientHeight;
        if (w >= 32 && h >= 32) {
            setFitShellAvail((prev) => (prev?.width === w && prev?.height === h ? prev : { width: w, height: h }));
        }
    }, [
        activeCategory,
        isModal,
        presentation,
        shortLandscapeStackedShell,
        stackedSettingsShell,
        viewportHeight,
        viewportWidth,
        wideShortDesktopShell
    ]);

    const fitShellWidth = fitShellAvail?.width ?? viewportWidth;
    const fitShellHeight = fitShellAvail?.height ?? viewportHeight;
    const { fitZoom: settingsFitZoom } = useFitShellZoom({
        enabled: settingsFitEnabled,
        measureRef: settingsFitMeasureRef,
        padding: 8,
        recomputeKey: `${activeCategory}:${activeSubsection}`,
        viewportHeight: fitShellHeight,
        viewportWidth: fitShellWidth
    });
    const activeCategoryMeta = SETTINGS_CATEGORIES.find((item) => item.id === activeCategory) ?? SETTINGS_CATEGORIES[0];
    const subsectionOptions = SETTINGS_SUBSECTIONS[activeCategory];
    /** Wide-short (e.g. 1280×720): one subsection at a time so intrinsic shell height fits `useFitShellZoom` (≥0.92) with full Gameplay subsections. */
    const subsectionOneAtATime =
        compactDisclosure || (wideShortDesktopShell && subsectionOptions.length > 1);
    const showSubsectionNav = subsectionOneAtATime && subsectionOptions.length > 1;
    const showSubsection = (id: SettingsSubsection): boolean =>
        !subsectionOneAtATime || activeSubsection === id;

    useEffect(() => {
        setDraft(settings);
    }, [settings]);

    useEffect(() => {
        setActiveSubsection(DEFAULT_SUBSECTION_BY_CATEGORY[activeCategory]);
    }, [activeCategory, compactDisclosure, wideShortDesktopShell]);

    /* OVR-010: matches OverlayModal — rAF initial focus, document capture Tab trap, restore on unmount. */
    useEffect(() => {
        if (!isModal) {
            return;
        }

        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const frame = window.requestAnimationFrame(() => {
            const list = getFocusableElements(modalShellRef.current);
            (list[0] ?? modalShellRef.current)?.focus();
        });

        return () => {
            window.cancelAnimationFrame(frame);
            previousFocusRef.current?.focus();
        };
    }, [isModal]);

    useEffect(() => {
        if (!isModal) {
            return;
        }

        const onDocumentKeyDown = (event: KeyboardEvent): void => {
            handleTabFocusTrapEvent(event, modalShellRef.current);
        };

        document.addEventListener('keydown', onDocumentKeyDown, true);

        return () => {
            document.removeEventListener('keydown', onDocumentKeyDown, true);
        };
    }, [isModal]);

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

    return (
        <section
            aria-labelledby={isModal ? titleId : undefined}
            aria-modal={isModal ? 'true' : undefined}
            className={`${styles.shell} ${isModal ? styles.shellModal : ''} ${stackedSettingsShell ? styles.stackedShell : ''} ${wideShortDesktopShell ? styles.wideShortShell : ''} ${shortLandscapeStackedShell ? styles.shortLandscapeShell : ''}`.trim()}
            data-settings-layout={
                shortLandscapeStackedShell ? 'short-stacked' : wideShortDesktopShell ? 'wide-short' : stackedSettingsShell ? 'stacked' : 'desktop'
            }
            data-testid={isModal ? 'settings-modal-shell' : undefined}
            ref={modalShellRef}
            role={isModal ? 'dialog' : undefined}
            tabIndex={isModal ? -1 : undefined}
        >
            <div className={styles.fitViewport} ref={fitViewportRef}>
                <div className={styles.fitMeasureOuter} ref={settingsFitMeasureRef}>
                    <div
                        className={styles.fitZoomInner}
                        data-testid="settings-shell-fit-zoom"
                        style={{ zoom: settingsFitZoom }}
                    >
                        <Panel
                            className={`${styles.panel} ${isModal ? styles.panelModal : ''}`.trim()}
                            data-testid="settings-shell-panel"
                            padding="none"
                            variant="strong"
                        >
                            <div className={styles.frame}>
                                <aside className={styles.sidebar}>
                                    <div className={styles.sidebarHeader}>
                                        <Eyebrow>{eyebrow}</Eyebrow>
                                        <ScreenTitle
                                            as={isModal ? 'h2' : 'h1'}
                                            className={styles.shellTitle}
                                            id={titleId}
                                            role="screenMd"
                                        >
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
                                        <ScreenTitle
                                            as={isModal ? 'h3' : 'h2'}
                                            className={styles.contentTitle}
                                            role="screen"
                                        >
                                            {activeCategoryMeta.label}
                                        </ScreenTitle>
                                        <p className={styles.headerCopy}>{activeCategoryMeta.note}</p>
                                    </header>

                                    {showSubsectionNav ? (
                                        <div
                                            aria-label={`${activeCategoryMeta.label} sections`}
                                            className={styles.subsectionNav}
                                            data-testid="settings-subsection-nav"
                                            role="group"
                                        >
                                            {subsectionOptions.map((option) => (
                                                <button
                                                    aria-pressed={activeSubsection === option.id}
                                                    className={`${styles.subsectionButton} ${activeSubsection === option.id ? styles.subsectionButtonActive : ''}`.trim()}
                                                    key={option.id}
                                                    onClick={() => setActiveSubsection(option.id)}
                                                    type="button"
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}

                                    <div className={styles.contentScroll}>
                                        {activeCategory === 'gameplay' && showSubsection('board') ? (
                                            <SettingsSection title="Board Presentation">
                                                <div className={styles.boardPresentationPair}>
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
                                                    <SegmentedControl<CameraViewportModePreference>
                                                        hint="Auto follows phone / narrow-short-landscape breakpoints. Always or Never override."
                                                        label="Mobile Camera Shell"
                                                        onChange={(next) => patchSettings('cameraViewportModePreference', next)}
                                                        options={[
                                                            { label: 'Auto', value: 'auto' },
                                                            { label: 'Always', value: 'always' },
                                                            { label: 'Never', value: 'never' }
                                                        ]}
                                                        value={draft.cameraViewportModePreference}
                                                    />
                                                </div>
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'gameplay' && showSubsection('timing') ? (
                                            <SettingsSection title="Run Timing">
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
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'gameplay' && showSubsection('assist') ? (
                                            <SettingsSection title="Assist Layers">
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
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'gameplay' && showSubsection('reference') ? (
                                            <SettingsSection title="Gameplay reference">
                                                <p className={styles.headerCopy}>
                                                    Reference comparison controls with no live save keys in this build.
                                                    Segments are disabled; the shipped Steam demo ignores these fields.
                                                </p>
                                                <div className={styles.toggleStack} data-testid="settings-gameplay-reference">
                                                    <PlaceholderControl
                                                        honestFuturePlaceholder
                                                        hint="No difficulty setting in save data yet; the run uses the shipped balance curve."
                                                        label="Difficulty"
                                                        options={['Easy', 'Normal', 'Hard', 'Nightmare']}
                                                    />
                                                    <PlaceholderControl
                                                        honestFuturePlaceholder
                                                        hint="Timer mode is not connected to save data or run rules in this build."
                                                        label="Timer mode"
                                                        options={['Classic', 'Countdown', 'Relentless']}
                                                    />
                                                    <PlaceholderControl
                                                        honestFuturePlaceholder
                                                        hint="Max lives follow game constants until a future settings schema."
                                                        label="Max lives"
                                                        options={['2', '3', '4', '5']}
                                                    />
                                                    <PlaceholderControl
                                                        honestFuturePlaceholder
                                                        hint="Alternate card art sets are not selectable yet; asset slots only."
                                                        label="Card theme"
                                                        options={['Crimson', 'Violet', 'Emerald', 'Steel']}
                                                    />
                                                </div>
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'controls' && showSubsection('input') ? (
                                            <SettingsSection title="Input">
                                                <p className={styles.headerCopy}>
                                                    Primary control is pointer or touch: tap a hidden tile to flip it. When
                                                    only one tile is face-up, the next tap attempts a match. Board powers
                                                    use the left rail or the in-game utility menu. Pause freezes timers;
                                                    settings opened from a run opens the modal shell without ending the
                                                    descent.
                                                </p>
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'controls' && showSubsection('tuning') ? (
                                            <SettingsSection title="Future Tuning">
                                                <p className={styles.headerCopy}>
                                                    Reference-only balance and presentation selectors are grouped under
                                                    Gameplay → Gameplay reference as honest "Coming soon" placeholders
                                                    (not persisted).
                                                </p>
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'audio' && showSubsection('volume') ? (
                                            <SettingsSection title="Volume">
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
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'video' && showSubsection('display') ? (
                                            <SettingsSection title="Display">
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
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'video' && showSubsection('graphics') ? (
                                            <SettingsSection title="Graphics">
                                                <SegmentedControl<GraphicsQualityPreset>
                                                    hint="Low caps board pixel ratio and menu atmosphere resolution; high allows sharper WebGL. Bloom stays off unless you enable it below."
                                                    label="Graphics quality"
                                                    onChange={(next) => patchSettings('graphicsQuality', next)}
                                                    options={[
                                                        { label: 'Low', value: 'low' },
                                                        { label: 'Medium', value: 'medium' },
                                                        { label: 'High', value: 'high' }
                                                    ]}
                                                    value={draft.graphicsQuality}
                                                />
                                                <div className={styles.toggleStack}>
                                                    <ToggleRow
                                                        checked={draft.boardBloomEnabled}
                                                        disabled={draft.graphicsQuality === 'low'}
                                                        hint="Soft bloom on the tile board. Disabled on Low quality for performance."
                                                        label="Board bloom"
                                                        onChange={(next) => patchSettings('boardBloomEnabled', next)}
                                                    />
                                                </div>
                                                <SegmentedControl<BoardScreenSpaceAA>
                                                    hint="Board WebGL edge smoothing. Auto follows the motion setting unless you override it."
                                                    label="Board anti-aliasing"
                                                    onChange={(next) => patchSettings('boardScreenSpaceAA', next)}
                                                    options={[
                                                        { label: 'Auto', value: 'auto' },
                                                        { label: 'SMAA', value: 'smaa' },
                                                        { label: 'MSAA', value: 'msaa' },
                                                        { label: 'Off', value: 'off' }
                                                    ]}
                                                    value={draft.boardScreenSpaceAA}
                                                />
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'accessibility' && showSubsection('accessibility') ? (
                                            <SettingsSection title="Accessibility">
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
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'about' && showSubsection('build') ? (
                                            <SettingsSection title="Memory Dungeon">
                                                <p className={styles.headerCopy}>
                                                    Version {packageJson.version}. Windows-first Steam desktop build. For
                                                    support and updates, use your storefront or developer channels.
                                                </p>
                                                <p className={styles.headerCopy}>
                                                    Built with React, Pixi/Three render paths, and Electron for the desktop
                                                    shell.
                                                </p>
                                            </SettingsSection>
                                        ) : null}

                                        {activeCategory === 'about' && showSubsection('reset') ? (
                                            <SettingsSection title="Reset">
                                                <p className={styles.headerCopy}>
                                                    Restore all settings to application defaults. Save data and runs are not
                                                    deleted.
                                                </p>
                                                <UiButton size={footerButtonSize} variant="secondary" onClick={handleResetToDefaults}>
                                                    Reset to defaults
                                                </UiButton>
                                            </SettingsSection>
                                        ) : null}
                                    </div>

                                    <footer className={styles.footer}>
                                        <div className={styles.footerActions}>
                                            <UiButton
                                                onClick={closeSettings}
                                                size={footerButtonSize}
                                                variant="secondary"
                                            >
                                                Back
                                            </UiButton>
                                            <UiButton
                                                disabled={!isDirty}
                                                onClick={handleSave}
                                                size={footerButtonSize}
                                                variant={isDirty ? 'primary' : 'secondary'}
                                            >
                                                Save
                                            </UiButton>
                                        </div>
                                    </footer>
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SettingsScreen;
