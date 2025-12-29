import { sql } from 'kysely';

import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  // Create unaccent extension
  await sql`CREATE EXTENSION IF NOT EXISTS unaccent`.execute(db);

  // Create pg_trgm extension
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);

  // Create IMMUTABLE wrapper function for unaccent
  // This allows us to create indexes on unaccented columns for better performance
  // https://stackoverflow.com/a/11007216/8299075
  await sql`
    CREATE OR REPLACE FUNCTION f_unaccent(text) RETURNS text
    AS $$
      SELECT unaccent('unaccent', $1);
    $$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;
  `.execute(db);
}

export async function down(db: TKyselyDB): Promise<void> {
  await sql`DROP FUNCTION IF EXISTS f_unaccent(text)`.execute(db);

  await sql`DROP EXTENSION IF EXISTS pg_trgm`.execute(db);

  await sql`DROP EXTENSION IF EXISTS unaccent`.execute(db);
}
