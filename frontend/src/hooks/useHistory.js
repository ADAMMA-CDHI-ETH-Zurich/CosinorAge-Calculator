import { useState, useEffect, useCallback } from 'react';

const MAX_HISTORY_ITEMS = 10;

export const useHistory = (tabType) => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(`CosinorAge Calculator_history_${tabType}`);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory.history || []);
        setCurrentIndex(parsedHistory.currentIndex || -1);
      } catch (error) {
        console.error('Error loading history from localStorage:', error);
      }
    }
  }, [tabType]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`CosinorAge Calculator_history_${tabType}`, JSON.stringify({
      history,
      currentIndex
    }));
  }, [history, currentIndex, tabType]);

  const saveState = useCallback((state) => {
    const timestamp = new Date().toISOString();
    const historyItem = {
      id: `${tabType}_${timestamp}`,
      timestamp,
      state: { ...state },
      label: `Run ${history.length + 1} - ${new Date(timestamp).toLocaleString()}`
    };

    setHistory(prevHistory => {
      const newHistory = [historyItem, ...prevHistory.slice(0, MAX_HISTORY_ITEMS - 1)];
      return newHistory;
    });
    setCurrentIndex(0);
  }, [tabType, history.length]);

  const restoreState = useCallback((index) => {
    if (index >= 0 && index < history.length) {
      setCurrentIndex(index);
      return history[index].state;
    }
    return null;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const removeHistoryItem = useCallback((id) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      const newIndex = currentIndex >= newHistory.length ? -1 : currentIndex;
      setCurrentIndex(newIndex);
      return newHistory;
    });
  }, [currentIndex]);

  return {
    history,
    currentIndex,
    saveState,
    restoreState,
    clearHistory,
    removeHistoryItem,
    hasHistory: history.length > 0
  };
}; 