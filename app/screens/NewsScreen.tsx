import { FC, useCallback, useEffect, ReactElement } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TextStyle, ActivityIndicator, View, Pressable } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useHeader } from "@/utils/useHeader"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { useStores } from "@/models"
import { NewsCard } from "@/components/NewsCard"
import { RefreshControl } from "react-native-gesture-handler"
import { FlashList } from "@shopify/flash-list"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowDownUp } from "lucide-react-native"
import { NewsItem } from "@/models/News"

interface NewsScreenProps extends BottomTabScreenProps<MainTabParamList, "News"> {}

export const NewsScreen: FC<NewsScreenProps> = observer(function NewsScreen() {
  const { themed, theme } = useAppTheme()
  const { newsStore, api } = useStores()
  const { sortNewestFirst } = newsStore
  const insets = useSafeAreaInsets()
  
  useHeader({
    title: "News",
    titleMode: "center",
    rightIcon: undefined,
    onRightPress: newsStore.toggleSortOrder,
  })

  const fetchData = useCallback(async () => {
    await newsStore.fetchNews(api)
  }, [newsStore, api])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const renderItem = useCallback(({ item }: { item: NewsItem }): ReactElement => {
    return <NewsCard item={item} />
  }, [])

  return (
    <Screen
      style={themed($root)}
      preset="fixed"
      safeAreaEdges={["bottom"]}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      {newsStore.isLoading && newsStore.items.length === 0 ? (
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
        </View>
      ) : newsStore.error ? (
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>
            Error loading news: {newsStore.error}
          </Text>
          <Pressable
            style={themed($retryButton)}
            onPress={fetchData}
            android_ripple={{ color: theme.colors.palette.neutral400 }}
          >
            <Text style={themed($retryText)}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={themed($sortContainer)}>
            <Pressable
              style={themed($sortButton)} 
              onPress={newsStore.toggleSortOrder}
              android_ripple={{ color: theme.colors.palette.neutral400 }}
            >
              <Text style={themed($sortText)}>
                Sort: {sortNewestFirst ? "Newest first" : "Oldest first"}
              </Text>
              <ArrowDownUp size={16} color={theme.colors.text} />
            </Pressable>
          </View>
          
          <FlashList
            data={newsStore.sortedItems}
            renderItem={renderItem}
            estimatedItemSize={150}
            contentContainerStyle={themed($listContent)}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={newsStore.isLoading}
                onRefresh={fetchData}
                colors={[theme.colors.tint]}
                tintColor={theme.colors.tint}
              />
            }
          />
        </>
      )}
    </Screen>
  )
})

// -----------------------
// Themed style definitions
// -----------------------

const $root: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  textAlign: "center",
  marginBottom: 20,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: spacing.sm,
})

const $retryText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "bold",
})

const $sortContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $sortButton: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $sortText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  marginRight: 8,
})
