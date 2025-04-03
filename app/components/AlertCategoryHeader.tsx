import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { Text, Button } from "@/components"
import { CategoryTabs, CategoryTab } from "@/components/CategoryTabs"
import { AlertCategory, CategoryInfo } from "@/utils/alertCategoryUtils"
import type { ThemedStyle } from "@/theme"

interface AlertCategoryHeaderProps {
  /**
   * Active tab ID
   */
  activeTab: AlertCategory
  
  /**
   * Current tab index
   */
  currentTabIndex: number
  
  /**
   * List of category tabs to display
   */
  categoryTabs: CategoryTab[]
  
  /**
   * Category info for the active tab
   */
  activeCategoryInfo: CategoryInfo
  
  /**
   * Function to call when a tab is selected
   */
  onTabChange: (tabId: string) => void
  
  /**
   * Text to display for the sort button
   */
  sortButtonText: string
  
  /**
   * Function to call when the sort button is pressed
   */
  onSortPress: () => void
}

export function AlertCategoryHeader({
  activeTab,
  currentTabIndex,
  categoryTabs,
  activeCategoryInfo,
  onTabChange,
  sortButtonText,
  onSortPress
}: AlertCategoryHeaderProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($stickyHeaderContainer)}>
      <View style={themed($categoryContainer)}>
        <CategoryTabs 
          tabs={categoryTabs}
          onTabChange={onTabChange}
          initialTabId={activeTab}
          currentIndex={currentTabIndex}
        />
      </View>
      
      <View style={themed($headerRow)}>
        <View style={themed($categoryHeaderContainer)}>
          {React.createElement(activeCategoryInfo.icon, { 
            size: 24, 
            color: activeCategoryInfo.color 
          })}
          <Text 
            text={activeCategoryInfo.label}
            style={[themed($categoryHeaderText), { color: activeCategoryInfo.color }]} 
          />
        </View>
        
        <Button
          text={sortButtonText}
          onPress={onSortPress}
          style={themed($sortButton)}
          textStyle={themed($sortButtonText)}
        />
      </View>
    </View>
  )
}

// Styles
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