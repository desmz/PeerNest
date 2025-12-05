import { promises as fs } from 'fs';
import path from 'path';

import { envObj } from '@peernest/config';
import { Kysely, Migrator, PostgresDialect, FileMigrationProvider } from 'kysely';
import { run } from 'kysely-migration-cli';
import pg from 'pg';

import { TKyselyDB } from './types';

const migrationFolder = path.join(__dirname, './migrations');

console.log(envObj.PG_DATABASE_URL);

const db = new Kysely<TKyselyDB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: envObj.PG_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder,
  }),
});

run(db, migrator, migrationFolder);
