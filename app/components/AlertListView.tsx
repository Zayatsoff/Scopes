import React, { useRef } from "react"
import { View, ViewStyle, RefreshControl, NativeSyntheticEvent, NativeScrollEvent, TextStyle } from "react-native"
import { FlashList, ListRenderItem } from "@shopify/flash-list"
import { useAppTheme } from "@/utils/useAppTheme"
import { Text } from "@/components"
import { AlertItem } from "@/components/AlertCard"
import { EnhancedAlertCard } from "@/components/EnhancedAlertCard"
import Animated, { FadeIn } from "react-native-reanimated"
import type { ThemedStyle } from "@/theme"
import { PoliceNewsItem } from "@/models/PoliceNews"
import { WeatherAlertItem } from "@/models/WeatherAlert"
import { AlertCategory } from "@/utils/alertCategoryUtils"

type AlertData = AlertItem | PoliceNewsItem | WeatherAlertItem

interface AlertListViewProps<T extends AlertData> {
  /**
   * Category of alerts to display
   */
  category: AlertCategory

  /**
   * Data items to display in the list
   */
  data: T[]

  /**
   * Whether the list is currently refreshing
   */
  refreshing: boolean

  /**
   * Function to call to refresh the data
   */
  onRefresh: () => void

  /**
   * Function to call when an alert is pressed
   */
  onAlertPress: (link: string) => void

  /**
   * Color associated with the category
   */
  categoryColor: string

  /**
   * Function to call when the list is scrolled
   */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void

  /**
   * Whether the list is loading initial data
   */
  isLoading?: boolean

  /**
   * Error message to display if there was an error loading data
   */
  error?: string
  
  /**
   * Custom render function for items
   */
  renderItem?: ListRenderItem<T>
}

export function AlertListView<T extends AlertData>({
  category,
  data,
  refreshing,
  onRefresh,
  onAlertPress,
  categoryColor,
  onScroll,
  isLoading,
  error,
  renderItem
}: AlertListViewProps<T>) {
  const { theme, themed } = useAppTheme()
  const listRef = useRef<FlashList<T>>(null)

  // Default render function that works with any alert type
  const defaultRenderItem: ListRenderItem<T> = ({ item }) => {
    // Create a wrapper for the item based on its category
    if (category === "weather" && "summary" in item) {
      // Weather alert
      const weatherItem = item as unknown as WeatherAlertItem
      return (
        <Animated.View entering={FadeIn.duration(200)}>
          <EnhancedAlertCard 
            item={{
              id: weatherItem.id,
              title: weatherItem.title,
              excerpt: weatherItem.summary,
              link: weatherItem.link,
              date: weatherItem.pubDate,
              formattedDate: weatherItem.formattedDate,
              category: "weather",
              source: "Environment Canada",
              message: weatherItem.summary,
              timestamp: weatherItem.formattedDate
            }}
            onPress={() => onAlertPress(weatherItem.link)}
            categoryColor={categoryColor}
          />
        </Animated.View>
      )
    } else {
      // Default for other alert types
      const alertItem = item as AlertItem | PoliceNewsItem
      return (
        <Animated.View entering={FadeIn.duration(200)}>
          <EnhancedAlertCard 
            item={alertItem} 
            onPress={() => alertItem.link && onAlertPress(alertItem.link)}
            categoryColor={categoryColor}
          />
        </Animated.View>
      )
    }
  }

  // Get the appropriate list empty component
  const getEmptyComponent = () => (
    <View style={themed($emptyContainer)}>
      <Text
        text={
          isLoading 
            ? `Loading ${category} alerts...` 
            : error || `No ${category} alerts available. Pull down to refresh.`
        }
        style={themed($emptyText)}
      />
    </View>
  )

  return (
    <View style={themed($listWrapper)} key={`${category}-list`}>
      <FlashList
        ref={listRef}
        data={data}
        renderItem={renderItem || defaultRenderItem}
        estimatedItemSize={150}
        keyExtractor={(item) => item.id}
        contentContainerStyle={themed($listContent)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.transparent}
            colors={[theme.colors.transparent]}
            progressBackgroundColor={theme.colors.transparent}
            progressViewOffset={20}
          />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListFooterComponent={<View style={{ height: 150 }} />}
        ListEmptyComponent={getEmptyComponent()}
      />
    </View>
  )
}

// Styles
const $listWrapper: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  width: "100%",
  minHeight: 800
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xxl * 6,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  height: 200,
  width: '100%',
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
}) 