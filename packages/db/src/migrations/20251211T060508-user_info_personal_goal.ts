import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('user_info_personal_goal')
    .addColumn('user_info_personal_goal_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('user_info_personal_goal_user_info_id', 'varchar(255)', (col) =>
      col.references('user_info.user_info_id').onDelete('cascade').notNull()
    )
    .addColumn('user_info_personal_goal_personal_goal_id', 'varchar(255)', (col) =>
      col.references('personal_goal.personal_goal_id').onDelete('cascade').notNull()
    )
    .addColumn('user_info_personal_goal_position', 'numeric(20, 10)', (col) => col.notNull())
    .addColumn('user_info_personal_goal_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('user_info_personal_goal_updated_time', 'timestamptz', (col) => col)
    .addUniqueConstraint('user_info_personal_goal_user_info_id_personal_goal_id_unique', [
      'user_info_personal_goal_user_info_id',
      'user_info_personal_goal_personal_goal_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user_info_personal_goal').execute();
}
