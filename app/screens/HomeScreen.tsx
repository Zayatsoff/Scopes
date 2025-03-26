import React, { useEffect } from "react"
import { Dimensions, Image, ImageStyle, View, ViewStyle, TextStyle } from "react-native"
import { Screen, Text } from "@/components"
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

export const HomeScreen = () => {
  const { themed, theme } = useAppTheme()
  const screenWidth = Dimensions.get("window").width
  
  // Animation values
  const opacityValue = useSharedValue(0)
  const translateYValue = useSharedValue(10)
  
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

export default HomeScreen
