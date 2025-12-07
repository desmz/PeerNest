import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('user')
    .addColumn('user_id', 'varchar(255)', (col) => col.primaryKey().defaultTo(sql`gen_uuid_v7()`))
    .addColumn('user_display_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('user_display_name_tsv', sql`tsvector`, (col) => col)
    .addColumn('user_password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('user_role_id', 'varchar(255)', (col) =>
      col.references('role.role_id').onDelete('set null')
    )
    .addColumn('user_email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('user_avatar_url', 'text', (col) => col.notNull())
    .addColumn('user_created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('user_updated_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('user_deleted_time', 'timestamptz', (col) => col)
    .addColumn('user_last_signed_time', 'timestamptz', (col) => col.notNull())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user').execute();
}
