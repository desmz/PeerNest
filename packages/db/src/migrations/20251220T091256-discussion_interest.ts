import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('discussion_interest')
    .addColumn('discussion_interest_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('discussion_interest_discussion_id', 'varchar(255)', (col) =>
      col.references('discussion.discussion_id').onDelete('cascade').notNull()
    )
    .addColumn('discussion_interest_interest_id', 'varchar(255)', (col) =>
      col.references('interest.interest_id').onDelete('cascade').notNull()
    )
    .addColumn('discussion_interest_position', 'numeric(20, 10)', (col) => col.notNull())
    .addUniqueConstraint('discussion_interest_discussion_id_interest_id_unique', [
      'discussion_interest_discussion_id',
      'discussion_interest_interest_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('discussion_interest').execute();
}
