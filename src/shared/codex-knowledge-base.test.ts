import { describe, expect, it } from 'vitest';
import { getCodexKnowledgeBaseRows } from './codex-knowledge-base';

describe('REG-095 codex knowledge base rows', () => {
    it('summarizes guide/table/deep-link depth from encyclopedia sources', () => {
        const rows = getCodexKnowledgeBaseRows();

        expect(rows.map((row) => row.id)).toEqual(['guide_depth', 'table_depth', 'deep_links', 'filter_recovery']);
        expect(rows.every((row) => row.localOnly)).toBe(true);
        expect(rows.find((row) => row.id === 'guide_depth')?.count).toBeGreaterThan(0);
        expect(rows.find((row) => row.id === 'filter_recovery')?.action).toMatch(/clear/i);
    });
});
