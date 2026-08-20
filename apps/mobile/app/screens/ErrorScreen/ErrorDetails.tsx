import { ErrorInfo } from "react"
import { ScrollView, TextStyle, View, ViewStyle } from "react-native"
import { Button, Screen, Text } from "../../components"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { AlertTriangle, Bug, RefreshCw } from "lucide-react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"

export interface ErrorDetailsProps {
  error: Error
  errorInfo: ErrorInfo | null
  onReset(): void
}

/**
 * Renders the error details screen.
 * @param {ErrorDetailsProps} props - The props for the `ErrorDetails` component.
 * @returns {JSX.Element} The rendered `ErrorDetails` component.
 */
export function ErrorDetails(props: ErrorDetailsProps) {
  const { themed, theme } = useAppTheme()

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($contentContainer)}
    >
      <Animated.View entering={FadeInDown.duration(600)} style={$topSection}>
        <AlertTriangle size={64} color={theme.colors.error} strokeWidth={1.5} />
        <Text style={themed($heading)} preset="heading" tx="errorScreen:title" />
        <Text style={themed($subtitle)} tx="errorScreen:friendlySubtitle" />
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400).duration(600)} style={themed($cardContainer)}>
        <View style={themed($cardHeader)}>
          <Bug size={20} color={theme.colors.text} />
          <Text style={themed($cardTitle)} weight="medium" tx="errorScreen:errorDetails" />
        </View>

        <ScrollView
          style={themed($errorSection)}
          contentContainerStyle={themed($errorSectionContentContainer)}
          showsVerticalScrollIndicator={false}
        >
          <Text style={themed($errorContent)} weight="medium" text={`${props.error}`.trim()} />
          <Text
            selectable
            style={themed($errorBacktrace)}
            text={`${props.errorInfo?.componentStack ?? ""}`.trim()}
          />
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(800).duration(600)}>
        <Button
          preset="default"
          style={themed($resetButton)}
          textStyle={themed($resetButtonText)}
          onPress={props.onReset}
          tx="errorScreen:reset"
          RightAccessory={() => (
            <RefreshCw size={18} color={theme.colors.palette.neutral100} style={$iconStyle} />
          )}
        />
      </Animated.View>
    </Screen>
  )
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  flex: 1,
})

const $topSection: ViewStyle = {
  flex: 0.7,
  alignItems: "center",
  justifyContent: "center",
}

const $heading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginTop: spacing.md,
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.xl,
  paddingHorizontal: spacing.md,
})

const $cardContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 2,
  width: "100%",
  backgroundColor: colors.containerBackground,
  borderRadius: 16,
  marginBottom: spacing.lg,
  overflow: "hidden",
})

const $cardHeader: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
})

const $cardTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginLeft: spacing.xs,
})

const $errorSection: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $errorSectionContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $errorContent: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginBottom: spacing.sm,
})

const $errorBacktrace: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  color: colors.textDim,
  fontSize: 13,
})

const $resetButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  paddingHorizontal: spacing.xl,
  borderRadius: 12,
  marginBottom: spacing.md,
})

const $resetButtonText: ThemedStyle<TextStyle> = () => ({
  fontWeight: "600",
})

const $iconStyle: ViewStyle = {
  marginLeft: 8,
}
