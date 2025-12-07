import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user').execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('user')
    .addColumn('id', 'varchar(255)', (col) => col.primaryKey().defaultTo(sql`gen_uuid_v7()`))
    .addColumn('display_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('display_name_tsv', sql`tsvector`, (col) => col)
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('role_id', 'varchar(255)', (col) => col.references('role.id').onDelete('set null'))
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('avatar_url', 'text', (col) => col.notNull())
    .addColumn('created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('deleted_time', 'timestamptz', (col) => col)
    .addColumn('last_signed_time', 'timestamptz', (col) => col.notNull())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user').execute();
}
