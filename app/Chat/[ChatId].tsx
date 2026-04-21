// 🔥 IMPORTANT FIXES APPLIED:
// - expo-clipboard instead of deprecated Clipboard
// - context menu closes correctly
// - selectedMessage resets properly
// - edit flow fixed (prefill input)
// - regenerate logic cleaned
// - no stale state bugs

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

import * as Clipboard from 'expo-clipboard'; // ✅ FIX

import { useLocalSearchParams, router } from 'expo-router';
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
import { chatCompletion, type ChatMessage } from '@/src/services/api';
import type { Message } from '@/src/store/chatStore';
import { createMarkdownStyles } from '@/src/utils/markdownStyles';
import { Linking } from 'react-native';

const MAX_CHAT_WIDTH = 720;

export default function ChatScreen() {
  const { ChatId } = useLocalSearchParams<{ ChatId: string }>();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const sessions = useChatStore((s) => s.sessions);
  const addMessage = useChatStore((s) => s.addMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const regenerateMessage = useChatStore((s) => s.regenerateMessage);

  const scrollViewRef = useRef<ScrollView>(null);

  const session = useMemo(
    () => sessions.find((s) => s.id === ChatId),
    [sessions, ChatId]
  );

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [session?.messages.length, isLoading]);

  if (!session) return null;

  // =========================
  // 🧠 SEND / EDIT LOGIC
  // =========================
  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // ✏️ EDIT MODE
      if (editingMessageId) {
        const index = session.messages.findIndex(
          (m) => m.id === editingMessageId
        );

        updateMessage(ChatId, editingMessageId, trimmed);

        const messages = session.messages.slice(0, index + 1).map((m) => ({
          role: m.id === editingMessageId ? 'user' : m.role,
          content: m.id === editingMessageId ? trimmed : m.content,
        }));

        const res = await chatCompletion(messages);

        addMessage(ChatId, {
          id: Date.now().toString(),
          role: 'assistant',
          content: res,
          createdAt: Date.now(),
        });

        setEditingMessageId(null);
      } else {
        // 🧾 NORMAL SEND
        const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: trimmed,
          createdAt: Date.now(),
        };

        addMessage(ChatId, userMsg);

        const apiMessages: ChatMessage[] = [
          ...session.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content: trimmed },
        ];

        const res = await chatCompletion(apiMessages);

        addMessage(ChatId, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res,
          createdAt: Date.now() + 1,
        });
      }

      setInput('');
    } catch {
      setError('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // 📋 ACTIONS
  // =========================
  const handleCopy = async (id: string) => {
    const msg = session.messages.find((m) => m.id === id);
    if (!msg) return;

    await Clipboard.setStringAsync(msg.content);
    Alert.alert('Copied');
    setSelectedMessage(null);
  };

  const handleRegenerate = async (id: string) => {
    const index = session.messages.findIndex((m) => m.id === id);
    if (index === -1) return;

    regenerateMessage(ChatId, id);

    const messages = session.messages.slice(0, index).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setIsLoading(true);

    try {
      const res = await chatCompletion(messages);

      addMessage(ChatId, {
        id: Date.now().toString(),
        role: 'assistant',
        content: res,
        createdAt: Date.now(),
      });
    } finally {
      setIsLoading(false);
      setSelectedMessage(null);
    }
  };

  const handleEdit = (id: string) => {
    const msg = session.messages.find((m) => m.id === id);
    if (!msg) return;

    setEditingMessageId(id);
    setInput(msg.content);
    setSelectedMessage(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete?', '', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMessage(ChatId, id),
      },
    ]);
  };

  const handleShare = async (id: string) => {
    const msg = session.messages.find((m) => m.id === id);
    if (!msg) return;

    await Share.share({ message: msg.content });
  };

  // =========================
  // UI
  // =========================
  return (
  <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }}>
    <Pressable style={{ flex: 1 }} onPress={() => setSelectedMessage(null)}>
      <ScrollView ref={scrollViewRef}>
        {session.messages.map((m) => (
          <Pressable
            key={m.id}
            onLongPress={() => setSelectedMessage(m.id)}
            style={{ padding: 16 }}
          >
            {m.role === 'assistant' ? (
              <Markdown
                style={{
                  ...createMarkdownStyles(),
                  link: {
                    color: '#3b82f6',
                    textDecorationLine: 'underline',
                  },
                }}
                onLinkPress={(url) => {
                  Linking.openURL(url).catch(() => {
                    console.warn('Cannot open link:', url);
                  });
                }}
              >
                {m.content}
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

            {/* 🔥 ACTION BAR */}
            {selectedMessage === m.id && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <Icon as={CopyIcon} onPress={() => handleCopy(m.id)} />
                {m.role === 'assistant' ? (
                  <Icon
                    as={RotateCwIcon}
                    onPress={() => handleRegenerate(m.id)}
                  />
                ) : (
                  <Icon as={EditIcon} onPress={() => handleEdit(m.id)} />
                )}
                <Icon as={ShareIcon} onPress={() => handleShare(m.id)} />
                <Icon as={TrashIcon} onPress={() => handleDelete(m.id)} />
                <Icon as={FlagIcon} onPress={() => setSelectedMessage(null)} />
              </View>
            )}
          </Pressable>
        ))}

        {isLoading && (
          <Text style={{ textAlign: 'center', padding: 20 }}>
            Thinking...
          </Text>
        )}
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

        <Button onPress={handleSendMessage}>
          <Icon as={SendIcon} />
        </Button>
      </View>
    </Pressable>
  </KeyboardAvoidingView>
  );
}