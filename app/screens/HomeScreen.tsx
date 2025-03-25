import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Header, Screen, Text } from "@/components"
import { useHeader } from "@/utils/useHeader"

interface HomeScreenProps extends BottomTabScreenProps<MainTabParamList, "Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  useHeader({
    title: "Home",
    titleMode: "center",
  })

  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["bottom"]}>
      <Text text="Home Screen Content" style={$content} />
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
