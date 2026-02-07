import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Document } from '@/types';
import { documentsService } from '@/services/firebaseService';
import { useAuthStore } from './authStore';

interface DocumentState {
  documents: Document[];
  isFirebaseEnabled: boolean;
  unsubscribeFirebase: (() => void) | null;
  loadDocuments: () => Promise<void>;
  createDocument: (doc: Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  enableFirebase: () => void;
  disableFirebase: () => void;
}

const STORAGE_KEY = '@documents';

export const useDocumentStore = create<DocumentState>((set, get) => {
  // Helper function to enable/disable Firebase based on auth state
  const syncFirebaseState = (user: any) => {
    if (user) {
      // User is logged in - always enable Firebase sync
      if (!get().isFirebaseEnabled) {
        get().enableFirebase();
      }
    } else {
      // User logged out - disable Firebase
      if (get().isFirebaseEnabled) {
        get().disableFirebase();
      }
    }
  };

  // Subscribe to auth state changes to automatically enable/disable Firebase
  // This ensures Firebase sync is always on when user is logged in
  useAuthStore.subscribe((state) => {
    syncFirebaseState(state.user);
  });

  // Check immediately if user is already authenticated (for app reloads)
  const currentUser = useAuthStore.getState().user;
  if (currentUser) {
    // Use setTimeout to ensure store is fully initialized
    setTimeout(() => syncFirebaseState(currentUser), 0);
  }

  return {
    documents: [],
    isFirebaseEnabled: false,
    unsubscribeFirebase: null,

    enableFirebase: () => {
    const { unsubscribeFirebase } = get();
    if (unsubscribeFirebase) {
      unsubscribeFirebase(); // Clean up existing subscription
    }

    // Get current user ID
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) {
      console.error('Cannot enable Firebase sync: User not authenticated');
      return;
    }

    const unsubscribe = documentsService.subscribe(userId, (firebaseDocuments) => {
      set({ documents: firebaseDocuments });
      // Also sync to local storage for offline access
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseDocuments));
    });

    set({ isFirebaseEnabled: true, unsubscribeFirebase: unsubscribe });
  },

  disableFirebase: () => {
    const { unsubscribeFirebase } = get();
    if (unsubscribeFirebase) {
      unsubscribeFirebase();
    }
    set({ isFirebaseEnabled: false, unsubscribeFirebase: null });
    get().loadDocuments();
  },

  loadDocuments: async () => {
    try {
      // If Firebase is enabled, subscription will handle updates
      if (get().isFirebaseEnabled) {
        return;
      }

      // Otherwise load from local storage
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ documents: JSON.parse(data) });
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  },

  createDocument: async (doc) => {
    const { isFirebaseEnabled } = get();
    const userId = useAuthStore.getState().user?.uid;
    
    if (!userId) {
      throw new Error('User must be authenticated to create documents');
    }
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        const result = await documentsService.create(doc, userId);
        return result;
      } catch (error: any) {
        console.error('❌ Firebase create failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const newDoc: Document = {
      ...doc,
      userId, // Include userId even in local storage
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const documents = [...get().documents, newDoc];
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
      set({ documents });
    } catch (storageError) {
      console.error('Error saving to local storage:', storageError);
      set({ documents });
    }
    return newDoc;
  },

  updateDocument: async (id, updates) => {
    const { isFirebaseEnabled } = get();
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        await documentsService.update(id, updates);
        return; // Firebase subscription will update state
      } catch (error: any) {
        console.error('❌ Firebase update failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const documents = get().documents.map(doc =>
      doc.id === id
        ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
        : doc
    );
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
      set({ documents });
    } catch (storageError) {
      console.error('Error saving to local storage:', storageError);
      set({ documents });
    }
  },

  deleteDocument: async (id) => {
    const { isFirebaseEnabled } = get();
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        await documentsService.delete(id);
        return; // Firebase subscription will update state
      } catch (error: any) {
        console.error('❌ Firebase delete failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const documents = get().documents.filter(doc => doc.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    set({ documents });
  },
  };
});
