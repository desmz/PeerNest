import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('discussion_attachment')
    .addColumn('discussion_attachment_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('discussion_attachment_discussion_id', 'varchar(255)', (col) =>
      col.references('discussion.discussion_id').onDelete('cascade').notNull()
    )
    .addColumn('discussion_attachment_attachment_id', 'varchar(255)', (col) =>
      col.references('attachment.attachment_id').onDelete('cascade').notNull()
    )
    .addUniqueConstraint('discussion_attachment_discussion_id_attachment_id_unique', [
      'discussion_attachment_discussion_id',
      'discussion_attachment_attachment_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('discussion_attachment').execute();
}
