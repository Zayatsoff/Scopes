import { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Dimensions, Image, ImageStyle, View, ViewStyle, TextStyle, Pressable } from "react-native"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { MainTabParamList } from "@/navigators/MainTabs"
import { Screen, Text } from "@/components"
import { useHeader } from "@/utils/useHeader"
import { useAppTheme } from "@/utils/useAppTheme"
import { LinearGradient } from "expo-linear-gradient"
import { ChevronDown, ChevronRight } from "lucide-react-native"
import type { ThemedStyle } from "@/theme"
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay
} from "react-native-reanimated"
import { useStores } from "@/models"
import { NewsCard } from "@/components/NewsCard"

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

  const navigateToNewsScreen = () => {
    navigation.navigate("News")
  }

  return (
    <Screen preset="scroll" style={themed($container)} safeAreaEdges={["bottom"]}>
      {/* Top image with gradient overlay */}
      <View style={themed($imageSection)}>
        <Image
          source={require("../../assets/images/ottawa_cover.jpg")}
          style={[{ width: screenWidth, height: screenWidth }, themed($image)]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", theme.colors.background]}
          style={[{ width: screenWidth, height: 220 }, themed($gradient)]}
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

      {/* Latest News Section */}
      <View style={themed($section)}>
        <View style={themed($sectionHeader)}>
          <Text style={themed($sectionTitle)}>Latest News</Text>
          <Pressable 
            onPress={navigateToNewsScreen}
            style={themed($seeAllButton)}
            android_ripple={{ color: theme.colors.palette.neutral400 }}
          >
            <Text style={themed($seeAllText)}>See All</Text>
            <ChevronRight size={16} color={theme.colors.primary} />
          </Pressable>
        </View>
        
        {newsStore.isLoading && newsStore.items.length === 0 ? (
          <Text style={themed($loadingText)}>Loading latest news...</Text>
        ) : newsStore.error ? (
          <Text style={themed($errorText)}>Unable to load news</Text>
        ) : newsStore.latestItems.length === 0 ? (
          <Text style={themed($emptyText)}>No news available</Text>
        ) : (
          <View style={themed($newsContainer)}>
            {newsStore.latestItems.map(item => (
              <NewsCard key={item.id} item={item} compact />
            ))}
          </View>
        )}
      </View>

      {/* 2x2 Grid of unavailable containers */}
      <View style={themed($gridSection)}>
        <View style={themed($gridRow)}>
          <View style={[themed($gridItem), { backgroundColor: theme.colors.tintInactive }]}>
            <Text style={themed($itemText)}>Unavailable</Text>
          </View>
          <View style={[themed($gridItem), { backgroundColor: theme.colors.tintInactive }]}>
            <Text style={themed($itemText)}>Unavailable</Text>
          </View>
        </View>
        <View style={themed($gridRow)}>
          <View style={[themed($gridItem), { backgroundColor: theme.colors.tintInactive }]}>
            <Text style={themed($itemText)}>Unavailable</Text>
          </View>
          <View style={[themed($gridItem), { backgroundColor: theme.colors.tintInactive }]}>
            <Text style={themed($itemText)}>Unavailable</Text>
          </View>
        </View>
      </View>

      {/* Vertical list (4 items; only 2 are visible initially) */}
      <View style={themed($listSection)}>
        <View style={[themed($listItem), { backgroundColor: "#ccc" }]}>
          <Text style={themed($itemText)}>Unavailable</Text>
        </View>
        <View style={[themed($listItem), { backgroundColor: "#ccc" }]}>
          <Text style={themed($itemText)}>Unavailable</Text>
        </View>
        <View style={[themed($listItem), { backgroundColor: "#ccc" }]}>
          <Text style={themed($itemText)}>Unavailable</Text>
        </View>
        <View style={[themed($listItem), { backgroundColor: "#ccc" }]}>
          <Text style={themed($itemText)}>Unavailable</Text>
        </View>
      </View>
    </Screen>
  )
}

// -----------------------
// Themed style definitions
// -----------------------

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $imageSection: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
})

// Change the type here to ImageStyle for compatibility with <Image />
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

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.md,
  paddingHorizontal: spacing.md,
})

const $sectionHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  fontWeight: "bold",
  color: colors.text,
})

const $seeAllButton: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $seeAllText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.primary,
  marginRight: 4,
})

const $gridSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  paddingHorizontal: spacing.lg,
})

const $gridRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: spacing.md,
})

const $gridItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "48%",
  aspectRatio: 1,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
})

const $listSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.xl,
})

const $listItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: 150,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $itemText: ThemedStyle<TextStyle> = () => ({
  color: "#000",
  fontWeight: "bold",
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

const $newsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginVertical: spacing.lg,
  textAlign: "center",
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginVertical: spacing.lg,
  textAlign: "center",
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginVertical: spacing.lg,
  textAlign: "center",
})

export default HomeScreen
