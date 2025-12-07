import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types/kysely.type';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('user')
    .addColumn('id', 'varchar(255)', (col) => col.primaryKey().defaultTo(sql`gen_uuid_v7()`))
    .addColumn('display_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user').execute();
}
