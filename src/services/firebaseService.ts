import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, deleteDoc, getDocs, query, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { Document, PDF, Resume } from '@/types';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBZWyv3_Ilrrq8YfmQkMwlX0xiKUealCcU",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "simplifyapp-d15b4.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "simplifyapp-d15b4",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "simplifyapp-d15b4.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "507784101632",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:507784101632:web:76e81fdc6c678b5457bde5"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase
 * Returns Firestore instance if successful, null otherwise
 */
export const initializeFirebase = (): Firestore | null => {
  try {
    // Check if config is valid
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
      console.error('❌ Firebase not configured - API key missing');
      return null;
    }

    if (!firebaseConfig.projectId || firebaseConfig.projectId === 'your-project-id') {
      console.error('❌ Firebase not configured - Project ID missing');
      return null;
    }

    // Initialize Firebase app (only if not already initialized)
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } else {
      app = getApps()[0];
    }

    // Get Firestore instance
    db = getFirestore(app);
    
    return db;
  } catch (error: any) {
    console.error('❌ Firebase initialization failed:', error);
    return null;
  }
};

/**
 * Get Firestore database instance
 * Initializes Firebase if not already initialized
 */
export const getFirestoreDB = (): Firestore | null => {
  if (!db) {
    return initializeFirebase();
  }
  return db;
};

/**
 * Test Firebase connection by creating a test document
 * Returns true if successful, false otherwise
 */
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      console.error('❌ Firebase not initialized');
      return false;
    }

    // Create a test document
    const testDocRef = doc(collection(firestoreDB, '_test'));
    const testData = {
      message: 'Firebase connection test',
      timestamp: Timestamp.now(),
      test: true
    };

    await setDoc(testDocRef, testData);

    // Try to delete the test document
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(testDocRef);
    } catch (cleanupError) {
      // Non-critical, ignore
    }

    console.log('✅ Firebase connection successful');
    return true;
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

// Documents Service for Firebase
export const documentsService = {
  // Create document
  create: async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(collection(firestoreDB, 'documents'));
    const newDoc: Document = {
      id: docRef.id,
      ...document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, {
      ...newDoc,
      createdAt: Timestamp.fromDate(new Date(newDoc.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(newDoc.updatedAt)),
    });

    return newDoc;
  },

  // Update document
  update: async (id: string, updates: Partial<Document>): Promise<void> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(firestoreDB, 'documents', id);
    await setDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    }, { merge: true });
  },

  // Delete document
  delete: async (id: string): Promise<void> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(firestoreDB, 'documents', id);
    await deleteDoc(docRef);
  },

  // Subscribe to real-time updates
  subscribe: (callback: (documents: Document[]) => void): (() => void) => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      return () => {};
    }

    const q = query(
      collection(firestoreDB, 'documents'),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const documents: Document[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const doc: Document = {
          id: docSnap.id,
          title: data.title || '',
          content: data.content || '',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        };
        documents.push(doc);
      });
      callback(documents);
    }, (error) => {
      console.error('❌ Firebase documents subscription error:', error);
    });
  },
};

// PDFs Service for Firebase
export const pdfsService = {
  // Create PDF
  create: async (pdf: Omit<PDF, 'id' | 'createdAt' | 'updatedAt'>): Promise<PDF> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(collection(firestoreDB, 'pdfs'));
    const newPDF: PDF = {
      id: docRef.id,
      ...pdf,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, {
      ...newPDF,
      createdAt: Timestamp.fromDate(new Date(newPDF.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(newPDF.updatedAt)),
    });

    return newPDF;
  },

  // Update PDF
  update: async (id: string, updates: Partial<PDF>): Promise<void> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(firestoreDB, 'pdfs', id);
    await setDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    }, { merge: true });
  },

  // Delete PDF
  delete: async (id: string): Promise<void> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(firestoreDB, 'pdfs', id);
    await deleteDoc(docRef);
  },

  // Subscribe to real-time updates
  subscribe: (callback: (pdfs: PDF[]) => void): (() => void) => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      return () => {};
    }

    const q = query(
      collection(firestoreDB, 'pdfs'),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const pdfs: PDF[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const pdf: PDF = {
          id: docSnap.id,
          name: data.name || '',
          uri: data.uri || '',
          annotations: data.annotations || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        };
        pdfs.push(pdf);
      });
      callback(pdfs);
    }, (error) => {
      console.error('❌ Firebase PDFs subscription error:', error);
    });
  },
};

// Resumes Service for Firebase
export const resumesService = {
  // Create resume
  create: async (resume: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resume> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(collection(firestoreDB, 'resumes'));
    const newResume: Resume = {
      id: docRef.id,
      ...resume,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, {
      ...newResume,
      createdAt: Timestamp.fromDate(new Date(newResume.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(newResume.updatedAt)),
    });

    return newResume;
  },

  // Update resume
  update: async (id: string, updates: Partial<Resume>): Promise<void> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(firestoreDB, 'resumes', id);
    await setDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    }, { merge: true });
  },

  // Delete resume
  delete: async (id: string): Promise<void> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    const docRef = doc(firestoreDB, 'resumes', id);
    await deleteDoc(docRef);
  },

  // Subscribe to real-time updates
  subscribe: (callback: (resumes: Resume[]) => void): (() => void) => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      return () => {};
    }

    const q = query(
      collection(firestoreDB, 'resumes'),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const resumes: Resume[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const resume: Resume = {
          id: docSnap.id,
          title: data.title || '',
          templateId: data.templateId || '',
          data: data.data || {},
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        };
        resumes.push(resume);
      });
      callback(resumes);
    }, (error) => {
      console.error('❌ Firebase resumes subscription error:', error);
    });
  },
};

