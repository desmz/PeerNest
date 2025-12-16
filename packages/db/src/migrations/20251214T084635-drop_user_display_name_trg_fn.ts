import { sql } from 'kysely';

import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await sql`DROP TRIGGER tsvector_display_name_trg ON "dev"."user"`.execute(db);

  await sql`DROP FUNCTION update_display_name_tsv_fn`.execute(db);
}

export async function down(db: TKyselyDB): Promise<void> {
  await db;
}
