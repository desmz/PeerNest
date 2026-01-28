import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('check_in')
    .addColumn('check_in_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('check_in_user_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('check_in_mood_rating', 'int8', (col) => col.notNull())
    .addColumn('check_in_sleep_quality_rating', 'int8', (col) => col)
    .addColumn('check_in_sleep_time', sql`interval`, (col) => col)
    .addColumn('check_in_check_in_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('check_in_created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('check_in_updated_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('check_in').execute();
}
