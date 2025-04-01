import React from "react"
import { Pressable, View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { type ThemedStyle } from "@/theme"
import { PoliceNewsItem } from "@/models/PoliceNews"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { Siren } from "lucide-react-native"

export interface PoliceNewsCardProps {
  item: PoliceNewsItem
  onPress?: () => void
}

export const PoliceNewsCard = observer(function PoliceNewsCard({ item, onPress }: PoliceNewsCardProps) {
  const { themed, theme } = useAppTheme()
  
  // Debug log to ensure component is rendering with correct data
  console.log("PoliceNewsCard rendering with item:", item.id, item.title)

  return (
    <Pressable style={themed($container)} onPress={onPress}>
      <View style={themed($header)}>
        <View style={themed($sourceContainer)}>
          <Siren size={16} color={theme.colors.police} />
          <Text text="Ottawa Police" style={themed($source)} />
        </View>
        <Text text={item.formattedDate || new Date(item.date).toLocaleDateString()} style={themed($date)} numberOfLines={1} />
      </View>

      <Text
        text={item.title}
        style={themed($title)}
        numberOfLines={3}
      />

      <Text text={item.excerpt} style={themed($description)} numberOfLines={3} />
    </Pressable>
  )
})

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.containerBackground,
  borderRadius: 3,
  padding: spacing.sm,
  marginVertical: spacing.xs,
  marginHorizontal: 0,
  borderWidth: 1,
  borderColor: colors.border,
  borderLeftWidth: 4,
  borderLeftColor: colors.police,
  // Enhanced shadow for better visibility
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2.22,
  elevation: 2,
})

const $header: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
  flexWrap: "nowrap",
})

const $sourceContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
})

const $source: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.police,
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

const $description: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.8,
  marginBottom: 8,
}) 