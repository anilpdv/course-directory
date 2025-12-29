import { useCallback, DependencyList } from 'react';

/**
 * Creates a callback that calls the original callback and then a reset function.
 * Useful for player controls that need to reset the hide timeout after user interaction.
 *
 * @param callback The main callback to execute
 * @param resetFn The reset function to call after the callback
 * @param deps Additional dependencies for the callback
 * @returns A wrapped callback that executes both functions
 */
export function useCallbackWithReset<T extends (...args: any[]) => any>(
  callback: T,
  resetFn: () => void,
  deps: DependencyList
): T {
  return useCallback(
    ((...args: Parameters<T>) => {
      callback(...args);
      resetFn();
    }) as T,
    [callback, resetFn, ...deps]
  );
}
