import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('interest')
    .addColumn('interest_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('interest_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('interest_position', 'numeric(20, 10)', (col) => col.notNull())
    .addColumn('interest_created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('interest_updated_time', 'timestamptz', (col) => col)
    .addColumn('interest_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('interest').execute();
}
