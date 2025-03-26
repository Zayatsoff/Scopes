import React, { useEffect } from "react"
import { ViewStyle, TextStyle } from "react-native"
import { Screen } from "@/components/Screen"
import { NewsCard } from "@/components/NewsCard"
import { useStores } from "@/models"
import { observer } from "mobx-react-lite"
import { FlashList } from "@shopify/flash-list"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { Button } from "@/components/Button"
import { Linking } from "react-native"
import { View } from "react-native"
import { Text } from "@/components/Text"
import { spacing } from "@/theme"
import { NewsItem } from "@/models/News"

export const NewsScreen = observer(function NewsScreen() {
  const { newsStore, api } = useStores()
  const { themed } = useAppTheme()
  
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
  
  const ListHeaderComponent = () => (
    <View style={themed($header)}>
      <Text
        text="Local News"
        preset="heading"
        style={themed($title)}
      />
      <Button
        text={newsStore.sortNewestFirst ? "Newest First" : "Oldest First"}
        onPress={newsStore.toggleSortOrder}
        style={themed($sortButton)}
      />
    </View>
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
      safeAreaEdges={["top"]}
    >
      <FlashList
        data={newsStore.sortedItems}
        renderItem={renderItem}
        estimatedItemSize={150}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={themed($listContainer)}
      />
    </Screen>
  )
})

// Styles
const $screenContainer: ThemedStyle<ViewStyle> = ({ colors }: { colors: any }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $listContainer: ThemedStyle<ViewStyle> = ({ spacing }: { spacing: any }) => ({
  paddingHorizontal: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }: { spacing: any }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.md,
})

const $title: ThemedStyle<TextStyle> = ({ colors }: { colors: any }) => ({
  color: colors.text,
})

const $sortButton: ThemedStyle<ViewStyle> = ({ colors }: { colors: any }) => ({
  backgroundColor: colors.primary,
  minHeight: 36,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }: { spacing: any }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.xl,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }: { colors: any }) => ({
  color: colors.text,
  textAlign: "center",
})
