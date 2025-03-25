import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { HomeScreen } from "@/screens/HomeScreen"
import { AlertsScreen } from "@/screens/AlertsScreen"
import { NewsScreen } from "@/screens/NewsScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { useAppTheme } from "@/utils/useAppTheme"
import { Home, Megaphone, Newspaper, Settings } from "lucide-react-native"
import { Platform, View, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type MainTabParamList = {
  Home: undefined
  Alerts: undefined
  News: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainTabs() {
  const { theme } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.colors.textDim || "#999",
        tabBarStyle: {
          borderTopColor: theme.colors.separator,
          backgroundColor: theme.colors.background,
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
          fontSize: 12,
          fontWeight: "500",
          marginTop: -5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Home color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Megaphone color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Newspaper color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Settings color={color} size={size} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
})
