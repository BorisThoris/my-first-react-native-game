import type { HTMLAttributes, ReactNode } from 'react';
import styles from './AccentBanner.module.css';

interface AccentBannerProps extends HTMLAttributes<HTMLParagraphElement> {
    children: ReactNode;
    compact?: boolean;
}

const AccentBanner = ({ children, compact = false, className = '', ...rest }: AccentBannerProps) => (
    <p className={`${styles.root} ${compact ? styles.compact : ''} ${className}`.trim()} {...rest}>
        {children}
    </p>
);

export default AccentBanner;
