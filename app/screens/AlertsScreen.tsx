import { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View, TextStyle } from "react-native"
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

interface AlertsScreenProps extends BottomTabScreenProps<MainTabParamList, "Alerts"> {}

export const AlertsScreen: FC<AlertsScreenProps> = observer(function AlertsScreen() {
  const { theme, themed } = useAppTheme()

  // Set up the tab header with customized styling
  useTabHeader({
    title: "Alerts",
    titleMode: "center",
  })

  // Define category tabs
  const categoryTabs: CategoryTab[] = [
    { id: "weather", label: "Weather", color: theme.colors.weather },
    { id: "police", label: "Police", color: theme.colors.police },
    { id: "hydro", label: "Hydro", color: theme.colors.hydro },
    { id: "traffic", label: "Road & Traffic", color: theme.colors.traffic },
  ]

  // Mock alerts data
  const [activeTab, setActiveTab] = useState("weather")
  
  // Generate mock alerts for demonstration
  const generateMockAlerts = (category: string): AlertItem[] => {
    return Array(4).fill(null).map((_, index) => ({
      id: `${category}-${index}`,
      source: "Ottawa Police Service",
      message: "Missing 40-year-old woman to locate. Police are concerned for her well-being.",
      timestamp: "Friday, March 28, 2025 12:52 PM",
      category
    }))
  }

  // Filter alerts based on active category
  const alerts = generateMockAlerts(activeTab)

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
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
      
      <FlashList
        data={alerts}
        renderItem={({ item }) => <AlertCard item={item} />}
        estimatedItemSize={100}
        contentContainerStyle={themed($listContent)}
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
