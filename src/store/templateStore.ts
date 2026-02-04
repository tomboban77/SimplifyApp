import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResumeTemplate } from '@/types';
import { templatesService } from '@/services/firebaseService';

interface TemplateState {
  templates: ResumeTemplate[];
  isFirebaseEnabled: boolean;
  unsubscribeFirebase: (() => void) | null;
  isLoading: boolean;
  loadTemplates: () => Promise<void>;
  enableFirebase: () => void;
  disableFirebase: () => void;
  getTemplate: (id: string) => ResumeTemplate | undefined;
}

const STORAGE_KEY = '@templates';

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  isFirebaseEnabled: false,
  unsubscribeFirebase: null,
  isLoading: false,

  enableFirebase: () => {
    const { unsubscribeFirebase } = get();
    if (unsubscribeFirebase) {
      unsubscribeFirebase(); // Clean up existing subscription
    }

    const unsubscribe = templatesService.subscribe((firebaseTemplates) => {
      set({ templates: firebaseTemplates });
      // Also sync to local storage for offline access
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseTemplates));
    });

    set({ isFirebaseEnabled: true, unsubscribeFirebase: unsubscribe });
  },

  disableFirebase: () => {
    const { unsubscribeFirebase } = get();
    if (unsubscribeFirebase) {
      unsubscribeFirebase();
    }
    set({ isFirebaseEnabled: false, unsubscribeFirebase: null });
    get().loadTemplates();
  },

  loadTemplates: async () => {
    try {
      set({ isLoading: true });
      
      // If Firebase is enabled, subscription will handle updates
      if (get().isFirebaseEnabled) {
        set({ isLoading: false });
        return;
      }

      // Always load from Firebase (no fallback to hardcoded templates)
      try {
        const firebaseTemplates = await templatesService.getAll();
        set({ templates: firebaseTemplates });
        // Cache in local storage for offline access
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseTemplates));
      } catch (error) {
        console.error('Error loading templates from Firebase:', error);
        // Try to load from local storage cache if Firebase fails
        const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (cachedData) {
          console.log('Loading templates from local cache');
          set({ templates: JSON.parse(cachedData) });
        } else {
          // No templates available - user needs to connect to Firebase
          console.error('No templates available. Please ensure Firebase is configured and templates are seeded.');
          set({ templates: [] });
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      set({ templates: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  getTemplate: (id) => {
    return get().templates.find(template => template.id === id);
  },
}));

