import { FC, useEffect, useRef } from "react"
import { observer } from "mobx-react-lite"
import { Dimensions, View, ViewStyle, RefreshControl, Linking } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import {
  useSharedValue,
  useAnimatedScrollHandler,
  withDelay,
  withSpring,
} from "react-native-reanimated"
import { SectionHeader } from "@/components/SectionHeader"
import { WeatherDisplay } from "@/components/WeatherDisplay"
import { CompactSummaryCards } from "@/components/CompactSummaryCards"
import { CityStatus } from "@/components/CityStatus"
import { CityAlertBanner } from "@/components/CityAlertBanner"
import { HomeHeader } from "@/components/HomeHeader"
import { HomeNewsSection } from "@/components/HomeNewsSection"
import { useHomeData } from "@/utils/useHomeData"
import { usePullToRefreshProgress } from "@/utils/usePullToRefreshProgress"

interface HomeScreenProps extends BottomTabScreenProps<MainTabParamList, "Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const { themed, theme } = useAppTheme()
  const screenWidth = Dimensions.get("window").width

  // Custom hooks
  const {
    stores: {
      newsStore,
      policeSummaryStore,
      weatherSummaryStore,
      trafficSummaryStore,
      cityStatusStore,
      ottawaAlertStore,
    },
    refreshing,
    fetchInitialData,
    refreshData,
  } = useHomeData()

  const { progress, onScroll: refreshProgress, resetProgress } = usePullToRefreshProgress()

  // The city's featured/pinned notice, if the scraper found one
  const latestAlert = ottawaAlertStore.latestAlert
  const alertTitle = latestAlert?.title || latestAlert?.status

  // Animation values
  const opacityValue = useSharedValue(0)
  const translateYValue = useSharedValue(10)
  const scrollY = useSharedValue(0)

  // Weather display refresh reference
  const weatherDisplayRefresh = useRef<() => void>(() => {})

  // Fetch data when component mounts
  useEffect(() => {
    // Start animation when component mounts - make it snappier with less delay and stiffer spring
    opacityValue.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 150 }))
    translateYValue.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 150 }))

    // Fetch initial data
    fetchInitialData()
  }, [])

  // Reset progress when refreshing state changes to false
  useEffect(() => {
    if (!refreshing) {
      resetProgress()
    }
  }, [refreshing, resetProgress])

  // Hide the header for this screen only
  useEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  // Handle news item press
  const handleNewsPress = (link: string) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't open URL: ", err))
  }

  // Handle refresh
  const onRefresh = async () => {
    await refreshData(weatherDisplayRefresh.current)
    // Ensure progress is reset when refresh completes
    resetProgress()
  }

  // Custom RefreshControl
  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.transparent}
      colors={[theme.colors.transparent]}
      progressBackgroundColor={theme.colors.transparent}
      progressViewOffset={(screenWidth * 0.5) / 2}
    />
  )

  return (
    <Screen
      preset="scroll"
      style={themed($container)}
      safeAreaEdges={[]}
      ScrollViewProps={{
        onScroll: scrollHandler,
        onScrollEndDrag: refreshProgress,
        onMomentumScrollEnd: () => {
          if (!refreshing) resetProgress()
        },
        scrollEventThrottle: 16,
        showsVerticalScrollIndicator: false,
        refreshControl: renderRefreshControl(),
      }}
    >
      {/* Header with image and greeting */}
      <HomeHeader
        scrollY={scrollY}
        opacityValue={opacityValue}
        translateYValue={translateYValue}
        refreshing={refreshing}
        progress={progress}
      />

      {/* City Alert Banner - the city's featured/pinned notice, when there is one */}
      {latestAlert && alertTitle && (
        <CityAlertBanner
          title={alertTitle}
          onPress={() => handleNewsPress(latestAlert.sourceUrl)}
        />
      )}

      {/* City Status Section */}
      <View style={themed($cityStatusSection)}>
        <View style={themed($sectionHeaderContainer)}>
          <SectionHeader
            title="City Status"
            RightComponent={
              <WeatherDisplay
                onRefresh={(refreshFn) => {
                  weatherDisplayRefresh.current = refreshFn
                }}
              />
            }
          />
        </View>
        <CityStatus statusItems={cityStatusStore.items} loading={cityStatusStore.isLoading} />
      </View>

      {/* City Updates Section - Compact cards for Police, Weather, and Traffic */}
      <View style={themed($section)}>
        <SectionHeader title="City Summaries" />
        <CompactSummaryCards
          policeSummary={policeSummaryStore.latestSummary || undefined}
          weatherSummary={weatherSummaryStore.latestSummary || undefined}
          trafficSummary={trafficSummaryStore.latestSummary || undefined}
          policeLoading={policeSummaryStore.isLoading}
          weatherLoading={weatherSummaryStore.isLoading}
          trafficLoading={trafficSummaryStore.isLoading}
        />
      </View>

      {/* Recent News Section */}
      <HomeNewsSection
        title="Local News"
        newsItems={newsStore.latestItems.slice(0, 4)}
        onNewsPress={handleNewsPress}
      />

      {/* More News Section */}
      <HomeNewsSection
        title="More News"
        newsItems={newsStore.latestItems.slice(4, 12)}
        onNewsPress={handleNewsPress}
      />
    </Screen>
  )
})

// -----------------------
// Themed style definitions
// -----------------------

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  // more air between distinct sections (rhythm), density stays tight inside each
  paddingTop: spacing.md,
})

const $cityStatusSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.sm,
})

const $sectionHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
})

export default HomeScreen
