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

export async function seedTodos(): Promise<void> {
  const result = await db.getAllAsync('SELECT COUNT(*) as count FROM todos') as Array<{ count: number }>;
  const count = result && result.length > 0 ? result[0].count : 0;
//   if (count === 0) {
//     const now = Date.now();
//     await db.runAsync(
//       'INSERT INTO todos (title, done, created_at) VALUES (?, ?, ?)',
//       ['Mẫu công việc 1', 0, now]
//     );
//     await db.runAsync(
//       'INSERT INTO todos (title, done, created_at) VALUES (?, ?, ?)',
//       ['Mẫu công việc 2', 0, now]
//     );
//   }
}

export default db;
