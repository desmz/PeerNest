import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('role_attachment')
    .addColumn('role_attachment_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('role_attachment_role_application_id', 'varchar(255)', (col) =>
      col.references('role_application.role_application_id').onDelete('cascade').notNull()
    )
    .addColumn('role_attachment_attachment_id', 'varchar(255)', (col) =>
      col.references('attachment.attachment_id').onDelete('cascade').notNull()
    )
    .addUniqueConstraint('role_attachment_role_application_id_attachment_id_unique', [
      'role_attachment_role_application_id',
      'role_attachment_attachment_id',
    ])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('role_attachment').execute();
}
