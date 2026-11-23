import * as SQLite from 'expo-sqlite';

let initialized = false;
const dbPromise = SQLite.openDatabaseAsync('kulinara.db');

export async function getDb() {
  const db = await dbPromise;
  if (!initialized) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        weight TEXT,
        expirationDate TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL,
        source TEXT NOT NULL,
        notificationIds TEXT
      );
    `);
    await db.execAsync('ALTER TABLE items ADD COLUMN weight TEXT;').catch(() => {
      // Column already exists on databases created after this migration.
    });
    initialized = true;
  }
  return db;
}
