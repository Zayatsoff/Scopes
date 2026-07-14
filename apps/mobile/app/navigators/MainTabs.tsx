import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { HomeScreen } from "@/screens/HomeScreen"
import { AlertsScreen } from "@/screens/AlertsScreen"
import { NewsScreen } from "@/screens/NewsScreen"
import { SettingsStack } from "@/navigators/SettingsStack"
import { useAppTheme } from "@/utils/useAppTheme"
import { Home, Megaphone, Newspaper, Settings } from "lucide-react-native"
import { Platform, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { ThemedStyle } from "@/theme"

export type MainTabParamList = {
  Home: undefined
  Alerts: undefined
  News: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainTabs() {
  const { theme, themed } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.navActive,
        tabBarInactiveTintColor: theme.colors.navInactive || "#999",
        tabBarStyle: {
          borderTopColor: theme.colors.containerBackground,
          backgroundColor: theme.colors.containerBackground,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          height: Platform.OS === "ios" ? 88 : 60,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.xs,
          fontWeight: "500",
          marginTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={themed(focused ? $activeIconContainer : $iconContainer)}>
              <Home color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={themed(focused ? $activeIconContainer : $iconContainer)}>
              <Megaphone color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={themed(focused ? $activeIconContainer : $iconContainer)}>
              <Newspaper color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={themed(focused ? $activeIconContainer : $iconContainer)}>
              <Settings color={color} size={size} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  )
}

// -----------------------
// Themed style definitions
// -----------------------

const $iconContainer: ThemedStyle<any> = () => ({
  width: 24,
  height: 24,
  alignItems: "center",
  justifyContent: "center",
})

const $activeIconContainer: ThemedStyle<any> = ({ colors }) => ({
  width: 60,
  height: 28,
  borderRadius: 6,
  backgroundColor: colors.accent,
  alignItems: "center",
  justifyContent: "center",
})
