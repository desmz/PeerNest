import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('role_application')
    .addColumn('role_application_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('role_application_applicant_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('role_application_applied_role_id', 'varchar(255)', (col) =>
      col.references('role.role_id').onDelete('cascade').notNull()
    )
    .addColumn('role_application_status', 'varchar(255)', (col) => col.notNull())
    .addColumn('role_application_description', 'varchar(255)', (col) => col)
    .addColumn('role_application_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('role_application_processed_time', 'timestamptz', (col) => col)
    .addColumn('role_application_processed_by', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('set null')
    )
    .addColumn('role_application_updated_time', 'timestamptz', (col) => col)
    .addColumn('role_application_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('role_application').execute();
}
