import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('achievement_category')
    .addColumn('achievement_category_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('achievement_category_name', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('achievement_category_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('achievement_category_updated_time', 'timestamptz', (col) => col)
    .addColumn('achievement_category_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('achievement_category').execute();
}
