import { useEffect } from "react"
import { ViewStyle } from "react-native"
import { Loader2 } from "lucide-react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { useAppTheme } from "@/utils/useAppTheme"

interface LoadingIconProps {
  size?: number
  color?: string
  style?: ViewStyle
}

export function LoadingIcon({ size = 24, color, style }: LoadingIconProps) {
  const { theme } = useAppTheme()
  const rotation = useSharedValue(0)

  // Set up rotation animation
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // -1 for infinite repetitions
      false, // Don't reverse the animation
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    }
  })

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Loader2 size={size} color={color || theme.colors.text} />
    </Animated.View>
  )
}
