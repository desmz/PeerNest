import { sql } from 'kysely';

import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION update_display_name_tsv_fn()
    RETURNS trigger AS $$
    BEGIN
      NEW.user_display_name_tsv := to_tsvector('english', NEW.user_display_name);
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE OR REPLACE TRIGGER tsvector_display_name_trg
    BEFORE INSERT OR UPDATE ON "dev"."user"
    FOR EACH ROW
    EXECUTE FUNCTION update_display_name_tsv_fn();
  `.execute(db);
}

export async function down(db: TKyselyDB): Promise<void> {
  await sql`DROP TRIGGER tsvector_display_name_trg ON "dev"."user"`.execute(db);

  await sql`DROP FUNCTION update_display_name_tsv_fn`.execute(db);
}
