import { FC, useEffect, useRef } from "react"
import { observer } from "mobx-react-lite"
import { Dimensions, Image, ImageStyle, View, ViewStyle, TextStyle, Pressable } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useHeader } from "@/utils/useHeader"
import { useAppTheme } from "@/utils/useAppTheme"
import { LinearGradient } from "expo-linear-gradient"
import type { ThemedStyle } from "@/theme"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"
import { useStores } from "@/models"
import { NewsCard } from "@/components/NewsCard"
import { Linking } from "react-native"
import { NewsItem } from "@/models/News"
import { SectionHeader } from "@/components/SectionHeader"
import { Siren, Cloudy, TowerControl, BusFront } from "lucide-react-native"

interface HomeScreenProps extends BottomTabScreenProps<MainTabParamList, "Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const { themed, theme } = useAppTheme()
  const { newsStore, api } = useStores()
  const screenWidth = Dimensions.get("window").width
  
  // Set up image dimensions
  const IMAGE_HEIGHT = screenWidth * 0.8
  const MIN_IMAGE_HEIGHT = 150

  // Animation values
  const opacityValue = useSharedValue(0)
  const translateYValue = useSharedValue(10)
  const scrollY = useSharedValue(0)

  // Hide the header for this screen only
  useEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

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

  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  // Greeting animation styles
  const greetingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
      transform: [{ translateY: translateYValue.value }],
    }
  })

  // Header image animation style
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [IMAGE_HEIGHT, MIN_IMAGE_HEIGHT],
      Extrapolate.CLAMP
    )

    const translateY = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [0, -(IMAGE_HEIGHT - MIN_IMAGE_HEIGHT) / 2],
      Extrapolate.CLAMP
    )

    const scale = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [1, 1.1],
      Extrapolate.CLAMP
    )

    return {
      height,
      transform: [
        { translateY },
        { scale },
      ],
    }
  })

  // Header container animation style
  const headerContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.85],
      Extrapolate.CLAMP
    )

    return {
      opacity,
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
    <Screen
      preset="scroll"
      style={themed($container)}
      safeAreaEdges={[]}
      ScrollViewProps={{
        onScroll: scrollHandler,
        scrollEventThrottle: 16,
        showsVerticalScrollIndicator: false,
      }}
    >
      {/* Top image with gradient overlay */}
      <Animated.View style={[themed($imageSection), headerContainerStyle]}>
        <Animated.Image
          source={require("../../assets/images/ottawa_cover.jpg")}
          style={[
            { width: screenWidth, height: IMAGE_HEIGHT },
            themed($image),
            imageAnimatedStyle,
          ]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", theme.colors.background]}
          style={[{ width: screenWidth, height: 180 }, themed($gradient)]}
        >
          <View style={themed($headerOverlay)}>
            <View style={themed($headerTextContainer)}>
              <View style={themed($cityTextWrapper)}>
                <Text preset="heading" style={themed($headerText)}>
                  Ottawa
                </Text>
              </View>
            </View>
            {/* Time-based greeting inside header overlay */}
            <Animated.View style={[themed($greetingContainer), greetingAnimatedStyle]}>
              <Text preset="subheading" style={themed($greetingText)}>
                {getGreeting()}
              </Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* 2x2 Grid of containers */}
      <View style={themed($gridSection)}>
        <View style={themed($gridRow)}>
          <View style={themed($gridItem)}>
            <View style={themed($gridItemContent)}>
              <View style={themed($iconTextRow)}>
                <Siren size={24} color={theme.colors.police} />
                <Text style={[themed($iconText), { color: theme.colors.police }]}>Police</Text>
              </View>
              <Text style={themed($gridItemWords)}>urgent response required</Text>
            </View>
          </View>
          <View style={themed($gridItem)}>
            <View style={themed($gridItemContent)}>
              <View style={themed($iconTextRow)}>
                <Cloudy size={24} color={theme.colors.weather} />
                <Text style={[themed($iconText), { color: theme.colors.weather }]}>Weather</Text>
              </View>
              <Text style={themed($gridItemWords)}>sunny partly cloudy</Text>
            </View>
          </View>
        </View>
        <View style={themed($gridRow)}>
          <View style={themed($gridItem)}>
            <View style={themed($gridItemContent)}>
              <View style={themed($iconTextRow)}>
                <TowerControl size={24} color={theme.colors.green} />
                <Text style={[themed($iconText), { color: theme.colors.green }]}>Hydro</Text>
              </View>
              <Text style={themed($gridItemWords)}>power outage restored</Text>
            </View>
          </View>
          <View style={themed($gridItem)}>
            <View style={themed($gridItemContent)}>
              <View style={themed($iconTextRow)}>
                <BusFront size={24} color={theme.colors.mustard} />
                <Text style={[themed($iconText), { color: theme.colors.mustard }]}>Traffic</Text>
              </View>
              <Text style={themed($gridItemWords)}>construction expect delays</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 1x4 Grid of news items */}
      <View style={themed($newsSection)}>
      <SectionHeader title="Local News" />
        {newsStore.latestItems.slice(4, 8).map((item: NewsItem) => (
          <NewsCard key={item.id} item={item} compact onPress={() => handleNewsPress(item.link)} />
        ))}
      </View>

      {/* Additional news items */}
      <View style={[themed($newsSection), { marginTop: theme.spacing.md }]}>
        <SectionHeader title="More News" />
        {newsStore.latestItems.slice(8, 16).map((item: NewsItem) => (
          <NewsCard key={item.id} item={item} compact onPress={() => handleNewsPress(item.link)} />
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
  overflow: 'hidden',
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

const $headerText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.cityName,
  marginRight: spacing.sm,
  fontFamily: typography.customFontFamily,
  fontWeight: "700",
  fontSize: 36,
  includeFontPadding: false,
  textAlignVertical: 'center',
})

const $gridSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  paddingVertical: spacing.xs,
})

const $gridRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginBottom: spacing.sm,
})

const $gridItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flex: 1,
  marginHorizontal: spacing.xs / 2,
  backgroundColor: colors.containerBackground,
  borderRadius: 3,
  height: 100,
  overflow: "hidden",
})

const $gridItemContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  padding: spacing.sm,
  justifyContent: "space-between",
})

const $newsSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  flexDirection: "column",
  gap: spacing.xs,
})

const $greetingContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-start",
  marginTop: 0,
})

const $greetingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.tint,
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
})

const $iconTextRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
})

const $iconText: ThemedStyle<TextStyle> = ({ typography }) => ({
  ...typography.secondary,
  marginLeft: 8,
  fontWeight: "600",
  fontSize: 16,
})

const $gridItemWords: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  ...typography.secondary,
  color: colors.text,
  fontSize: 14,
})

const $cityTextWrapper: ThemedStyle<ViewStyle> = () => ({
  height: 36,
  justifyContent: 'center',
})

export default HomeScreen
