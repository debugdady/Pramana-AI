import { View, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SendIcon, AlertCircleIcon } from 'lucide-react-native';
import { useChatStore } from '@/src/store/chatStore';
import { chatCompletion, type ChatMessage } from '@/src/services/api';
import type { Message } from '@/src/store/chatStore';

export default function NewChatScreen() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createSessionWithFirstMessage = useChatStore((state) => state.createSessionWithFirstMessage);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    const userInput = input;
    setInput('');

    try {
      // Create first message
      const firstMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userInput,
        createdAt: Date.now(),
      };

      // Create session with first message
      const chatId = createSessionWithFirstMessage(firstMessage);

      // Call API with the user message
      const apiMessages: ChatMessage[] = [{ role: 'user', content: userInput }];
      const assistantResponse = await chatCompletion(apiMessages);

      if (!assistantResponse?.trim()) {
        throw new Error('Empty response from API');
      }

      // Add assistant message to the session
      const store = useChatStore.getState();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        createdAt: Date.now() + 1,
      };
      store.addMessage(chatId, assistantMessage);

      // Navigate to chat screen (replace to prevent going back to new chat)
      router.replace(`/Chat/${chatId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start chat';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24, justifyContent: 'space-between' }}>
        {/* Header with title */}
        <View style={{ marginBottom: 32, marginTop: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>New Chat</Text>
          <Text style={{ fontSize: 16, color: '#9a9a9a' }}>Start a conversation with AI</Text>
        </View>

        {/* Messages area (empty for new chat) */}
        <ScrollView style={{ flex: 1, marginBottom: 16 }} />

        {/* Error Alert */}
        {error && (
          <View style={{ backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <Icon as={AlertCircleIcon} className="size-5 text-red-600" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#dc2626', marginBottom: 4 }}>Error</Text>
              <Text style={{ fontSize: 12, color: '#b91c1c' }}>{error}</Text>
            </View>
            <Button
              onPress={() => setError(null)}
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
            >
              <Text style={{ fontSize: 12, color: '#dc2626' }}>Dismiss</Text>
            </Button>
          </View>
        )}

        {/* Input area */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <TextInput
              style={{
                flex: 1,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#f7f7f7',
                color: '#111',
                borderWidth: 1,
                borderColor: '#ededed',
                fontSize: 16,
                lineHeight: 22,
              }}
              placeholder="Type your message..."
              placeholderTextColor="#9a9a9a"
              multiline
              maxLength={2000}
              value={input}
              onChangeText={setInput}
              editable={!isLoading}
              scrollEnabled={false}
            />
            <Button
              onPress={handleSendMessage}
              disabled={!input.trim() || isLoading}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: !input.trim() || isLoading ? '#d9d9d9' : '#111',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon as={SendIcon} className="size-5 text-white" />
              )}
            </Button>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, color: '#9a9a9a' }}>
              {input.length}/2000
            </Text>
            {isLoading && (
              <Text style={{ fontSize: 12, color: '#9a9a9a' }}>
                Creating chat...
              </Text>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
