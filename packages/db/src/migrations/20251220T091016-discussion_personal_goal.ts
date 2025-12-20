import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('discussion_personal_goal')
    .addColumn('discussion_personal_goal_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('discussion_personal_goal_discussion_id', 'varchar(255)', (col) =>
      col.references('discussion.discussion_id').onDelete('cascade').notNull()
    )
    .addColumn('discussion_personal_goal_personal_goal_id', 'varchar(255)', (col) =>
      col.references('personal_goal.personal_goal_id').onDelete('cascade').notNull()
    )
    .addColumn('discussion_personal_goal_position', 'numeric(20, 10)', (col) => col.notNull())
    .addUniqueConstraint('discussion_personal_goal_discussion_id_personal_goal_id_unique', [
      'discussion_personal_goal_discussion_id',
      'discussion_personal_goal_personal_goal_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('discussion_personal_goal').execute();
}
