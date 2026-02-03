import { useCallback } from 'react';
import { Alert } from 'react-native';
import { handleError, getErrorMessage, AppError } from '@/utils/errors';

interface UseErrorHandlerOptions {
  showAlert?: boolean;
  logError?: boolean;
  onError?: (error: AppError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showAlert = true, logError = true, onError } = options;

  const handleErrorCallback = useCallback(
    (error: unknown, customMessage?: string) => {
      const appError = handleError(error);

      if (logError) {
        console.error('Error handled:', appError);
        if (appError.originalError) {
          console.error('Original error:', appError.originalError);
        }
      }

      if (onError) {
        onError(appError);
      }

      if (showAlert) {
        Alert.alert(
          'Error',
          customMessage || getErrorMessage(appError),
          [{ text: 'OK' }]
        );
      }

      return appError;
    },
    [showAlert, logError, onError]
  );

  return handleErrorCallback;
}

