import { FC, useEffect, useRef } from "react"
import { observer } from "mobx-react-lite"
import { Dimensions, View, ViewStyle, RefreshControl, Linking } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  withDelay,
  withSpring,
} from "react-native-reanimated"
import { SectionHeader } from "@/components/SectionHeader"
import { useTabHeader } from "@/components/TabHeader"
import { WeatherDisplay } from "@/components/WeatherDisplay"
import { CompactSummaryCards } from "@/components/CompactSummaryCards"
import { CityStatus } from "@/components/CityStatus"
import { HomeHeader } from "@/components/HomeHeader"
import { CitySelector } from "@/components/CitySelector"
import { HomeNewsSection } from "@/components/HomeNewsSection"
import { useHomeData } from "@/utils/useHomeData"
import { useCitySelector } from "@/utils/useCitySelector"
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
      cityStatusStore
    },
    refreshing,
    fetchInitialData,
    refreshData
  } = useHomeData()
  
  const {
    cityTextRef,
    selectedCity,
    dropdownVisible,
    dropdownPosition,
    measureAndShowDropdown,
    handleCitySelect,
    closeDropdown
  } = useCitySelector()
  
  const { progress, onScroll: refreshProgress, resetProgress } = usePullToRefreshProgress()

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
      resetProgress();
    }
  }, [refreshing, resetProgress]);

  // Hide the header for this screen only
  useEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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
      progressViewOffset={screenWidth * 0.5 / 2}
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
          if (!refreshing) resetProgress();
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
        selectedCity={selectedCity}
        refreshing={refreshing}
        progress={progress}
        onCitySelectorPress={measureAndShowDropdown}
      />
      
      {/* City Selector Dropdown */}
      <CitySelector
        visible={dropdownVisible}
        dropdownPosition={dropdownPosition}
        selectedCity={selectedCity}
        onCitySelect={handleCitySelect}
        onClose={closeDropdown}
      />
      
      {/* City Status Section */}
      <View style={themed($section)}>
        <SectionHeader 
          title="City Status" 
          RightComponent={
            <WeatherDisplay onRefresh={(refreshFn) => {
              weatherDisplayRefresh.current = refreshFn
            }} />
          }
        />
        <CityStatus 
          statusItems={cityStatusStore.items}
          loading={cityStatusStore.isLoading}
        />
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
        newsItems={newsStore.latestItems.slice(4, 8)}
        onNewsPress={handleNewsPress}
      />

      {/* More News Section */}
      <HomeNewsSection
        title="More News"
        newsItems={newsStore.latestItems.slice(8, 16)}
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
  paddingTop: spacing.sm,
})

export default HomeScreen
