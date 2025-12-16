import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('friend_request')
    .addColumn('friend_request_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('friend_request_from_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('friend_request_to_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('friend_request_status', 'varchar(255)', (col) => col.notNull())
    .addColumn('friend_request_matched_by_system', 'boolean', (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn('friend_request_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('friend_request_resolved_time', 'timestamptz', (col) => col)
    .addUniqueConstraint('friend_request_from_id_to_id_unique', [
      'friend_request_from_id',
      'friend_request_to_id',
    ])
    .addCheckConstraint(
      'friend_request_from_id_to_id_check',
      sql`friend_request_from_id <> friend_request_to_id`
    )
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('friend_request').execute();
}
