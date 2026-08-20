import { useState, useCallback } from "react"
import { logError, ErrorMetadata } from "./errorLogger"

/**
 * A hook that allows functional components to catch and handle errors.
 * This simulates the behavior of Error Boundaries but for specific operations
 * within a functional component.
 *
 * @param componentName Optional name of the component for better error tracking
 * @param fallbackValue Value to return when an error occurs
 * @returns An array containing [errorHandler, error, resetError]
 */
export function useErrorHandler<T = any>(
  componentName?: string,
  fallbackValue?: T,
): [
  // Function to wrap operations that might throw
  <R>(fn: () => R, metadata?: ErrorMetadata) => R | T,
  // Current error state
  Error | null,
  // Function to reset the error state
  () => void,
] {
  const [error, setError] = useState<Error | null>(null)

  /**
   * Wraps a function with error handling
   * @param fn Function to execute
   * @param metadata Additional error context
   * @returns Result of the function or fallback value if an error occurred
   */
  const handleError = useCallback(
    <R>(fn: () => R, metadata: ErrorMetadata = {}): R | T => {
      try {
        return fn()
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))

        // Update error state
        setError(error)

        // Log the error with component context
        logError(error, {
          componentName,
          ...metadata,
        })

        // Return fallback value
        return fallbackValue as T
      }
    },
    [componentName, fallbackValue],
  )

  /**
   * Resets the error state
   */
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  return [handleError, error, resetError]
}

/**
 * A specialized version of useErrorHandler for async operations.
 *
 * @param componentName Optional name of the component for better error tracking
 * @returns An array containing [asyncErrorHandler, error, resetError]
 */
export function useAsyncErrorHandler(componentName?: string): [
  // Function to wrap async operations that might throw
  <R>(fn: () => Promise<R>, metadata?: ErrorMetadata) => Promise<R | undefined>,
  // Current error state
  Error | null,
  // Function to reset the error state
  () => void,
] {
  const [error, setError] = useState<Error | null>(null)

  /**
   * Wraps an async function with error handling
   * @param fn Async function to execute
   * @param metadata Additional error context
   * @returns Promise resolving to the function result or undefined if error
   */
  const handleAsyncError = useCallback(
    async <R>(fn: () => Promise<R>, metadata: ErrorMetadata = {}): Promise<R | undefined> => {
      try {
        return await fn()
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))

        // Update error state
        setError(error)

        // Log the error with component context
        logError(error, {
          componentName,
          ...metadata,
        })

        return undefined
      }
    },
    [componentName],
  )

  /**
   * Resets the error state
   */
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  return [handleAsyncError, error, resetError]
}
