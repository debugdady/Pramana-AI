import '@/global.css';

import { NAV_THEME, FONTS } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Drawer } from 'expo-router/drawer';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as Font from 'expo-font';
import * as React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { initDB } from '@/src/db';
import { useChatStore } from '@/src/store/chatStore';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  
  // Initialize database
  useEffect(() => {
    initDB();
  }, []);

  const [fontsLoaded] = Font.useFonts({
    [FONTS.regular]: require('@/assets/fonts/DMSans-Regular.ttf'),
    [FONTS.medium]: require('@/assets/fonts/DMSans-Medium.ttf'),
    [FONTS.semibold]: require('@/assets/fonts/DMSans-SemiBold.ttf'),
    [FONTS.italic]: require('@/assets/fonts/DMSans-Italic.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Routes />
            <PortalHost />
          </SafeAreaView>
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

function Routes() {
  const { isSignedIn, isLoaded } = useAuth();

  React.useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <Stack>
        <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/reset-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/forgot-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
      </Stack>
    );
  }

  return (
    <Drawer drawerContent={() => <CustomDrawerContent />}>
      <Drawer.Screen
        name="index"
        options={{ title: 'Home' }}
      />

      {/* Chat routes */}
      <Drawer.Screen 
        name="Chat/new" 
        options={{ title: 'New Chat' }} 
      />
      <Drawer.Screen 
        name="Chat/[ChatId]" 
        options={{ title: 'Chat' }} 
      />

      {/* Other screens */}
      <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
      <Drawer.Screen name="(modals)" options={{ presentation: 'modal' }} />
    </Drawer>
  );
}

function CustomDrawerContent() {
  const sessions = useChatStore((state) => state.sessions);
  const insets = useSafeAreaInsets();

  // 🔥 sort latest chats first
  const sortedSessions = [...sessions].sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left']}>
      <View style={{ flex: 1, padding: 16 }}>
        
        {/* ➕ New Chat */}
        <Pressable
          onPress={() => {
            router.push('/Chat/new');
          }}
          style={{ marginBottom: 20 }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600' }}>
            + New Chat
          </Text>
        </Pressable>

        {/* 💬 Chat List */}
        {sortedSessions.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
            <Text style={{ color: '#999', fontSize: 14 }}>
              No chats yet. Start a new conversation!
            </Text>
          </View>
        ) : (
          <ScrollView>
            {sortedSessions.map((session) => (
              <Pressable
                key={session.id}
                onPress={() => router.push(`/Chat/${session.id}`)}
                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4 }} numberOfLines={1}>
                  {session.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#999' }}>
                  {session.messages.length} messages
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
};

const SIGN_UP_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  gestureEnabled: false,
} as const;

const DEFAULT_AUTH_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
};