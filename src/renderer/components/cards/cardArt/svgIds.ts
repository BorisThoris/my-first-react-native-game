import { useId } from 'react';

/** SVG/XML `id` must avoid `:` from React `useId()`. */
export function useSvgInstancePrefix(prefix: string): string {
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    return `${prefix}${id}`;
}
