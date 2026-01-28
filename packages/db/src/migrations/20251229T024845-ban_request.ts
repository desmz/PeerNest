import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('ban_request')
    .addColumn('ban_request_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('ban_request_requester_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('ban_request_banned_user_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('ban_request_status', 'varchar(255)', (col) => col.notNull())
    .addColumn('ban_request_reason', 'text', (col) => col.notNull())
    .addColumn('ban_request_proof_reference_raw', 'text', (col) => col.notNull())
    .addColumn('ban_request_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('ban_request_resolver_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('set null')
    )
    .addColumn('ban_request_resolved_time', 'timestamptz', (col) => col)
    .addCheckConstraint(
      'ban_request_requester_id_banned_user_id_check',
      sql`ban_request_requester_id <> ban_request_banned_user_id`
    )
    .addCheckConstraint(
      'ban_request_requester_id_resolver_id_check',
      sql`ban_request_requester_id <> ban_request_resolver_id`
    )
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('ban_request').execute();
}
