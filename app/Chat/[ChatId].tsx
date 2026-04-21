import {
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
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
import { streamChat, type ChatMessage } from '@/src/services/api';
import type { Message } from '@/src/store/chatStore';
import { createMarkdownStyles } from '@/src/utils/markdownStyles';
import { Linking } from 'react-native';

const MAX_CHAT_WIDTH = 720;

export default function ChatScreen() {
  const { ChatId, autoSend } = useLocalSearchParams<{ ChatId: string; autoSend?: string }>();

  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'streaming'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  // ✅ Prevents autoSend from firing more than once even if session changes
  const autoSendFiredRef = useRef(false);

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

  const appendToken = (id: string, token: string) => {
    const currentSession = useChatStore.getState().sessions.find((s) => s.id === ChatId);
    if (!currentSession) return;
    const msg = currentSession.messages.find((m) => m.id === id);
    if (!msg) return;
    updateMessage(ChatId, id, msg.content + token);
  };

  // ✅ Defined ABOVE the if (!session) guard so it's always in scope for the autoSend effect
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
    } catch (err: any) {
      if (!controller.signal.aborted) {
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

  // ✅ session in deps so effect retries if session wasn't ready on first render
  useEffect(() => {
    if (autoSend !== '1' || !session || autoSendFiredRef.current) return;

    const lastMsg = session.messages[session.messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user') return;

    autoSendFiredRef.current = true; // ✅ mark fired before async work starts

    const assistantId = `${Date.now()}-a`;

    addMessage(ChatId, {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    });

    const history: ChatMessage[] = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setTimeout(() => runStreaming(history, assistantId), 0);
  }, [autoSend, session]); // ✅ re-runs when session becomes available

  if (!session) return null;

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isBusy) return;

    const text = input.trim();
    setInput('');

    const currentSession = useChatStore.getState().sessions.find((s) => s.id === ChatId);
    if (!currentSession) return;

    const history: ChatMessage[] = [
      ...currentSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: text },
    ];

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

    runStreaming(history, assistantId);
  };

  const handleCopy = async (id: string) => {
    const msg = session.messages.find((m) => m.id === id);
    if (!msg) return;
    await Clipboard.setStringAsync(msg.content);
  };

  return (
    // ✅ behavior="padding" is reliable on both iOS and Android
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <Pressable style={{ flex: 1 }} onPress={() => setSelectedMessage(null)}>
        {/* ✅ flex:1 + flexGrow:1 ensures ScrollView fills space and never hides behind keyboard */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
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
                    <ActivityIndicator size="small" color="#000000" />
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
