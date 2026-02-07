/**
 * Migration Script: Associate existing documents and resumes with a user
 * 
 * This script will:
 * 1. Find all documents and resumes without a userId
 * 2. Associate them with the specified user ID
 * 
 * Usage: npx tsx scripts/migrate-user-data.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// User ID to associate existing data with
const TARGET_USER_ID = 'lp3jLZ3DyHNIWGYIJbLYNAcoEM52';

async function migrateData() {
  try {
    console.log('🚀 Starting migration...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized');

    // Migrate Documents
    console.log('\n📄 Migrating documents...');
    const documentsRef = collection(db, 'documents');
    
    // Get all documents (we'll filter in memory to find ones without userId)
    const documentsSnapshot = await getDocs(documentsRef);
    let documentsMigrated = 0;
    
    for (const docSnap of documentsSnapshot.docs) {
      const data = docSnap.data();
      
      // Check if document doesn't have userId or has empty userId
      if (!data.userId || data.userId === '') {
        const docRef = doc(db, 'documents', docSnap.id);
        await updateDoc(docRef, {
          userId: TARGET_USER_ID,
        });
        documentsMigrated++;
        console.log(`  ✓ Migrated document: ${docSnap.id}`);
      }
    }
    
    console.log(`✅ Migrated ${documentsMigrated} documents`);

    // Migrate Resumes
    console.log('\n📋 Migrating resumes...');
    const resumesRef = collection(db, 'resumes');
    
    const resumesSnapshot = await getDocs(resumesRef);
    let resumesMigrated = 0;
    
    for (const docSnap of resumesSnapshot.docs) {
      const data = docSnap.data();
      
      // Check if resume doesn't have userId or has empty userId
      if (!data.userId || data.userId === '') {
        const docRef = doc(db, 'resumes', docSnap.id);
        await updateDoc(docRef, {
          userId: TARGET_USER_ID,
        });
        resumesMigrated++;
        console.log(`  ✓ Migrated resume: ${docSnap.id}`);
      }
    }
    
    console.log(`✅ Migrated ${resumesMigrated} resumes`);

    console.log('\n🎉 Migration completed successfully!');
    console.log(`   - Documents migrated: ${documentsMigrated}`);
    console.log(`   - Resumes migrated: ${resumesMigrated}`);
    console.log(`   - All data associated with user: ${TARGET_USER_ID}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();

