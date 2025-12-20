import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('comment')
    .addColumn('comment_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('comment_author_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('comment_discussion_id', 'varchar(255)', (col) =>
      col.references('discussion.discussion_id').onDelete('cascade').notNull()
    )
    .addColumn('comment_parent_comment_id', 'varchar(255)', (col) =>
      col.references('comment.comment_id').onDelete('cascade')
    )
    .addColumn('comment_content', 'text', (col) => col.notNull())
    .addColumn('comment_created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('comment_updated_time', 'timestamptz', (col) => col)
    .addColumn('comment_deleted_time', 'timestamptz', (col) => col)
    .addUniqueConstraint('comment_author_id_discussion_id_unique', [
      'comment_author_id',
      'comment_discussion_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('comment').execute();
}
