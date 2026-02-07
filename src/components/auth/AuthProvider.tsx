import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * AuthProvider Component
 * 
 * Handles authentication state and route protection.
 * Redirects unauthenticated users to login screen.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initializeAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    // Initialize auth state listener
    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const inAuthGroup = segments[0] === 'auth';
    const isAuthenticated = !!user;

    // If user is not authenticated and not in auth group, redirect to login
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
    }
    // If user is authenticated and in auth group, redirect to main app
    else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
});

