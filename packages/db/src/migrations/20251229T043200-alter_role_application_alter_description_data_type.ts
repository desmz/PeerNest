import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('role_application')
    .alterColumn('role_application_description', (col) => col.setDataType('text'))
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('role_application')
    .alterColumn('role_application_description', (col) => col.setDataType('varchar(255)'))
    .execute();
}
