import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Resume, ResumeData } from '@/types';

interface ResumeState {
  resumes: Resume[];
  loadResumes: () => Promise<void>;
  addResume: (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Resume>;
  updateResume: (id: string, updates: Partial<Resume>) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  getResume: (id: string) => Resume | undefined;
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

  loadResumes: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ resumes: JSON.parse(data) });
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  },

  addResume: async (resume) => {
    const newResume: Resume = {
      ...resume,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const resumes = [...get().resumes, newResume];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    set({ resumes });
    return newResume;
  },

  updateResume: async (id, updates) => {
    const resumes = get().resumes.map(resume =>
      resume.id === id
        ? { ...resume, ...updates, updatedAt: new Date().toISOString() }
        : resume
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    set({ resumes });
  },

  deleteResume: async (id) => {
    const resumes = get().resumes.filter(resume => resume.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    set({ resumes });
  },

  getResume: (id) => {
    return get().resumes.find(resume => resume.id === id);
  },
}));

