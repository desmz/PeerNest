import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('achievement')
    .addColumn('achievement_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('achievement_achievement_category_id', 'varchar(255)', (col) =>
      col.references('achievement_category.achievement_category_id').onDelete('cascade').notNull()
    )
    .addColumn('achievement_title', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('achievement_description', 'text', (col) => col.notNull())
    .addColumn('achievement_criteria', 'jsonb', (col) => col)
    .addColumn('achievement_is_active', 'boolean', (col) => col.notNull().defaultTo(sql`TRUE`))
    .addColumn('achievement_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('achievement_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('achievement_updated_time', 'timestamptz', (col) => col)
    .addColumn('achievement_deleted_time', 'timestamptz', (col) => col)
    .addCheckConstraint(
      'achievement_criteria_nullable_check',
      sql`
        (achievement_is_active = TRUE AND achievement_criteria IS NOT NULL) OR 
        achievement_is_active = FALSE
      `
    )
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('achievement').execute();
}
