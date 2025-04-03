import { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Dimensions, Image, ImageStyle, View, ViewStyle, TextStyle, Pressable, RefreshControl } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withTiming,
  runOnJS,
} from "react-native-reanimated"
import { useStores } from "@/models"
import { NewsCard } from "@/components/NewsCard"
import { Linking } from "react-native"
import { NewsItem } from "@/models/News"
import { SectionHeader } from "@/components/SectionHeader"
import { Siren, CloudSun, BusFront } from "lucide-react-native"
import { useTabHeader } from "@/components/TabHeader"
import { LoadingIcon } from "@/components/LoadingIcon"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"
import { usePullToRefreshProgress } from "@/utils/usePullToRefreshProgress"
import { PoliceSummaryCard } from "@/components/PoliceSummaryCard"
import { WeatherAlertSummaryCard } from "@/components/WeatherAlertSummaryCard"
import { WeatherSummaryCard } from "@/components/WeatherSummaryCard"
import { TrafficSummaryCard } from "@/components/TrafficSummaryCard"

interface HomeScreenProps extends BottomTabScreenProps<MainTabParamList, "Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const { themed, theme } = useAppTheme()
  const { newsStore, policeSummaryStore, weatherAlertStore, weatherSummaryStore, trafficSummaryStore, api } = useStores()
  const screenWidth = Dimensions.get("window").width
  const [refreshing, setRefreshing] = useState(false)
  
  // Set up image dimensions
  const IMAGE_HEIGHT = screenWidth * 0.5
  const MIN_IMAGE_HEIGHT = 120

  // Animation values
  const opacityValue = useSharedValue(0)
  const translateYValue = useSharedValue(10)
  const scrollY = useSharedValue(0)
  const { progress, onScroll: refreshProgress, resetProgress } = usePullToRefreshProgress()

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

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) {
      return "Good morning"
    } else if (hour >= 12 && hour < 18) {
      return "Good afternoon"
    } else {
      return "Good evening"
    }
  }

  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Greeting animation styles
  const greetingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
      transform: [{ translateY: translateYValue.value }],
    }
  })

  // Header image animation style
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [IMAGE_HEIGHT, MIN_IMAGE_HEIGHT],
      Extrapolate.CLAMP
    )

    const translateY = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [0, -(IMAGE_HEIGHT - MIN_IMAGE_HEIGHT) / 2],
      Extrapolate.CLAMP
    )

    const scale = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [1, 1.1],
      Extrapolate.CLAMP
    )

    return {
      height,
      transform: [
        { translateY },
        { scale },
      ],
    }
  })

  // Header container animation style
  const headerContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.85],
      Extrapolate.CLAMP
    )

    return {
      opacity,
    }
  })

  // Fetch data when component mounts
  useEffect(() => {
    // Start animation when component mounts
    opacityValue.value = withDelay(500, withSpring(1, { damping: 20 }))
    translateYValue.value = withDelay(500, withSpring(0, { damping: 20 }))
    
    // Fetch news if we don't have any yet
    if (newsStore.items.length === 0) {
      newsStore.fetchNews(api)
    }
    
    // Fetch police summaries
    policeSummaryFetch()
    
    // Fetch weather alerts (for Alerts screen)
    weatherAlertFetch()
    
    // Fetch weather summaries (for Home screen)
    weatherSummaryFetch()
    
    // Fetch traffic summaries
    trafficSummaryFetch()
  }, [api, newsStore, policeSummaryStore, weatherAlertStore, weatherSummaryStore, trafficSummaryStore])
  
  // Fetch police summaries
  const policeSummaryFetch = () => {
    if (policeSummaryStore.items.length === 0) {
      policeSummaryStore.fetchPoliceSummaries(api)
    }
  }
  
  // Fetch weather alerts
  const weatherAlertFetch = () => {
    if (weatherAlertStore.items.length === 0) {
      weatherAlertStore.fetchWeatherAlerts(api)
    }
  }
  
  // Fetch weather summaries
  const weatherSummaryFetch = () => {
    if (weatherSummaryStore.items.length === 0) {
      weatherSummaryStore.fetchWeatherSummaries(api)
    }
  }
  
  // Fetch traffic summaries
  const trafficSummaryFetch = () => {
    if (trafficSummaryStore.items.length === 0) {
      trafficSummaryStore.fetchTrafficSummaries(api)
    }
  }

  const handleNewsPress = (link: string) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't open URL: ", err))
  }
  
  const handleWeatherAlertPress = (link: string) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't open URL: ", err))
  }
  
  // Handle refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true)
      // Only refresh summaries and news, not alerts when pulling down on Home screen
      await Promise.all([
        newsStore.refreshNews(api),
        policeSummaryStore.refreshPoliceSummaries(api),
        weatherSummaryStore.refreshWeatherSummaries(api),
        trafficSummaryStore.refreshTrafficSummaries(api)
      ])
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
      // Ensure progress is reset when refresh completes
      resetProgress()
    }
  }
  
  // Custom RefreshControl 
  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.transparent}
      colors={[theme.colors.transparent]}
      progressBackgroundColor={theme.colors.transparent}
      progressViewOffset={IMAGE_HEIGHT / 2}
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
      {/* Top image with black overlay */}
      <Animated.View style={[themed($imageSection), headerContainerStyle]}>
        <PullToRefreshIndicator visible={refreshing} progress={progress} />
        <Animated.Image
          source={require("../../assets/images/ottawa_cover.jpg")}
          style={[
            { width: screenWidth, height: IMAGE_HEIGHT },
            themed($image),
            imageAnimatedStyle,
          ]}
          resizeMode="cover"
        />
        <View
          style={[{ width: screenWidth, height: IMAGE_HEIGHT }, themed($overlay)]}
        >
          <View style={themed($headerOverlay)}>
            <View style={themed($headerTextContainer)}>
              <View style={themed($cityTextWrapper)}>
                <Text preset="heading" style={themed($headerText)}>
                  Ottawa
                </Text>
              </View>
            </View>
            {/* Time-based greeting inside header overlay */}
            <Animated.View style={[themed($greetingContainer), greetingAnimatedStyle]}>
              <Text preset="subheading" style={themed($greetingText)}>
                {getGreeting()}
              </Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Weather Summary Section */}
      <View style={themed($weatherSummarySection)}>
        <View style={themed($sectionTitleContainer)}>
          <CloudSun size={20} color={theme.colors.weather} />
          <Text style={[themed($sectionTitle), { color: theme.colors.weather }]}>
            Weather Updates
          </Text>
        </View>
        
        {weatherSummaryStore.isLoading && (
          <View style={themed($loadingContainer)}>
            <LoadingIcon />
          </View>
        )}
        
        {!weatherSummaryStore.isLoading && weatherSummaryStore.latestSummary && (
          <WeatherSummaryCard item={weatherSummaryStore.latestSummary} />
        )}
        
        {!weatherSummaryStore.isLoading && !weatherSummaryStore.latestSummary && (
          <View style={themed($emptyContainer)}>
            <Text style={themed($emptyText)}>No weather updates available.</Text>
          </View>
        )}
      </View>

      {/* Police Summary Section */}
      <View style={themed($policeSummarySection)}>
        <View style={themed($sectionTitleContainer)}>
          <Siren size={20} color={theme.colors.police} />
          <Text style={[themed($sectionTitle), { color: theme.colors.police }]}>
            Police Updates
          </Text>
        </View>
        
        {policeSummaryStore.isLoading && (
          <View style={themed($loadingContainer)}>
            <LoadingIcon />
          </View>
        )}
        
        {!policeSummaryStore.isLoading && policeSummaryStore.latestSummary && (
          <PoliceSummaryCard item={policeSummaryStore.latestSummary} />
        )}
        
        {!policeSummaryStore.isLoading && !policeSummaryStore.latestSummary && (
          <View style={themed($emptyContainer)}>
            <Text style={themed($emptyText)}>No police updates available.</Text>
          </View>
        )}
      </View>
      
      {/* Traffic Summary Section */}
      <View style={themed($trafficSummarySection)}>
        <View style={themed($sectionTitleContainer)}>
          <BusFront size={20} color={theme.colors.traffic} />
          <Text style={[themed($sectionTitle), { color: theme.colors.traffic }]}>
            Traffic Updates
          </Text>
        </View>
        
        {trafficSummaryStore.isLoading && (
          <View style={themed($loadingContainer)}>
            <LoadingIcon />
          </View>
        )}
        
        {!trafficSummaryStore.isLoading && trafficSummaryStore.latestSummary && (
          <TrafficSummaryCard item={trafficSummaryStore.latestSummary} />
        )}
        
        {!trafficSummaryStore.isLoading && !trafficSummaryStore.latestSummary && (
          <View style={themed($emptyContainer)}>
            <Text style={themed($emptyText)}>No traffic updates available.</Text>
          </View>
        )}
      </View>

      {/* 1x4 Grid of news items */}
      <View style={themed($newsSection)}>
      <SectionHeader title="Local News" />
        {newsStore.latestItems.slice(4, 8).map((item: NewsItem) => (
          <NewsCard key={item.id} item={item} compact onPress={() => handleNewsPress(item.link)} />
        ))}
      </View>

      {/* Additional news items */}
      <View style={[themed($newsSection), { marginTop: theme.spacing.md }]}>
        <SectionHeader title="More News" />
        {newsStore.latestItems.slice(8, 16).map((item: NewsItem) => (
          <NewsCard key={item.id} item={item} compact onPress={() => handleNewsPress(item.link)} />
        ))}
      </View>
    </Screen>
  )
})

