import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/auth';
import { authService } from '@/services/authService';
import { FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initializeAuth: () => Promise<(() => void) | undefined>;
}

const AUTH_STORAGE_KEY = '@auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      error: null 
    });
    // Persist to storage
    if (user) {
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.login(email, password);
      get().setUser(user);
    } catch (error: any) {
      set({ error: error.message || 'Login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, displayName?: string) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.register(email, password, displayName);
      get().setUser(user);
    } catch (error: any) {
      set({ error: error.message || 'Registration failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await authService.logout();
      get().setUser(null);
    } catch (error: any) {
      set({ error: error.message || 'Logout failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      await authService.resetPassword(email);
    } catch (error: any) {
      set({ error: error.message || 'Password reset failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      // First, try to restore user from AsyncStorage for immediate UI update
      // This provides instant feedback while Firebase Auth initializes
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const user: User = JSON.parse(storedUser);
          // Set user temporarily while we verify with Firebase
          set({ user, isAuthenticated: true, isLoading: true });
        }
      } catch (storageError) {
        console.error('Error loading stored user:', storageError);
      }
      
      // Set up auth state listener - this will verify and update the user state
      // Firebase Auth persists automatically, so this should restore the session
      const unsubscribe = authService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Fetch user profile
            const profile = await authService.getUserProfile(firebaseUser.uid);
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: profile?.displayName || firebaseUser.displayName || '',
              photoURL: profile?.photoURL || firebaseUser.photoURL || null,
            };
            get().setUser(user);
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Fallback to Firebase user data
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || null,
            };
            get().setUser(user);
          }
        } else {
          // No Firebase user - clear stored user as well
          get().setUser(null);
        }
        set({ isLoading: false });
      });

      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
      return () => {}; // Return no-op function if initialization fails
    }
  },
}));

