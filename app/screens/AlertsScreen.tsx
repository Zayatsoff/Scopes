import { FC, useState, useEffect, useRef } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle, RefreshControl, Linking } from "react-native"
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

  // Set up the tab header with customized styling
  useTabHeader({
    title: "Alerts",
    titleMode: "center",
  }, [themeContext])

  // Load initial alerts and police news
  useEffect(() => {
    // Load saved active tab from storage if available
    // This would require adding a method to your storage module
    // For now, we're just using the default "weather"
    
    // Generate mock alerts for initial tab
    const initialAlerts = generateMockAlerts(activeTab);
    console.log(`Generated ${initialAlerts.length} initial ${activeTab} alerts`);
    setAlerts(initialAlerts);
    
    // Fetch police news
    policeNewsStore.fetchPoliceNews(api);
  }, [api, policeNewsStore]);

  // Save active tab when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      // Save active tab to storage
      // This would require adding a method to your storage module
      console.log(`Saving active tab: ${activeTab}`)
    }
  }, [isFocused, activeTab]);

  // Track scroll position for current tab
  const handleScroll = (event: any) => {
    // Call the original onScroll handler
    onScroll(event);
    
    // Save the scroll position for current tab
    const offset = event.nativeEvent.contentOffset.y;
    scrollPositions.current[activeTab] = offset;
    
    // Debug log
    console.log(`Saved scroll position for ${activeTab}: ${offset}`);
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    console.log(`Tab changed to: ${tabId}`)
    setActiveTab(tabId)
    
    if (tabId !== "police") {
      setAlerts(generateMockAlerts(tabId))
    } else {
      // Log police news data when police tab is selected
      console.log("Police news items count:", policeNewsStore.items.length)
      console.log("Police news sorted items count:", policeNewsStore.sortedItems.length)
      
      // If no police news data is available, fetch it
      if (policeNewsStore.items.length === 0) {
        console.log("No police news found, fetching data...")
        policeNewsStore.fetchPoliceNews(api)
      }
    }
    
    // Determine if this is the first visit to this tab
    const isFirstVisit = !visitedTabs.has(tabId);
    
    // If first visit, scroll to top, otherwise restore previous position
    setTimeout(() => {
      if (isFirstVisit) {
        // Scroll to top for first visit
        scrollToTop();
        // Mark tab as visited
        setVisitedTabs(prev => new Set([...prev, tabId]));
      } else {
        // Restore previous scroll position
        const savedPosition = scrollPositions.current[tabId] || 0;
        console.log(`Restoring scroll position for ${tabId}: ${savedPosition}`);
        
        const currentListRef = getListRefForTab(tabId);
        if (currentListRef?.current) {
          currentListRef.current.scrollToOffset({ 
            offset: savedPosition, 
            animated: false 
          });
        }
      }
    }, 100);
  }
  
  // Get list ref for the given tab
  const getListRefForTab = (tabId: string) => {
    switch (tabId) {
      case "weather": return weatherListRef;
      case "police": return policeListRef;
      case "hydro": return hydroListRef;
      case "traffic": return trafficListRef;
      default: return null;
    }
  };
  
  // Scroll to top when needed
  const scrollToTop = () => {
    const currentListRef = getListRefForTab(activeTab);
    if (currentListRef?.current) {
      currentListRef.current.scrollToOffset({ offset: 0, animated: true });
      // Reset saved position for this tab
      scrollPositions.current[activeTab] = 0;
    }
  }
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    
    if (activeTab === "police") {
      await policeNewsStore.refreshPoliceNews(api)
    } else {
      // Simulate API call delay
      setTimeout(() => {
        // Update alerts
        setAlerts(generateMockAlerts(activeTab))
      }, 1000)
    }
    
    // Scroll to top after refreshing
    setTimeout(scrollToTop, 300);
    
    setRefreshing(false)
  }

  // Handle police news item press
  const handlePoliceNewsPress = (link: string) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't open URL: ", err))
  }

  // Get the icon and title for the current category
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

  const getCategoryColor = () => {
    switch (activeTab) {
      case "weather": return theme.colors.weather
      case "police": return theme.colors.police
      case "hydro": return theme.colors.hydro
      case "traffic": return theme.colors.traffic
      default: return theme.colors.text
    }
  }

  const getCategoryTitle = () => {
    return categoryTabs.find(tab => tab.id === activeTab)?.label || ""
  }
  
  // Toggle sort order for non-police alerts
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

  // Define category tabs
  const categoryTabs: CategoryTab[] = [
    { id: "weather", label: "Weather", color: theme.colors.weather },
    { id: "police", label: "Police", color: theme.colors.police },
    { id: "hydro", label: "Hydro", color: theme.colors.hydro },
    { id: "traffic", label: "Road & Traffic", color: theme.colors.traffic },
  ]

  // Generate mock alerts for demonstration
  const generateMockAlerts = (category: string): AlertItem[] => {
    // Sources by category
    const sources = {
      weather: "Environment Canada",
      police: "Ottawa Police Service",
      hydro: "Hydro Ottawa",
      traffic: "City of Ottawa Traffic"
    }
    
    console.log(`Generating mock alerts for category: ${category}`);
    
    // Generate mock alerts based on the category
    const mockAlerts = Array.from({ length: 10 }, (_, i) => ({
      id: `${category}-${i}`,
      source: sources[category as keyof typeof sources] || "Unknown Source",
      message: `This is a mock ${category} alert #${i+1} for testing.`,
      timestamp: new Date(Date.now() - i * 3600000).toLocaleString(),
      category,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Alert #${i+1}`,
      excerpt: `Detailed information about this ${category} alert situation. This provides additional context for the alert message.`,
      link: `https://example.com/${category}/alert/${i}`,
      date: new Date(Date.now() - i * 3600000).toISOString(),
      formattedDate: new Date(Date.now() - i * 3600000).toLocaleDateString(),
    }));
    
    console.log(`Generated ${mockAlerts.length} ${category} alerts`);
    return mockAlerts;
  }

  // Render the appropriate list based on active tab
  const renderContent = () => {
    if (activeTab === "police") {
      // Show Police News
      console.log("Rendering police content with items:", policeNewsStore.sortedItems.length);
      
      return (
        <View style={themed($listWrapper)}>
          <FlashList
            ref={policeListRef}
            data={policeNewsStore.sortedItems}
            renderItem={({ item }: { item: PoliceNewsItem }) => {
              console.log("Rendering police news item:", item.id, item.title);
              return (
                <EnhancedAlertCard 
                  item={item} 
                  onPress={() => handlePoliceNewsPress(item.link)}
                  categoryColor={theme.colors.police}
                />
              );
            }}
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
      );
    }
    
    // Other categories - show mock alerts that match the format of PoliceNewsItem
    console.log(`Rendering ${alerts.length} alerts for ${activeTab} category`);
    
    // Get sorted alerts
    const sortedAlerts = getSortedAlerts();
    
    return (
      <View style={themed($listWrapper)}>
        <FlashList
          ref={activeTab === "weather" ? weatherListRef : 
               activeTab === "hydro" ? hydroListRef : 
               trafficListRef}
          data={sortedAlerts}
          renderItem={({ item }) => {
            console.log(`Rendering alert: ${item.id}`);
            return (
              <EnhancedAlertCard 
                item={item} 
                onPress={() => item.link && Linking.openURL(item.link)}
                categoryColor={getCategoryColor()}
              />
            );
          }}
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
    );
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
  paddingVertical: spacing.sm,
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
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
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
})

const $listWrapper: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minHeight: 800, // Increased from 200 to ensure enough space
  width: '100%',
})

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.containerBackground,
  borderRadius: 3,
  padding: spacing.sm,
  marginVertical: spacing.xs,
  marginHorizontal: 0,
  borderWidth: 1,
  borderColor: colors.border,
  borderLeftWidth: 4,
  borderLeftColor: colors.tint, // Default color, will be overridden by getCategoryColor
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2.22,
  elevation: 2,
})

const $header: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
  flexWrap: "nowrap",
})

const $sourceContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
})

const $source: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  fontWeight: "bold",
})

const $date: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  flexShrink: 1,
  marginLeft: 4,
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.md,
  fontWeight: "bold",
  color: colors.text,
  marginBottom: 8,
})

const $description: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.8,
  marginBottom: 8,
})