// -----------------------
// Themed style definitions
// -----------------------

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $imageSection: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  overflow: 'hidden',
})

const $image: ThemedStyle<ImageStyle> = () => ({})

const $overlay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)', // Black overlay with 30% opacity
  paddingHorizontal: spacing.md,
  justifyContent: "flex-end",
})

const $headerOverlay: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  paddingBottom: 10,
})

const $headerTextContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
})

const $headerText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.cityName,
  fontFamily: typography.customFontFamily,
  fontWeight: "700",
  fontSize: 36,
  textAlignVertical: 'center',
})

const $weatherSummarySection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
})

const $policeSummarySection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
})

const $trafficSummarySection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
})

const $sectionTitleContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  ...typography.secondary,
  fontWeight: "600",
  fontSize: 18,
  marginLeft: 8,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  alignItems: "center",
  justifyContent: "center",
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingVertical: spacing.md,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.containerBackground,
  borderRadius: 3,
  padding: spacing.md,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  opacity: 0.7,
})

const $newsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  flexDirection: "column",
  gap: spacing.xs,
})

const $greetingContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-start",
  marginTop: 0,
})

const $greetingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
})

const $cityTextWrapper: ThemedStyle<ViewStyle> = () => ({
  paddingVertical: 2,
  borderRadius: 8,
  justifyContent: 'center',
})

export default HomeScreen
