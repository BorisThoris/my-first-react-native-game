import { describe, expect, it, vi } from 'vitest';
import metaStyles from './MetaScreen.module.css';
import { getMetaSubscreenLayout } from './metaStackedShellLayout';

vi.mock('./MetaScreen.module.css', () => ({
    default: {
        shellInRunModal: 'shell-in-run',
        shellMetaStage: 'shell-meta-stage'
    }
}));

describe('getMetaSubscreenLayout', () => {
    const inRun = { panel: 'panel-class', hero: 'hero-class' } as const;

    it('when stacked on gameplay uses in-run shell and framed panel classes', () => {
        const layout = getMetaSubscreenLayout(true, inRun);
        expect(layout.shellStageClass).toBe(metaStyles.shellInRunModal);
        expect(layout.panelClassName).toBe('panel-class');
        expect(layout.heroPanelClassName).toBe('hero-class');
        expect(layout.titleLevel).toBe('h2');
    });

    it('when not stacked uses meta stage and empty panel classes', () => {
        const layout = getMetaSubscreenLayout(false, inRun);
        expect(layout.shellStageClass).toBe(metaStyles.shellMetaStage);
        expect(layout.panelClassName).toBe('');
        expect(layout.heroPanelClassName).toBe('');
        expect(layout.titleLevel).toBe('h1');
    });
});
