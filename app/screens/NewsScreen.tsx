import React, { useEffect } from "react"
import { ViewStyle, TextStyle, View } from "react-native"
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

export const NewsScreen = observer(function NewsScreen() {
  const { newsStore, api } = useStores()
  const { themed, theme, themeContext } = useAppTheme()
  
  // Set up the tab header with the same style as Settings
  useTabHeader({ 
    title: "Local News",
    titleMode: "center"
  }, [themeContext]);
  
  // Create a custom section header with sort button
  const NewsFeedHeader = () => (
    <View style={themed($sectionHeaderContainer)}>
      <SectionHeader title="News Feed" />
      <Button
        text={newsStore.sortNewestFirst ? "Newest First" : "Oldest First"}
        onPress={newsStore.toggleSortOrder}
        style={themed($sortButton)}
        textStyle={themed($sortButtonText)}
      />
    </View>
  );
  
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
    />
  )
  
  const ListEmptyComponent = () => (
    <View style={themed($emptyContainer)}>
      <Text
        text={newsStore.isLoading ? "Loading..." : newsStore.error || "No news available"}
        style={themed($emptyText)}
      />
    </View>
  )
  
  return (
    <Screen
      preset="fixed"
      contentContainerStyle={themed($screenContainer)}
      safeAreaEdges={[]}
    >
      <NewsFeedHeader />
      
      <FlashList
        data={newsStore.sortedItems}
        renderItem={renderItem}
        estimatedItemSize={150}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={themed($listContainer)}
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
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  padding: spacing.xl,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  textAlign: "center",
})

// New styles for the section header with sort button
const $sectionHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
})

const $sortButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "transparent",
  minHeight: 32,
  paddingHorizontal: spacing.xs,
})

const $sortButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary600,
  fontSize: 14,
})
