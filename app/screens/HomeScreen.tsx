import { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Dimensions, Image, ImageStyle, View, ViewStyle, TextStyle, Pressable, RefreshControl, TouchableOpacity, Modal, TouchableWithoutFeedback, findNodeHandle, UIManager } from "react-native"
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
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
  ZoomOut,
} from "react-native-reanimated"
import { useStores } from "@/models"
import { NewsCard } from "@/components/NewsCard"
import { Linking } from "react-native"
import { NewsItem } from "@/models/News"
import { SectionHeader } from "@/components/SectionHeader"
import { Siren, CloudSun, BusFront, ChevronDown, Plus } from "lucide-react-native"
import { useTabHeader } from "@/components/TabHeader"
import { LoadingIcon } from "@/components/LoadingIcon"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"
import { usePullToRefreshProgress } from "@/utils/usePullToRefreshProgress"
import { CompactSummaryCards } from "@/components/CompactSummaryCards"
import { CityStatus } from "@/components/CityStatus"
import { WeatherDisplay } from "@/components/WeatherDisplay"

interface HomeScreenProps extends BottomTabScreenProps<MainTabParamList, "Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const { themed, theme } = useAppTheme()
  const { newsStore, policeSummaryStore, weatherAlertStore, weatherSummaryStore, trafficSummaryStore, cityStatusStore, api } = useStores()
  const screenWidth = Dimensions.get("window").width
  const [refreshing, setRefreshing] = useState(false)
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [selectedCity, setSelectedCity] = useState("Ottawa")
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const cityTextRef = useRef<any>(null)
  
  // Set up image dimensions
  const IMAGE_HEIGHT = screenWidth * 0.5
  const MIN_IMAGE_HEIGHT = 120

  // Animation values
  const opacityValue = useSharedValue(0)
  const translateYValue = useSharedValue(10)
  const scrollY = useSharedValue(0)
  const { progress, onScroll: refreshProgress, resetProgress } = usePullToRefreshProgress()

  // Add animation for dropdown icon
  const dropdownIconRotation = useSharedValue(0)
  
  // Update rotation when dropdown visibility changes
  useEffect(() => {
    dropdownIconRotation.value = withTiming(dropdownVisible ? 180 : 0, { duration: 200 })
  }, [dropdownVisible])
  
  // Create animated style for icon rotation
  const dropdownIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${dropdownIconRotation.value}deg` }],
    }
  })

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
  }, [scrollY.value])

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

  // Weather display refresh reference
  const weatherDisplayRefresh = useRef<() => void>(() => {})

  // Fetch data when component mounts
  useEffect(() => {
    // Start animation when component mounts - make it snappier with less delay and stiffer spring
    opacityValue.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 150 }))
    translateYValue.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 150 }))
    
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
    
    // Fetch city status information
    cityStatusFetch()
  }, [api, newsStore, policeSummaryStore, weatherAlertStore, weatherSummaryStore, trafficSummaryStore, cityStatusStore])
  
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

  // Fetch city status
  const cityStatusFetch = () => {
    if (cityStatusStore.items.length === 0) {
      cityStatusStore.fetchCityStatus(api)
      
      // Add school bus item directly for testing
      setTimeout(() => {
        cityStatusStore.addSchoolBusItem()
      }, 2000)
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
        trafficSummaryStore.refreshTrafficSummaries(api),
        cityStatusStore.refreshCityStatus(api)
      ])
      
      // Also refresh weather display
      if (weatherDisplayRefresh.current) {
        weatherDisplayRefresh.current()
      }
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

  // Function to measure and show dropdown
  const measureAndShowDropdown = () => {
    if (cityTextRef.current && findNodeHandle(cityTextRef.current)) {
      UIManager.measure(
        findNodeHandle(cityTextRef.current) as number,
        (x, y, width, height, pageX, pageY) => {
          setDropdownPosition({
            top: pageY + height,
            left: pageX,
            width: Math.max(width, 200)
          });
          setDropdownVisible(true);
        }
      );
    } else {
      // Fallback if measurement fails - position near the top of the screen
      setDropdownPosition({
        top: IMAGE_HEIGHT * 0.7,
        left: 20,
        width: screenWidth - 40
      });
      setDropdownVisible(true);
    }
  };

  // Custom animation values for dropdown
  const dropdownAnimProgress = useSharedValue(0);
  
  // Update dropdown animation when visibility changes
  useEffect(() => {
    if (dropdownVisible) {
      // Open with a faster spring animation
      dropdownAnimProgress.value = withSpring(1, {
        damping: 22,        // Slightly more damping to prevent bounce
        stiffness: 250,     // Higher stiffness for faster animation
        mass: 0.6,          // Lower mass for quicker response
        restDisplacementThreshold: 0.005, // More precision
        restSpeedThreshold: 5, // Allow faster completion
      });
    } else {
      // Close with timing for a smooth controlled return
      dropdownAnimProgress.value = withTiming(0, {
        duration: 180,
      });
    }
  }, [dropdownVisible]);
  
  // Custom animation style for dropdown
  const dropdownAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      dropdownAnimProgress.value,
      [0, 1],
      [-10, 0]  // Smaller distance for more subtle effect
    );
    
    const opacity = dropdownAnimProgress.value;
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

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
                <TouchableOpacity 
                  ref={cityTextRef}
                  onPress={measureAndShowDropdown} 
                  style={themed($citySelector)}
                  activeOpacity={0.7}
                >
                  <Text preset="heading" style={themed($headerText)}>
                    {selectedCity}
                  </Text>
                  <Animated.View style={dropdownIconStyle}>
                    <ChevronDown size={24} color={theme.colors.text} />
                  </Animated.View>
                </TouchableOpacity>
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
      
      {/* City Dropdown using Animated.View */}
      {dropdownVisible && (
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <Animated.View 
            style={[
              themed($modalOverlay),
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                opacity: dropdownAnimProgress,
              }
            ]}
          >
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <Animated.View 
                style={[
                  themed($dropdown),
                  {
                    position: 'absolute',
                    top: dropdownPosition.top,
                    left: Math.max(10, dropdownPosition.left - 10),
                    width: Math.max(200, dropdownPosition.width + 20),
                    marginTop: 4,
                    maxHeight: 300,
                  },
                  dropdownAnimatedStyle
                ]}
              >
                <TouchableOpacity
                  style={[
                    themed($cityItem),
                    selectedCity === "Ottawa" && themed($selectedCityItem),
                  ]}
                  onPress={() => {
                    setSelectedCity("Ottawa")
                    setDropdownVisible(false)
                  }}
                >
                  <Image
                    source={require("../../assets/images/ottawa_cover.jpg")}
                    style={themed($cityImage)}
                    resizeMode="cover"
                  />
                  <Text style={themed($cityItemText)}>Ottawa</Text>
                  {selectedCity === "Ottawa" && (
                    <View style={themed($checkIconWrapper)}>
                      <ChevronDown size={20} color={theme.colors.text} />
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    themed($cityItem),
                    selectedCity === "Vancouver" && themed($selectedCityItem),
                  ]}
                  onPress={() => {
                    setSelectedCity("Vancouver")
                    setDropdownVisible(false)
                  }}
                >
                  <Image
                    source={require("../../assets/images/vancouver-cover.jpg")}
                    style={themed($cityImage)}
                    resizeMode="cover"
                  />
                  <Text style={themed($cityItemText)}>Vancouver</Text>
                  {selectedCity === "Vancouver" && (
                    <View style={themed($checkIconWrapper)}>
                      <ChevronDown size={20} color={theme.colors.text} />
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity style={themed($addCityButton)}>
                  <Plus size={22} color={theme.colors.text} />
                  <Text style={themed($addCityText)}>Add City</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
      
      {/* City Status Section */}
      <View style={themed($updatesSection)}>
        <SectionHeader 
          title="City Status" 
          RightComponent={
            <WeatherDisplay onRefresh={(refreshFn) => {
              weatherDisplayRefresh.current = refreshFn
            }} />
          }
        />
        <CityStatus 
          statusItems={[
            ...cityStatusStore.items,
            
          ]}
          loading={cityStatusStore.isLoading}
        />
      </View>
      {/* City Updates Section - Compact cards for Police, Weather, and Traffic */}
      <View style={themed($updatesSection)}>
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

const $updatesSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
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

const $citySelector: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
})

const $cityItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginVertical: 4,
})

const $selectedCityItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.containerBackground,
})

const $cityImage: ThemedStyle<ImageStyle> = () => ({
  width: 48,
  height: 48,
  borderRadius: 8,
  marginRight: 12,
})

const $cityItemText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16,
  fontFamily: typography.primary.medium,
})

const $checkIconWrapper: ThemedStyle<ViewStyle> = () => ({
  marginLeft: "auto",
})

const $addCityButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: 16,
  marginTop: 8,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  gap: 8,
})

const $addCityText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16, 
  fontFamily: typography.primary.medium,
})

const $modalOverlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
})

const $dropdown: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  minWidth: 200,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
  overflow: 'hidden',
})

export default HomeScreen
