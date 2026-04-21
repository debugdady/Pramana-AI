import { fetch as expoFetch } from 'expo/fetch';

const BASE_URL = 'http://192.168.1.3:1234/v1';
const MODEL = 'local-model';

type Role = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: Role;
  content: string;
};

type ChatResponse = {
  id: string;
  choices: {
    message: {
      role: Role;
      content: string;
    };
  }[];
};

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const res = await expoFetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error: ${res.status} - ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function chatCompletion(messages: ChatMessage[]) {
  const data = await request<ChatResponse>('/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  return data.choices[0]?.message?.content ?? '';
}

export async function streamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal
) {
  const res = await expoFetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stream API Error: ${res.status} - ${text}`);
  }

  if (!res.body) {
    throw new Error('No stream body returned by the server');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';

  try {
    while (true) {
      // ✅ Check abort BEFORE reading, and just return instead of throwing DOMException
      if (signal?.aborted) {
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (signal?.aborted) break; // ✅ Also bail mid-chunk if aborted

        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') return;

        try {
          const parsed = JSON.parse(payload);
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) onToken(token);
        } catch {
          // Ignore partial or malformed chunks
        }
      }
    }
  } finally {
    // ✅ Always cancel the reader safely in finally — never throw after cancel
    reader.cancel().catch(() => {});
  }
}