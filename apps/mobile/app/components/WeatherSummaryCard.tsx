import React from "react"
import { View, ViewStyle, TextStyle, ImageStyle } from "react-native"
import { Text } from "./Text"
import { type ThemedStyle } from "@/theme"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { CloudSun } from "lucide-react-native"

export interface WeatherSummaryCardProps {
  item: {
    id: string
    section: string
    date: string
    summary: string
    generatedAt: any
    formattedDate?: string
  }
}

export const WeatherSummaryCard = observer(function WeatherSummaryCard({ 
  item
}: WeatherSummaryCardProps) {
  const { themed, theme } = useAppTheme()
  
  // Convert bullet points into array
  const bulletPoints = item.summary.split("\n").filter(line => line.trim().startsWith("-"))
  
  return (
    <View 
      style={[
        themed($container), 
        { borderLeftColor: theme.colors.weather }
      ]} 
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
          text="Today" 
          style={themed($date)} 
          numberOfLines={1} 
        />
      </View>

      <View style={themed($summaryContainer)}>
        {bulletPoints.map((point, index) => (
          <View key={index} style={themed($bulletPointContainer)}>
            <Text text="•" style={themed($bulletPoint)} />
            <Text 
              text={point.replace("- ", "").trim()} 
              style={themed($summaryText)}
            />
          </View>
        ))}
      </View>
    </View>
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
  borderLeftColor: colors.weather,
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

const $summaryContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $bulletPointContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 4,
})

const $bulletPoint: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontSize: typography.sizes.md,
  marginRight: spacing.xs,
  color: colors.weather,
})

const $summaryText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  lineHeight: typography.sizes.sm * 1.4,
  flex: 1,
  paddingRight: spacing.xs,
})

const $date: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  flexShrink: 1,
}) 