import { Kysely, Migrator, SqliteDialect, FileMigrationProvider } from 'kysely';
import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

declare global {
  interface ImportMeta {
    main?: boolean;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrate(dbInstance?: Kysely<any>) {
  const shouldDestory = !dbInstance;

  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '../data/db.sqlite');

  // Create database directory if it doesn't exist
  const dbDir = path.dirname(dbPath);
  await fs.mkdir(dbDir, { recursive: true });

  const db =
    dbInstance ??
    new Kysely<any>({
      dialect: new SqliteDialect({
        database: new Database(dbPath),
      }),
    });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, '../migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('Failed to migrate');
    console.error(error);
    process.exit(1);
  }

  if (shouldDestory) {
    await db.destroy();
  }
}

// Optional CLI usage
if (import.meta.main) {
  migrate().catch(console.error);
}
