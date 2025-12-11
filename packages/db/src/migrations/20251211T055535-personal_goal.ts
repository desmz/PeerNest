import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('personal_goal')
    .addColumn('personal_goal_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('personal_goal_title', 'varchar(255)', (col) => col.notNull())
    .addColumn('personal_goal_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('personal_goal_description', 'text', (col) => col)
    .addColumn('personal_goal_position', 'numeric(20, 10)', (col) => col.notNull())
    .addColumn('personal_goal_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('personal_goal_updated_time', 'timestamptz', (col) => col)
    .addColumn('personal_goal_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('personal_goal').execute();
}
