import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('achievement_category')
    .addColumn('achievement_category_position', 'numeric(20, 10)', (col) => col.notNull())
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('achievement')
    .addColumn('achievement_position', 'numeric(20, 10)', (col) => col.notNull())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('achievement_category')
    .dropColumn('achievement_category_position')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('achievement')
    .dropColumn('achievement_position')
    .execute();
}
