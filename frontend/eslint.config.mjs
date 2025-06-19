// frontend/eslint.config.mjs
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '.next/',
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      // We will NOT ignore JSON, MD, CSS here if Prettier CLI needs to see them,
      // but ESLint itself should not try to parse them as JS/TS.
    ],
  },
  {
    files: ['**/*.mjs', '**/*.js', '**/*.cjs'],
    ...js.configs.recommended,
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, React: 'readonly' },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    settings: { react: { version: 'detect' } },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...compat.extends('next/core-web-vitals')[0],
  },
  {
    // Prettier integration - ONLY for JS/TS files that ESLint can parse
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'], // <<<--- KEY CHANGE HERE
    plugins: { prettier: prettierPlugin },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },
];

export default eslintConfig;
