import { DbSchema } from '../config';
import { TKyselyDB } from '../types';

export async function up(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('pronoun')
    .addUniqueConstraint('pronoun_name_unique', ['pronoun_name'])
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('university')
    .addUniqueConstraint('university_name_unique', ['university_name'])
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('domain')
    .addUniqueConstraint('domain_name_unique', ['domain_name'])
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('interest')
    .addUniqueConstraint('interest_name_unique', ['interest_name'])
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('personal_goal')
    .addUniqueConstraint('personal_goal_title_unique', ['personal_goal_title'])
    .execute();
}

export async function down(db: TKyselyDB): Promise<void> {
  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('pronoun')
    .dropConstraint('pronoun_name_unique')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('university')
    .dropConstraint('university_name_unique')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('domain')
    .dropConstraint('domain_name_unique')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('interest')
    .dropConstraint('interest_name_unique')
    .execute();

  await db
    .withSchema(DbSchema.DEV)
    .schema.alterTable('personal_goal')
    .dropConstraint('personal_goal_title_unique')
    .execute();
}
