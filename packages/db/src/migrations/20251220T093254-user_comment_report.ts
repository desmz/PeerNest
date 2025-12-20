import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('user_comment_report')
    .addColumn('user_comment_report_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('user_comment_report_reporter_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('user_comment_report_comment_id', 'varchar(255)', (col) =>
      col.references('comment.comment_id').onDelete('cascade').notNull()
    )
    .addColumn('user_comment_report_status', 'varchar(255)', (col) => col.notNull())
    .addColumn('user_comment_report_reported_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('user_comment_report_resolver_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('set null')
    )
    .addColumn('user_comment_report_resolved_time', 'timestamptz', (col) => col)
    .addUniqueConstraint('user_comment_report_reporter_id_comment_id_unique', [
      'user_comment_report_reporter_id',
      'user_comment_report_comment_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('user_comment_report').execute();
}
