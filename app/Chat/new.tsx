import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { SendIcon } from 'lucide-react-native';
import { useChatStore } from '@/src/store/chatStore';
import type { Message } from '@/src/store/chatStore';

export default function NewChatScreen() {
  const [input, setInput] = useState('');
  const createSessionWithFirstMessage = useChatStore((state) => state.createSessionWithFirstMessage);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput('');

    const firstMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      createdAt: Date.now(),
    };

    // ✅ Just create the session and navigate — chat screen handles streaming
    const chatId = createSessionWithFirstMessage(firstMessage);
    router.replace(`/Chat/${chatId}?autoSend=1`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24, justifyContent: 'space-between' }}>
        <View style={{ marginBottom: 32, marginTop: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 8 }}>New Chat</Text>
          <Text style={{ fontSize: 16, color: '#9a9a9a' }}>Start a conversation with AI</Text>
        </View>

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
            />
            <Button
              onPress={handleSendMessage}
              disabled={!input.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: !input.trim() ? '#d9d9d9' : '#111',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon as={SendIcon} className="size-5 text-white" />
            </Button>
          </View>
          <Text style={{ fontSize: 12, color: '#9a9a9a', paddingHorizontal: 4 }}>
            {input.length}/2000
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}