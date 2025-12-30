import { useEffect, useRef } from 'react';

/**
 * Hook for debounced saving of data to storage
 * Extracted from TagsContext and ProgressContext to eliminate duplication
 *
 * @param data - The data to save (triggers save on change)
 * @param saveFunction - Function to call with the data
 * @param delay - Debounce delay in milliseconds
 * @param isReady - Whether the system is ready to save (typically isLoaded state)
 */
export function useDebouncedSave<T>(
  data: T,
  saveFunction: (data: T) => void | Promise<void>,
  delay: number,
  isReady: boolean
): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef(data);
  const isPendingRef = useRef(false);
  const saveFunctionRef = useRef(saveFunction);

  // Direct assignment - no useEffect needed for refs
  dataRef.current = data;
  saveFunctionRef.current = saveFunction;

  useEffect(() => {
    if (isReady) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Mark save as pending
      isPendingRef.current = true;

      // Set new debounced save
      timeoutRef.current = setTimeout(() => {
        saveFunction(data);
        isPendingRef.current = false;
      }, delay);
    }

    // Cleanup on unmount or data change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction, delay, isReady]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (isPendingRef.current) {
        saveFunctionRef.current(dataRef.current);
      }
    };
  }, []);
}
