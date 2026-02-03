import { useState, useCallback } from 'react';
import { PDFAnnotation } from '@/types';

interface HistoryState {
  annotations: PDFAnnotation[];
}

export function useUndoRedo(initialAnnotations: PDFAnnotation[] = []) {
  const [history, setHistory] = useState<HistoryState[]>([{ annotations: initialAnnotations }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentAnnotations = history[historyIndex]?.annotations || [];

  const addToHistory = useCallback((annotations: PDFAnnotation[]) => {
    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push({ annotations: [...annotations] });
      // Limit history to 50 states for memory management
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback((): PDFAnnotation[] | null => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return history[newIndex]?.annotations || [];
    }
    return null;
  }, [historyIndex, history]);

  const redo = useCallback((): PDFAnnotation[] | null => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return history[newIndex]?.annotations || [];
    }
    return null;
  }, [historyIndex, history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    currentAnnotations,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

