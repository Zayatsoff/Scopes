import { View, ViewStyle, TextStyle } from "react-native"
import { Text, Button, Icon } from "../../components"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { TxKeyPath, translate } from "../../i18n"

export interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  title?: string
  titleTx?: TxKeyPath
  message?: string
  messageTx?: TxKeyPath
  showDetails?: boolean
  variant?: "default" | "inline" | "minimal" | "card"
}

/**
 * A reusable fallback component that displays an error message with a retry button
 */
export function ErrorFallback({
  error,
  resetError,
  title,
  titleTx = "errorScreen:title",
  message,
  messageTx = "errorBoundary:component.message",
  showDetails = __DEV__,
  variant = "default",
}: ErrorFallbackProps) {
  const { themed } = useAppTheme()

  const titleText = titleTx ? translate(titleTx) : title
  const messageText = messageTx ? translate(messageTx) : message

  // Minimal version just shows a small indicator with retry
  if (variant === "minimal") {
    return (
      <View style={themed($minimalContainer)}>
        <Icon icon="ladybug" size={16} color={themed($errorIcon).color} />
        <Text preset="formLabel" style={themed($minimalText)}>
          Error
        </Text>
        <Button
          text={translate("common:retry")}
          style={themed($retryButton)}
          onPress={resetError}
        />
      </View>
    )
  }

  // Inline version for row items or list elements
  if (variant === "inline") {
    return (
      <View style={themed($inlineContainer)}>
        <Icon icon="ladybug" size={20} color={themed($errorIcon).color} />
        <View style={$textContainer}>
          <Text weight="bold" style={themed($title)}>
            {titleText}
          </Text>
          <Text style={themed($message)}>{messageText}</Text>
        </View>
        <Button
          preset="reversed"
          tx="common:retry"
          style={themed($retryButton)}
          onPress={resetError}
        />
      </View>
    )
  }

  // Card version for components
  if (variant === "card") {
    return (
      <View style={themed($cardContainer)}>
        <Icon icon="ladybug" size={32} color={themed($errorIcon).color} />
        <Text weight="bold" style={themed($title)}>
          {titleText}
        </Text>
        <Text style={themed($message)}>{messageText}</Text>
        {showDetails && (
          <Text selectable style={themed($errorDetails)}>
            {error.message}
          </Text>
        )}
        <Button
          preset="reversed"
          tx="common:retry"
          style={themed($retryButton)}
          onPress={resetError}
        />
      </View>
    )
  }

  // Default full screen version
  return (
    <View style={themed($container)}>
      <Icon icon="ladybug" size={64} color={themed($errorIcon).color} />
      <Text preset="heading" style={themed($title)}>
        {titleText}
      </Text>
      <Text style={themed($message)}>{messageText}</Text>

      {showDetails && (
        <View style={themed($detailsContainer)}>
          <Text weight="bold" style={themed($detailsTitle)}>
            {translate("errorScreen:errorDetails")}:
          </Text>
          <Text selectable style={themed($errorDetails)}>
            {error.message}
          </Text>
          {error.stack && (
            <Text selectable style={themed($stackTrace)}>
              {error.stack}
            </Text>
          )}
        </View>
      )}

      <Button
        preset="reversed"
        tx="common:retry"
        style={themed($retryButton)}
        onPress={resetError}
      />
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.lg,
  backgroundColor: colors.background,
})

const $cardContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.md,
  borderRadius: 3,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.separator,
  shadowColor: colors.textDim,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
})

const $inlineContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.xs,
  backgroundColor: colors.background,
  borderRadius: 3,
})

const $minimalContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.xs,
  backgroundColor: "transparent",
})

const $textContainer: ViewStyle = {
  flex: 1,
  marginHorizontal: 10,
}

const $detailsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginVertical: spacing.md,
  padding: spacing.sm,
  borderRadius: 3,
  backgroundColor: colors.separator,
  alignSelf: "stretch",
  maxHeight: 200,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginTop: spacing.md,
  marginBottom: spacing.xs,
  textAlign: "center",
})

const $message: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
  textAlign: "center",
})

const $minimalText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  marginHorizontal: 4,
})

const $detailsTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $errorDetails: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  fontSize: 12,
})

const $stackTrace: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 10,
  marginTop: spacing.xs,
})

const $errorIcon: ThemedStyle<{ color: string }> = ({ colors }) => ({
  color: colors.error,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  minWidth: 120,
  marginTop: spacing.md,
})
