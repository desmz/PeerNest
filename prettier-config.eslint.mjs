// @ts-nocheck
/**
 * Custom config base for projects using prettier.
 * @see https://github.com/belgattitude/nextjs-monorepo-example/tree/main/packages/eslint-config-bases
 */
import prettierPlugin from "eslint-plugin-prettier";

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */

const prettierBaseConfig = {
  $schema: "https://json.schemastore.org/prettierrc",
  singleQuote: true,
  jsxSingleQuote: true,
  semi: true,
  printWidth: 100,
  tabWidth: 2,
  bracketSpacing: true,
  trailingComma: "es5",
  bracketSameLine: true,
  useTabs: false,
  endOfLine: "lf",
  arrowParens: "always",
  overrides: [],
};

export default [
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      "prettier/prettier": ["error", prettierBaseConfig],
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
];
