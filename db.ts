import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('todos.db');

export async function initDB(): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      created_at INTEGER
    );
  `);
}

export default db;
