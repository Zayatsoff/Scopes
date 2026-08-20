import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { NotificationSettingsScreen } from "@/screens/NotificationSettingsScreen"
import { AboutScreen } from "@/screens/AboutScreen"
import { SchoolBusProviderScreen } from "@/screens/SchoolBusProviderScreen"
import { FeedbackScreen } from "@/screens/FeedbackScreen"
import { PrivacyPolicyScreen } from "@/screens/PrivacyPolicyScreen"
import { TermsOfServiceScreen } from "@/screens/TermsOfServiceScreen"
import { useAppTheme } from "@/utils/useAppTheme"

export type SettingsStackParamList = {
  Settings: undefined
  NotificationSettings: undefined
  About: undefined
  SchoolBusProvider: {
    currentProvider: string
    onSelect: (provider: string) => void
  }
  Feedback: undefined
  PrivacyPolicy: undefined
  TermsOfService: undefined
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
      <Stack.Screen name="SchoolBusProvider" component={SchoolBusProviderScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </Stack.Navigator>
  )
}
