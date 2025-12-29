import { sql } from 'kysely';

import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.createTable('relationship')
    .addColumn('relationship_id', 'varchar(255)', (col) =>
      col.primaryKey().defaultTo(sql`gen_uuid_v7()`)
    )
    .addColumn('relationship_user_id_a', 'varchar(255)', (col) =>
      col.references('user.user_id').notNull()
    )
    .addColumn('relationship_user_id_b', 'varchar(255)', (col) =>
      col.references('user.user_id').notNull()
    )
    .addColumn('relationship_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('relationship_created_time', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addUniqueConstraint('relationship_user_id_a_user_id_b_unique', [
      'relationship_user_id_a',
      'relationship_user_id_b',
    ])
    .addCheckConstraint(
      'relationship_user_id_a_user_id_b_check',
      sql`relationship_user_id_a <> relationship_user_id_b`
    )
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db.withSchema(DbSchema.DEV).schema.dropTable('relationship').execute();
}
