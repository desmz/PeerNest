import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('domain')
    .addColumn('domain_id', 'varchar(255)', (col) => col.primaryKey().defaultTo(sql`gen_uuid_v7()`))
    .addColumn('domain_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('domain_created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('domain_updated_time', 'timestamptz', (col) => col)
    .addColumn('domain_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('domain').execute();
}
