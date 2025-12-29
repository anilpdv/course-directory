/**
 * Result type for operations that can fail
 * Provides type-safe error handling instead of throwing exceptions
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper to create a success result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper to create a failure result
 */
export function failure<T>(error: string): Result<T> {
  return { success: false, error };
}
