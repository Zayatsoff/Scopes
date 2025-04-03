import React from "react"
import { View, ViewStyle, TextStyle, ScrollView, Dimensions } from "react-native"
import { PoliceSummaryItem } from "@/models/PoliceSummary"
import { TrafficSummaryItem } from "@/models/TrafficSummary"
import { Text } from "./Text"
import { type ThemedStyle } from "@/theme"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { Siren, CloudSun, BusFront } from "lucide-react-native"

export interface CompactSummaryCardsProps {
  policeSummary?: PoliceSummaryItem
  weatherSummary?: {
    id: string
    section: string
    date: string
    summary: string
    generatedAt: any
    formattedDate?: string
  }
  trafficSummary?: TrafficSummaryItem
  policeLoading?: boolean
  weatherLoading?: boolean
  trafficLoading?: boolean
}

export const CompactSummaryCards = observer(function CompactSummaryCards({ 
  policeSummary,
  weatherSummary,
  trafficSummary,
  policeLoading,
  weatherLoading,
  trafficLoading
}: CompactSummaryCardsProps) {
  const { themed, theme } = useAppTheme()
  const screenWidth = Dimensions.get("window").width
  const cardWidth = screenWidth * 0.85 // Cards will be 85% of screen width
  
  // Function to parse bullet points from a summary string
  const getBulletPoints = (summary?: string) => {
    return summary?.split("\n").filter(line => line.trim().startsWith("-")) || []
  }
  
  // Get bullet points for each summary
  const policeBulletPoints = policeSummary ? getBulletPoints(policeSummary.summary) : []
  const weatherBulletPoints = weatherSummary ? getBulletPoints(weatherSummary.summary) : []
  const trafficBulletPoints = trafficSummary ? getBulletPoints(trafficSummary.summary) : []
  
  // Render a single summary card
  const renderSummaryCard = (
    title: string, 
    bulletPoints: string[], 
    color: string, 
    icon: React.ReactNode,
    loading: boolean = false
  ) => {
    if (loading) {
      return (
        <View style={[themed($card), { width: cardWidth, borderLeftColor: color }]}>
          <View style={themed($cardHeader)}>
            <View style={themed($titleContainer)}>
              {icon}
              <Text style={[themed($title), { color }]}>{title}</Text>
            </View>
            <Text style={themed($date)}>Today</Text>
          </View>
          <View style={themed($cardContent)}>
            <Text style={themed($loadingText)}>Loading...</Text>
          </View>
        </View>
      )
    }
    
    if (bulletPoints.length === 0) {
      return (
        <View style={[themed($card), { width: cardWidth, borderLeftColor: color }]}>
          <View style={themed($cardHeader)}>
            <View style={themed($titleContainer)}>
              {icon}
              <Text style={[themed($title), { color }]}>{title}</Text>
            </View>
            <Text style={themed($date)}>Today</Text>
          </View>
          <View style={themed($cardContent)}>
            <Text style={themed($emptyText)}>No updates available</Text>
          </View>
        </View>
      )
    }
    
    return (
      <View style={[themed($card), { width: cardWidth, borderLeftColor: color }]}>
        <View style={themed($cardHeader)}>
          <View style={themed($titleContainer)}>
            {icon}
            <Text style={[themed($title), { color }]}>{title}</Text>
          </View>
          <Text style={themed($date)}>Today</Text>
        </View>
        <View style={themed($cardContent)}>
          {bulletPoints.map((point, index) => (
            <View key={index} style={themed($bulletContainer)}>
              <Text style={[themed($bullet), { color }]}>•</Text>
              <Text style={themed($bulletText)}>
                {point.replace("- ", "").trim()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    )
  }
  
  return (
    <View style={themed($container)}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + theme.spacing.xs}
        contentContainerStyle={themed($scrollContent)}
      >
        {renderSummaryCard(
          "Police Updates", 
          policeBulletPoints, 
          theme.colors.police, 
          <Siren size={16} color={theme.colors.police} />,
          policeLoading
        )}
        
        {renderSummaryCard(
          "Weather Updates", 
          weatherBulletPoints, 
          theme.colors.weather, 
          <CloudSun size={16} color={theme.colors.weather} />,
          weatherLoading
        )}
        
        {renderSummaryCard(
          "Traffic Updates", 
          trafficBulletPoints, 
          theme.colors.traffic, 
          <BusFront size={16} color={theme.colors.traffic} />,
          trafficLoading
        )}
      </ScrollView>
      
      {/* Optional indicator dots for which card is currently displayed */}
      <View style={themed($dotsContainer)}>
        <View style={[themed($dot), { backgroundColor: theme.colors.police }]} />
        <View style={[themed($dot), { backgroundColor: theme.colors.weather }]} />
        <View style={[themed($dot), { backgroundColor: theme.colors.traffic }]} />
      </View>
    </View>
  )
})

// Styles
const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxs,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingRight: spacing.xs,
  paddingBottom: spacing.xs,
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.containerBackground,
  borderRadius: 3,
  padding: spacing.sm,
  marginRight: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
  borderLeftWidth: 4,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2.22,
  elevation: 2,
  minHeight: 90,
})

const $cardHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
})

const $titleContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
})

const $title: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: typography.sizes.xs,
  fontWeight: "bold",
})

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxs,
})

const $bulletContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 1,
})

const $bullet: ThemedStyle<TextStyle> = ({ spacing, typography }) => ({
  fontSize: typography.sizes.md,
  marginRight: spacing.xxs,
})

const $bulletText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm - 1,
  color: colors.text,
  lineHeight: (typography.sizes.sm - 1) * 1.3,
  flex: 1,
})

const $date: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xxs,
  color: colors.text,
  opacity: 0.7,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.7,
  textAlign: "center",
  paddingVertical: typography.sizes.sm,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.7,
  textAlign: "center",
  paddingVertical: typography.sizes.sm,
})

const $dotsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "center",
  gap: spacing.xs,
  marginTop: spacing.xxs,
  marginBottom: spacing.xs,
})

const $dot: ThemedStyle<ViewStyle> = () => ({
  width: 5,
  height: 5,
  borderRadius: 3,
  opacity: 0.5,
}) 