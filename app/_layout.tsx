import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEffect } from 'react';
import { initializeFirebase } from '@/services/firebaseService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize Firebase on app start
    initializeFirebase();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="editor/[id]" />
              <Stack.Screen name="pdf/[id]" />
              <Stack.Screen name="create/voice" />
              <Stack.Screen name="create/meeting-notes" />
              <Stack.Screen name="settings" />
            </Stack>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

