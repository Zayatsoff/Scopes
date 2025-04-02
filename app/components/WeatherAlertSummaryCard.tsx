import React from "react"
import { Pressable, View, ViewStyle, TextStyle, ImageStyle } from "react-native"
import { Text } from "./Text"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { WeatherAlertItem } from "@/models/WeatherAlert"
import { ThemedStyle } from "@/theme"
import { CloudSun } from "lucide-react-native"
import { Avatar } from "./Avatar"

export interface WeatherAlertSummaryCardProps {
  item: WeatherAlertItem
  onPress?: () => void
}

export const WeatherAlertSummaryCard = observer(function WeatherAlertSummaryCard({
  item,
  onPress,
}: WeatherAlertSummaryCardProps) {
  const { themed, theme } = useAppTheme()

  return (
    <Pressable 
      style={[
        themed($container), 
        { borderLeftColor: theme.colors.weather }
      ]} 
      onPress={onPress}
    >
      <View style={themed($header)}>
        <View style={themed($sourceContainer)}>
          <CloudSun size={16} color={theme.colors.weather} />
          <Text 
            text="Environment Canada" 
            style={[
              themed($source), 
              { color: theme.colors.weather }
            ]} 
          />
        </View>
        <Text 
          text={item.formattedDate} 
          style={themed($date)} 
        />
      </View>

      <Text
        text={item.title}
        style={themed($title)}
        numberOfLines={2}
      />

      <Text 
        text={item.summary} 
        style={themed($description)} 
        numberOfLines={3}
      />
      
      <View style={themed($footer)}>
        <View style={themed($affectedLocationsContainer)}>
          {item.locationsAffected && item.locationsAffected.length > 0 && (
            <Text
              text={`Affected Areas: ${item.locationsAffected.join(", ")}`}
              style={themed($affectedLocations)}
              numberOfLines={1}
            />
          )}
        </View>
      </View>
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
  borderLeftColor: colors.weather, // Will be overridden in component
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

const $title: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.md,
  fontWeight: "bold",
  color: colors.text,
  marginBottom: 4,
})

const $description: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.8,
  marginBottom: 8,
})

const $footer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $affectedLocationsContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
})

const $affectedLocations: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  flexShrink: 1,
})

const $date: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  flexShrink: 1,
}) 