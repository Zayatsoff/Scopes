import React from "react"
import { Pressable, View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { type ThemedStyle } from "@/theme"
import { PoliceNewsItem } from "@/models/PoliceNews"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { AlertItem } from "./AlertCard"
import { Siren, CloudSun, Zap, BusFront } from "lucide-react-native"

export interface EnhancedAlertCardProps {
  item: PoliceNewsItem | AlertItem
  onPress?: () => void
  categoryColor?: string
}

export const EnhancedAlertCard = observer(function EnhancedAlertCard({ 
  item, 
  onPress, 
  categoryColor 
}: EnhancedAlertCardProps) {
  const { themed, theme } = useAppTheme()
  
  // Get the item's category (if it's an AlertItem) or default to "police" for PoliceNewsItem
  const category = 'category' in item ? item.category : "police"
  
  // Get the appropriate icon based on category
  const getIcon = () => {
    switch (category) {
      case "weather":
        return <CloudSun size={16} color={categoryColor || theme.colors.weather} />
      case "police":
        return <Siren size={16} color={categoryColor || theme.colors.police} />
      case "hydro": 
        return <Zap size={16} color={categoryColor || theme.colors.hydro} />
      case "traffic":
        return <BusFront size={16} color={categoryColor || theme.colors.traffic} />
      default:
        return <Siren size={16} color={categoryColor || theme.colors.tint} />
    }
  }

  // Get color based on category
  const getColor = () => {
    if (categoryColor) return categoryColor;
    
    if (category === "weather") return theme.colors.weather;
    if (category === "police") return theme.colors.police;
    if (category === "hydro") return theme.colors.hydro;
    if (category === "traffic") return theme.colors.traffic;
    
    return theme.colors.tint;
  }

  // Format date from item
  const getFormattedDate = () => {
    if (item.formattedDate) return item.formattedDate;
    
    if ('date' in item && item.date) {
      try {
        return new Date(item.date).toLocaleDateString();
      } catch (e) {
        return '';
      }
    }
    
    return ('timestamp' in item) ? item.timestamp : '';
  }

  return (
    <Pressable 
      style={[
        themed($container), 
        { borderLeftColor: getColor() }
      ]} 
      onPress={onPress}
    >
      <View style={themed($header)}>
        <View style={themed($sourceContainer)}>
          {getIcon()}
          <Text 
            text={'source' in item ? item.source : "Ottawa Police"} 
            style={[
              themed($source), 
              { color: getColor() }
            ]} 
          />
        </View>
        <Text 
          text={getFormattedDate()} 
          style={themed($date)} 
          numberOfLines={1} 
        />
      </View>

      <Text
        text={item.title || ('message' in item ? item.message : "")}
        style={themed($title)}
        numberOfLines={3}
      />

      <Text 
        text={item.excerpt || ('message' in item && !item.title ? "" : "")} 
        style={themed($description)} 
        numberOfLines={3} 
      />
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
  borderLeftColor: colors.tint, // Will be overridden in component
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

const $source: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: typography.sizes.xs,
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