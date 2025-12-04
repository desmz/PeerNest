import nx from '@nx/eslint-plugin';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import * as tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

import prettierConfig from './prettier-config.eslint.mjs';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/vite.config.*.timestamp*'],
  },
  // base configuration
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          globalReturn: false,
        },
        ecmaVersion: 2022,
        project: [
          './tsconfig.json',
          './tsconfig.base.json',
          './apps/**/tsconfig.app.json',
          './packages/**/tsconfig.app.json',
        ],
        tsconfigRootDir: import.meta.dirname, // <-- Important for monorepos
        sourceType: 'module',
      },
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },

  // TypeScript ESLint recommended rules
  {
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    ignores: ['**/vite.config.mts'],
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/ban-tslint-comment': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: false }],
      '@typescript-eslint/no-empty-function': ['error', { allow: ['private-constructors'] }],
      '@typescript-eslint/consistent-type-exports': 'error',
      // '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Note: you must disable the base rule as it can report incorrect errors, https://typescript-eslint.io/rules/no-unused-vars/#options
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            arguments: false,
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['function'],
          format: ['camelCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['enum', 'enumMember'],
          format: ['PascalCase'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
        },
        {
          selector: 'classProperty',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'objectLiteralProperty',
          format: ['camelCase', 'snake_case', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allowSingleOrDouble',
          trailingUnderscore: 'allowSingleOrDouble',
        },
        {
          selector: ['interface'],
          format: ['PascalCase'],
          prefix: ['I'],
        },
        {
          selector: ['typeAlias'],
          format: ['PascalCase'],
          prefix: ['T'],
        },
        {
          selector: ['typeProperty'],
          format: ['camelCase'],
          leadingUnderscore: 'allowDouble',
        },
        {
          selector: ['typeParameter'],
          format: ['PascalCase'],
        },
        {
          selector: 'classProperty',
          modifiers: ['public', 'static'],
          format: ['UPPER_CASE'],
        },
        {
          selector: 'parameter',
          modifiers: ['unused'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],
    },
  },

  // import order
  {
    plugins: {
      import: importPlugin,
    },
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  ...prettierConfig,
];
