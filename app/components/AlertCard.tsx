import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { Avatar } from "./Avatar"

export interface AlertItem {
  id: string
  source: string
  message: string
  timestamp: string
  category: string
}

interface AlertCardProps {
  item: AlertItem
}

export function AlertCard({ item }: AlertCardProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($container)}>
      <View style={themed($avatarContainer)}>
        <Avatar source="Ottawa Police Service" size={36} />
      </View>
      <View style={themed($contentContainer)}>
        <Text text={item.source} style={themed($sourceText)} />
        <Text text={item.message} style={themed($messageText)} />
        <Text text={item.timestamp} style={themed($timestampText)} />
      </View>
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  padding: spacing.md,
  marginHorizontal: spacing.md,
  marginVertical: spacing.xs,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 6,
})

const $avatarContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.md,
  alignSelf: "flex-start",
  marginTop: 2,
})

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $sourceText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontWeight: "bold",
  color: colors.text,
  marginBottom: 4,
  fontSize: typography.sizes.sm,
})

const $messageText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  marginBottom: 8,
  fontWeight: "500",
  fontSize: typography.sizes.md,
})

const $timestampText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontSize: typography.sizes.sm,
}) 