import { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle, RefreshControl } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { CategoryTabs, CategoryTab } from "@/components/CategoryTabs"
import { AlertCard, AlertItem } from "@/components/AlertCard"
import { FlashList } from "@shopify/flash-list"
import { useTabHeader } from "@/components/TabHeader"
import type { ThemedStyle } from "@/theme"
import { CloudSun, Siren, Zap, BusFront } from "lucide-react-native"
import { LoadingIcon } from "@/components/LoadingIcon"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"
import { usePullToRefreshProgress } from "@/utils/usePullToRefreshProgress"

interface AlertsScreenProps extends BottomTabScreenProps<MainTabParamList, "Alerts"> {}

export const AlertsScreen: FC<AlertsScreenProps> = observer(function AlertsScreen() {
  const { theme, themed, themeContext } = useAppTheme()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("weather")
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const { progress, onScroll } = usePullToRefreshProgress()

  // Set up the tab header with customized styling
  useTabHeader({
    title: "Alerts",
    titleMode: "center",
  }, [themeContext])

  // Load initial alerts
  useEffect(() => {
    // Generate mock alerts for initial tab
    setAlerts(generateMockAlerts(activeTab))
  }, [])

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
    
    // Generate mock alerts based on the category
    return Array.from({ length: 10 }, (_, i) => ({
      id: `${category}-${i}`,
      source: sources[category as keyof typeof sources],
      message: `This is a mock ${category} alert #${i+1} for testing.`,
      timestamp: new Date(Date.now() - i * 3600000).toLocaleString(),
      category,
    }))
  }

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setAlerts(generateMockAlerts(tabId))
  }
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update alerts
    setAlerts(generateMockAlerts(activeTab))
    setRefreshing(false)
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
      <View style={themed($categoryContainer)}>
        <CategoryTabs 
          tabs={categoryTabs}
          onTabChange={handleTabChange}
          initialTabId="weather"
        />
      </View>
      
      <View style={themed($categoryHeaderContainer)}>
        {getCategoryIcon()}
        <Text 
          text={getCategoryTitle()} 
          style={[themed($categoryHeaderText), { color: getCategoryColor() }]} 
        />
      </View>
      
      <PullToRefreshIndicator visible={refreshing} color={getCategoryColor()} progress={progress} />
      
      <FlashList
        data={alerts}
        renderItem={({ item }) => <AlertCard item={item} />}
        estimatedItemSize={100}
        contentContainerStyle={themed($listContent)}
        refreshControl={renderRefreshControl()}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </Screen>
  )
})

// Styles
const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $categoryContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
})

const $categoryHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  justifyContent: "flex-start",
})

const $categoryHeaderText: ThemedStyle<TextStyle> = ({ spacing, typography }) => ({
  fontSize: typography.sizes.lg,
  fontWeight: "bold",
  marginLeft: spacing.sm,
  lineHeight: typography.sizes.lg * 1.2,
  textAlignVertical: "center",
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
})
