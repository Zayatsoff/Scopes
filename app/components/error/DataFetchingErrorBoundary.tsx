import React from "react"
import { ErrorBoundary as BaseErrorBoundary } from "../../screens/ErrorScreen/ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"
import { logError } from "../../utils/errorLogger"
import { View, ViewStyle } from "react-native"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { TxKeyPath, translate } from "../../i18n"

interface DataFetchingErrorBoundaryProps {
  children: React.ReactNode
  dataSource: string
  fallbackType?: "card" | "inline" | "default"
  FallbackComponent?: React.ComponentType<{
    error: Error
    resetError: () => void
    retry?: () => Promise<void> | void
  }>
  style?: ViewStyle
  retryFn?: () => Promise<void> | void
  maxRetries?: number
}

/**
 * Error boundary specifically designed for components that fetch data.
 * Optimized for network errors and API failures with retry capabilities.
 */
export function DataFetchingErrorBoundary({
  children,
  dataSource,
  fallbackType = "card",
  FallbackComponent,
  style,
  retryFn,
  maxRetries = 1,
}: DataFetchingErrorBoundaryProps) {
  const { themed } = useAppTheme()
  
  // This tracks if a retry function is currently executing
  const [isRetrying, setIsRetrying] = React.useState(false)
  
  // Error handler that includes API or data fetching context
  const handleError = (error: Error, componentStack: string) => {
    // If the error has a response property, it's likely an API error
    const isApiError = 'response' in error || 'status' in error || error.name === 'NetworkError'
    
    logError(error, {
      componentName: `DataFetching-${dataSource}`,
      componentStack,
      severity: "high",
      tags: ["data-error", isApiError ? "api-error" : "processing-error"],
      additionalInfo: {
        dataSource,
        isApiError,
      }
    })
  }
  
  // Custom retry handler to coordinate with optional retryFn
  const handleRetry = async (resetError: () => void) => {
    if (isRetrying || !retryFn) {
      resetError()
      return
    }
    
    setIsRetrying(true)
    
    try {
      await retryFn()
      resetError()
    } catch (error) {
      console.warn("Retry failed:", error)
      // resetError will be handled by the error boundary itself
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <BaseErrorBoundary
      catchErrors="always"
      componentName={`DataFetching-${dataSource}`}
      onError={handleError}
      maxRetries={maxRetries}
      fallback={
        FallbackComponent
          ? ({ error, resetError }) => (
              <View style={[themed($container), style]}>
                <FallbackComponent 
                  error={error} 
                  resetError={resetError} 
                  retry={retryFn ? () => handleRetry(resetError) : undefined}
                />
              </View>
            )
          : ({ error, resetError }) => (
              <View style={[themed($container), style]}>
                <ErrorFallback
                  error={error}
                  resetError={retryFn ? () => handleRetry(resetError) : resetError}
                  variant={fallbackType}
                  showDetails={__DEV__}
                  titleTx="errorBoundary:dataFetching.title"
                  messageTx={getErrorMessageTxKey(error)}
                />
              </View>
            )
      }
    >
      {children}
    </BaseErrorBoundary>
  )
}

/**
 * Get a translation key for the error message based on the error type
 */
function getErrorMessageTxKey(error: Error): TxKeyPath {
  // Check for network connectivity errors
  if (error.message.includes('Network') || error.message.includes('network') || 
      error.message.includes('connection') || error.message.includes('timeout') ||
      error.message.includes('offline')) {
    return "errorBoundary:dataFetching.networkError"
  }
  
  // Check for server errors
  if (error.message.includes('500') || error.message.includes('server error')) {
    return "errorBoundary:dataFetching.serverError"
  }
  
  // Check for not found errors
  if (error.message.includes('404') || error.message.includes('not found')) {
    return "errorBoundary:dataFetching.notFoundError"
  }
  
  // Check for authentication errors
  if (error.message.includes('401') || error.message.includes('403') || 
      error.message.includes('unauthorized') || error.message.includes('forbidden')) {
    return "errorBoundary:dataFetching.authError"
  }
  
  // Default message
  return "errorBoundary:dataFetching.message"
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  overflow: "hidden",
}) 