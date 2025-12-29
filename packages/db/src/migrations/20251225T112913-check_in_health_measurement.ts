import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('check_in_health_measurement')
    .addColumn('check_in_health_measurement_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('check_in_health_measurement_check_in_id', 'varchar(255)', (col) =>
      col.references('check_in.check_in_id').onDelete('cascade').notNull()
    )
    .addColumn('check_in_health_measurement_heart_rate', 'int8', (col) => col)
    .addColumn('check_in_health_measurement_step_count', 'int8', (col) => col)
    .addColumn('check_in_health_measurement_weight', 'numeric(10, 2)', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('check_in_health_measurement').execute();
}
