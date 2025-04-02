import React from "react"
import { View, ViewStyle, TextStyle, Image, ImageStyle } from "react-native"
import { Text } from "./Text"
import { type ThemedStyle } from "@/theme"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { PoliceSummaryItem } from "@/models/PoliceSummary"

export interface PoliceSummaryCardProps {
  item: PoliceSummaryItem
}

export const PoliceSummaryCard = observer(function PoliceSummaryCard({ 
  item
}: PoliceSummaryCardProps) {
  const { themed, theme } = useAppTheme()
  
  // Convert bullet points into array
  const bulletPoints = item.summary.split("\n").filter(line => line.trim().startsWith("-"))
  
  return (
    <View 
      style={[
        themed($container), 
        { borderLeftColor: theme.colors.police }
      ]} 
    >
      <View style={themed($header)}>
        <View style={themed($sourceContainer)}>
          <Image 
            source={require("../../assets/favicons/ottpolice.png")}
            style={themed($policeIcon)}
          />
          <Text 
            text="Ottawa Police" 
            style={[
              themed($source), 
              { color: theme.colors.police }
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
  borderLeftColor: colors.police,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2.22,
  elevation: 2,
})

const $policeIcon: ThemedStyle<ImageStyle> = () => ({
  width: 16,
  height: 16,
  resizeMode: 'contain',
})

const $header: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
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
})

const $bulletPointContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  paddingVertical: spacing.xxs,
})

const $bulletPoint: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  fontSize: typography.sizes.md,
  marginRight: spacing.xs,
  color: colors.police,
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