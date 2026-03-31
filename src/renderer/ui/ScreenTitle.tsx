import { createElement, type HTMLAttributes, type ReactNode } from 'react';
import styles from './ScreenTitle.module.css';

export type ScreenTitleRole = 'display' | 'screen' | 'screenMd' | 'screenLg' | 'modal' | 'section';

export type ScreenTitleTag = 'h1' | 'h2' | 'h3';

interface ScreenTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
    role: ScreenTitleRole;
    as?: ScreenTitleTag;
}

const roleClass: Record<ScreenTitleRole, string> = {
    display: styles.display,
    screen: styles.screen,
    screenMd: styles.screenMd,
    screenLg: styles.screenLg,
    modal: styles.modal,
    section: styles.section
};

const defaultTag: Record<ScreenTitleRole, ScreenTitleTag> = {
    display: 'h1',
    screen: 'h1',
    screenMd: 'h2',
    screenLg: 'h1',
    modal: 'h3',
    section: 'h2'
};

const ScreenTitle = ({ children, role, as, className = '', ...rest }: ScreenTitleProps) => {
    const Tag = as ?? defaultTag[role];

    return createElement(
        Tag,
        {
            className: `${styles.root} ${roleClass[role]} ${className}`.trim(),
            ...rest
        },
        children
    );
};

export default ScreenTitle;
