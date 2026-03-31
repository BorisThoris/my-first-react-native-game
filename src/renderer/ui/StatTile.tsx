import type { HTMLAttributes, ReactNode } from 'react';
import styles from './StatTile.module.css';

export type StatTileDensity = 'default' | 'compact' | 'dense' | 'modalChild';

interface StatTileProps extends HTMLAttributes<HTMLElement> {
    label: string;
    value: ReactNode;
    density?: StatTileDensity;
    valueAccent?: boolean;
    valueLg?: boolean;
    /** Puts the numeric/title line above the caption (modal stat grids). */
    valueFirst?: boolean;
}

const StatTile = ({
    label,
    value,
    density = 'default',
    valueAccent = false,
    valueLg = false,
    valueFirst = false,
    className = '',
    ...rest
}: StatTileProps) => (
    <article
        className={`${styles.root} ${density === 'compact' ? styles.compact : ''} ${density === 'dense' ? styles.dense : ''} ${density === 'modalChild' ? styles.modalChild : ''} ${valueFirst ? styles.valueFirst : ''} ${className}`.trim()}
        {...rest}
    >
        <span className={styles.label}>{label}</span>
        <strong
            className={`${styles.value} ${valueAccent ? styles.valueAccent : ''} ${valueLg ? styles.valueLg : ''}`.trim()}
        >
            {value}
        </strong>
    </article>
);

export default StatTile;
