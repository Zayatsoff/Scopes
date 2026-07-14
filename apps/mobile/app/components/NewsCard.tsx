import React from "react"
import { Pressable, View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { colors, spacing, type ThemedStyle } from "@/theme"
import { NewsItem } from "@/models/News"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { SourceFavicon } from "./SourceFavicon"

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
        <View style={themed($sourceContainer)}>
          <SourceFavicon source={item.source} size={16} />
          <Text text={item.sourceDisplay} style={themed($source)} numberOfLines={1} />
        </View>
      </View>

      <Text
        text={item.title}
        style={[themed($title), compact && themed($compactTitle)]}
        numberOfLines={compact ? 2 : 3}
      />

      {!compact && <Text text={item.description} style={themed($description)} numberOfLines={3} />}

      {!compact ? (
        <View style={themed($footer)}>
          <Text text={item.formattedDate} style={themed($date)} numberOfLines={1} />
          {item.authors && (
            <Text text={item.authors} style={themed($author)} numberOfLines={1} />
          )}
        </View>
      ) : (
        <View style={themed($compactFooter)}>
          <Text 
            text={item.formattedDate} 
            style={[themed($date), themed($compactDate)]} 
            numberOfLines={1} 
          />
          {item.authors && (
            <Text 
              text={item.authors} 
              style={[themed($author), themed($compactAuthor)]} 
              numberOfLines={1} 
            />
          )}
        </View>
      )}

      {/* Tags section - only shown in non-compact mode */}
      {!compact && item.tags && item.tags.length > 0 && (
        <View style={themed($tagsContainer)}>
          {item.tags.map((tag, index) => (
            <View key={tag} style={themed($tagPill)}>
              <Text text={tag} style={themed($tagText)} />
            </View>
          ))}
        </View>
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
})

const $compactContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
  marginVertical: spacing.xxs,
})

const $header: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
  flexWrap: "nowrap",
  gap: 4,
})

const $sourceContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  flex: 1,
})

const $source: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  flexShrink: 1,
  flexGrow: 0,
  paddingLeft: spacing.xs,
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.md,
  // fontWeight: "bold",
  color: colors.text,
  marginBottom: 8,
})

const $compactTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: typography.sizes.md,
  marginBottom: 4,
})

const $description: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.8,
  marginBottom: 8,
})

const $footer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $compactFooter: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 0,
})

const $date: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  flexShrink: 1,
})

const $compactDate: ThemedStyle<TextStyle> = ({ typography }) => ({
  marginTop: 0,
  fontSize: typography.sizes.xs,
})

const $author: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  fontStyle: "italic",
  textAlign: "right",
  flexShrink: 1,
})

const $compactAuthor: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: typography.sizes.xs,
})

// New styles for tags
const $tagsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: spacing.xs,
  gap: spacing.xxs,
})

const $tagPill: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.containerBackground,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxs,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.textDim,
})

const $tagText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xxs,
  color: colors.text,
  textTransform: "capitalize",
})
