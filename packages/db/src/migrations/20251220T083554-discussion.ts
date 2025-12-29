import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('discussion')
    .addColumn('discussion_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('discussion_author_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('discussion_title', 'varchar(255)', (col) => col.notNull())
    .addColumn('discussion_content', 'text', (col) => col.notNull())
    .addColumn('discussion_search_tsv', sql`tsvector`, (col) => col.notNull())
    .addColumn('discussion_status', 'varchar(255)', (col) => col.notNull())
    .addColumn('discussion_archived_by', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('set null')
    )
    .addColumn('discussion_archived_time', 'timestamptz', (col) => col)
    .addColumn('discussion_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('discussion_updated_time', 'timestamptz', (col) => col)
    .addColumn('discussion_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('discussion').execute();
}
