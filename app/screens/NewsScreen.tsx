import { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useHeader } from "@/utils/useHeader"

interface NewsScreenProps extends BottomTabScreenProps<MainTabParamList, "News"> {}

export const NewsScreen: FC<NewsScreenProps> = observer(function NewsScreen() {
  useHeader({
    title: "News",
    titleMode: "center",
  })

  return (
    <Screen style={$root} preset="scroll" safeAreaEdges={["bottom"]}>
      <Text text="News Screen Content" style={$content} />
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
