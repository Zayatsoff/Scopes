import { FC } from "react"
import { Dimensions, ImageStyle, View, ViewStyle, TextStyle } from "react-native"
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import { Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"

// ottawa-only by design, no city selection (see PRODUCT.md)
const CITY_NAME = "Ottawa"

interface HomeHeaderProps {
  scrollY: Animated.SharedValue<number>
  opacityValue: Animated.SharedValue<number>
  translateYValue: Animated.SharedValue<number>
  refreshing: boolean
  progress: number
}

export const HomeHeader: FC<HomeHeaderProps> = ({
  scrollY,
  opacityValue,
  translateYValue,
  refreshing,
  progress,
}) => {
  const { themed, theme } = useAppTheme()
  const screenWidth = Dimensions.get("window").width

  // Set up image dimensions
  const IMAGE_HEIGHT = screenWidth * 0.5
  const MIN_IMAGE_HEIGHT = 120

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

  // Header image animation style
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [IMAGE_HEIGHT, MIN_IMAGE_HEIGHT],
      Extrapolate.CLAMP,
    )

    const translateY = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [0, -(IMAGE_HEIGHT - MIN_IMAGE_HEIGHT) / 2],
      Extrapolate.CLAMP,
    )

    const scale = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - MIN_IMAGE_HEIGHT],
      [1, 1.1],
      Extrapolate.CLAMP,
    )

    return {
      height,
      transform: [{ translateY }, { scale }],
    }
  }, [scrollY.value])

  // Header container animation style
  const headerContainerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.85], Extrapolate.CLAMP)

    return {
      opacity,
    }
  })

  // Greeting animation styles
  const greetingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
      transform: [{ translateY: translateYValue.value }],
    }
  })

  return (
    <Animated.View style={[themed($imageSection), headerContainerStyle]}>
      <PullToRefreshIndicator visible={refreshing} progress={progress} />
      <Animated.Image
        source={require("../../../assets/images/ottawa_cover.jpg")}
        style={[{ width: screenWidth, height: IMAGE_HEIGHT }, themed($image), imageAnimatedStyle]}
        resizeMode="cover"
      />
      <View style={[{ width: screenWidth, height: IMAGE_HEIGHT }, themed($overlay)]}>
        <LinearGradient
          colors={[theme.colors.homeHeaderScrimStart, theme.colors.homeHeaderScrimEnd]}
          style={$scrim}
          pointerEvents="none"
        />
        <View style={themed($headerOverlay)}>
          <Text preset="heading" style={themed($headerText)}>
            {CITY_NAME}
          </Text>
          {/* Time-based greeting inside header overlay */}
          <Animated.View style={[themed($greetingContainer), greetingAnimatedStyle]}>
            <Text preset="subheading" style={themed($greetingText)}>
              {getGreeting()}
            </Text>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  )
}

// -----------------------
// Themed style definitions
// -----------------------

const $imageSection: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  overflow: "hidden",
})

const $image: ThemedStyle<ImageStyle> = () => ({})

const $scrim: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
}

const $overlay: ThemedStyle<ViewStyle> = ({ spacing }) => ({
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

const $headerText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.cityName,
  // brand display face for the hero city name
  fontFamily: typography.display.bold,
  fontSize: 36,
  letterSpacing: -0.5,
})

const $greetingContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-start",
  marginTop: 0,
})

const $greetingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  // quiet system weight under the display city name -> hierarchy by contrast
  fontWeight: typography.weights.medium,
  fontSize: 18,
})
