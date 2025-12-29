import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('attachment')
    .addColumn('attachment_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('attachment_owner_id', 'varchar(255)', (col) => col)
    .addColumn('attachment_path', 'text', (col) => col.notNull())
    .addColumn('attachment_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('attachment_size', 'int8', (col) => col.notNull())
    .addColumn('attachment_mimetype', 'varchar(255)', (col) => col.notNull())
    .addColumn('attachment_width', 'int8', (col) => col)
    .addColumn('attachment_height', 'int8', (col) => col)
    .addColumn('attachment_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('attachment_updated_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('attachment_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('attachment').execute();
}
