import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('user_token')
    .addColumn('id', 'varchar(255)', (col) => col.primaryKey().defaultTo(sql`gen_uuid_v7()`))
    .addColumn('user_id', 'varchar(255)', (col) =>
      col.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('type', 'varchar(255)', (col) => col.notNull())
    .addColumn('token_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user_token').execute();
}
