import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('discussion')
    .alterColumn('discussion_search_tsv', (col) => col.dropNotNull())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('discussion')
    .alterColumn('discussion_search_tsv', (col) => col.setNotNull())
    .execute();
}
