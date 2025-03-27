import { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Dimensions, Image, ImageStyle, View, ViewStyle, TextStyle, Pressable } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useHeader } from "@/utils/useHeader"
import { useAppTheme } from "@/utils/useAppTheme"
import { LinearGradient } from "expo-linear-gradient"
import { ChevronDown } from "lucide-react-native"
import type { ThemedStyle } from "@/theme"
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay
} from "react-native-reanimated"
import { useStores } from "@/models"
import { NewsCard } from "@/components/NewsCard"
import { Linking } from "react-native"
import { NewsItem } from "@/models/News"

interface HomeScreenProps extends BottomTabScreenProps<MainTabParamList, "Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const { themed, theme } = useAppTheme()
  const { newsStore, api } = useStores()
  const screenWidth = Dimensions.get("window").width
  
  // Animation values
  const opacityValue = useSharedValue(0)
  const translateYValue = useSharedValue(10)
  
  useHeader({
    title: "Home",
    titleMode: "center",
  })

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      return "Good morning"
    } else if (hour >= 12 && hour < 18) {
      return "Good afternoon"
    } else {
      return "Good evening"
    }
  }
  
  // Greeting animation styles
  const greetingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
      transform: [{ translateY: translateYValue.value }]
    }
  })
  
  // Start animation when component mounts
  useEffect(() => {
    opacityValue.value = withDelay(500, withSpring(1, { damping: 20 }))
    translateYValue.value = withDelay(500, withSpring(0, { damping: 20 }))
  }, [])

  useEffect(() => {
    // Fetch news when component mounts if we don't have any yet
    if (newsStore.items.length === 0) {
      newsStore.fetchNews(api)
    }
  }, [api, newsStore])

  const handleNewsPress = (link: string) => {
    Linking.openURL(link).catch((err) => console.error("Couldn't open URL: ", err))
  }

  return (
    <Screen preset="scroll" style={themed($container)} safeAreaEdges={["bottom"]}>
      {/* Top image with gradient overlay */}
      <View style={themed($imageSection)}>
        <Image
          source={require("../../assets/images/ottawa_cover.jpg")}
          style={[{ width: screenWidth, height: screenWidth * 0.8 }, themed($image)]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", theme.colors.background]}
          style={[{ width: screenWidth, height: 180 }, themed($gradient)]}
        >
          <View style={themed($headerOverlay)}>
            <View style={themed($headerTextContainer)}>
              <Text preset="heading" style={themed($headerText)}>
                Ottawa
              </Text>
              <ChevronDown size={24} color={theme.colors.tint} />
            </View>
            {/* Time-based greeting inside header overlay */}
            <Animated.View style={[themed($greetingContainer), greetingAnimatedStyle]}>
              <Text preset="subheading" style={themed($greetingText)}>
                {getGreeting()}
              </Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>

      {/* 2x2 Grid of containers */}
      <View style={themed($gridSection)}>
        <View style={themed($gridRow)}>
          {newsStore.latestItems.slice(0, 2).map((item: NewsItem) => (
            <Pressable
              key={item.id}
              style={themed($gridItem)}
              onPress={() => handleNewsPress(item.link)}
            >
              <View style={themed($gridItemContent)}>
                <Text style={themed($gridNewsSource)}>{item.sourceDisplay}</Text>
                <Text 
                  style={themed($gridNewsTitle)} 
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text style={themed($gridNewsDate)}>{item.formattedDate}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <View style={themed($gridRow)}>
          {newsStore.latestItems.slice(2, 4).map((item: NewsItem) => (
            <Pressable
              key={item.id}
              style={themed($gridItem)}
              onPress={() => handleNewsPress(item.link)}
            >
              <View style={themed($gridItemContent)}>
                <Text style={themed($gridNewsSource)}>{item.sourceDisplay}</Text>
                <Text 
                  style={themed($gridNewsTitle)} 
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text style={themed($gridNewsDate)}>{item.formattedDate}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 1x4 Grid of news items */}
      <View style={themed($newsSection)}>
        {newsStore.latestItems.slice(4, 8).map((item: NewsItem) => (
          <NewsCard
            key={item.id}
            item={item}
            compact
            onPress={() => handleNewsPress(item.link)}
          />
        ))}
      </View>

      {/* Additional news items */}
      <View style={[themed($newsSection), { marginTop: theme.spacing.md }]}>
        <Text style={themed($sectionTitle)}>More News</Text>
        {newsStore.latestItems.slice(8, 16).map((item: NewsItem) => (
          <NewsCard
            key={item.id}
            item={item}
            compact
            onPress={() => handleNewsPress(item.link)}
          />
        ))}
      </View>

    </Screen>
  )
})

// -----------------------
// Themed style definitions
// -----------------------

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $imageSection: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  marginBottom: 16,
})

const $image: ThemedStyle<ImageStyle> = () => ({})


const $gradient: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  paddingHorizontal: spacing.md,
  justifyContent: "flex-end",
})

const $headerOverlay: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-end",
  paddingBottom: 10,
})

const $headerTextContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  marginBottom: 4,
})

const $headerText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.header,
  marginRight: spacing.sm,
})

const $gridSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  marginBottom: spacing.sm,
})

const $gridRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
})

const $gridItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: "48%",
  minHeight: 120,
  borderRadius: 12,
  overflow: "hidden",
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
})

const $gridItemContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.sm,
  justifyContent: "flex-start",
})

const $newsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  flexDirection: "column",
  gap: spacing.xs,
})

const $greetingContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: 'flex-start',
  marginTop: 0,
})

const $greetingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.tint,
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  marginBottom: spacing.xs,
})

// Add new styles for grid news items
const $gridNewsSource: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  color: colors.tint,
  marginBottom: 4,
})

const $gridNewsTitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.semiBold,
  color: colors.text,
  marginBottom: 8,
  lineHeight: 18,
})

const $gridNewsDate: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  marginTop: 'auto',
})

export default HomeScreen
