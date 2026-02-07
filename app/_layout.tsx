import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { initializeFirebase } from '@/services/firebaseService';
import { theme, colors } from '@/theme';

/**
 * Root Layout
 * 
 * Premium app shell with:
 * - Proper safe area handling
 * - Material Design 3 theming
 * - Gesture handler setup
 * - Status bar configuration
 */
export default function RootLayout() {
  useEffect(() => {
    // Initialize Firebase on app start
    initializeFirebase();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <AuthProvider>
              {/* Light status bar for dark headers, dark for light backgrounds */}
              <StatusBar style="dark" backgroundColor={colors.background.default} />
              
              <View style={styles.container}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: styles.content,
                    animation: 'slide_from_right',
                    animationDuration: 250,
                  }}
                >
                  <Stack.Screen 
                    name="(tabs)" 
                    options={{
                      animation: 'fade',
                    }}
                  />
                  <Stack.Screen 
                    name="auth/login"
                    options={{
                      presentation: 'card',
                      animation: 'fade',
                    }}
                  />
                  <Stack.Screen 
                    name="auth/register"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen 
                    name="auth/forgot-password"
                    options={{
                      presentation: 'card',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen 
                    name="editor/[id]" 
                    options={{
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen 
                    name="resumes/[id]" 
                    options={{
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen 
                    name="resumes/questionnaire" 
                    options={{
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen 
                    name="create/voice" 
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen 
                    name="create/meeting-notes" 
                    options={{
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen 
                    name="settings" 
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                </Stack>
              </View>
            </AuthProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    backgroundColor: colors.background.default,
  },
});