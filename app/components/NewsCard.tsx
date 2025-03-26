import React from "react"
import { Pressable, View, ViewStyle, TextStyle, Linking } from "react-native"
import { Text } from "./Text"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import type { NewsItem } from "@/models/News"
import { ExternalLink } from "lucide-react-native"

interface NewsCardProps {
  item: NewsItem
  compact?: boolean
}

export function NewsCard({ item, compact = false }: NewsCardProps) {
  const { themed, theme } = useAppTheme()
  
  const handlePress = () => {
    Linking.openURL(item.link).catch((err) => console.error("Couldn't open URL: ", err))
  }
  
  return (
    <Pressable 
      style={themed(compact ? $compactCard : $card)} 
      onPress={handlePress}
      android_ripple={{ color: theme.colors.palette.neutral400 }}
    >
      <View style={themed($cardContent)}>
        <View style={themed($headerRow)}>
          <Text style={themed($source)}>{item.sourceDisplay}</Text>
          <Text style={themed($date)}>{item.formattedDate}</Text>
        </View>
        
        <Text style={themed(compact ? $compactTitle : $title)} numberOfLines={compact ? 2 : 3}>
          {item.title}
        </Text>
        
        {!compact && (
          <Text style={themed($description)} numberOfLines={3}>
            {item.description}
          </Text>
        )}
        
        <View style={themed($footer)}>
          {item.authors && (
            <Text style={themed($author)} numberOfLines={1}>
              {item.authors}
            </Text>
          )}
          <ExternalLink size={16} color={theme.colors.text} />
        </View>
      </View>
    </Pressable>
  )
}

// ------------------------
// Styled components
// ------------------------

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.card,
  borderRadius: spacing.sm,
  marginVertical: spacing.xs,
  shadowColor: colors.shadowColor,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
})

const $compactCard: ThemedStyle<ViewStyle> = (theme) => ({
  ...$card(theme),
  marginVertical: theme.spacing.xxs,
})

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $headerRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
})

const $source: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "bold",
  color: colors.primary,
})

const $date: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 18,
  fontWeight: "bold",
  color: colors.text,
  marginBottom: spacing.xs,
})

const $compactTitle: ThemedStyle<TextStyle> = (theme) => ({
  ...$title(theme),
  fontSize: 16,
  marginBottom: theme.spacing.xxs,
})

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: spacing.xs,
})

const $footer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $author: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  flex: 1,
}) 