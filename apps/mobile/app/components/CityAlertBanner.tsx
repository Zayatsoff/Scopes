import { Pressable, View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { Info, ChevronRight } from "lucide-react-native"
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface CityAlertBannerProps {
  /**
   * The notice headline, e.g. "Resources and information - July 1 extreme weather event"
   */
  title: string
  /**
   * Called when the banner is pressed (opens the source in the browser)
   */
  onPress: () => void
}

// city's featured/pinned notice. deliberately not a card -> full-bleed tinted
// strip, one brand-tint icon, no red/alarm color (that's reserved for actual
// restrictions in CityStatus) -> present w/out reading as alarmist
export const CityAlertBanner = ({ title, onPress }: CityAlertBannerProps) => {
  const { themed, theme } = useAppTheme()
  const scale = useSharedValue(1)
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <AnimatedPressable
        style={[themed($container), pressStyle]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.98, { duration: 100 })
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 })
        }}
        accessibilityRole="link"
        accessibilityLabel={title}
        accessibilityHint="Opens the city's notice in your browser"
      >
        <Info size={20} color={theme.colors.tint} />
        <Text style={themed($title)} numberOfLines={2}>
          {title}
        </Text>
        <View style={themed($chevron)}>
          <ChevronRight size={18} color={theme.colors.textDim} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  minHeight: 44,
  backgroundColor: hexToRgba(colors.tint, 0.1),
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flex: 1,
  fontSize: typography.sizes.sm,
  fontWeight: typography.weights.medium,
  color: colors.text,
})

const $chevron: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.6,
})

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
