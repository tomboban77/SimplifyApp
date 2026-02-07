import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { getFirestoreDB, getAuthInstance } from './firebaseService';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User, UserProfile } from '@/types/auth';

/**
 * Firebase Authentication Service
 * 
 * Handles all authentication operations:
 * - User registration
 * - User login
 * - User logout
 * - Password reset
 * - Profile management
 * - Auth state persistence
 */
class AuthService {
  private get auth() {
    const authInstance = getAuthInstance();
    if (!authInstance) {
      throw new Error('Firebase Auth not initialized. Make sure Firebase is configured.');
    }
    return authInstance;
  }

  /**
   * Register a new user with email and password
   */
  async register(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User> {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const db = getFirestoreDB();
      if (db) {
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          {
            ...userProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );
      }

      // Convert to app User type
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL,
      };

      return user;
    } catch (error: any) {
      // Handle specific Firebase errors
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Sign in with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      // Fetch user profile from Firestore
      const userProfile = await this.getUserProfile(firebaseUser.uid);

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: userProfile?.displayName || firebaseUser.displayName || '',
        photoURL: userProfile?.photoURL || firebaseUser.photoURL || null,
      };

      return user;
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      throw new Error('Logout failed. Please try again.');
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No user is currently signed in.');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password should be at least 6 characters.';
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const db = getFirestoreDB();
      if (!db) {
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || '',
        photoURL: data.photoURL || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in.');
      }

      const db = getFirestoreDB();
      if (!db) {
        throw new Error('Firebase not initialized');
      }

      // Update Firebase Auth profile if displayName or photoURL changed
      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: updates.displayName || user.displayName || undefined,
          photoURL: updates.photoURL || user.photoURL || undefined,
        });
      }

      // Update Firestore profile
      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...updates,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error: any) {
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }
}

export const authService = new AuthService();

