import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { HomeScreen } from "@/screens/HomeScreen"
import { AlertsScreen } from "@/screens/AlertsScreen"
import { NewsScreen } from "@/screens/NewsScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { useAppTheme } from "@/utils/useAppTheme"
import { Home, Megaphone, Newspaper, Settings } from "lucide-react-native"

export type MainTabParamList = {
  Home: undefined
  Alerts: undefined
  News: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainTabs() {
  const { theme } = useAppTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.colors.textDim || "#999",
        tabBarStyle: {
          borderTopColor: theme.colors.separator,
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Megaphone color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Newspaper color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}
