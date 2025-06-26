import { Kysely, SqliteDialect } from 'kysely';
import { config } from 'dotenv';
import { hashPassword } from '../src/lib/argon.js';
import Database from 'better-sqlite3';
import { Database as DB } from '../src/types/database.js';

// Load environment variables from .env
config();

async function createAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const dbPath = process.env.SQLITE_PATH;

  if (!adminUsername || !adminPassword || !dbPath) {
    console.error('Error: ADMIN_USERNAME, ADMIN_PASSWORD, and SQLITE_PATH must be set in .env');
    process.exit(1);
  }

  console.log(dbPath);

  // Use the same database connection approach as in migrate.ts
  const db = new Kysely<DB>({
    dialect: new SqliteDialect({
      database: new Database(dbPath),
    }),
  });

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .selectFrom('user')
      .select('id')
      .where('name', '=', adminUsername)
      .executeTakeFirst();

    if (existingAdmin) {
      console.log(`Admin user "${adminUsername}" already exists.`);
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    await db
      .insertInto('user')
      .values({
        name: adminUsername,
        password: hashedPassword,
        type: 1, // Admin type
      })
      .execute();

    console.log(`Admin user "${adminUsername}" created successfully.`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

createAdmin().catch(console.error);
