import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('ban_action')
    .addColumn('ban_action_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('ban_action_banned_user_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('ban_action_ban_request_id', 'varchar(255)', (col) =>
      col.references('ban_request.ban_request_id').onDelete('set null')
    )
    .addColumn('ban_action_banned_by', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('ban_action_reason', 'text', (col) => col.notNull())
    .addColumn('ban_action_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('ban_action_updated_time', 'timestamptz', (col) => col)
    .addColumn('ban_action_ban_start_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('ban_action_ban_end_time', 'timestamptz', (col) => col)
    .addCheckConstraint(
      'ban_action_banned_user_id_banned_by_check',
      sql`ban_action_banned_user_id <> ban_action_banned_by`
    )
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('ban_action').execute();
}
