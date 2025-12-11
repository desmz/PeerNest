import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('pronoun')
    .addColumn('pronoun_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('pronoun_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('pronoun_created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('pronoun_updated_time', 'timestamptz', (col) => col)
    .addColumn('pronoun_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('pronoun').execute();
}
