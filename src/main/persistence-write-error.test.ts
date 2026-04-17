import { describe, expect, it, vi } from 'vitest';
import { createDefaultSaveData, normalizeSaveData } from '../shared/save-data';

describe('PersistenceService write failures', () => {
    it('throws PersistenceWriteError with quota when store.set throws ENOSPC', async () => {
        vi.resetModules();
        vi.doMock('electron-store', () => ({
            default: class ThrowStore {
                constructor(opts?: { defaults?: { saveData: ReturnType<typeof normalizeSaveData> } }) {
                    void opts;
                }

                get(): ReturnType<typeof normalizeSaveData> {
                    return normalizeSaveData();
                }

                set(): void {
                    const err = new Error('nospace') as NodeJS.ErrnoException;
                    err.code = 'ENOSPC';
                    throw err;
                }
            }
        }));

        const { PersistenceService, PersistenceWriteError } = await import('./persistence');
        const p = new PersistenceService();

        let thrown: unknown;
        try {
            p.saveGame(createDefaultSaveData());
        } catch (e) {
            thrown = e;
        }
        expect(thrown).toBeInstanceOf(PersistenceWriteError);
        expect((thrown as InstanceType<typeof PersistenceWriteError>).code).toBe('quota');
    });
});
