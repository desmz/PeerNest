// @ts-check

/**
 * This is the base lint-staged rules config and just includes prettier by default.
 * A good practice is to override this base configuration in each package and/or application
 * where we are able to add customization depending on the nature of the project (eslint...).
 *
 * {@link https://github.com/okonet/lint-staged#how-to-use-lint-staged-in-a-multi-package-monorepo}
 * {@link https://github.com/teableio/teable/blob/main/docs/about-lint-staged.md}
 */

import { concatFilesForPrettier, getEslintFixCmd } from '../../lint-staged.common.mjs';

/**
 * @type {Record<string, (filenames: string[]) => string | string[] | Promise<string|string[]>>}
 */
export default {
  '**/*.{ts,js,tsx,jsx,mjs,mts,cjs}': (filenames) => {
    return getEslintFixCmd({
      cwd: import.meta.dirname,
      fix: true,
      cache: true,
      cacheLocation: '../../.cache/eslint/db.eslintcache',
      // when autofixing staged-files a good tip is to disable react-hooks/exhaustive-deps, because a change here can potentially break things without proper visibility
      rules: ['react-hooks/exhaustive-deps: off'],
      maxWarnings: 30,
      files: filenames,
    });
  },
  '**/*.{json,yml,yaml,md,mdx,html,css,scss,ts,js,tsx,jsx,mjs,mts}': (filenames) => {
    return `prettier --write ${concatFilesForPrettier(filenames)}`;
  },
};
