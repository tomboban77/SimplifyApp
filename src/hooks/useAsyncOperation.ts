import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { handleError, getErrorMessage, isRetryableError, AppError } from '@/utils/errors';

interface UseAsyncOperationOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: AppError) => void;
  showErrorAlert?: boolean;
  retryable?: boolean;
  maxRetries?: number;
}

interface AsyncOperationState<T> {
  loading: boolean;
  error: AppError | null;
  data: T | null;
}

export function useAsyncOperation<T = any>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const {
    onSuccess,
    onError,
    showErrorAlert = true,
    retryable = true,
    maxRetries = 3,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (retryCount = 0): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await operation();
        setState({ loading: false, error: null, data: result });
        onSuccess?.(result);
        return result;
      } catch (error) {
        const appError = handleError(error);
        setState(prev => ({ ...prev, loading: false, error: appError }));

        // Retry logic
        if (
          retryable &&
          isRetryableError(appError) &&
          retryCount < maxRetries
        ) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return execute(retryCount + 1);
        }

        // Handle error
        onError?.(appError);

        if (showErrorAlert) {
          Alert.alert('Error', getErrorMessage(appError));
        }

        return null;
      }
    },
    [operation, onSuccess, onError, showErrorAlert, retryable, maxRetries]
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

