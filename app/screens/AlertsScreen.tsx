import { FC, useState, useEffect, useRef, useMemo } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle, RefreshControl, Linking, NativeSyntheticEvent, NativeScrollEvent, Dimensions, LayoutChangeEvent, Platform } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text, Button } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { CategoryTabs, CategoryTab } from "@/components/CategoryTabs"
import { AlertItem } from "@/components/AlertCard"
import { FlashList } from "@shopify/flash-list"
import { useTabHeader } from "@/components/TabHeader"
import type { ThemedStyle } from "@/theme"
import { CloudSun, Siren, Zap, BusFront } from "lucide-react-native"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"
import { usePullToRefreshProgress } from "@/utils/usePullToRefreshProgress"
import { useStores } from "@/models"
import { PoliceNewsItem } from "@/models/PoliceNews"
import { WeatherAlertItem } from "@/models/WeatherAlert"
import { EnhancedAlertCard } from "@/components/EnhancedAlertCard"
import { useIsFocused } from "@react-navigation/native"
import { formatRelativeTime } from "@/utils/formatRelativeTime"
import { GestureDetector, Gesture } from "react-native-gesture-handler"
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue, 
  runOnJS,
  interpolate,
  Extrapolation,
  withSpring,
  withDecay,
  Easing,
  cancelAnimation,
  useDerivedValue,
  FadeIn,
  FadeOut,
  clamp,
  useAnimatedScrollHandler,
  SharedValue
} from "react-native-reanimated"

interface AlertsScreenProps extends BottomTabScreenProps<MainTabParamList, "Alerts"> {}

