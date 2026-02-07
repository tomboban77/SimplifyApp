/**
 * Authentication Types
 */

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

