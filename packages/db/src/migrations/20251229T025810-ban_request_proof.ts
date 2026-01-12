import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('ban_request_proof')
    .addColumn('ban_request_proof_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('ban_request_proof_ban_request_id', 'varchar(255)', (col) =>
      col.references('ban_request.ban_request_id').onDelete('cascade').notNull()
    )
    .addColumn('ban_request_proof_resource_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('ban_request_proof_resource_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('ban_request_proof_reference_raw', 'text', (col) => col.notNull())
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('ban_request_proof').execute();
}
