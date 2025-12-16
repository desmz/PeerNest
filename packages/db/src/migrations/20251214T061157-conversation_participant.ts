import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

// todo: add last_read_message_id column
export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('conversation_participant')
    .addColumn('conversation_participant_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('conversation_participant_conversation_id', 'varchar(255)', (col) =>
      col.references('conversation.conversation_id').onDelete('cascade').notNull()
    )
    .addColumn('conversation_participant_participant_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('conversation_participant_role', 'varchar(255)', (col) => col.notNull())
    .addColumn('conversation_participant_joined_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addUniqueConstraint('conversation_participant_conversation_id_participant_id_unique', [
      'conversation_participant_conversation_id',
      'conversation_participant_participant_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('conversation_participant').execute();
}
