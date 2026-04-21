const BASE_URL = 'http://192.168.1.3:1234/v1';

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

/**
 * Generic request wrapper
 */
async function request<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error: ${res.status} - ${text}`);
  }

  return res.json();
}

/**
 * Chat completion (non-streaming)
 */
export async function chatCompletion(messages: ChatMessage[]) {
  const data = await request<ChatResponse>('/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: 'local-model', // LM Studio ignores or auto-selects
      messages,
      temperature: 0.7,
    }),
  });

  return data.choices[0]?.message?.content ?? '';
}