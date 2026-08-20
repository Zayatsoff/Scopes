import { useEffect, useState } from "react"
import {
  ViewStyle,
  TextStyle,
  View,
  RefreshControl,
  Pressable,
  ScrollView,
  Linking,
} from "react-native"
import { Screen } from "@/components/Screen"
import { NewsCard } from "@/components/NewsCard"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import { FlashList } from "@shopify/flash-list"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { Text } from "@/components/Text"
import { NewsItem } from "@/models/News"
import { useTabHeader } from "@/components/TabHeader"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"
import { usePullToRefreshProgress } from "@/utils/usePullToRefreshProgress"
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const TAG_OPTIONS = ["politics", "science", "business", "community", "health", "sports", "culture"]

// a single filter pill: press-scale feedback matches NewsCard's touch feel
const FilterChip = ({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) => {
  const { themed } = useAppTheme()
  const scale = useSharedValue(1)
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.94, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label === "All" ? "Show all topics" : `Filter by ${label}`}
      style={[themed($chip), selected && themed($chipSelected), pressStyle]}
    >
      <Text text={label} style={[themed($chipText), selected && themed($chipTextSelected)]} />
    </AnimatedPressable>
  )
}

export const NewsScreen = observer(function NewsScreen() {
  const { newsStore, api } = useStores()
  const { themed, theme, themeContext } = useAppTheme()
  const [refreshing, setRefreshing] = useState(false)
  const { progress, onScroll } = usePullToRefreshProgress()

  // Set up the tab header with the same style as Settings
  useTabHeader(
    {
      title: "Local News",
      titleMode: "center",
    },
    [themeContext],
  )

  // persistent, always-visible topic filter bar (Nextdoor-style tag filtering)
  // + a fixed sort pill, replacing the old filter-button + dropdown + active-filters label
  const NewsFilterBar = () => (
    <View style={themed($filterBarRow)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={themed($chipsScroll)}
        contentContainerStyle={themed($chipsScrollContent)}
        accessibilityRole="tablist"
      >
        <FilterChip
          label="All"
          selected={newsStore.selectedTags.length === 0}
          onPress={newsStore.clearTagFilters}
        />
        {TAG_OPTIONS.map((tag) => (
          <FilterChip
            key={tag}
            label={tag}
            selected={newsStore.selectedTags.includes(tag)}
            onPress={() => newsStore.toggleTag(tag)}
          />
        ))}
      </ScrollView>

      <Pressable
        onPress={newsStore.toggleSortOrder}
        hitSlop={8}
        style={themed($sortChip)}
        accessibilityRole="button"
        accessibilityLabel={`Sorted ${
          newsStore.sortNewestFirst ? "newest first" : "oldest first"
        }. Tap to reverse.`}
      >
        {newsStore.sortNewestFirst ? (
          <ArrowDownWideNarrow size={15} color={theme.colors.text} />
        ) : (
          <ArrowUpNarrowWide size={15} color={theme.colors.text} />
        )}
        <Text
          text={newsStore.sortNewestFirst ? "Newest" : "Oldest"}
          style={themed($sortChipText)}
        />
      </Pressable>
    </View>
  )

  useEffect(() => {
    // Fetch news when component mounts
    newsStore.fetchNews(api)
  }, [])

  const handleNewsPress = (link: string) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't open URL: ", err))
  }

  const renderItem = ({ item }: { item: NewsItem }) => (
    <NewsCard
      item={item}
      onPress={() => handleNewsPress(item.link)}
      compact={newsStore.compactView}
    />
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await newsStore.refreshNews(api)
    setRefreshing(false)
  }

  const ListEmptyComponent = () => (
    <View style={themed($emptyContainer)}>
      <Text
        text={newsStore.isLoading ? "Loading..." : newsStore.error || "No news available"}
        style={themed($emptyText)}
      />
    </View>
  )

  // Custom RefreshControl with our rotating icon
  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.transparent}
      colors={[theme.colors.transparent]}
      progressBackgroundColor={theme.colors.transparent}
      progressViewOffset={20}
      // We make the default loading indicator invisible and show our custom one
    />
  )

  return (
    <Screen preset="fixed" contentContainerStyle={themed($screenContainer)} safeAreaEdges={[]}>
      <NewsFilterBar />

      <PullToRefreshIndicator visible={refreshing} progress={progress} />

      <FlashList
        key={newsStore.compactView ? "compact" : "full"}
        data={newsStore.sortedItems}
        renderItem={renderItem}
        estimatedItemSize={newsStore.compactView ? 100 : 150}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={themed($listContainer)}
        refreshControl={renderRefreshControl()}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </Screen>
  )
})

// Styles
const $screenContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $listContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.lg,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})

// persistent topic filter bar: scrollable chips + a fixed sort pill
const $filterBarRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  marginTop: spacing.sm,
  marginBottom: spacing.xs,
  gap: spacing.xs,
})

const $chipsScroll: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $chipsScrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  paddingRight: spacing.xs,
})

const $chip: ThemedStyle<ViewStyle> = ({ colors, spacing, radius }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.containerBackground,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.pill,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs + 2,
})

const $chipSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $chipText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  fontWeight: typography.weights.medium,
  color: colors.text,
  textTransform: "capitalize",
})

const $chipTextSelected: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.navActive,
  fontWeight: typography.weights.semiBold,
})

const $sortChip: ThemedStyle<ViewStyle> = ({ colors, spacing, radius }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  backgroundColor: colors.containerBackground,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.pill,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs + 2,
})

const $sortChipText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  fontWeight: typography.weights.medium,
  color: colors.text,
})
