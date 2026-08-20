/**
 * Error logging utility for the application.
 * This service centralizes error reporting and can be configured to send errors
 * to various monitoring services like Sentry, Firebase Crashlytics, etc.
 */

import Config from "../config"

// Define the error metadata interface
export interface ErrorMetadata {
  componentName?: string
  componentStack?: string
  userId?: string
  additionalInfo?: Record<string, any>
  severity?: "low" | "medium" | "high" | "critical"
  tags?: string[]
}

/**
 * Log an error to the configured error reporting services
 * @param error The error object
 * @param metadata Additional context about the error
 */
export function logError(error: Error, metadata: ErrorMetadata = {}) {
  // In development, always log to console for debugging
  if (__DEV__) {
    console.error("======= ERROR CAPTURED =======")
    console.error(`Error: ${error.message}`)
    console.error(`Stack: ${error.stack}`)

    if (metadata.componentName) {
      console.error(`Component: ${metadata.componentName}`)
    }

    if (metadata.componentStack) {
      console.error(`Component Stack: ${metadata.componentStack}`)
    }

    if (metadata.additionalInfo) {
      console.error("Additional Info:", metadata.additionalInfo)
    }

    console.error("=============================")
  }

  // Only log to production services if error catching is enabled
  if (Config.catchErrors === "always" || (Config.catchErrors === "prod" && !__DEV__)) {
    // Here you would integrate with error monitoring services
    // Examples:
    // For Sentry:
    // import * as Sentry from '@sentry/react-native';
    // Sentry.captureException(error, {
    //   extra: metadata.additionalInfo,
    //   tags: metadata.tags ? Object.fromEntries(metadata.tags.map(tag => [tag, true])) : undefined,
    //   level: mapSeverityToSentryLevel(metadata.severity),
    // });
    // For Firebase Crashlytics:
    // import crashlytics from '@react-native-firebase/crashlytics';
    // crashlytics().recordError(error);
    // if (metadata.userId) crashlytics().setUserId(metadata.userId);
    // if (metadata.componentName) crashlytics().setAttribute('component', metadata.componentName);
  }
}

/**
 * Creates a standardized error object with app context
 * @param message Error message
 * @param code Optional error code
 * @param metadata Additional error context
 */
export function createAppError(
  message: string,
  code?: string,
  metadata: ErrorMetadata = {},
): Error {
  const error = new Error(message)

  // Add custom properties to the error
  Object.assign(error, {
    code,
    metadata,
    timestamp: new Date().toISOString(),
  })

  return error
}

/**
 * Handles an unexpected error gracefully
 * @param error The error that occurred
 * @param fallbackMessage Optional user-friendly message to display
 */
export function handleUnexpectedError(error: Error, fallbackMessage?: string): string {
  // Log the error
  logError(error, { severity: "high" })

  // Return a user-friendly message
  return fallbackMessage || "An unexpected error occurred. Please try again later."
}
