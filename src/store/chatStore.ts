import { create } from 'zustand';
import {
  createSession,
  getSessions,
  addMessage as dbAddMessage,
  deleteSession as dbDeleteSession,
  updateSessionTitle as dbUpdateTitle,
} from '@/src/db/chats';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

type ChatState = {
  sessions: ChatSession[];

  loadSessions: () => void;

  createSessionWithFirstMessage: (message: Message) => string;
  addMessage: (chatId: string, message: Message) => void;
  deleteSession: (chatId: string) => void;
  updateSessionTitle: (chatId: string, title: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  regenerateMessage: (chatId: string, messageId: string) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],

  // 🔄 Load from SQLite
  loadSessions: () => {
    const dbSessions = getSessions();

    const sessions = (dbSessions as any[]).map((s: any) => ({
      ...s,
      messages: [],
    }));

    set({ sessions });
  },

  // 🆕 Create chat only when first message exists (your logic stays)
  createSessionWithFirstMessage: (message) => {
    const newChatId = Date.now().toString();

    const title =
      message.content.substring(0, 30) +
      (message.content.length > 30 ? '...' : '');

    const newChat: ChatSession = {
      id: newChatId,
      title: title || 'New Chat',
      messages: [message],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // ✅ Save to DB
    createSession(newChat);

    dbAddMessage({
      ...message,
      chatId: newChatId,
    });

    // ✅ Update UI
    set((state) => ({
      sessions: [newChat, ...state.sessions],
    }));

    return newChatId;
  },

  // ➕ Add message
  addMessage: (chatId, message) => {
    // ✅ Save to DB first
    dbAddMessage({
      ...message,
      chatId,
    });

    // ✅ Update UI
    const updated = get().sessions.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          updatedAt: Date.now(),
        };
      }
      return chat;
    });

    set({ sessions: updated });
  },

  // 🗑 Delete
  deleteSession: (chatId) => {
    dbDeleteSession(chatId);

    set((state) => ({
      sessions: state.sessions.filter((chat) => chat.id !== chatId),
    }));
  },

  // ✏️ Update title
  updateSessionTitle: (chatId, title) => {
    dbUpdateTitle(chatId, title);

    const updated = get().sessions.map((chat) => {
      if (chat.id === chatId) {
        return { ...chat, title };
      }
      return chat;
    });

    set({ sessions: updated });
  },

  // 🗑 Delete specific message
  deleteMessage: (chatId, messageId) => {
    const updated = get().sessions.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.filter((msg) => msg.id !== messageId),
          updatedAt: Date.now(),
        };
      }
      return chat;
    });

    set({ sessions: updated });
  },

  // ✏️ Update specific message
  updateMessage: (chatId, messageId, content) => {
    const updated = get().sessions.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content } : msg
          ),
          updatedAt: Date.now(),
        };
      }
      return chat;
    });

    set({ sessions: updated });
  },

  // 🔄 Regenerate message (delete assistant message and subsequent messages)
  regenerateMessage: (chatId, messageId) => {
    const updated = get().sessions.map((chat) => {
      if (chat.id === chatId) {
        const messageIndex = chat.messages.findIndex((msg) => msg.id === messageId);
        if (messageIndex !== -1) {
          // Keep messages up to and including the message to regenerate
          return {
            ...chat,
            messages: chat.messages.slice(0, messageIndex + 1),
            updatedAt: Date.now(),
          };
        }
      }
      return chat;
    });

    set({ sessions: updated });
  },
}));