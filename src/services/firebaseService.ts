import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, deleteDoc, getDocs, query, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { Document, Resume, ResumeTemplate } from '@/types';

// Firebase configuration - all values must come from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase
 * Returns Firestore instance if successful, null otherwise
 */
export const initializeFirebase = (): Firestore | null => {
  try {
    // Check if all required config values are present
    if (!firebaseConfig.apiKey) {
      console.error('❌ Firebase not configured - EXPO_PUBLIC_FIREBASE_API_KEY missing');
      return null;
    }

    if (!firebaseConfig.projectId) {
      console.error('❌ Firebase not configured - EXPO_PUBLIC_FIREBASE_PROJECT_ID missing');
      return null;
    }

    if (!firebaseConfig.authDomain) {
      console.error('❌ Firebase not configured - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN missing');
      return null;
    }

    if (!firebaseConfig.storageBucket) {
      console.error('❌ Firebase not configured - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET missing');
      return null;
    }

    if (!firebaseConfig.messagingSenderId) {
      console.error('❌ Firebase not configured - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID missing');
      return null;
    }

    if (!firebaseConfig.appId) {
      console.error('❌ Firebase not configured - EXPO_PUBLIC_FIREBASE_APP_ID missing');
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

// Templates Service for Firebase
export const templatesService = {
  // Get all active templates
  getAll: async (): Promise<ResumeTemplate[]> => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      throw new Error('Firebase not initialized');
    }

    // Fetch all templates and filter/sort in memory to avoid composite index requirement
    const q = query(collection(firestoreDB, 'templates'));

    const snapshot = await getDocs(q);
    const templates: ResumeTemplate[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const template: ResumeTemplate = {
        id: docSnap.id,
        name: data.name || '',
        description: data.description || '',
        badge: data.badge || null,
        industries: data.industries || [],
        roles: data.roles || [],
        isActive: data.isActive !== false,
        order: data.order || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      };
      templates.push(template);
    });
    
    // Filter active templates and sort by order
    return templates
      .filter(t => t.isActive)
      .sort((a, b) => a.order - b.order);
  },

  // Subscribe to real-time updates
  subscribe: (callback: (templates: ResumeTemplate[]) => void): (() => void) => {
    const firestoreDB = getFirestoreDB();
    if (!firestoreDB) {
      return () => {};
    }

    // Fetch all templates and filter/sort in memory to avoid composite index requirement
    const q = query(collection(firestoreDB, 'templates'));

    return onSnapshot(q, (snapshot) => {
      const templates: ResumeTemplate[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const template: ResumeTemplate = {
          id: docSnap.id,
          name: data.name || '',
          description: data.description || '',
          badge: data.badge || null,
          industries: data.industries || [],
          roles: data.roles || [],
          isActive: data.isActive !== false,
          order: data.order || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        };
        templates.push(template);
      });
      
      // Filter active templates and sort by order
      const activeTemplates = templates
        .filter(t => t.isActive)
        .sort((a, b) => a.order - b.order);
      
      callback(activeTemplates);
    }, (error) => {
      console.error('❌ Firebase templates subscription error:', error);
    });
  },
};

