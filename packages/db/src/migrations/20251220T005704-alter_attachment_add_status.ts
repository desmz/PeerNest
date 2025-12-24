import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('attachment')
    .addColumn('attachment_status', 'varchar(255)', (col) => col.notNull().defaultTo('ready'))
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('attachment')
    .alterColumn('attachment_status', (col) => col.dropDefault())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('attachment')
    .dropColumn('attachment_status')
    .execute();
}
