import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('user_achievement')
    .addColumn('user_achievement_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('user_achievement_user_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('user_achievement_achievement_id', 'varchar(255)', (col) =>
      col.references('achievement.achievement_id').onDelete('cascade').notNull()
    )
    .addColumn('user_achievement_is_visible', 'boolean', (col) =>
      col.notNull().defaultTo(sql`FALSE`)
    )
    .addColumn('user_achievement_awarded_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('user_achievement_updated_time', 'timestamptz', (col) => col)
    .addUniqueConstraint('user_achievement_user_id_achievement_id_unique', [
      'user_achievement_user_id',
      'user_achievement_achievement_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user_achievement').execute();
}
