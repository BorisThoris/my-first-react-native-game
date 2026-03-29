import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import styles from './OverlayModal.module.css';

interface ModalAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

interface OverlayModalProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    actions: ModalAction[];
}

const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(', ');

const getFocusableElements = (container: HTMLElement | null): HTMLElement[] => {
    if (!container) {
        return [];
    }

    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
    );
};

const OverlayModal = ({ title, subtitle, children, actions }: OverlayModalProps) => {
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
                onKeyDown={handleKeyDown}
                ref={modalRef}
                role="dialog"
                tabIndex={-1}
            >
                <h3 className={styles.title} id={titleId}>
                    {title}
                </h3>
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

                <div className={styles.actions}>
                    {actions.map((action) => (
                        <button
                            className={`${styles.button} ${styles[action.variant ?? 'primary']}`}
                            key={action.label}
                            onClick={action.onClick}
                            type="button"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default OverlayModal;
