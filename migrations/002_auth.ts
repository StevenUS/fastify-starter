import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user_session')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('user_id', 'integer', (col) =>
      col.references('user.id').onDelete('cascade').notNull(),
    )
    .addColumn('token', 'text', (col) => col.notNull())
    .addColumn('user_agent', 'text')
    .addColumn('ip_address', 'text')
    .addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .addColumn('revoked_at', 'text')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_session').execute();
}
