import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('comment')
    .addColumn('comment_deleted_by', 'varchar(255)', (col) =>
      col.references('user.user_id').onDelete('set null')
    )
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('comment')
    .dropColumn('comment_deleted_by')
    .execute();
}
