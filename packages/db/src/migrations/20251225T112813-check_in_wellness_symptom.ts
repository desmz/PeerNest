//* the file name is wrong by accident

import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('check_in_wellness_factor')
    .addColumn('check_in_wellness_factor_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('check_in_wellness_factor_check_in_id', 'varchar(255)', (col) =>
      col.references('check_in.check_in_id').onDelete('cascade').notNull()
    )
    .addColumn('check_in_wellness_factor_wellness_factor_id', 'varchar(255)', (col) =>
      col.references('wellness_factor.wellness_factor_id').onDelete('cascade').notNull()
    )
    .addUniqueConstraint('check_in_wellness_factor_check_in_id_wellness_factor_id_unique', [
      'check_in_wellness_factor_check_in_id',
      'check_in_wellness_factor_wellness_factor_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('check_in_wellness_factor').execute();
}
