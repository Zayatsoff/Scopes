import React from "react"
import { Pressable, View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { colors, spacing, type ThemedStyle } from "@/theme"
import { NewsItem } from "@/models/News"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"

export interface NewsCardProps {
  item: NewsItem
  onPress?: () => void
  compact?: boolean
}

export const NewsCard = observer(function NewsCard({ item, onPress, compact }: NewsCardProps) {
  const { themed } = useAppTheme()

  return (
    <Pressable style={[themed($container), compact && themed($compactContainer)]} onPress={onPress}>
      <View style={themed($header)}>
        <Text text={item.sourceDisplay} style={themed($source)} />
        <Text text={item.formattedDate} style={themed($date)} numberOfLines={1} />
      </View>

      <Text
        text={item.title}
        style={[themed($title), compact && themed($compactTitle)]}
        numberOfLines={compact ? 2 : 3}
      />

      {!compact && <Text text={item.description} style={themed($description)} numberOfLines={3} />}

      {item.authors && !compact && (
        <Text text={item.authors} style={themed($author)} numberOfLines={1} />
      )}
    </Pressable>
  )
})

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.containerBackground,
  borderRadius: 3,
  padding: spacing.sm,
  marginVertical: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $compactContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
  marginVertical: spacing.xxs,
})

const $header: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
  flexWrap: "nowrap",
})

const $source: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.tint,
  fontWeight: "bold",
})

const $date: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  flexShrink: 1,
  marginLeft: 4,
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.md,
  fontWeight: "bold",
  color: colors.text,
  marginBottom: 8,
})

const $compactTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: typography.sizes.sm,
  marginBottom: 0,
})

const $description: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.8,
  marginBottom: 8,
})

const $author: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  fontStyle: "italic",
})
