/**
 * Application constants
 */

// Storage Keys
export const STORAGE_KEYS = {
  DOCUMENTS: '@documents',
  SETTINGS: '@settings',
} as const;

// API Configuration
export const API_CONFIG = {
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  OPENAI_WHISPER_URL: 'https://api.openai.com/v1/audio/transcriptions',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect. Please check your internet connection.',
  STORAGE: 'Unable to save data. Please try again.',
  VALIDATION: 'Please check your input and try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const;

// UI Constants
export const UI = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  SNACKBAR_DURATION: 3000,
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_AI: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: false,
} as const;

