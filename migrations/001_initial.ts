import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  try {
    await db.schema
      .createTable('user')
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', (col) => col.unique().notNull())
      .addColumn('password', 'text', (col) => col.notNull())
      .addColumn('type', 'integer', (col) => col.defaultTo(2).notNull())
      .addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn('disabled_at', 'text', (col) => col)
      .execute();
  } catch (error) {
    console.error(error);
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user').execute();
}
