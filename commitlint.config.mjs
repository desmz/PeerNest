//* commit naming convention guide: https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build', // affect build components like build tool, ci pipeline, dependencies, project version, etc
        'chore', // miscellaneous commits e.g. modifying .gitignore
        'ci', // affect operational components like infrastructure, deployment, backup, recovery
        'docs', // affect documentation only
        'feat', // add or remove a new feature to the app
        'fix', // fix a bug in the app
        'perf', // rewrite/restructure your code, however do not change any app behavior
        'refactor', // special refactor commits, that improve performance
        'revert', // revert a previous commit
        'security', // commit related to security
        'style', // commit do not affect the meaning (white-space, formatting, missing semi-colons, etc)
        'test', // add missing tests or correcting existing tests
        'translation', // commit related to translation
      ],
    ],
  },
};
