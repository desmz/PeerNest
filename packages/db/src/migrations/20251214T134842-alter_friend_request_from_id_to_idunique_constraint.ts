import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('friend_request')
    .dropConstraint('friend_request_from_id_to_id_unique')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.createIndex('friend_request_from_id_to_id_unique')
    .unique()
    .on('friend_request')
    .expression(
      sql`
      LEAST(friend_request_from_id, friend_request_to_id),
      GREATEST(friend_request_from_id, friend_request_to_id)
      `
    )
    .where(sql.ref('friend_request_status'), '=', 'pending')
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.dropIndex('friend_request_from_id_to_id_unique')
    .execute();
}
