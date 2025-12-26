import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('check_in_wellness_mood')
    .dropConstraint('check_in_wellness_mood_check_in_id_wellness_mood_id_unique')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('check_in_wellness_mood')
    .dropColumn('check_in_wellness_mood_check_in_id')
    .dropColumn('check_in_wellness_mood_wellness_mood_id')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('check_in_wellness_mood')
    .addColumn('check_in_wellness_mood_check_in_id', 'varchar(255)', (col) =>
      col.references('check_in.check_in_id').onDelete('cascade').notNull()
    )
    .addColumn('check_in_wellness_mood_wellness_mood_id', 'varchar(255)', (col) =>
      col.references('wellness_mood.wellness_mood_id').onDelete('cascade').notNull()
    )
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.createIndex('check_in_wellness_mood_check_in_id_wellness_mood_id_unique')
    .on('check_in_wellness_mood')
    .columns(['check_in_wellness_mood_check_in_id', 'check_in_wellness_mood_wellness_mood_id'])
    .unique()
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('check_in_wellness_mood')
    .dropConstraint('check_in_wellness_mood_check_in_id_wellness_mood_id_unique')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('check_in_wellness_mood')
    .dropColumn('check_in_wellness_mood_check_in_id')
    .dropColumn('check_in_wellness_mood_wellness_mood_id')
    .execute();
}
