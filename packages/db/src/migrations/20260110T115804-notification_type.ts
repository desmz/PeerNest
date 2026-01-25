import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('notification_type')
    .addColumn('notification_type_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('notification_type_notification_category_id', 'varchar(255)', (col) =>
      col.references('notification_category.notification_category_id').onDelete('cascade').notNull()
    )
    .addColumn('notification_type_name', 'varchar(255)', (col) => col.unique().notNull())
    .addColumn('notification_type_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('notification_type_updated_time', 'timestamptz', (col) => col)
    .addColumn('notification_type_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('notification_type').execute();
}
