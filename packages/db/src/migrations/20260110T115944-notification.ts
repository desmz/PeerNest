import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('notification')
    .addColumn('notification_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('notification_recipient_id', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('cascade').notNull()
    )
    .addColumn('notification_notification_type_id', 'varchar(255)', (col) =>
      col.references('notification_type.notification_type_id').onDelete('cascade').notNull()
    )
    .addColumn('notification_title', 'text', (col) => col.notNull())
    .addColumn('notification_body', 'text', (col) => col.notNull())
    .addColumn('notification_payload', 'jsonb', (col) => col.notNull())
    .addColumn('notification_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('notification_seen_time', 'timestamptz', (col) => col)
    .addColumn('notification_read_time', 'timestamptz', (col) => col)
    .addUniqueConstraint('notification_recipient_id_notification_type_id_unique', [
      'notification_recipient_id',
      'notification_notification_type_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('notification').execute();
}
