import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types/kysely.type';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('role')
    .addColumn('role_id', 'varchar(255)', (col) => col.primaryKey().defaultTo(sql`gen_uuid_v7()`))
    .addColumn('role_name', 'varchar', (col) => col.unique().notNull())
    .addColumn('role_rank', 'int8', (col) => col.notNull())
    .addColumn('role_created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('role_updated_time', 'timestamptz', (col) => col)
    .addColumn('role_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('role').execute();
}
