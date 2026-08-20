import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { NewsCard } from "@/components/NewsCard"
import { SectionHeader } from "@/components/SectionHeader"
import { NewsItem } from "@/models/News"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"

interface HomeNewsSectionProps {
  title: string
  newsItems: NewsItem[]
  onNewsPress: (link: string) => void
}

export const HomeNewsSection: FC<HomeNewsSectionProps> = ({ title, newsItems, onNewsPress }) => {
  const { themed } = useAppTheme()

  if (!newsItems || newsItems.length === 0) return null

  return (
    <View style={themed($newsSection)}>
      <SectionHeader title={title} />
      {newsItems.map((item: NewsItem) => (
        <NewsCard key={item.id} item={item} compact onPress={() => onNewsPress(item.link)} />
      ))}
    </View>
  )
}

// -----------------------
// Themed style definitions
// -----------------------

const $newsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  flexDirection: "column",
  gap: spacing.xs,
  paddingTop: spacing.md,
  marginBottom: spacing.md,
})
