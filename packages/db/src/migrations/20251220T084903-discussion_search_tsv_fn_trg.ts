import { sql } from 'kysely';

import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION update_discussion_search_tsv_fn()
    RETURNS trigger AS $$
    BEGIN
      NEW.discussion_search_tsv :=
        setweight(
          to_tsvector('english', f_unaccent(coalesce(NEW.discussion_title, ''))),
          'A'
        ) ||
        setweight(
          to_tsvector(
            'english',
            f_unaccent(substring(coalesce(NEW.discussion_content, ''), 1, 1000000))
          ),
          'B'
        );

      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;
  `.execute(db);

  await sql`
    CREATE TRIGGER update_discussion_search_tsv
    BEFORE INSERT OR UPDATE OF discussion_title, discussion_content
    ON "dev"."discussion"
    FOR EACH ROW
    EXECUTE FUNCTION update_discussion_search_tsv_fn();
  `.execute(db);

  await sql`
    CREATE INDEX discussion_search_tsv_gin_idx
    ON "dev"."discussion" USING GIN(discussion_search_tsv);
  `.execute(db);
}

export async function down(db: TKyselyDB): Promise<void> {
  await sql`DROP INDEX discussion_search_tsv_gin_idx`.execute(db);

  await sql`DROP TRIGGER tsvector_discussion_search_tsv_trg ON "dev"."discussion"`.execute(db);

  await sql`DROP FUNCTION update_discussion_search_tsv_fn`.execute(db);
}
