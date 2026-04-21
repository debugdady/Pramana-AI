import { db } from './index';

import type { ChatSession } from '@/src/store/chatStore';

// 🆕 create session
export function createSession(session: ChatSession) {
  db.runSync(
    `INSERT INTO sessions (id, title, createdAt, updatedAt)
     VALUES (?, ?, ?, ?)`,
    [session.id, session.title, session.createdAt, session.updatedAt]
  );
}

// 📥 get sessions
export function getSessions() {
  return db.getAllSync(
    `SELECT * FROM sessions ORDER BY updatedAt DESC`
  );
}

// ➕ add message
export function addMessage(message: any) {
  db.runSync(
    `INSERT INTO messages (id, chatId, role, content, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [
      message.id,
      message.chatId,
      message.role,
      message.content,
      message.createdAt,
    ]
  );

  // update session timestamp
  db.runSync(
    `UPDATE sessions SET updatedAt = ? WHERE id = ?`,
    [Date.now(), message.chatId]
  );
}

// 🗑 delete session
export function deleteSession(chatId: string) {
  db.runSync(`DELETE FROM sessions WHERE id = ?`, [chatId]);
  db.runSync(`DELETE FROM messages WHERE chatId = ?`, [chatId]);
}

// ✏️ update title
export function updateSessionTitle(chatId: string, title: string) {
  db.runSync(
    `UPDATE sessions SET title = ?, updatedAt = ? WHERE id = ?`,
    [title, Date.now(), chatId]
  );
}