import type { ReactNode } from 'react';
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

const OverlayModal = ({ title, subtitle, children, actions }: OverlayModalProps) => (
    <div className={styles.backdrop}>
        <section className={styles.modal}>
            <h3 className={styles.title}>{title}</h3>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {children && <div className={styles.body}>{children}</div>}

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

export default OverlayModal;
