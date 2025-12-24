import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('comment')
    .dropConstraint('comment_author_id_discussion_id_unique')
    .ifExists()
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('comment')
    .addUniqueConstraint('comment_author_id_discussion_id_unique', [
      'comment_author_id',
      'comment_discussion_id',
    ])
    .execute();
}
