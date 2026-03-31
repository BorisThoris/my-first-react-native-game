import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './UiButton.module.css';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'debug';
export type UiButtonSize = 'sm' | 'md' | 'lg';

export interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: UiButtonVariant;
    size?: UiButtonSize;
    fullWidth?: boolean;
    children: ReactNode;
}

const UiButton = ({
    variant = 'secondary',
    size = 'md',
    fullWidth = false,
    className = '',
    type = 'button',
    children,
    ...rest
}: UiButtonProps) => (
    <button
        className={`${styles.root} ${styles[size]} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`.trim()}
        type={type}
        {...rest}
    >
        {children}
    </button>
);

export default UiButton;
