import { promises as fs } from 'fs';
import path from 'path';

import { envObj } from '@peernest/config/dynamic';
import { Migrator, FileMigrationProvider, Kysely, PostgresDialect } from 'kysely';
import { run } from 'kysely-migration-cli';
import pg from 'pg';

import { DB } from './types/db';

const migrationFolder = path.join(__dirname, './migrations');

export const db = new Kysely<DB>({
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
