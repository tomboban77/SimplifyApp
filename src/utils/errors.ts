/**
 * Custom error types for better error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', originalError?: Error) {
    super(message, 'NETWORK_ERROR', 0, originalError);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class StorageError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 'STORAGE_ERROR', 0, originalError);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Error handler utility
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for network errors
    if (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    ) {
      return new NetworkError(error.message, error);
    }

    // Generic error
    return new AppError(error.message, 'UNKNOWN_ERROR', undefined, error);
  }

  // Unknown error type
  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR');
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const appError = handleError(error);

  switch (appError.code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect. Please check your internet connection and try again.';
    case 'VALIDATION_ERROR':
      return appError.message;
    case 'STORAGE_ERROR':
      return 'Unable to save data locally. Please try again.';
    default:
      return appError.message || 'Something went wrong. Please try again.';
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const appError = handleError(error);
  return appError.code === 'NETWORK_ERROR';
}

