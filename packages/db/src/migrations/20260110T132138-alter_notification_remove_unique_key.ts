import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('notification')
    .dropConstraint('notification_recipient_id_notification_type_id_unique')
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('notification')
    .addUniqueConstraint('notification_recipient_id_notification_type_id_unique', [
      'notification_recipient_id',
      'notification_notification_type_id',
    ])
    .execute();
}
