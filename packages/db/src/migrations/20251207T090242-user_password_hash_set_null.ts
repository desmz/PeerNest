import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('user')
    .alterColumn('user_password_hash', (col) => col.dropNotNull())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('user')
    .alterColumn('user_password_hash', (col) => col.setNotNull())
    .execute();
}
