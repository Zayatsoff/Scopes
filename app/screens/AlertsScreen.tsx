import { FC, useState, useEffect, useRef } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle, RefreshControl, Linking, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
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

interface AlertsScreenProps extends BottomTabScreenProps<MainTabParamList, "Alerts"> {}

export const AlertsScreen: FC<AlertsScreenProps> = observer(function AlertsScreen() {
  const { theme, themed, themeContext } = useAppTheme()
  const { policeNewsStore, weatherAlertStore, api } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("weather")
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [sortNewestFirst, setSortNewestFirst] = useState(true)
  const { progress, onScroll } = usePullToRefreshProgress()
  const weatherListRef = useRef<FlashList<WeatherAlertItem>>(null)
  const policeListRef = useRef<FlashList<PoliceNewsItem>>(null)
  const hydroListRef = useRef<FlashList<AlertItem>>(null)
  const trafficListRef = useRef<FlashList<AlertItem>>(null)
  const isFocused = useIsFocused()
  
  // Track visited tabs and their scroll positions
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set())
  const scrollPositions = useRef<Record<string, number>>({
    weather: 0,
    police: 0,
    hydro: 0,
    traffic: 0
  })

  // Define category tabs
  const categoryTabs: CategoryTab[] = [
    { id: "weather", label: "Weather", color: theme.colors.weather },
    { id: "police", label: "Police", color: theme.colors.police },
    { id: "hydro", label: "Hydro", color: theme.colors.hydro },
    { id: "traffic", label: "Road & Traffic", color: theme.colors.traffic },
  ]

  // Set up the tab header with customized styling
  useTabHeader({
    title: "Alerts",
    titleMode: "center",
  }, [themeContext])

  // Load initial alerts and police news
  useEffect(() => {
    // Fetch weather alerts if that's the active tab
    if (activeTab === "weather") {
      console.log("Fetching weather alerts because active tab is weather")
      weatherAlertStore.fetchWeatherAlerts(api)
    } else if (activeTab === "police") {
      // Fetch police news
      console.log("Fetching police news because active tab is police")
      policeNewsStore.fetchPoliceNews(api)
    } else {
      // Generate mock alerts for other tabs
      console.log(`Generating mock alerts for tab: ${activeTab}`)
      const initialAlerts = generateMockAlerts(activeTab)
      setAlerts(initialAlerts)
    }
  }, [api, policeNewsStore, weatherAlertStore, activeTab])

  // Save active tab when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      // Save active tab to storage (TODO: implement storage method)
    }
  }, [isFocused, activeTab])

  // Track scroll position for current tab
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Call the original onScroll handler
    onScroll(event)
    
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

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    
    if (tabId === "weather") {
      if (weatherAlertStore.items.length === 0) {
        weatherAlertStore.fetchWeatherAlerts(api)
      }
    } else if (tabId === "police") {
      if (policeNewsStore.items.length === 0) {
        policeNewsStore.fetchPoliceNews(api)
      }
    } else {
      setAlerts(generateMockAlerts(tabId))
    }
    
    // Determine if this is the first visit to this tab
    const isFirstVisit = !visitedTabs.has(tabId)
    
    // If first visit, scroll to top, otherwise restore previous position
    setTimeout(() => {
      if (isFirstVisit) {
        // Scroll to top for first visit
        scrollToTop()
        // Mark tab as visited
        setVisitedTabs(prev => new Set([...prev, tabId]))
      } else {
        // Restore previous scroll position
        const savedPosition = scrollPositions.current[tabId] || 0
        
        const currentListRef = getListRefForTab(tabId)
        if (currentListRef?.current) {
          currentListRef.current.scrollToOffset({ 
            offset: savedPosition, 
            animated: false 
          })
        }
      }
    }, 100)
  }
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    
    if (activeTab === "police") {
      await policeNewsStore.refreshPoliceNews(api)
    } else if (activeTab === "weather") {
      await weatherAlertStore.refreshWeatherAlerts(api)
    } else {
      // Simulate API call delay
      setTimeout(() => {
        setAlerts(generateMockAlerts(activeTab))
      }, 1000)
    }
    
    // Scroll to top after refreshing
    setTimeout(scrollToTop, 300)
    
    setRefreshing(false)
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

  // Sort alerts based on date
  const getSortedAlerts = () => {
    return [...alerts].sort((a, b) => {
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

  // Custom RefreshControl 
  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.transparent}
      colors={[theme.colors.transparent]}
      progressBackgroundColor={theme.colors.transparent}
      progressViewOffset={20}
    />
  )

  // Render the appropriate list based on active tab
  const renderContent = () => {
    // Add a key to each FlashList to ensure proper remounting when switching tabs
    if (activeTab === "police") {
      // Show Police News
      console.log(`Rendering police news, items: ${policeNewsStore.sortedItems.length}`)
      return (
        <View style={themed($listWrapper)} key="police-list">
          <FlashList
            ref={policeListRef}
            data={policeNewsStore.sortedItems}
            renderItem={({ item }: { item: PoliceNewsItem }) => (
              <EnhancedAlertCard 
                item={item} 
                onPress={() => handleAlertPress(item.link)}
                categoryColor={theme.colors.police}
              />
            )}
            estimatedItemSize={150}
            keyExtractor={(item) => item.id}
            contentContainerStyle={themed($listContent)}
            refreshControl={renderRefreshControl()}
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
      console.log(`Rendering weather alerts, items: ${weatherAlertStore.sortedItems.length}`)
      return (
        <View style={themed($listWrapper)} key="weather-list">
          <FlashList
            ref={weatherListRef}
            data={weatherAlertStore.sortedItems}
            renderItem={({ item }: { item: WeatherAlertItem }) => (
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
            )}
            estimatedItemSize={150}
            keyExtractor={(item) => item.id}
            contentContainerStyle={themed($listContent)}
            refreshControl={renderRefreshControl()}
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
    
    // Other categories - show mock alerts
    const sortedAlerts = getSortedAlerts()
    
    return (
      <View style={themed($listWrapper)} key={`${activeTab}-list`}>
        <FlashList
          ref={activeTab === "hydro" ? hydroListRef : trafficListRef}
          data={sortedAlerts}
          renderItem={({ item }) => (
            <EnhancedAlertCard 
              item={item} 
              onPress={() => item.link && handleAlertPress(item.link)}
              categoryColor={getCategoryColor()}
            />
          )}
          estimatedItemSize={150}
          keyExtractor={(item) => item.id}
          contentContainerStyle={themed($listContent)}
          refreshControl={renderRefreshControl()}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListFooterComponent={<View style={{ height: 150 }} />}
          ListEmptyComponent={
            <View style={themed($emptyContainer)}>
              <Text
                text="No alerts available. Pull down to refresh."
                style={themed($emptyText)}
              />
            </View>
          }
        />
      </View>
    )
  }

  return (
    <Screen style={themed($root)} preset="fixed" safeAreaEdges={["bottom"]} contentContainerStyle={themed($screenContent)}>
      {/* Sticky header section */}
      <View style={themed($stickyHeaderContainer)}>
        <View style={themed($categoryContainer)}>
          <CategoryTabs 
            tabs={categoryTabs}
            onTabChange={handleTabChange}
            initialTabId="weather"
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
      
      <View style={themed($contentContainer)}>
        {renderContent()}
      </View>
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
