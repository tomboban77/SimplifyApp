/**
 * Migration Script: Seed Resume Templates to Firebase
 * 
 * This script populates Firebase Firestore with the initial resume templates.
 * 
 * Usage:
 *   npm run seed:templates
 * 
 * Or directly:
 *   npx tsx scripts/seed-templates.ts
 *   ts-node scripts/seed-templates.ts
 */

// Load environment variables from .env file
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env file from project root (relative to script location)
// This works for tsx which runs in Node.js context
const envPath = resolve(process.cwd(), '.env');
config({ path: envPath });

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { ResumeTemplate } from '../src/types';
import { templateSchemas } from '../src/schemas/templateSchemas';

// Firebase configuration - all values must come from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Default templates to seed with schemas
const defaultTemplates: Omit<ResumeTemplate, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'template1',
    name: 'Classic Professional',
    description: 'Traditional single-column layout trusted by Fortune 500 recruiters. Clean black typography, ATS-optimized.',
    badge: 'Most Popular',
    industries: ['Technology', 'Finance', 'Consulting', 'Legal', 'Real Estate', 'Manufacturing', 'Retail'],
    roles: ['Entry Level', 'Mid Level', 'Senior Level', 'Manager', 'Director'],
    isActive: true,
    order: 1,
    schema: templateSchemas.template1,
  },
  {
    id: 'template2',
    name: 'Modern Executive',
    description: 'Sophisticated navy blue design for senior professionals. Bold header with elegant section styling.',
    badge: 'Executive',
    industries: ['Finance', 'Consulting', 'Legal', 'Healthcare', 'Education', 'Technology'],
    roles: ['Senior Level', 'Executive', 'Manager', 'Director'],
    isActive: true,
    order: 2,
    schema: templateSchemas.template2,
  },
  {
    id: 'template3',
    name: 'Minimalist',
    description: 'Ultra-clean design with elegant whitespace. Perfect for letting your content speak for itself.',
    badge: null,
    industries: ['Design', 'Technology', 'Marketing', 'Education', 'Healthcare'],
    roles: ['Entry Level', 'Mid Level', 'Senior Level', 'Freelancer'],
    isActive: true,
    order: 3,
    schema: templateSchemas.template3,
  },
  {
    id: 'template4',
    name: 'Corporate',
    description: 'Classic authoritative layout ideal for law, finance, consulting, and corporate positions.',
    badge: null,
    industries: ['Legal', 'Finance', 'Consulting', 'Real Estate', 'Manufacturing'],
    roles: ['Mid Level', 'Senior Level', 'Manager', 'Director', 'Executive'],
    isActive: true,
    order: 4,
    schema: templateSchemas.template4,
  },
  {
    id: 'template5',
    name: 'Bold Professional',
    description: 'Eye-catching design with red accent header. Modern section styling with subtle backgrounds.',
    badge: 'Creative',
    industries: ['Design', 'Marketing', 'Sales', 'Technology', 'Hospitality'],
    roles: ['Entry Level', 'Mid Level', 'Senior Level', 'Freelancer'],
    isActive: true,
    order: 5,
    schema: templateSchemas.template5,
  },
];

async function seedTemplates() {
  try {
    console.log('🚀 Starting template migration...\n');

    // Validate Firebase configuration
    if (!firebaseConfig.apiKey) {
      throw new Error('EXPO_PUBLIC_FIREBASE_API_KEY environment variable is required');
    }
    if (!firebaseConfig.projectId) {
      throw new Error('EXPO_PUBLIC_FIREBASE_PROJECT_ID environment variable is required');
    }
    if (!firebaseConfig.authDomain) {
      throw new Error('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN environment variable is required');
    }
    if (!firebaseConfig.storageBucket) {
      throw new Error('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is required');
    }
    if (!firebaseConfig.messagingSenderId) {
      throw new Error('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID environment variable is required');
    }
    if (!firebaseConfig.appId) {
      throw new Error('EXPO_PUBLIC_FIREBASE_APP_ID environment variable is required');
    }

    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized');
    } else {
      app = getApps()[0];
      console.log('✅ Using existing Firebase app');
    }

    const db = getFirestore(app);
    const templatesCollection = collection(db, 'templates');

    // Check if templates already exist
    const existingTemplates = await getDocs(query(templatesCollection));
    if (existingTemplates.size > 0) {
      console.log(`⚠️  Found ${existingTemplates.size} existing template(s) in database.`);
      console.log('   This script will update existing templates with matching IDs.\n');
    }

    // Seed each template
    const now = new Date().toISOString();
    let successCount = 0;
    let updateCount = 0;
    let errorCount = 0;

    for (const template of defaultTemplates) {
      try {
        const templateRef = doc(templatesCollection, template.id);
        
        // Check if template exists
        const existing = existingTemplates.docs.find(doc => doc.id === template.id);
        
        if (existing) {
          // Update existing template (preserve original createdAt)
          const existingData = existing.data();
          const existingCreatedAt = existingData.createdAt?.toDate?.()?.toISOString() || existingData.createdAt || now;
          
          await setDoc(templateRef, {
            ...template,
            createdAt: Timestamp.fromDate(new Date(existingCreatedAt)),
            updatedAt: Timestamp.fromDate(new Date()),
          }, { merge: true });
          console.log(`   ✏️  Updated: ${template.name} (${template.id})`);
          updateCount++;
        } else {
          // Create new template
          await setDoc(templateRef, {
            ...template,
            createdAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date()),
          });
          console.log(`   ✅ Created: ${template.name} (${template.id})`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`   ❌ Error with ${template.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Created: ${successCount}`);
    console.log(`   ✏️  Updated: ${updateCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total: ${defaultTemplates.length} templates\n`);

    if (errorCount === 0) {
      console.log('🎉 Template migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with some errors. Please review the output above.');
    }

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error);
    console.error('   Error details:', error.message);
    process.exit(1);
  }
}

// Run the migration
seedTemplates();

