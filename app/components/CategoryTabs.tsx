import React, { useState } from "react"
import { View, Text, TouchableOpacity, ViewStyle, TextStyle, ScrollView } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"

export interface CategoryTab {
  id: string
  label: string
  color: string
}

interface CategoryTabsProps {
  tabs: CategoryTab[]
  onTabChange: (tabId: string) => void
  initialTabId?: string
}

export function CategoryTabs({ tabs, onTabChange, initialTabId }: CategoryTabsProps) {
  const [activeTabId, setActiveTabId] = useState(initialTabId || tabs[0]?.id || "")
  const { themed } = useAppTheme()

  const handleTabPress = (tabId: string) => {
    setActiveTabId(tabId)
    onTabChange(tabId)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={themed($container)}
      contentContainerStyle={themed($contentContainer)}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId
        const isFirst = index === 0
        const isLast = index === tabs.length - 1
        
        return (
          <View 
            key={tab.id} 
            style={[
              themed($tabWrapper),
              isFirst && themed($firstTab),
              isLast && themed($lastTab)
            ]}
          >
            <TouchableOpacity
              onPress={() => handleTabPress(tab.id)}
              style={themed($tabButton)}
            >
              <Text
                style={[
                  themed($tabText),
                  { color: tab.color, fontWeight: isActive ? "600" : "400" },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
            <View 
              style={[
                themed($tabIndicator), 
                { 
                  backgroundColor: tab.color,
                  height: isActive ? 4 : 2,
                }
              ]} 
            />
          </View>
        )
      })}
    </ScrollView>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
})

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
})

const $tabWrapper: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  marginRight: 0,
})

const $firstTab: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingLeft: spacing.md,
})

const $lastTab: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingRight: spacing.md,
})

const $tabButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.sm,
  minHeight: 46,
  justifyContent: "center",
  alignItems: "center",
  width: 111,
})

const $tabIndicator: ThemedStyle<ViewStyle> = () => ({
  width: 111,
  height: 2,
})

const $tabText: ThemedStyle<TextStyle> = ({ spacing, typography }) => ({
  fontSize: typography.sizes.md,
  textAlign: "center",
}) 