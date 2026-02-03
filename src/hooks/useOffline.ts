import { useState, useEffect } from 'react';

// Simple offline detection - can be enhanced with NetInfo if needed
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Try to use NetInfo if available
    let unsubscribe: (() => void) | null = null;

    try {
      // Dynamic import to avoid issues if NetInfo is not available
      import('@react-native-community/netinfo').then((NetInfo) => {
        const unsub = NetInfo.default.addEventListener(state => {
          setIsOffline(!state.isConnected);
        });
        unsubscribe = unsub;

        // Check initial state
        NetInfo.default.fetch().then(state => {
          setIsOffline(!state.isConnected);
        });
      }).catch(() => {
        // NetInfo not available, assume online
        setIsOffline(false);
      });
    } catch {
      // Fallback: assume online
      setIsOffline(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return isOffline;
}

