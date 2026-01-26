import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('role_change_action')
    .addColumn('role_change_action_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('role_change_action_target_user_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('role_change_action_old_role_id', 'varchar(255)', (col) =>
      col.references('role.role_id').onDelete('cascade').notNull()
    )
    .addColumn('role_change_action_new_role_id', 'varchar(255)', (col) =>
      col.references('role.role_id').onDelete('cascade').notNull()
    )
    .addColumn('role_change_action_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('role_change_action_processed_by', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('role_change_action_role_application_id', 'varchar(255)', (col) =>
      col.references('role_application.role_application_id').onDelete('set null')
    )
    .addColumn('role_change_action_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('role_change_action_updated_time', 'timestamptz', (col) => col)
    .addColumn('role_change_action_deleted_time', 'timestamptz', (col) => col)
    .addCheckConstraint(
      'role_change_action_old_role_id_new_role_id_check',
      sql`role_change_action_old_role_id <> role_change_action_new_role_id`
    )
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('role_change_action').execute();
}
