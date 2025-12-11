import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('user_info')
    .addColumn('user_info_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('user_info_user_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('user_info_pronoun_id', 'varchar(255)', (col) =>
      col.references('pronoun.pronoun_id').onDelete('set null')
    )
    .addColumn('user_info_university_id', 'varchar(255)', (col) =>
      col.references('university.university_id').onDelete('set null')
    )
    .addColumn('user_info_domain_id', 'varchar(255)', (col) =>
      col.references('domain.domain_id').onDelete('set null')
    )
    .addColumn('user_info_bio', 'text', (col) => col)
    .addColumn('user_info_looking_for', 'text', (col) => col)
    .addColumn('user_info_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('user_info_updated_time', 'timestamptz', (col) => col)
    .addColumn('user_info_deleted_time', 'timestamptz', (col) => col)
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user_info').execute();
}
