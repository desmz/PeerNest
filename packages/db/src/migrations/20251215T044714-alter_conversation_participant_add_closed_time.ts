import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('conversation_participant')
    .addColumn('conversation_participant_closed_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('conversation_participant')
    .dropColumn('conversation_participant_closed_time')
    .execute();
}
