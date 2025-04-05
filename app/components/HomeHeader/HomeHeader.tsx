import { FC, useRef, useState } from "react"
import { Dimensions, Image, ImageStyle, View, ViewStyle, TouchableOpacity, TextStyle, TouchableWithoutFeedback } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  withTiming,
} from "react-native-reanimated"
import { Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { ChevronDown } from "lucide-react-native"
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator"

interface HomeHeaderProps {
  scrollY: Animated.SharedValue<number>
  opacityValue: Animated.SharedValue<number>
  translateYValue: Animated.SharedValue<number>
  selectedCity: string
  refreshing: boolean
  progress: number
  onCitySelectorPress: () => void
}

export const HomeHeader: FC<HomeHeaderProps> = ({
  scrollY,
  opacityValue,
  translateYValue,
  selectedCity,
  refreshing,
  progress,
  onCitySelectorPress,
}) => {
  const { themed, theme } = useAppTheme()
  const screenWidth = Dimensions.get("window").width
  const cityTextRef = useRef<any>(null)
  
  // Set up image dimensions
  const IMAGE_HEIGHT = screenWidth * 0.5
  const MIN_IMAGE_HEIGHT = 120

  // Add animation for dropdown icon
  const dropdownIconRotation = useSharedValue(0)
  
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
  }, [scrollY.value])

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
  
  // Create animated style for icon rotation
  const dropdownIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${dropdownIconRotation.value}deg` }],
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
        style={[
          { width: screenWidth, height: IMAGE_HEIGHT },
          themed($image),
          imageAnimatedStyle,
        ]}
        resizeMode="cover"
      />
      <View
        style={[{ width: screenWidth, height: IMAGE_HEIGHT }, themed($overlay)]}
      >
        <View style={themed($headerOverlay)}>
          <View style={themed($headerTextContainer)}>
            <View style={themed($cityTextWrapper)}>
              <TouchableOpacity 
                ref={cityTextRef}
                onPress={onCitySelectorPress} 
                style={themed($citySelector)}
                activeOpacity={0.7}
              >
                <Text preset="heading" style={themed($headerText)}>
                  {selectedCity}
                </Text>
                <Animated.View style={dropdownIconStyle}>
                  <ChevronDown size={24} color={theme.colors.text} />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
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
  overflow: 'hidden',
})

const $image: ThemedStyle<ImageStyle> = () => ({})

const $overlay: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.homeHeaderBackground, // Black overlay with 30% opacity
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
})

const $headerText: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.cityName,
  fontFamily: typography.customFontFamily,
  fontWeight: "700",
  fontSize: 36,
  textAlignVertical: 'center',
})

const $greetingContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-start",
  marginTop: 0,
})

const $greetingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
})

const $cityTextWrapper: ThemedStyle<ViewStyle> = () => ({
  paddingVertical: 2,
  borderRadius: 8,
  justifyContent: 'center',
  alignSelf: 'flex-start',
})

const $citySelector: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingVertical: 4,
}) 