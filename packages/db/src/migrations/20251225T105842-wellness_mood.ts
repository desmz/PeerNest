import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('wellness_mood')
    .addColumn('wellness_mood_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('wellness_mood_name', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('wellness_mood_position', 'numeric(20, 10)', (col) => col.notNull())
    .addColumn('wellness_mood_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('wellness_mood_updated_time', 'timestamptz', (col) => col)
    .addColumn('wellness_mood_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('wellness_mood').execute();
}
