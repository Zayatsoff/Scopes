import { useEffect } from "react"
import { ViewStyle } from "react-native"
import { Loader2 } from "lucide-react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
  FadeIn,
  FadeOut,
} from "react-native-reanimated"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface PullToRefreshIndicatorProps {
  size?: number
  color?: string
  style?: ViewStyle
  visible: boolean
  progress?: number // 0-1 value for pull progress
}

export function PullToRefreshIndicator({
  size = 32,
  color,
  style,
  visible,
  progress = 0,
}: PullToRefreshIndicatorProps) {
  const { theme, themed } = useAppTheme()
  const rotation = useSharedValue(0)
  const scale = useSharedValue(1)

  // Set up rotation and scale animations
  useEffect(() => {
    if (visible) {
      // Rotation animation
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1200,
          easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
        }),
        -1, // -1 for infinite repetitions
        false, // Don't reverse the animation
      )

      // Pulsing scale animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.bezierFn(0.25, 0.1, 0.25, 1) }),
          withTiming(1.0, { duration: 600, easing: Easing.bezierFn(0.25, 0.1, 0.25, 1) }),
        ),
        -1,
        true,
      )
    } else if (progress > 0) {
      // When pulling, rotate based on pull progress
      rotation.value = progress * 180
      scale.value = withTiming(0.8 + progress * 0.3, { duration: 100 })
    } else {
      // Reset animations when not visible with a quick fade out
      rotation.value = withTiming(0, { duration: 250 })
      scale.value = withTiming(0.8, { duration: 250 })
    }
  }, [visible, progress])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
      opacity: visible
        ? 1
        : progress > 0
          ? Math.min(progress * 1.3, 0.7)
          : withTiming(0, { duration: 300 }),
    }
  })

  const backgroundStyle = useAnimatedStyle(() => {
    // Adjust background opacity based on state
    return {
      opacity: visible ? 0.7 : Math.min(progress * 0.7, 0.5),
    }
  })

  // Don't render anything if not visible and no pull progress
  if (!visible && progress === 0) return null

  return (
    <Animated.View
      style={[themed($container), style]}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <Animated.View style={[themed($iconBackground), backgroundStyle]}>
        <Animated.View style={animatedStyle}>
          <Loader2 size={size} color={color || theme.colors.text} strokeWidth={3} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 20,
  alignSelf: "center",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
})

const $iconBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  padding: 12,
  borderRadius: 30,
  shadowColor: colors.text,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})
