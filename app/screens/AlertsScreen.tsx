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
import { EnhancedAlertCard } from "@/components/EnhancedAlertCard"
import { useIsFocused } from "@react-navigation/native"
import { formatRelativeTime } from "@/utils/formatRelativeTime"

interface AlertsScreenProps extends BottomTabScreenProps<MainTabParamList, "Alerts"> {}

export const AlertsScreen: FC<AlertsScreenProps> = observer(function AlertsScreen() {
  const { theme, themed, themeContext } = useAppTheme()
  const { policeNewsStore, api } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("weather")
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [sortNewestFirst, setSortNewestFirst] = useState(true)
  const { progress, onScroll } = usePullToRefreshProgress()
  const weatherListRef = useRef<FlashList<AlertItem>>(null)
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
    // Generate mock alerts for initial tab
    const initialAlerts = generateMockAlerts(activeTab)
    setAlerts(initialAlerts)
    
    // Fetch police news
    policeNewsStore.fetchPoliceNews(api)
  }, [api, policeNewsStore])

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
    
    if (tabId !== "police") {
      setAlerts(generateMockAlerts(tabId))
    } else if (policeNewsStore.items.length === 0) {
      policeNewsStore.fetchPoliceNews(api)
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

  // Handle police news item press
  const handlePoliceNewsPress = (link: string) => {
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
    if (activeTab === "police") {
      // Show Police News
      return (
        <View style={themed($listWrapper)}>
          <FlashList
            ref={policeListRef}
            data={policeNewsStore.sortedItems}
            renderItem={({ item }: { item: PoliceNewsItem }) => (
              <EnhancedAlertCard 
                item={item} 
                onPress={() => handlePoliceNewsPress(item.link)}
                categoryColor={theme.colors.police}
              />
            )}
            estimatedItemSize={120}
            keyExtractor={(item) => item.id}
            contentContainerStyle={themed($listContent)}
            refreshControl={renderRefreshControl()}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListFooterComponent={<View style={{ height: 100 }} />}
            ListEmptyComponent={
              <View style={themed($emptyContainer)}>
                <Text
                  text={policeNewsStore.isLoading ? "Loading police news..." : policeNewsStore.error || "No police alerts available"}
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
      <View style={themed($listWrapper)}>
        <FlashList
          ref={activeTab === "weather" ? weatherListRef : 
               activeTab === "hydro" ? hydroListRef : 
               trafficListRef}
          data={sortedAlerts}
          renderItem={({ item }) => (
            <EnhancedAlertCard 
              item={item} 
              onPress={() => item.link && Linking.openURL(item.link)}
              categoryColor={getCategoryColor()}
            />
          )}
          estimatedItemSize={100}
          keyExtractor={(item) => item.id}
          contentContainerStyle={themed($listContent)}
          refreshControl={renderRefreshControl()}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListFooterComponent={<View style={{ height: 100 }} />}
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
    <Screen style={themed($root)} preset="fixed" safeAreaEdges={["bottom"]}>
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
            text={activeTab === "police" 
              ? (policeNewsStore.sortNewestFirst ? "Newest First" : "Oldest First")
              : (sortNewestFirst ? "Newest First" : "Oldest First")
            }
            onPress={activeTab === "police" ? policeNewsStore.toggleSortOrder : toggleSortOrder}
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
  minHeight: 800,
  width: '100%',
})
