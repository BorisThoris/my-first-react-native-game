import { useEffect, useId, useRef, type ReactNode } from 'react';
import { focusFirstTabbableOrContainer, handleTabFocusTrapEvent } from '../a11y/focusables';
import { popModalFocusSnapshot, pushModalFocusSnapshot } from '../a11y/modalFocusReturnStack';
import { popVerticalToolbarRovingPause, pushVerticalToolbarRovingPause } from '../a11y/toolbarRoving';
import { MetaFrame, ScreenTitle, UiButton, type UiButtonVariant } from '../ui';
import styles from './OverlayModal.module.css';

interface ModalAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
}

/** META-009: pause=blue-neutral, floor=gold+success well, relic=violet — only when `ornamentalHeaderPlate`. */
export type OverlayModalHeaderPlateTone = 'neutral' | 'success' | 'pause' | 'relic' | 'danger';

interface OverlayModalProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    actions: ModalAction[];
    /** Optional stable hook for e2e (applied to the dialog surface). */
    testId?: string;
    /**
     * OVR-002: forged-gold header band using {@link MetaFrame} (META-003). Static only — pairs with global
     * `data-reduce-motion` (drops cornice glow, no motion hooks here). OVR-003: dialog surface enter animation is
     * CSS-only under `[data-reduce-motion='false']` (see MOTION_AND_STATE_SPEC).
     */
    ornamentalHeaderPlate?: boolean;
    /** When `ornamentalHeaderPlate` is set: chrome wash + MetaFrame glow (see {@link OverlayModalHeaderPlateTone}). */
    headerPlateTone?: OverlayModalHeaderPlateTone;
}

const headerPlateToneClass = (tone: OverlayModalHeaderPlateTone): string => {
    if (tone === 'success') {
        return styles.headerPlateFrameSuccess;
    }

    if (tone === 'pause') {
        return styles.headerPlateFramePause;
    }

    if (tone === 'relic') {
        return styles.headerPlateFrameRelic;
    }

    if (tone === 'danger') {
        return styles.headerPlateFrameDanger;
    }

    return '';
};

const overlayToneClass = (tone: OverlayModalHeaderPlateTone): string => {
    if (tone === 'success') {
        return styles.modalToneSuccess;
    }

    if (tone === 'pause') {
        return styles.modalTonePause;
    }

    if (tone === 'relic') {
        return styles.modalToneRelic;
    }

    if (tone === 'danger') {
        return styles.modalToneDanger;
    }

    return styles.modalToneNeutral;
};

const toUiVariant = (variant: ModalAction['variant']): UiButtonVariant => {
    if (variant === 'danger') {
        return 'danger';
    }

    if (variant === 'secondary') {
        return 'secondary';
    }

    return 'primary';
};

const OverlayModal = ({
    title,
    subtitle,
    children,
    actions,
    testId,
    ornamentalHeaderPlate = false,
    headerPlateTone = 'neutral'
}: OverlayModalProps) => {
    const modalRef = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const subtitleId = useId();
    const bodyId = useId();
    const describedBy = [subtitle ? subtitleId : null, children ? bodyId : null].filter(Boolean).join(' ') || undefined;

    /* OVR-010: initial focus + restore — same lifecycle pattern as Settings modal (`presentation="modal"`). */
    useEffect(() => {
        pushModalFocusSnapshot();
        pushVerticalToolbarRovingPause();

        const focusInitialElement = window.requestAnimationFrame(() => {
            focusFirstTabbableOrContainer(modalRef.current);
        });

        return () => {
            window.cancelAnimationFrame(focusInitialElement);
            popVerticalToolbarRovingPause();
            popModalFocusSnapshot();
        };
    }, []);

    useEffect(() => {
        const onDocumentKeyDown = (event: KeyboardEvent): void => {
            handleTabFocusTrapEvent(event, modalRef.current);
        };

        document.addEventListener('keydown', onDocumentKeyDown, true);

        return () => {
            document.removeEventListener('keydown', onDocumentKeyDown, true);
        };
    }, []);

    useEffect(() => {
        document.body.dataset.overlayModalOpen = 'true';
        return () => {
            delete document.body.dataset.overlayModalOpen;
        };
    }, []);

    return (
        <div
            className={`${styles.backdrop} ${overlayToneClass(headerPlateTone)}`.trim()}
            onWheel={(event) => {
                if (event.target === event.currentTarget) {
                    event.preventDefault();
                }
            }}
        >
            <section
                aria-describedby={describedBy}
                aria-labelledby={titleId}
                aria-modal="true"
                className={`${styles.modal} ${overlayToneClass(headerPlateTone)}`.trim()}
                data-testid={testId}
                ref={modalRef}
                role="dialog"
                tabIndex={-1}
            >
                <div className={styles.mainColumn}>
                    {ornamentalHeaderPlate ? (
                        <MetaFrame
                            className={`${styles.headerPlateFrame} ${headerPlateToneClass(headerPlateTone)}`.trim()}
                        >
                            <div className={styles.headerPlateWell}>
                                <ScreenTitle as="h3" className={styles.title} id={titleId} role="modal">
                                    {title}
                                </ScreenTitle>
                            </div>
                        </MetaFrame>
                    ) : (
                        <ScreenTitle as="h3" className={styles.title} id={titleId} role="modal">
                            {title}
                        </ScreenTitle>
                    )}
                    {subtitle && (
                        <p className={styles.subtitle} id={subtitleId}>
                            {subtitle}
                        </p>
                    )}
                    {children && (
                        <div className={styles.body} id={bodyId}>
                            {children}
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    {actions.map((action) => (
                        <UiButton
                            className={styles.modalAction}
                            disabled={action.disabled}
                            key={action.label}
                            onClick={action.onClick}
                            size="md"
                            variant={toUiVariant(action.variant)}
                        >
                            {action.label}
                        </UiButton>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default OverlayModal;
