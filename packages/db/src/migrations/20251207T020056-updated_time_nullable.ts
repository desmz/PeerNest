import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('user')
    .alterColumn('user_updated_time', (col) => col.dropNotNull())
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('account')
    .alterColumn('account_updated_time', (col) => col.dropNotNull())
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('attachment')
    .alterColumn('attachment_updated_time', (col) => col.dropNotNull())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('user')
    .alterColumn('user_updated_time', (col) => col.setNotNull())
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('account')
    .alterColumn('account_updated_time', (col) => col.setNotNull())
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('attachment')
    .alterColumn('attachment_updated_time', (col) => col.setNotNull())
    .execute();
}
