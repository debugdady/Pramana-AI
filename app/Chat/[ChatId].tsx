import {
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Share,
  Alert,
  Pressable,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  SendIcon,
  CopyIcon,
  RotateCwIcon,
  EditIcon,
  TrashIcon,
  FlagIcon,
  ShareIcon,
} from 'lucide-react-native';

import Markdown from 'react-native-markdown-display';
import { useChatStore } from '@/src/store/chatStore';
import { chatCompletion, streamChat, type ChatMessage } from '@/src/services/api';
import type { Message } from '@/src/store/chatStore';
import { createMarkdownStyles } from '@/src/utils/markdownStyles';
import { Linking } from 'react-native';

const MAX_CHAT_WIDTH = 720;

export default function ChatScreen() {
  const { ChatId } = useLocalSearchParams<{ ChatId: string }>();

  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'streaming'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const sessions = useChatStore((s) => s.sessions);
  const addMessage = useChatStore((s) => s.addMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);

  const session = useMemo(
    () => sessions.find((s) => s.id === ChatId),
    [sessions, ChatId]
  );

  const isBusy = status !== 'idle';

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [session?.messages.length, status]);

  if (!session) return null;

  const appendToken = (id: string, token: string) => {
    // Get the latest session from store to avoid stale closure
    const currentSession = useChatStore.getState().sessions.find((s) => s.id === ChatId);
    if (!currentSession) return;
    const msg = currentSession.messages.find((m) => m.id === id);
    if (!msg) return;
    updateMessage(ChatId, id, msg.content + token);
  };

  const runStreaming = async (messages: ChatMessage[], assistantId: string) => {
    const controller = new AbortController();
    abortRef.current = controller;

    setStreamingMessageId(assistantId);
    setStatus('thinking');

    let first = true;

    try {
      await streamChat(
        messages,
        (token) => {
          if (controller.signal.aborted) return;

          if (first) {
            setStatus('streaming');
            first = false;
          }

          appendToken(assistantId, token);
        },
        controller.signal
      );
      
      setStatus('idle');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Streaming failed');
        console.error('Streaming error:', err);
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setStatus('idle');
      setStreamingMessageId(null);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
    setStreamingMessageId(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isBusy) return;

    const text = input.trim();
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    addMessage(ChatId, userMsg);

    const assistantId = `${Date.now()}-a`;

    addMessage(ChatId, {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    });

    // Get the latest session from store (includes both user and assistant messages)
    const currentSession = useChatStore.getState().sessions.find((s) => s.id === ChatId);
    if (!currentSession) return;

    const history: ChatMessage[] = currentSession.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    runStreaming(history, assistantId);
  };

  const handleCopy = async (id: string) => {
    const msg = session.messages.find((m) => m.id === id);
    if (!msg) return;
    await Clipboard.setStringAsync(msg.content);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <Pressable style={{ flex: 1 }} onPress={() => setSelectedMessage(null)}>
        <ScrollView
          ref={scrollViewRef}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {session.messages.map((m) => {
            const isStreaming =
              m.id === streamingMessageId && status !== 'idle';

            return (
              <View key={m.id} style={{ padding: 16 }}>
                {m.role === 'assistant' ? (
                  <Markdown
                    key={m.id}
                    style={createMarkdownStyles()}
                    onLinkPress={(url) => Linking.openURL(url)}
                  >
                    {m.content || ' '}
                  </Markdown>
                ) : (
                  <View
                    style={{
                      alignSelf: 'flex-end',
                      backgroundColor: '#eee',
                      padding: 12,
                      borderRadius: 16,
                    }}
                  >
                    <Text>{m.content}</Text>
                  </View>
                )}

                {isStreaming && m.content.length === 0 && (
                  <View style={{ flexDirection: 'row', marginTop: 6 }}>
                    <ActivityIndicator size="small" />
                    <Text style={{ marginLeft: 6 }}>Thinking...</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* INPUT */}
        <View style={{ padding: 12 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            multiline
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 20,
              padding: 12,
            }}
          />

          <Button onPress={isBusy ? handleStop : handleSendMessage}>
            {isBusy ? <Text>Stop</Text> : <Icon as={SendIcon} />}
          </Button>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}