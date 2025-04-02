import { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import { Screen, ListItem, Text, Switch } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { 
  Bell, 
  Car, 
  Bus, 
  Cloud, 
  Shield, 
  TrafficCone,
  Flame,
  Snowflake,
  Zap,
  ChevronLeft
} from "lucide-react-native"
import type { ThemedStyle } from "@/theme"
import { SectionHeader } from "@/components/SectionHeader"
import { useNavigation } from "@react-navigation/native"
import { TouchableOpacity } from "react-native"
import type { SettingsStackParamList } from "@/navigators/SettingsStack"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const NotificationSettingsScreen: FC = observer(function NotificationSettingsScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>()
  const insets = useSafeAreaInsets()
  
  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    streetParkingBan: true,
    schoolBuses: true,
    weatherAlerts: true,
    policeAlerts: true,
    trafficAlerts: true,
    openAirFires: true,
    sleddingAlerts: true,
    hydroAlerts: true,
  })

  const toggleNotificationSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key],
    })
  }

  // Helper function to render Lucide icon with consistent styling
  const renderIcon = (Icon: any, color?: string) => {
    return (
      <View style={themed($iconContainer)}>
        <Icon size={22} color={color} strokeWidth={2} />
      </View>
    )
  }

  // Custom switch component to ensure consistent alignment
  const renderSwitch = (value: boolean, onValueChange: () => void) => {
    return (
      <View style={themed($switchContainer)}>
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
        />
      </View>
    )
  }

  return (
    <Screen style={themed($root)} preset="scroll" safeAreaEdges={[]}>
      {/* Header with back button */}
      <View style={[themed($header), { paddingTop: insets.top }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={themed($backButton)}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text text="Notification Settings" style={themed($headerText)} />
      </View>

      {/* Notification Settings */}
      <View style={themed($section)}>
        <ListItem 
          text="Street Parking Ban"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Car, theme.colors.palette.primary500)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.streetParkingBan,
            () => toggleNotificationSetting("streetParkingBan")
          )}
        />
        <ListItem 
          text="School Buses"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Bus, theme.colors.palette.secondary500)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.schoolBuses,
            () => toggleNotificationSetting("schoolBuses")
          )}
        />
        <ListItem 
          text="Weather Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Cloud, theme.colors.palette.primary500)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.weatherAlerts,
            () => toggleNotificationSetting("weatherAlerts")
          )}
        />
        <ListItem 
          text="Police Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Shield, theme.colors.palette.primary500)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.policeAlerts,
            () => toggleNotificationSetting("policeAlerts")
          )}
        />
        <ListItem 
          text="Traffic Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(TrafficCone, theme.colors.palette.primary500)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.trafficAlerts,
            () => toggleNotificationSetting("trafficAlerts")
          )}
        />
        <ListItem 
          text="Open Air Fires"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Flame, theme.colors.palette.primary500)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.openAirFires,
            () => toggleNotificationSetting("openAirFires")
          )}
        />
        <ListItem 
          text="Sledding Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Snowflake, theme.colors.palette.primary500)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.sleddingAlerts,
            () => toggleNotificationSetting("sleddingAlerts")
          )}
        />
        <ListItem 
          text="Hydro Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Zap, theme.colors.palette.primary500)}
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.hydroAlerts,
            () => toggleNotificationSetting("hydroAlerts")
          )}
        />
      </View>
    </Screen>
  )
})

const $root: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.background,
  paddingHorizontal: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingBottom: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $headerText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: typography.sizes.lg,
  fontWeight: "600",
  color: colors.text,
  marginLeft: spacing.sm,
})

const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  marginTop: spacing.md,
})

const $listItemContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
})

const $iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.sm,
  justifyContent: "center",
})

const $listItemText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $switchContainer: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "center",
}) 