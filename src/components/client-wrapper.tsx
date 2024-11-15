'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsedItem = JSON.parse(item);
        setStoredValue(parsedItem);
      } else {
        // If no value in localStorage, set the initial value
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.warn(`Error reading from localStorage for key "${key}":`, error);
      // If there's an error reading from localStorage, set the initial value
      window.localStorage.setItem(key, JSON.stringify(initialValue));
    }
    setIsInitialized(true);
  }, [key, initialValue, isInitialized]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error saving to localStorage for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
