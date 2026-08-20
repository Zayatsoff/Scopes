import { ReactNode, ComponentType } from "react"
import { ErrorBoundary as BaseErrorBoundary } from "../../screens/ErrorScreen/ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"
import { logError } from "../../utils/errorLogger"
import { View, ViewStyle } from "react-native"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface ComponentErrorBoundaryProps {
  children: ReactNode
  componentName: string
  fallbackType?: "card" | "inline" | "minimal"
  FallbackComponent?: ComponentType<{
    error: Error
    resetError: () => void
  }>
  style?: ViewStyle
}

/**
 * Error boundary specifically designed for UI components.
 * Provides a more compact error display tailored for component-level errors.
 */
export function ComponentErrorBoundary({
  children,
  componentName,
  fallbackType = "card",
  FallbackComponent,
  style,
}: ComponentErrorBoundaryProps) {
  const { themed } = useAppTheme()

  const handleError = (error: Error, componentStack: string) => {
    logError(error, {
      componentName,
      componentStack,
      severity: "medium",
      tags: ["component-error"],
    })
  }

  return (
    <BaseErrorBoundary
      catchErrors="always"
      componentName={componentName}
      onError={handleError}
      fallback={
        FallbackComponent
          ? ({ error, resetError }) => (
              <View style={[themed($container), style]}>
                <FallbackComponent error={error} resetError={resetError} />
              </View>
            )
          : ({ error, resetError }) => (
              <View style={[themed($container), style]}>
                <ErrorFallback
                  error={error}
                  resetError={resetError}
                  variant={fallbackType}
                  showDetails={__DEV__}
                  titleTx="errorBoundary:component.title"
                  messageTx="errorBoundary:component.message"
                />
              </View>
            )
      }
    >
      {children}
    </BaseErrorBoundary>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  overflow: "hidden",
})