export const AlertsScreen: FC<AlertsScreenProps> = observer(function AlertsScreen() {
  const { theme, themed, themeContext } = useAppTheme()
  const { policeNewsStore, weatherAlertStore, api } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("weather")
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [alerts, setAlerts] = useState<Record<string, AlertItem[]>>({
    hydro: [],
    traffic: []
  })
  const [sortNewestFirst, setSortNewestFirst] = useState(true)
  const { progress, onScroll: pullRefreshOnScroll } = usePullToRefreshProgress()
  const weatherListRef = useRef<FlashList<WeatherAlertItem>>(null)
  const policeListRef = useRef<FlashList<PoliceNewsItem>>(null)
  const hydroListRef = useRef<FlashList<AlertItem>>(null)
  const trafficListRef = useRef<FlashList<AlertItem>>(null)
  const isFocused = useIsFocused()
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
  
  // Track visited tabs and their scroll positions
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set())
  const scrollPositions = useRef<Record<string, number>>({
    weather: 0,
    police: 0,
    hydro: 0,
    traffic: 0
  })
  const [containerLayout, setContainerLayout] = useState({ width: screenWidth, height: 0 })
  const [allTabsPreloaded, setAllTabsPreloaded] = useState(false)

  // Animation values for swipe
  const translateX = useSharedValue(0)
  const prevTranslateX = useSharedValue(0)
  const isAnimating = useSharedValue(false)
  const activeIndex = useSharedValue(currentTabIndex)
  const scrollEnabled = useSharedValue(true)
  
  // Animation constants
  const offscreenRight = screenWidth
  const offscreenLeft = -screenWidth
  const ANIMATION_CONFIG = useMemo(() => ({
    timing: {
      duration: 200, // Faster animation
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Modified curve for faster feel
    },
    spring: {
      damping: 18, // Less damping for faster animation
      stiffness: 350, // Higher stiffness for quicker movement
      mass: 0.6, // Lower mass for faster response
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    },
    edge: {
      damping: 12, 
      stiffness: 200,
      mass: 0.5,
    }
  }), [])

  // Derive values for paralax and fade effects
  const tabOpacity = useDerivedValue(() => {
    return interpolate(
      Math.abs(translateX.value),
      [0, screenWidth * 0.8],
      [1, 0.5], // Increased minimum opacity for better visibility
      Extrapolation.CLAMP
    )
  })

  const tabScale = useDerivedValue(() => {
    return interpolate(
      Math.abs(translateX.value),
      [0, screenWidth],
      [1, 0.96], // Less scale effect for faster perception
      Extrapolation.CLAMP
    )
  })

  // Update activeIndex when currentTabIndex changes
  useEffect(() => {
    activeIndex.value = currentTabIndex
  }, [currentTabIndex, activeIndex])

  // Define category tabs
  const categoryTabs: CategoryTab[] = [
    { id: "weather", label: "Weather", color: theme.colors.weather },
    { id: "police", label: "Police", color: theme.colors.police },
    { id: "hydro", label: "Hydro", color: theme.colors.hydro },
    { id: "traffic", label: "Road & Traffic", color: theme.colors.traffic },
  ]

  // Preload all tab data when app mounts
  useEffect(() => {
    const preloadAllTabs = async () => {
      // Preload weather alerts
      if (weatherAlertStore.items.length === 0) {
        weatherAlertStore.fetchWeatherAlerts(api)
      }
      
      // Preload police news
      if (policeNewsStore.items.length === 0) {
        policeNewsStore.fetchPoliceNews(api)
      }
      
      // Generate mock alerts for other tabs
      const hydroAlerts = generateMockAlerts("hydro")
      const trafficAlerts = generateMockAlerts("traffic")
      
      setAlerts({
        hydro: hydroAlerts,
        traffic: trafficAlerts
      })
      
      // Mark all tabs as visited to prevent refreshing when first accessing
      setVisitedTabs(new Set(["weather", "police", "hydro", "traffic"]))
      setAllTabsPreloaded(true)
    }
    
    preloadAllTabs()
  }, [api, policeNewsStore, weatherAlertStore])

  // Set up the tab header with customized styling
  useTabHeader({
    title: "Alerts",
    titleMode: "center",
  }, [themeContext])

  // Handle container layout changes
  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window')
      setContainerLayout({ width, height })
    }
    
    // Initial update
    updateLayout()
    
    // Setup listener for dimension changes
    const subscription = Dimensions.addEventListener('change', updateLayout)
    
    return () => {
      subscription.remove()
    }
  }, [])

  // Handle tab change with optimized animation
  const handleTabChange = (tabId: string, animate = true) => {
    const prevIndex = currentTabIndex
    const newIndex = categoryTabs.findIndex(tab => tab.id === tabId)
    
    // Don't do anything if it's the same tab
    if (prevIndex === newIndex) return
    
    // Update state immediately
    setActiveTab(tabId)
    setCurrentTabIndex(newIndex)
    
    // Direction of transition (-1 = right to left, 1 = left to right)
    const direction = prevIndex < newIndex ? -1 : 1
    const startPosition = direction * containerLayout.width
    
    if (animate) {
      // Start animation sequence - much faster now
      isAnimating.value = true
      scrollEnabled.value = false
      
      // Setup animation to start from offscreen position
      translateX.value = startPosition
      
      // Animate to centered position with optimized animation
      translateX.value = withTiming(
        0, 
        {
          duration: 250, // Much faster animation
          easing: Easing.out(Easing.cubic),
        },
        () => {
          // Mark animation as complete
          isAnimating.value = false
          scrollEnabled.value = true
        }
      )
    } else {
      // Jump to position without animation
      translateX.value = 0
      isAnimating.value = false
      scrollEnabled.value = true
    }
    
    // Restore previous scroll position if available
    setTimeout(() => {
      const savedPosition = scrollPositions.current[tabId] || 0
      const currentListRef = getListRefForTab(tabId)
      
      if (currentListRef?.current) {
        currentListRef.current.scrollToOffset({ 
          offset: savedPosition, 
          animated: false 
        })
      }
    }, 0) // No delay needed now
  }

  // Enhanced gesture handlers for more responsive swipe
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Don't start a new gesture if we're already animating
      if (isAnimating.value) return
      
      prevTranslateX.value = translateX.value
      cancelAnimation(translateX)
    })
    .onUpdate((event) => {
      // Don't track gesture if scrolling content
      if (!scrollEnabled.value) return

      // Apply the translation - with less resistance for faster response
      translateX.value = prevTranslateX.value + event.translationX * 1.0
    })
    .onEnd((event) => {
      // Don't handle gesture if scrolling content
      if (!scrollEnabled.value) {
        translateX.value = withTiming(0, { duration: 200 })
        return
      }

      const currentIndex = activeIndex.value
      const maxIndex = categoryTabs.length - 1
      
      // More sensitive thresholds for faster switching
      const threshold = containerLayout.width * 0.15 // 15% of width to trigger
      const velocityThreshold = 300 // Lower velocity threshold
      
      const shouldGoToNextTab = 
        (translateX.value < -threshold || event.velocityX < -velocityThreshold) && 
        currentIndex < maxIndex
        
      const shouldGoToPrevTab = 
        (translateX.value > threshold || event.velocityX > velocityThreshold) && 
        currentIndex > 0
      
      if (shouldGoToNextTab) {
        // Go to next tab with optimized animation
        isAnimating.value = true
        const nextIndex = currentIndex + 1
        
        // Use timing animation which can be faster than spring
        translateX.value = withTiming(
          offscreenLeft, 
          { duration: 150 }, // Super quick transition
          () => {
            runOnJS(handleTabChange)(categoryTabs[nextIndex].id, false)
          }
        )
      } else if (shouldGoToPrevTab) {
        // Go to previous tab with optimized animation
        isAnimating.value = true
        const prevIndex = currentIndex - 1
        
        // Use timing animation which can be faster than spring
        translateX.value = withTiming(
          offscreenRight, 
          { duration: 150 }, // Super quick transition
          () => {
            runOnJS(handleTabChange)(categoryTabs[prevIndex].id, false)
          }
        )
      } else {
        // Return to center with timing for predictable animation
        translateX.value = withTiming(0, { 
          duration: 150,
          easing: Easing.out(Easing.cubic),
        })
      }
    })
    .minDistance(5) // Lower minimum distance to detect swipe sooner
    .enabled(true)

  // Enhanced animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: tabScale.value }
      ],
      opacity: tabOpacity.value,
    }
  })

  // Handle refresh with preloading for all tabs
  const onRefresh = async () => {
    setRefreshing(true)
    
    try {
      // Refresh all data at once regardless of active tab
      const promises = []
      
      // Refresh weather alerts
      promises.push(weatherAlertStore.refreshWeatherAlerts(api))
      
      // Refresh police news
      promises.push(policeNewsStore.refreshPoliceNews(api))
      
      // Refresh mock alerts
      const hydroAlerts = generateMockAlerts("hydro")
      const trafficAlerts = generateMockAlerts("traffic")
      
      // Wait for all refreshes to complete
      await Promise.all(promises)
      
      // Update alerts
      setAlerts({
        hydro: hydroAlerts,
        traffic: trafficAlerts
      })
      
      // Scroll active tab to top
      scrollToTop()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // Combined scroll handler that works for both swipe and pull-to-refresh
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Call the original onScroll handler for pull-to-refresh
    pullRefreshOnScroll(event)
    
    // Save the scroll position for current tab
    const offset = event.nativeEvent.contentOffset.y
    scrollPositions.current[activeTab] = offset
  }

  // Get list ref for the given tab
  const getListRefForTab = (tabId: string) => {
    switch (tabId) {
      case "weather": return weatherListRef
      case "police": return policeListRef
      case "hydro": return hydroListRef
      case "traffic": return trafficListRef
      default: return null
    }
  }
  
  // Scroll to top when needed
  const scrollToTop = () => {
    const currentListRef = getListRefForTab(activeTab)
    if (currentListRef?.current) {
      currentListRef.current.scrollToOffset({ offset: 0, animated: true })
      // Reset saved position for this tab
      scrollPositions.current[activeTab] = 0
    }
  }

  // Handle alert item press
  const handleAlertPress = (link: string) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't open URL: ", err))
  }

  // Get the icon for the current category
  const getCategoryIcon = () => {
    switch (activeTab) {
      case "weather":
        return <CloudSun size={24} color={theme.colors.weather} />
      case "police":
        return <Siren size={24} color={theme.colors.police} />
      case "hydro": 
        return <Zap size={24} color={theme.colors.hydro} />
      case "traffic":
        return <BusFront size={24} color={theme.colors.traffic} />
      default:
        return null
    }
  }

  // Get the color for the current category
  const getCategoryColor = () => {
    switch (activeTab) {
      case "weather": return theme.colors.weather
      case "police": return theme.colors.police
      case "hydro": return theme.colors.hydro
      case "traffic": return theme.colors.traffic
      default: return theme.colors.text
    }
  }

  // Get the title for the current category
  const getCategoryTitle = () => {
    return categoryTabs.find(tab => tab.id === activeTab)?.label || ""
  }
  
  // Toggle sort order for alerts
  const toggleSortOrder = () => {
    setSortNewestFirst(!sortNewestFirst)
  }

  // Get sorted alerts for the current tab
  const getSortedAlerts = (category: string) => {
    const tabAlerts = alerts[category] || []
    return [...tabAlerts].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : new Date(a.timestamp).getTime()
      const dateB = b.date ? new Date(b.date).getTime() : new Date(b.timestamp).getTime()
      return sortNewestFirst ? dateB - dateA : dateA - dateB
    })
  }

  // Generate mock alerts for demonstration
  const generateMockAlerts = (category: string): AlertItem[] => {
    // Sources by category
    const sources = {
      weather: "Environment Canada",
      police: "Ottawa Police Service",
      hydro: "Hydro Ottawa",
      traffic: "City of Ottawa Traffic"
    }
    
    // Generate mock alerts based on the category
    return Array.from({ length: 10 }, (_, i) => {
      // Generate a date in ISO format for i hours ago
      const date = new Date(Date.now() - i * 3600000).toISOString()
      
      return {
        id: `${category}-${i}`,
        source: sources[category as keyof typeof sources] || "Unknown Source",
        message: `This is a mock ${category} alert #${i+1} for testing.`,
        timestamp: formatRelativeTime(date),
        category,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Alert #${i+1}`,
        excerpt: `Detailed information about this ${category} alert situation. This provides additional context for the alert message.`,
        link: `https://example.com/${category}/alert/${i}`,
        date,
        formattedDate: new Date(Date.now() - i * 3600000).toLocaleDateString(),
      }
    })
  }

  // Render the appropriate list based on active tab
  const renderContent = () => {
    // Add a key to each FlashList to ensure proper remounting when switching tabs
    if (activeTab === "police") {
      // Show Police News
      return (
        <View style={themed($listWrapper)} key="police-list">
          <FlashList
            ref={policeListRef}
            data={policeNewsStore.sortedItems}
            renderItem={({ item }: { item: PoliceNewsItem }) => (
              <Animated.View entering={FadeIn.duration(200)}>
                <EnhancedAlertCard 
                  item={item} 
                  onPress={() => handleAlertPress(item.link)}
                  categoryColor={theme.colors.police}
                />
              </Animated.View>
            )}
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
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListFooterComponent={<View style={{ height: 150 }} />}
            ListEmptyComponent={
              <View style={themed($emptyContainer)}>
                <Text
                  text={policeNewsStore.isLoading ? "Loading police alerts..." : policeNewsStore.error || "No police alerts available"}
                  style={themed($emptyText)}
                />
              </View>
            }
          />
        </View>
      )
    } else if (activeTab === "weather") {
      // Show Weather Alerts
      return (
        <View style={themed($listWrapper)} key="weather-list">
          <FlashList
            ref={weatherListRef}
            data={weatherAlertStore.sortedItems}
            renderItem={({ item }: { item: WeatherAlertItem }) => (
              <Animated.View entering={FadeIn.duration(200)}>
                <EnhancedAlertCard 
                  item={{
                    id: item.id,
                    title: item.title,
                    excerpt: item.summary,
                    link: item.link,
                    date: item.pubDate,
                    formattedDate: item.formattedDate,
                    category: "weather",
                    source: "Environment Canada",
                    message: item.summary,
                    timestamp: item.formattedDate
                  }}
                  onPress={() => handleAlertPress(item.link)}
                  categoryColor={theme.colors.weather}
                />
              </Animated.View>
            )}
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
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListFooterComponent={<View style={{ height: 150 }} />}
            ListEmptyComponent={
              <View style={themed($emptyContainer)}>
                <Text
                  text={weatherAlertStore.isLoading ? "Loading weather alerts..." : weatherAlertStore.error || "No weather alerts available"}
                  style={themed($emptyText)}
                />
              </View>
            }
          />
        </View>
      )
    }
    
    // Other categories - show preloaded mock alerts
    const category = activeTab // 'hydro' or 'traffic'
    const sortedAlerts = getSortedAlerts(category)
    
    return (
      <View style={themed($listWrapper)} key={`${activeTab}-list`}>
        <FlashList
          ref={activeTab === "hydro" ? hydroListRef : trafficListRef}
          data={sortedAlerts}
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn.duration(200)}>
              <EnhancedAlertCard 
                item={item} 
                onPress={() => item.link && handleAlertPress(item.link)}
                categoryColor={getCategoryColor()}
              />
            </Animated.View>
          )}
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListFooterComponent={<View style={{ height: 150 }} />}
          ListEmptyComponent={
            <View style={themed($emptyContainer)}>
              <Text
                text={refreshing ? `Loading ${activeTab} alerts...` : `No ${activeTab} alerts available. Pull down to refresh.`}
                style={themed($emptyText)}
              />
            </View>
          }
        />
      </View>
    )
  }

  // Initialize currentTabIndex
  useEffect(() => {
    setCurrentTabIndex(categoryTabs.findIndex(tab => tab.id === activeTab))
  }, [])

  return (
    <Screen 
      style={themed($root)} 
      preset="fixed" 
      safeAreaEdges={["bottom"]} 
      contentContainerStyle={themed($screenContent)}
    >
      {/* Sticky header section */}
      <View style={themed($stickyHeaderContainer)}>
        <View style={themed($categoryContainer)}>
          <CategoryTabs 
            tabs={categoryTabs}
            onTabChange={handleTabChange}
            initialTabId={activeTab}
            currentIndex={currentTabIndex}
          />
        </View>
        
        <View style={themed($headerRow)}>
          <View style={themed($categoryHeaderContainer)}>
            {getCategoryIcon()}
            <Text 
              text={getCategoryTitle()}
              style={[themed($categoryHeaderText), { color: getCategoryColor() }]} 
            />
          </View>
          
          <Button
            text={
              activeTab === "police" 
                ? (policeNewsStore.sortNewestFirst ? "Newest First" : "Oldest First")
                : activeTab === "weather"
                  ? (weatherAlertStore.sortNewestFirst ? "Newest First" : "Oldest First")
                  : (sortNewestFirst ? "Newest First" : "Oldest First")
            }
            onPress={
              activeTab === "police" 
                ? policeNewsStore.toggleSortOrder
                : activeTab === "weather"
                  ? weatherAlertStore.toggleSortOrder
                  : toggleSortOrder
            }
            style={themed($sortButton)}
            textStyle={themed($sortButtonText)}
          />
        </View>
      </View>
      
      <PullToRefreshIndicator visible={refreshing} color={getCategoryColor()} progress={progress} />
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[themed($contentContainer), contentAnimatedStyle]}>
          {renderContent()}
        </Animated.View>
      </GestureDetector>
    </Screen>
  )
})

// Styles
const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $stickyHeaderContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  backgroundColor: colors.background,
  zIndex: 10,
  elevation: 3, // For Android shadow
  shadowColor: "#000", // For iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
})

const $categoryContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,

})

const $categoryHeaderContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
})

const $categoryHeaderText: ThemedStyle<TextStyle> = ({ spacing, typography }) => ({
  fontSize: typography.sizes.lg,
  fontWeight: "bold",
  marginLeft: spacing.sm,
  lineHeight: typography.sizes.lg * 1.2,
  textAlignVertical: "center",
})

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  width: "100%",
  flexGrow: 1,
  height: "100%"
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

const $sortButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.transparent,
  paddingHorizontal: 0,
  borderWidth: 0,
})

const $sortButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.tint,
  backgroundColor: colors.transparent,
  paddingHorizontal: 12,
  borderWidth: 0,
})

const $listWrapper: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  width: "100%",
  minHeight: 800
})

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  flexGrow: 1,
  height: "100%",
})
