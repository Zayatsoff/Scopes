import React, { useEffect, useState } from "react"
import { ViewStyle, TextStyle, View, RefreshControl, Pressable } from "react-native"
import { Screen } from "@/components/Screen"
import { NewsCard } from "@/components/NewsCard"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import { FlashList } from "@shopify/flash-list"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { Button } from "@/components/Button"
import { Linking } from "react-native"
import { Text } from "@/components/Text"
import { NewsItem } from "@/models/News"
import { SectionHeader } from "@/components/SectionHeader"
import { useTabHeader } from "@/components/TabHeader"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"
import { usePullToRefreshProgress } from "@/utils/usePullToRefreshProgress"
import { Filter, ArrowDownWideNarrow, ArrowUpNarrowWide, Check, X } from "lucide-react-native"

export const NewsScreen = observer(function NewsScreen() {
  const { newsStore, api } = useStores()
  const { themed, theme, themeContext } = useAppTheme()
  const [refreshing, setRefreshing] = useState(false)
  const { progress, onScroll } = usePullToRefreshProgress()
  
  // Set up the tab header with the same style as Settings
  useTabHeader({ 
    title: "Local News",
    titleMode: "center"
  }, [themeContext]);
  
  // Create a custom section header with filter button and sort button
  const NewsFeedHeader = () => (
    <View style={themed($sectionHeaderContainer)}>
      <View style={themed($filterContainer)}>
        <Button
          preset="default"
          onPress={newsStore.toggleTagFilter} 
          LeftAccessory={() => <Filter size={18} color={theme.colors.text} />}
          text="Filter"
          style={themed($filterButton)}
          textStyle={themed($filterText)}
        />
        <View style={themed($filterIndicator)} />
      </View>
      <Button
        onPress={newsStore.toggleSortOrder}
        style={themed($sortButton)}
        textStyle={themed($sortButtonText)}
        RightAccessory={() => (
          newsStore.sortNewestFirst 
            ? <ArrowDownWideNarrow size={18} color={theme.colors.text} />
            : <ArrowUpNarrowWide size={18} color={theme.colors.text} />
        )}
        text={newsStore.sortNewestFirst ? "Newest" : "Oldest"}
      />
    </View>
  );

  // Tag filter dropdown component
  const TagFilterDropdown = observer(() => {
    if (!newsStore.showTagFilter) return null;
    
    const availableTags = [
      "politics", "science", "business", "community", "health", "sports"
    ];
    
    return (
      <View style={themed($dropdownContainer)}>
        <View style={themed($dropdownHeader)}>
          <Text text="Select Tags" style={themed($dropdownTitle)} />
          <Button
            preset="default"
            style={themed($closeButton)}
            onPress={newsStore.toggleTagFilter}
            LeftAccessory={() => <X size={16} color={theme.colors.text} />}
          />
        </View>
        
        <View style={themed($tagsContainer)}>
          {availableTags.map(tag => (
            <Pressable
              key={tag}
              style={[
                themed($tagButton),
                newsStore.selectedTags.includes(tag) && themed($tagButtonSelected)
              ]}
              onPress={() => newsStore.toggleTag(tag)}
            >
              <Text 
                text={tag} 
                style={[
                  themed($tagButtonText),
                  newsStore.selectedTags.includes(tag) && themed($tagButtonTextSelected)
                ]} 
              />
              {newsStore.selectedTags.includes(tag) && (
                <Check size={14} color={theme.colors.tint} />
              )}
            </Pressable>
          ))}
        </View>
        
        {newsStore.selectedTags.length > 0 && (
          <Button
            text="Clear Filters"
            preset="default"
            style={[themed($clearButton), { minHeight: 36 }]}
            textStyle={themed($clearButtonText)}
            onPress={newsStore.clearTagFilters}
          />
        )}
      </View>
    );
  });
  
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
  
  // Show a label with the active filters if any
  const renderActiveFiltersLabel = () => {
    if (newsStore.selectedTags.length === 0) return null;
    
    return (
      <View style={themed($activeFiltersContainer)}>
        <Text style={themed($activeFiltersText)}>
          Filtering by: {newsStore.selectedTags.join(', ')}
        </Text>
        <Pressable onPress={newsStore.clearTagFilters}>
          <X size={16} color={theme.colors.text} />
        </Pressable>
      </View>
    );
  };
  
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={themed($screenContainer)}
      safeAreaEdges={[]}
    >
      <NewsFeedHeader />
      <TagFilterDropdown />
      {renderActiveFiltersLabel()}
      
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

// New styles for the section header with sort button
const $sectionHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  marginTop: spacing.sm,
  marginBottom: spacing.xs,
})

const $filterContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: 'column',
  alignItems: 'flex-start',
})

const $filterText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  color: colors.text,
  marginLeft: 4,
})

const $filterIndicator: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 2,
  backgroundColor: colors.text,
  width: '100%',
  // marginTop: 2,
})

const $filterButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.transparent,
  paddingHorizontal: 8,
  borderWidth: 0,
})

const $sortButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.transparent,
  paddingHorizontal: 8,
  borderWidth: 0,
  flexDirection: "row",
  alignItems: "center",
})

const $sortButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  color: colors.text,
  marginRight: 4,
})

// New styles for tag filter dropdown
const $dropdownContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 8,
  marginHorizontal: spacing.md,
  marginTop: spacing.xs,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  elevation: 4,
  borderWidth: 1,
  borderColor: colors.border,
})

const $dropdownHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
})

const $dropdownTitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.md,
  fontWeight: "bold",
  color: colors.text,
})

const $closeButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.transparent,
  padding: 4,
  borderWidth: 0,
})

const $tagsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
  justifyContent: "flex-start",
  alignItems: "flex-start",
})

const $tagButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  marginBottom: spacing.xs,
  minWidth: 80,
  maxWidth: '45%',
  flexGrow: 0,
  flexShrink: 1,
})

const $tagButtonSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.containerBackground,
  borderColor: colors.text,
})

const $tagButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  textTransform: "capitalize",
  marginRight: 4,
})

const $tagButtonTextSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "bold",
})

const $clearButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.transparent,
  marginTop: spacing.sm,
  alignSelf: "center",
  paddingVertical: spacing.xxs,
})

const $clearButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.accent,
})

const $activeFiltersContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.containerBackground,
  marginHorizontal: spacing.md,
  marginBottom: spacing.xs,
  padding: spacing.xs,
  borderRadius: 4,
})

const $activeFiltersText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  flex: 1,
})
