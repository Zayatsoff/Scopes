import React from "react"
import { ErrorBoundary as BaseErrorBoundary } from "../../screens/ErrorScreen/ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"
import { logError } from "../../utils/errorLogger"
import { CommonActions, NavigationContainerRef } from "@react-navigation/native"
import { View, ViewStyle } from "react-native"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface NavigationErrorBoundaryProps {
  children: React.ReactNode
  routeName: string
  navigation?: NavigationContainerRef<any>
  fallbackRoute?: string // Route to navigate to if there's an error
  style?: ViewStyle
}

/**
 * Error boundary specifically designed for navigation screens.
 * Has the ability to navigate to a fallback route when an error occurs.
 */
export function NavigationErrorBoundary({
  children,
  routeName,
  navigation,
  fallbackRoute,
  style,
}: NavigationErrorBoundaryProps) {
  const { themed } = useAppTheme()
  
  // Error handler that includes navigation context
  const handleError = (error: Error, componentStack: string) => {
    logError(error, {
      componentName: `Navigation-${routeName}`,
      componentStack,
      severity: "high",
      tags: ["navigation-error"],
      additionalInfo: {
        routeName,
        fallbackRoute,
      }
    })
    
    // If specified and available, navigate to a fallback route
    if (fallbackRoute && navigation?.isReady()) {
      try {
        navigation.dispatch(
          CommonActions.navigate({
            name: fallbackRoute,
          })
        )
      } catch (navError) {
        console.error("Failed to navigate to fallback route:", navError)
      }
    }
  }

  return (
    <BaseErrorBoundary
      catchErrors="always"
      componentName={`Navigation-${routeName}`}
      onError={handleError}
      fallback={({ error, resetError }) => (
        <View style={[themed($container), style]}>
          <ErrorFallback
            error={error}
            resetError={resetError}
            titleTx="errorBoundary:navigation.title"
            messageTx="errorBoundary:navigation.message"
            showDetails={__DEV__}
          />
        </View>
      )}
    >
      {children}
    </BaseErrorBoundary>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
}) 