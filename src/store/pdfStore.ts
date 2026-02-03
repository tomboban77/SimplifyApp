import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDF, PDFAnnotation } from '@/types';
import { pdfsService } from '@/services/firebaseService';

interface PDFState {
  pdfs: PDF[];
  isFirebaseEnabled: boolean;
  unsubscribeFirebase: (() => void) | null;
  loadPDFs: () => Promise<void>;
  addPDF: (pdf: Omit<PDF, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PDF>;
  updatePDF: (id: string, updates: Partial<PDF>) => Promise<void>;
  addAnnotation: (pdfId: string, annotation: Omit<PDFAnnotation, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnotation: (pdfId: string, annotationId: string, updates: Partial<PDFAnnotation>) => Promise<void>;
  deleteAnnotation: (pdfId: string, annotationId: string) => Promise<void>;
  deletePDF: (id: string) => Promise<void>;
  enableFirebase: () => void;
  disableFirebase: () => void;
}

const STORAGE_KEY = '@pdfs';

export const usePDFStore = create<PDFState>((set, get) => ({
  pdfs: [],
  isFirebaseEnabled: false,
  unsubscribeFirebase: null,

  enableFirebase: () => {
    const { unsubscribeFirebase } = get();
    if (unsubscribeFirebase) {
      unsubscribeFirebase();
    }

    const unsubscribe = pdfsService.subscribe((firebasePDFs) => {
      set({ pdfs: firebasePDFs });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(firebasePDFs));
    });

    set({ isFirebaseEnabled: true, unsubscribeFirebase: unsubscribe });
  },

  disableFirebase: () => {
    const { unsubscribeFirebase } = get();
    if (unsubscribeFirebase) {
      unsubscribeFirebase();
    }
    set({ isFirebaseEnabled: false, unsubscribeFirebase: null });
    get().loadPDFs();
  },

  loadPDFs: async () => {
    try {
      if (get().isFirebaseEnabled) {
        return; // Firebase subscription will handle updates
      }

      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        set({ pdfs: JSON.parse(data) });
      }
    } catch (error) {
      console.error('Error loading PDFs:', error);
    }
  },

  addPDF: async (pdf) => {
    const { isFirebaseEnabled } = get();
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        const result = await pdfsService.create(pdf);
        return result;
      } catch (error: any) {
        console.error('❌ Firebase create failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const newPDF: PDF = {
      ...pdf,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const pdfs = [...get().pdfs, newPDF];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pdfs));
    set({ pdfs });
    return newPDF;
  },

  updatePDF: async (id, updates) => {
    const { isFirebaseEnabled } = get();
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        await pdfsService.update(id, updates);
        return; // Firebase subscription will update state
      } catch (error: any) {
        console.error('❌ Firebase update failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const pdfs = get().pdfs.map(pdf =>
      pdf.id === id
        ? { ...pdf, ...updates, updatedAt: new Date().toISOString() }
        : pdf
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pdfs));
    set({ pdfs });
  },

  addAnnotation: async (pdfId, annotation) => {
    const newAnnotation: PDFAnnotation = {
      ...annotation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const pdf = get().pdfs.find(p => p.id === pdfId);
    if (!pdf) return;

    const updatedPDF = {
      ...pdf,
      annotations: [...(pdf.annotations || []), newAnnotation],
      updatedAt: new Date().toISOString(),
    };

    await get().updatePDF(pdfId, updatedPDF);
  },

  updateAnnotation: async (pdfId, annotationId, updates) => {
    const pdf = get().pdfs.find(p => p.id === pdfId);
    if (!pdf || !pdf.annotations) return;

    const updatedPDF = {
      ...pdf,
      annotations: pdf.annotations.map(ann =>
        ann.id === annotationId ? { ...ann, ...updates } : ann
      ),
      updatedAt: new Date().toISOString(),
    };

    await get().updatePDF(pdfId, updatedPDF);
  },

  deleteAnnotation: async (pdfId, annotationId) => {
    const pdf = get().pdfs.find(p => p.id === pdfId);
    if (!pdf || !pdf.annotations) return;

    const updatedPDF = {
      ...pdf,
      annotations: pdf.annotations.filter(ann => ann.id !== annotationId),
      updatedAt: new Date().toISOString(),
    };

    await get().updatePDF(pdfId, updatedPDF);
  },

  deletePDF: async (id) => {
    const { isFirebaseEnabled } = get();
    
    // Try Firebase first if enabled
    if (isFirebaseEnabled) {
      try {
        await pdfsService.delete(id);
        return; // Firebase subscription will update state
      } catch (error: any) {
        console.error('❌ Firebase delete failed, using local storage:', error);
        // Fall through to local storage
      }
    }

    // Local storage fallback
    const pdfs = get().pdfs.filter(pdf => pdf.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pdfs));
    set({ pdfs });
  },
}));
