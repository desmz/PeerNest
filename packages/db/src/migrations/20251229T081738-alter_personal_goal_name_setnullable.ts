import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('personal_goal')
    .alterColumn('personal_goal_name', (col) => col.dropNotNull())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('personal_goal')
    .alterColumn('personal_goal_name', (col) => col.setNotNull())
    .execute();
}
