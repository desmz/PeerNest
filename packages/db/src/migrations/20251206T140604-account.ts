import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('account')
    .addColumn('id', 'varchar(255)', (col) => col.primaryKey().defaultTo(sql`gen_uuid_v7()`))
    .addColumn('user_id', 'varchar(255)', (col) =>
      col.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('type', 'varchar(255)', (col) => col.notNull())
    .addColumn('provider', 'varchar(255)', (col) => col.notNull())
    .addColumn('provider_user_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_time', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('deleted_time', 'timestamptz', (col) => col)
    .addUniqueConstraint('account_provider_provider_user_id_unique', [
      'provider',
      'provider_user_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('account').execute();
}
