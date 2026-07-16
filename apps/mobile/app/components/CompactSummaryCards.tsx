import React, { useState, useRef } from "react"
import { View, ViewStyle, TextStyle, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
import { PoliceSummaryItem } from "@/models/PoliceSummary"
import { TrafficSummaryItem } from "@/models/TrafficSummary"
import { Text } from "./Text"
import { type ThemedStyle } from "@/theme"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { Siren, CloudSun, BusFront } from "lucide-react-native"
import Animated, { FadeIn, FadeOut, FadeInDown } from "react-native-reanimated"

// stagger the 3 cards in on first reveal, cards-in-a-row is legitimate list rhythm
const CARD_STAGGER_MS = 70

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
  const cardWidth = screenWidth - (theme.spacing.md * 2) // Cards will be full width minus padding
  
  // Function to parse bullet points from a summary string
  const getBulletPoints = (summary?: string) => {
    return summary?.split("\n").filter(line => line.trim().startsWith("-")) || []
  }
  
  // Get bullet points for each summary
  const policeBulletPoints = policeSummary ? getBulletPoints(policeSummary.summary) : []
  const weatherBulletPoints = weatherSummary ? getBulletPoints(weatherSummary.summary) : []
  const trafficBulletPoints = trafficSummary ? getBulletPoints(trafficSummary.summary) : []
  
  // Render a single summary card. Content (loading/empty/list) crossfades on change;
  // the card itself staggers in on first reveal.
  const renderSummaryCard = (
    title: string,
    bulletPoints: string[],
    color: string,
    icon: React.ReactNode,
    loading: boolean = false,
    index: number = 0,
  ) => {
    const contentKey = loading ? "loading" : bulletPoints.length === 0 ? "empty" : "content"

    return (
      <Animated.View
        style={[themed($card), { width: cardWidth }]}
        entering={FadeInDown.delay(index * CARD_STAGGER_MS).duration(220)}
      >
        <View style={themed($cardHeader)}>
          <View style={themed($titleContainer)}>
            {icon}
            <Text style={[themed($title), { color }]}>{title}</Text>
          </View>
          <Text style={themed($date)}>Today</Text>
        </View>
        <Animated.View
          key={contentKey}
          style={themed($cardContent)}
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
        >
          {loading ? (
            <Text style={themed($loadingText)}>Loading...</Text>
          ) : bulletPoints.length === 0 ? (
            <Text style={themed($emptyText)}>No updates available</Text>
          ) : (
            bulletPoints.map((point, i) => (
              <View key={i} style={themed($bulletContainer)}>
                <Text style={[themed($bullet), { color }]}>•</Text>
                <Text style={themed($bulletText)}>
                  {point.replace("- ", "").trim()}
                </Text>
              </View>
            ))
          )}
        </Animated.View>
      </Animated.View>
    )
  }

  return (
    <View style={themed($container)}>
      <View style={themed($cardsContainer)}>
        {renderSummaryCard(
          "Police Updates",
          policeBulletPoints,
          theme.colors.police,
          <Siren size={16} color={theme.colors.police} />,
          policeLoading,
          0,
        )}

        {renderSummaryCard(
          "Weather Updates",
          weatherBulletPoints,
          theme.colors.weather,
          <CloudSun size={16} color={theme.colors.weather} />,
          weatherLoading,
          1,
        )}

        {renderSummaryCard(
          "Traffic Updates",
          trafficBulletPoints,
          theme.colors.traffic,
          <BusFront size={16} color={theme.colors.traffic} />,
          trafficLoading,
          2,
        )}
      </View>
    </View>
  )
})

// Styles
const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxs,
})

const $cardsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing, radius }) => ({
  backgroundColor: colors.containerBackground,
  borderRadius: radius.md,
  padding: spacing.sm,
  marginBottom: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
  // category is carried by the colored icon + title, not a side-stripe
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
  fontWeight: typography.weights.semiBold,
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