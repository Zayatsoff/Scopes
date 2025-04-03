import { FC, useState, useEffect, useRef } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, Linking, Dimensions } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { AlertItem } from "@/components/AlertCard"
import { useTabHeader } from "@/components/TabHeader"
import type { ThemedStyle } from "@/theme"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"
import { usePullToRefreshProgress } from "@/utils/usePullToRefreshProgress"
import { useStores } from "@/models"
import { FlashList } from "@shopify/flash-list"
import { useIsFocused } from "@react-navigation/native"
import { AlertCategory, getAlertCategories, getCategoryInfo } from "@/utils/alertCategoryUtils"
import { generateMockAlerts } from "@/utils/mockAlertGenerator" 
import { CategoryTab } from "@/components/CategoryTabs"
import { SwipeableTabView } from "@/components/SwipeableTabView"
import { AlertListView } from "@/components/AlertListView"
import { AlertCategoryHeader } from "@/components/AlertCategoryHeader"
import { PoliceNewsItem } from "@/models/PoliceNews"
import { WeatherAlertItem } from "@/models/WeatherAlert"

interface AlertsScreenProps extends BottomTabScreenProps<MainTabParamList, "Alerts"> {}

export const AlertsScreen: FC<AlertsScreenProps> = observer(function AlertsScreen() {
  const { theme, themed, themeContext } = useAppTheme()
  const { policeNewsStore, weatherAlertStore, api } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<AlertCategory>("weather")
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [alerts, setAlerts] = useState<Record<string, AlertItem[]>>({
    hydro: [],
    traffic: []
  })
  const { progress, onScroll: pullRefreshOnScroll } = usePullToRefreshProgress()
  const weatherListRef = useRef<FlashList<WeatherAlertItem>>(null)
  const policeListRef = useRef<FlashList<PoliceNewsItem>>(null)
  const hydroListRef = useRef<FlashList<AlertItem>>(null)
  const trafficListRef = useRef<FlashList<AlertItem>>(null)
  const isFocused = useIsFocused()
  const { width: screenWidth } = Dimensions.get("window")
  
  // Track scroll positions
  const scrollPositions = useRef<Record<string, number>>({
    weather: 0,
    police: 0,
    hydro: 0,
    traffic: 0
  })
  const [containerLayout, setContainerLayout] = useState({ width: screenWidth, height: 0 })
  const [allTabsPreloaded, setAllTabsPreloaded] = useState(false)

  // Category colors for consistent access
  const categoryColors: Record<AlertCategory, string> = {
    weather: theme.colors.weather,
    police: theme.colors.police,
    hydro: theme.colors.hydro,
    traffic: theme.colors.traffic
  }

  // Convert alert categories to category tabs
  const categoryTabs: CategoryTab[] = [
    { id: "weather", label: "Weather", color: categoryColors.weather },
    { id: "police", label: "Police", color: categoryColors.police },
    { id: "hydro", label: "Hydro", color: categoryColors.hydro },
    { id: "traffic", label: "Road & Traffic", color: categoryColors.traffic },
  ]

  // Get info about the active category
  const activeCategoryInfo = getCategoryInfo(activeTab, categoryColors)

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

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as AlertCategory)
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
  const handleScroll = (event: any) => {
    // Call the original onScroll handler for pull-to-refresh
    pullRefreshOnScroll(event)
    
    // Save the scroll position for current tab
    const offset = event.nativeEvent.contentOffset.y
    scrollPositions.current[activeTab] = offset
  }

  // Get sort button text based on active tab
  const getSortButtonText = () => {
    if (activeTab === "police") {
      return policeNewsStore.sortNewestFirst ? "Newest First" : "Oldest First"
    } else if (activeTab === "weather") {
      return weatherAlertStore.sortNewestFirst ? "Newest First" : "Oldest First"
    } else {
      // For mock data
      return "Newest First"
    }
  }

  // Handle sort button press
  const handleSortPress = () => {
    if (activeTab === "police") {
      policeNewsStore.toggleSortOrder()
    } else if (activeTab === "weather") {
      weatherAlertStore.toggleSortOrder()
    }
  }

  // Get the appropriate data for the current tab
  const getData = () => {
    // Use a type assertion to any[] to avoid strict typechecking
    // This is acceptable since AlertListView internally handles different data types
    if (activeTab === "weather") {
      return weatherAlertStore.sortedItems as any[]
    } else if (activeTab === "police") {
      return policeNewsStore.sortedItems as any[]
    } else if (activeTab === "hydro") {
      return alerts.hydro || []
    } else if (activeTab === "traffic") {
      return alerts.traffic || []
    } else {
      return []
    }
  }

  // Get loading state for the current tab
  const isCurrentTabLoading = () => {
    switch (activeTab) {
      case "weather":
        return weatherAlertStore.isLoading
      case "police":
        return policeNewsStore.isLoading
      default:
        return false
    }
  }

  // Get error state for the current tab
  const getCurrentTabError = () => {
    switch (activeTab) {
      case "weather":
        return weatherAlertStore.error || undefined
      case "police":
        return policeNewsStore.error || undefined
      default:
        return undefined
    }
  }

  return (
    <Screen 
      style={themed($root)} 
      preset="fixed" 
      safeAreaEdges={["bottom"]} 
      contentContainerStyle={themed($screenContent)}
    >
      <AlertCategoryHeader
        activeTab={activeTab}
        currentTabIndex={currentTabIndex}
        categoryTabs={categoryTabs}
        activeCategoryInfo={activeCategoryInfo}
        onTabChange={handleTabChange}
        sortButtonText={getSortButtonText()}
        onSortPress={handleSortPress}
      />
      
      <PullToRefreshIndicator 
        visible={refreshing} 
        color={activeCategoryInfo.color} 
        progress={progress} 
      />
      
      <SwipeableTabView
        activeTab={activeTab}
        setActiveTab={setActiveTab as (tab: string) => void}
        tabs={categoryTabs.map(tab => tab.id) as readonly string[]}
        currentIndex={currentTabIndex}
        setCurrentIndex={setCurrentTabIndex}
        containerLayout={containerLayout}
      >
        <AlertListView
          category={activeTab}
          data={getData()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onAlertPress={handleAlertPress}
          categoryColor={activeCategoryInfo.color}
          onScroll={handleScroll}
          isLoading={isCurrentTabLoading()}
          error={getCurrentTabError()}
        />
      </SwipeableTabView>
    </Screen>
  )
})

// Styles
const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  flexGrow: 1,
  height: "100%",
})
