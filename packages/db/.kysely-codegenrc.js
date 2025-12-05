module.exports = {
  defaultSchemas: ['dev'],
  dialect: 'postgres',
  camelCase: true,
  envFile: '../../.env',
  outFile: './src/types/db.d.ts',
  url: 'env(PG_DATABASE_URL)',
  typeOnlyImports: true,
};
