import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useHeader } from "@/utils/useHeader"

interface SettingsScreenProps extends BottomTabScreenProps<MainTabParamList, "Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> = observer(function SettingsScreen() {
  useHeader({
    title: "Settings",
    titleMode: "center",
  })

  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["bottom"]}>
      <Text text="Settings Screen Content" style={$content} />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  padding: 20,
  alignItems: "center",
}
