import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { NotificationSettingsScreen } from "@/screens/NotificationSettingsScreen"
import { AboutScreen } from "@/screens/AboutScreen"
import { useAppTheme } from "@/utils/useAppTheme"

export type SettingsStackParamList = {
  Settings: undefined
  NotificationSettings: undefined
  About: undefined
}

const Stack = createNativeStackNavigator<SettingsStackParamList>()

export function SettingsStack() {
  const { theme } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: theme.colors.background,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  )
} 