import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Resume, ResumeData } from '@/types';
import { resumesService } from '@/services/firebaseService';

interface ResumeState {
  resumes: Resume[];
  isFirebaseEnabled: boolean;
  unsubscribeFirebase: (() => void) | null;
  loadResumes: () => Promise<void>;
  addResume: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Resume>;
  updateResume: (id: string, updates: Partial<Resume>) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  getResume: (id: string) => Resume | undefined;
  enableFirebase: () => void;
  disableFirebase: () => void;
}

const STORAGE_KEY = '@resumes';

const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  isFirebaseEnabled: false,
  unsubscribeFirebase: null,

  enableFirebase: () => {
    const { unsubscribeFirebase } = get();
    if (unsubscribeFirebase) {
      unsubscribeFirebase(); // Clean up existing subscription
    }

    const unsubscribe = resumesService.subscribe((firebaseResumes) => {
      set({ resumes: firebaseResumes });
      // Also sync to local storage for offline access
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseResumes));
    });

    set({ isFirebaseEnabled: true, unsubscribeFirebase: unsubscribe });
  },

  disableFirebase: () => {
    const { unsubscribeFirebase } = get();
    if (unsubscribeFirebase) {
      unsubscribeFirebase();
    }
    set({ isFirebaseEnabled: false, unsubscribeFirebase: null });
    get().loadResumes();
  },

  loadResumes: async () => {
    try {
      // If Firebase is enabled, subscription will handle updates
      if (get().isFirebaseEnabled) {
        return;
      }

      // Otherwise load from local storage
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ resumes: JSON.parse(data) });
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  },

  addResume: async (resume) => {
    const { isFirebaseEnabled } = get();
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        const result = await resumesService.create(resume);
        return result;
      } catch (error: any) {
        console.error('❌ Firebase create failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const newResume: Resume = {
      ...resume,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const resumes = [...get().resumes, newResume];
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
      set({ resumes });
    } catch (storageError) {
      console.error('Error saving to local storage:', storageError);
      set({ resumes });
    }
    return newResume;
  },

  updateResume: async (id, updates) => {
    const { isFirebaseEnabled } = get();
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        await resumesService.update(id, updates);
        return; // Firebase subscription will update state
      } catch (error: any) {
        console.error('❌ Firebase update failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const resumes = get().resumes.map(resume =>
      resume.id === id
        ? { ...resume, ...updates, updatedAt: new Date().toISOString() }
        : resume
    );
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
      set({ resumes });
    } catch (storageError) {
      console.error('Error saving to local storage:', storageError);
      set({ resumes });
    }
  },

  deleteResume: async (id) => {
    const { isFirebaseEnabled } = get();
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        await resumesService.delete(id);
        return; // Firebase subscription will update state
      } catch (error: any) {
        console.error('❌ Firebase delete failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const resumes = get().resumes.filter(resume => resume.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    set({ resumes });
  },

  getResume: (id) => {
    return get().resumes.find(resume => resume.id === id);
  },
}));
