import { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { ListItem, Screen, Text, Switch } from "@/components"
import { useHeader } from "@/utils/useHeader"
import { useAppTheme } from "@/utils/useAppTheme"
import { 
  Bell, 
  MoonIcon, 
  Type, 
  CloudSun, 
  LayoutDashboard, 
  Settings, 
  MapPin, 
  History, 
  BarChart,
  Book, 
  ShieldCheck,
  FileText,
  Info,
  ChevronRight
} from "lucide-react-native"
import type { ThemedStyle } from "@/theme"
import { StyleProp } from "react-native"

interface SettingsScreenProps extends BottomTabScreenProps<MainTabParamList, "Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> = observer(function SettingsScreen() {
  const { themed, theme } = useAppTheme()
  
  // State for toggle settings
  const [notificationSettings, setNotificationSettings] = useState({
    policeAlerts: true,
    hydroAlerts: true,
    governmentAlerts: true,
    emergencyAlerts: true,
  })

  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    largeText: false,
    showWeather: true,
    compactNewsView: false,
  })

  const [otherSettings, setOtherSettings] = useState({
    saveHistory: true,
    autoLocation: true,
    sendAnalytics: false,
  })

  useHeader({
    title: "Settings",
    titleMode: "center",
    backgroundColor: theme.colors.palette.primary500,
    titleStyle: { color: theme.colors.palette.neutral100 }
  })

  const toggleNotificationSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key],
    })
  }

  const toggleDisplaySetting = (key: keyof typeof displaySettings) => {
    setDisplaySettings({
      ...displaySettings,
      [key]: !displaySettings[key],
    })
  }

  const toggleOtherSetting = (key: keyof typeof otherSettings) => {
    setOtherSettings({
      ...otherSettings,
      [key]: !otherSettings[key],
    })
  }

  // Define section colors
  const sectionColors = {
    notifications: theme.colors.palette.primary500,
    display: theme.colors.palette.secondary500,
    layout: theme.colors.palette.neutral800,
    general: theme.colors.palette.angry500,
    about: theme.colors.palette.primary600,
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
    <Screen style={themed($root)} preset="scroll" safeAreaEdges={["bottom"]}>
      {/* Notification Settings */}
      <Text preset="heading" text="Notifications" style={themed($sectionTitle)} />
      <View style={themed($section)}>
        <ListItem 
          text="Police Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Bell, sectionColors.notifications)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.policeAlerts,
            () => toggleNotificationSetting("policeAlerts")
          )}
        />
        <ListItem 
          text="Hydro Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Bell, sectionColors.notifications)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.hydroAlerts,
            () => toggleNotificationSetting("hydroAlerts")
          )}
        />
        <ListItem 
          text="Government Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Bell, sectionColors.notifications)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.governmentAlerts,
            () => toggleNotificationSetting("governmentAlerts")
          )}
        />
        <ListItem 
          text="Emergency Alerts"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Bell, sectionColors.notifications)}
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            notificationSettings.emergencyAlerts,
            () => toggleNotificationSetting("emergencyAlerts")
          )}
        />
      </View>

      {/* Display Settings */}
      <Text preset="heading" text="Display" style={themed($sectionTitle)} />
      <View style={themed($section)}>
        <ListItem 
          text="Dark Mode"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(MoonIcon, sectionColors.display)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            displaySettings.darkMode,
            () => toggleDisplaySetting("darkMode")
          )}
        />
        <ListItem 
          text="Large Text"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Type, sectionColors.display)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            displaySettings.largeText,
            () => toggleDisplaySetting("largeText")
          )}
        />
        <ListItem 
          text="Show Weather on Home"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(CloudSun, sectionColors.display)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            displaySettings.showWeather,
            () => toggleDisplaySetting("showWeather")
          )}
        />
        <ListItem 
          text="Compact News View"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(LayoutDashboard, sectionColors.display)}
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            displaySettings.compactNewsView,
            () => toggleDisplaySetting("compactNewsView")
          )}
        />
      </View>

      {/* Home Layout Settings */}
      <Text preset="heading" text="Home Layout" style={themed($sectionTitle)} />
      <View style={themed($section)}>
        <ListItem 
          text="Customize Home Layout"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(LayoutDashboard, sectionColors.layout)}
          RightComponent={renderIcon(ChevronRight, sectionColors.layout)}
          onPress={() => {}}
          containerStyle={themed($listItemContainer)}
        />
      </View>

      {/* Other Settings */}
      <Text preset="heading" text="General" style={themed($sectionTitle)} />
      <View style={themed($section)}>
        <ListItem 
          text="Auto-detect Location"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(MapPin, sectionColors.general)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            otherSettings.autoLocation,
            () => toggleOtherSetting("autoLocation")
          )}
        />
        <ListItem 
          text="Save Browse History"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(History, sectionColors.general)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            otherSettings.saveHistory,
            () => toggleOtherSetting("saveHistory")
          )}
        />
        <ListItem 
          text="Send Anonymous Analytics"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(BarChart, sectionColors.general)}
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            otherSettings.sendAnalytics,
            () => toggleOtherSetting("sendAnalytics")
          )}
        />
      </View>

      {/* About & Help */}
      <Text preset="heading" text="About & Help" style={themed($sectionTitle)} />
      <View style={themed($section)}>
        <ListItem 
          text="Tutorial"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Book, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          bottomSeparator
          onPress={() => {}}
          containerStyle={themed($listItemContainer)}
        />
        <ListItem 
          text="Privacy Policy"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(ShieldCheck, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          bottomSeparator
          onPress={() => {}}
          containerStyle={themed($listItemContainer)}
        />
        <ListItem 
          text="Terms of Service"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(FileText, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          bottomSeparator
          onPress={() => {}}
          containerStyle={themed($listItemContainer)}
        />
        <ListItem 
          text="About This App"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Info, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          onPress={() => {}}
          containerStyle={themed($listItemContainer)}
        />
      </View>
      
      {/* Add some padding at the bottom */}
      <View style={themed($bottomPadding)} />
    </Screen>
  )
})

// -----------------------
// Themed style definitions
// -----------------------

const $root: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral200,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xs,
  color: colors.palette.primary600,
  fontSize: 18,
  fontWeight: "600",
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  marginHorizontal: spacing.md,
  marginBottom: spacing.sm,
  overflow: 'hidden',
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
})

const $listItemContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  height: 60,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
})

const $iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 42,
  height: 42,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: spacing.sm,
  alignSelf: 'center',
})

const $listItemText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  flex: 1,
  fontWeight: '400',
  textAlignVertical: 'center',
})

const $switchContainer: ThemedStyle<ViewStyle> = () => ({
  width: 48,
  height: 42,
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
})

const $bottomPadding: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: spacing.xxl,
})
