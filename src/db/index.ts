import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('chat.db');

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT,
      createdAt INTEGER,
      updatedAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chatId TEXT,
      role TEXT,
      content TEXT,
      createdAt INTEGER
    );
  `);
}