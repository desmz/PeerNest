import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('account')
    .addColumn('account_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('account_user_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('account_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('account_provider', 'varchar(255)', (col) => col.notNull())
    .addColumn('account_provider_user_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('account_created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('account_updated_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('account_deleted_time', 'timestamptz', (col) => col)
    .addUniqueConstraint('account_provider_provider_user_id_unique', [
      'account_provider',
      'account_provider_user_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('account').execute();
}
