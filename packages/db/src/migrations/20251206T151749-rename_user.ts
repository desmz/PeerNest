import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await sql`DROP TRIGGER tsvector_display_name_trg ON "dev"."user"`.execute(db);

  await sql`DROP FUNCTION update_display_name_tsv_fn`.execute(db);

  await db.withSchema(DbSchema.DEV).schema.dropTable('user_token').execute();
  await db.withSchema(DbSchema.DEV).schema.dropTable('attachment').execute();
  await db.withSchema(DbSchema.DEV).schema.dropTable('account').execute();
  await db.withSchema(DbSchema.DEV).schema.dropTable('user').execute();
  await db.withSchema(DbSchema.DEV).schema.dropTable('role').execute();
}

export async function down(): Promise<void> {
  return;
}
