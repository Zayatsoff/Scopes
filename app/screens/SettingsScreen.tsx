import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useHeader } from "@/utils/useHeader"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"

interface SettingsScreenProps extends BottomTabScreenProps<MainTabParamList, "Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> = observer(function SettingsScreen() {
  const { themed } = useAppTheme()
  
  useHeader({
    title: "Settings",
    titleMode: "center",
  })

  return (
    <Screen style={themed($root)} preset="scroll" safeAreaEdges={["bottom"]}>
      <Text text="Settings Screen Content" style={themed($content)} />
    </Screen>
  )
})

// -----------------------
// Themed style definitions
// -----------------------

const $root: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  alignItems: "center",
})
