import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        'main/index': 'src/main/index.ts',
        'preload/index': 'src/preload/index.ts'
    },
    outDir: 'dist-electron',
    format: ['cjs'],
    target: 'node20',
    platform: 'node',
    sourcemap: true,
    clean: true,
    splitting: false,
    dts: false,
    external: ['electron', 'steamworks.js']
});
