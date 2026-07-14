import { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { ListItem, Screen, Text, Switch } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { useStores } from "@/models"
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
  ChevronRight,
  Bus,
  MessageSquare
} from "lucide-react-native"
import type { ThemedStyle } from "@/theme"
import { StyleProp } from "react-native"
import { SectionHeader } from "@/components/SectionHeader"
import { useTabHeader } from "@/components/TabHeader"
import { useNavigation } from "@react-navigation/native"
import type { SettingsStackParamList } from "@/navigators/SettingsStack"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

interface SettingsScreenProps extends BottomTabScreenProps<MainTabParamList, "Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> = observer(function SettingsScreen() {
  const { themed, theme, themeContext, setThemeContextOverride } = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>()
  const { newsStore } = useStores()
  
  // Set up the tab header
  useTabHeader({ title: "Settings" }, [themeContext]);
  
  // State for toggle settings
  const [displaySettings, setDisplaySettings] = useState({
    showWeather: true,
  })

  const [otherSettings, setOtherSettings] = useState({
    saveHistory: true,
    autoLocation: true,
    sendAnalytics: false,
  })
  
  // State for school bus provider selection
  const [schoolBusProvider, setSchoolBusProvider] = useState("OSTA")

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
    schoolBus: theme.colors.hydro, // Use existing hydro color for school bus section
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
    <Screen style={themed($root)} preset="scroll" safeAreaEdges={[]}>
      {/* Notification Settings */}
      <SectionHeader title="Notifications" />
      <View style={themed($section)}>
        <ListItem 
          text="Notification Settings"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Bell, sectionColors.notifications)}
          RightComponent={renderIcon(ChevronRight, sectionColors.notifications)}
          onPress={() => navigation.navigate("NotificationSettings")}
          containerStyle={themed($listItemContainer)}
        />
      </View>

      {/* Display Settings */}
      <SectionHeader title="Display" />
      <View style={themed($section)}>
        <ListItem 
          text="Dark Mode"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(MoonIcon, sectionColors.display)}
          bottomSeparator
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            themeContext === "dark",
            () => setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
          )}
        />
        <ListItem 
          text="Compact News View"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(LayoutDashboard, sectionColors.display)}
          containerStyle={themed($listItemContainer)}
          RightComponent={renderSwitch(
            newsStore.compactView,
            () => newsStore.toggleCompactView()
          )}
        />
      </View>

      {/* Home Layout Settings */}
      <SectionHeader title="Home Layout" />
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
      
      {/* School Bus Settings */}
      <SectionHeader title="School Bus Settings" />
      <View style={themed($section)}>
        <ListItem 
          text="School Bus Provider"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Bus, sectionColors.schoolBus)}
          RightComponent={renderIcon(ChevronRight, sectionColors.schoolBus)}
          onPress={() => navigation.navigate("SchoolBusProvider", { 
            currentProvider: schoolBusProvider,
            onSelect: (provider: string) => setSchoolBusProvider(provider)
          })}
          containerStyle={themed($listItemContainer)}
          TextProps={{
            style: themed($listItemText),
            children: (
              <View style={themed($providerContainer)}>
                <Text text="School Bus Provider" style={themed($listItemText)} />
                <Text text={schoolBusProvider} style={themed($providerText)} />
              </View>
            )
          }}
        />
      </View>

      {/* Other Settings */}
      <SectionHeader title="General" />
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
      <SectionHeader title="About & Help" />
      <View style={themed($section)}>
        <ListItem 
          text="Tutorial"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Book, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          onPress={() => {}}
          containerStyle={themed($listItemContainer)}
        />
        <ListItem 
          text="Feedback and Requests"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(MessageSquare, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          onPress={() => navigation.navigate("Feedback")}
          containerStyle={themed($listItemContainer)}
        />
        <ListItem 
          text="Privacy Policy"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(ShieldCheck, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          onPress={() => {}}
          containerStyle={themed($listItemContainer)}
        />
        <ListItem 
          text="Terms of Service"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(FileText, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          onPress={() => {}}
          containerStyle={themed($listItemContainer)}
        />
        <ListItem 
          text="About"
          textStyle={themed($listItemText)}
          LeftComponent={renderIcon(Info, sectionColors.about)}
          RightComponent={renderIcon(ChevronRight, sectionColors.about)}
          onPress={() => navigation.navigate("About")}
          containerStyle={themed($listItemContainer)}
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

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  marginBottom: spacing.lg,
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

const $bottomPadding: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
})

const $providerContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "column",
  alignItems: "flex-start",
})

const $providerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginTop: 2,
})
