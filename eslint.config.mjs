import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'dist-electron/**',
            'release/**',
            'output/**',
            'node_modules/**',
            'docs/**',
            'legacy/expo-roguelike/**',
            '.idea/**',
            '.expo/**'
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname
            }
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            '@typescript-eslint/consistent-type-imports': 'warn',
            '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }]
        }
    }
);
