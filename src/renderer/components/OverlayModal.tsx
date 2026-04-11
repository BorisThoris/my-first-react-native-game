import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { getFocusableElements } from '../a11y/focusables';
import { ScreenTitle, UiButton, type UiButtonVariant } from '../ui';
import styles from './OverlayModal.module.css';

interface ModalAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
}

interface OverlayModalProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    actions: ModalAction[];
    /** Optional stable hook for e2e (applied to the dialog surface). */
    testId?: string;
}

const toUiVariant = (variant: ModalAction['variant']): UiButtonVariant => {
    if (variant === 'danger') {
        return 'danger';
    }

    if (variant === 'secondary') {
        return 'secondary';
    }

    return 'primary';
};

const OverlayModal = ({ title, subtitle, children, actions, testId }: OverlayModalProps) => {
    const modalRef = useRef<HTMLElement | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const subtitleId = useId();
    const bodyId = useId();
    const describedBy = [subtitle ? subtitleId : null, children ? bodyId : null].filter(Boolean).join(' ') || undefined;

    useEffect(() => {
        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const focusInitialElement = window.requestAnimationFrame(() => {
            const focusableElements = getFocusableElements(modalRef.current);
            const initialFocusTarget = focusableElements[0] ?? modalRef.current;
            initialFocusTarget?.focus();
        });

        return () => {
            window.cancelAnimationFrame(focusInitialElement);
            previousFocusRef.current?.focus();
        };
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
        if (event.key !== 'Tab') {
            return;
        }

        const focusableElements = getFocusableElements(modalRef.current);

        if (focusableElements.length === 0) {
            event.preventDefault();
            modalRef.current?.focus();
            return;
        }

        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        const lastIndex = focusableElements.length - 1;

        if (event.shiftKey) {
            if (currentIndex <= 0) {
                event.preventDefault();
                focusableElements[lastIndex]?.focus();
            }

            return;
        }

        if (currentIndex === -1 || currentIndex === lastIndex) {
            event.preventDefault();
            focusableElements[0]?.focus();
        }
    };

    return (
        <div className={styles.backdrop}>
            <section
                aria-describedby={describedBy}
                aria-labelledby={titleId}
                aria-modal="true"
                className={styles.modal}
                data-testid={testId}
                onKeyDown={handleKeyDown}
                ref={modalRef}
                role="dialog"
                tabIndex={-1}
            >
                <div className={styles.mainColumn}>
                    <ScreenTitle className={styles.title} id={titleId} role="modal">
                        {title}
                    </ScreenTitle>
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
