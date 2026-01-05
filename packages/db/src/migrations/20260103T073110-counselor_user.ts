import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('counselor_user')
    .addColumn('counselor_user_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('counselor_user_counselor_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('counselor_user_user_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('counselor_user_note', 'text', (col) => col)
    .addColumn('counselor_user_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('counselor_user_updated_time', 'timestamptz', (col) => col)
    .addColumn('counselor_user_released_time', 'timestamptz', (col) => col)
    .addCheckConstraint(
      'counselor_user_counselor_id_user_id_check',
      sql`counselor_user_counselor_id <> counselor_user_user_id`
    )
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('counselor_user').execute();
}
