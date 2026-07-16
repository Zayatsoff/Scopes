import { useRef, useState } from "react"
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "@/navigators/AppNavigator"
import { Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import {
  ChevronRight,
  ShieldCheck,
  BellRing,
  CloudSun,
  Siren,
  BusFront,
  Newspaper,
} from "lucide-react-native"
import type { ThemedStyle } from "@/theme"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  withTiming,
  Extrapolation,
  useAnimatedScrollHandler,
  runOnJS,
  SharedValue,
} from "react-native-reanimated"

const { width } = Dimensions.get("window")

type Slide = {
  key: string
  heading: string
  description: string
  graphic: "logo" | "shield" | "bell"
}

const slides: Slide[] = [
  {
    key: "1",
    heading: "One glance, everything local",
    description:
      "Weather, traffic, police activity, and news — every real signal that shapes your day in Ottawa, together in one dashboard.",
    graphic: "logo",
  },
  {
    key: "2",
    heading: "Real signals only",
    description:
      "Nothing here is simulated. When we can't verify something ourselves, like a Hydro outage, we link straight to the official source instead of guessing.",
    graphic: "shield",
  },
  {
    key: "3",
    heading: "Calm, even when it matters",
    description:
      "Severity is always paired with an icon and a label, not just a color, so you know what's happening without the alarm.",
    graphic: "bell",
  },
]

const categoryLegend = [
  { key: "weather", label: "Weather", Icon: CloudSun, colorKey: "weather" as const },
  { key: "traffic", label: "Traffic", Icon: BusFront, colorKey: "traffic" as const },
  { key: "police", label: "Police", Icon: Siren, colorKey: "police" as const },
  { key: "news", label: "News", Icon: Newspaper, colorKey: "tint" as const },
]

function Dot({
  index,
  isActive,
  scrollX,
  dotScale,
  dotOpacity,
  style,
  activeColor,
  inactiveColor,
}: {
  index: number
  isActive: boolean
  scrollX: SharedValue<number>
  dotScale: SharedValue<number>
  dotOpacity: SharedValue<number>
  style: ViewStyle
  activeColor: string
  inactiveColor: string
}) {
  const animatedDotStyle = useAnimatedStyle(() => ({
    backgroundColor: isActive ? activeColor : inactiveColor,
    transform: [
      {
        scale: isActive
          ? dotScale.value
          : interpolate(
              scrollX.value,
              [(index - 1) * width, index * width, (index + 1) * width],
              [0.8, 1, 0.8],
              Extrapolation.CLAMP,
            ),
      },
    ],
    opacity: isActive
      ? dotOpacity.value
      : interpolate(
          scrollX.value,
          [(index - 1) * width, index * width, (index + 1) * width],
          [0.5, 1, 0.5],
          Extrapolation.CLAMP,
        ),
  }))

  return <Animated.View style={[style, animatedDotStyle]} />
}

export function IntroScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [carouselHeight, setCarouselHeight] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { themed, theme } = useAppTheme()
  const insets = useSafeAreaInsets()

  const scrollX = useSharedValue(0)
  const dotScale = useSharedValue(1)
  const dotOpacity = useSharedValue(1)

  const isLastSlide = currentIndex === slides.length - 1

  const goToMainTabs = () => {
    navigation.replace("MainTabs")
  }

  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      goToMainTabs()
    }
  }

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x

      const slideIndex = Math.round(event.contentOffset.x / width)
      if (slideIndex !== currentIndex) {
        runOnJS(setCurrentIndex)(slideIndex)

        dotScale.value = withTiming(1.2, { duration: 100 }, () => {
          dotScale.value = withTiming(1, { duration: 100 })
        })
        dotOpacity.value = withTiming(0.7, { duration: 50 }, () => {
          dotOpacity.value = withTiming(1, { duration: 100 })
        })
      }
    },
  })

  const handleMomentumScrollEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  const renderGraphic = (slide: Slide) => {
    if (slide.graphic === "logo") {
      return (
        <View style={themed($iconBadge)}>
          <Image
            source={require("../../assets/images/app-icon-android-adaptive-foreground.png")}
            style={themed($logoImage)}
            resizeMode="contain"
          />
        </View>
      )
    }

    const Icon = slide.graphic === "shield" ? ShieldCheck : BellRing
    return (
      <View style={themed($iconBadge)}>
        <Icon size={64} color={theme.colors.tint} strokeWidth={1.75} />
      </View>
    )
  }

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const isLast = index === slides.length - 1

    return (
      <View style={[themed($slide), { width, height: carouselHeight || undefined }]}>
        <View style={themed($topSection)}>{renderGraphic(item)}</View>

        <View style={themed($bottomSection)}>
          <Text preset="heading" style={themed($heading)}>
            {item.heading}
          </Text>
          <Text preset="default" style={themed($description)}>
            {item.description}
          </Text>

          {isLast && (
            <View style={themed($legendRow)}>
              {categoryLegend.map(({ key, label, Icon, colorKey }) => (
                <View key={key} style={themed($legendItem)}>
                  <Icon size={18} color={theme.colors[colorKey]} strokeWidth={2} />
                  <Text text={label} style={themed($legendLabel)} />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={themed($container)}>
      {!isLastSlide && (
        <TouchableOpacity
          style={[themed($skipButton), { top: insets.top + theme.spacing.sm }]}
          onPress={goToMainTabs}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={themed($skipText)}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.FlatList
        ref={flatListRef}
        style={themed($carousel)}
        onLayout={(e) => setCarouselHeight(e.nativeEvent.layout.height)}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={(item) => item.key}
        bounces={false}
        scrollEventThrottle={16}
      />

      <View style={[themed($footer), { paddingBottom: theme.spacing.lg + insets.bottom }]}>
        <View style={themed($dotsRow)}>
          {slides.map((_, i) => (
            <Dot
              key={i}
              index={i}
              isActive={i === currentIndex}
              scrollX={scrollX}
              dotScale={dotScale}
              dotOpacity={dotOpacity}
              style={themed($dot)}
              activeColor={theme.colors.tint}
              inactiveColor={theme.colors.tintInactive}
            />
          ))}
        </View>

        <TouchableOpacity style={themed($primaryButton)} onPress={goToNextSlide}>
          <Text style={themed($primaryButtonText)}>{isLastSlide ? "Get Started" : "Next"}</Text>
          <ChevronRight color={theme.colors.background} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// -----------------------
// Themed style definitions
// -----------------------

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $carousel: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $slide: ThemedStyle<ViewStyle> = () => ({})

const $topSection: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $bottomSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.md,
  alignItems: "center",
})

const $iconBadge: ThemedStyle<ViewStyle> = ({ colors, spacing, radius }) => ({
  width: 176,
  height: 176,
  borderRadius: radius.pill,
  backgroundColor: colors.containerBackground,
  borderWidth: 1,
  borderColor: colors.border,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $logoImage: ThemedStyle<ImageStyle> = () => ({
  width: "100%",
  height: "100%",
})

const $heading: ThemedStyle<TextStyle> = ({ spacing, typography, colors }) => ({
  fontFamily: typography.display.semiBold,
  fontSize: typography.sizes.xxl,
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.sm,
})

const $description: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontSize: typography.sizes.md,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: typography.sizes.md * 1.5,
  maxWidth: 320,
})

const $legendRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "center",
  gap: spacing.lg,
  marginTop: spacing.lg,
})

const $legendItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.xxs,
})

const $legendLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xxs,
  color: colors.textDim,
})

const $skipButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  right: spacing.md,
  minHeight: 44,
  minWidth: 44,
  justifyContent: "center",
  alignItems: "flex-end",
  zIndex: 10,
})

const $skipText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.md,
  fontWeight: "600",
  color: colors.text,
})

const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.md,
  alignItems: "center",
})

const $dotsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  marginBottom: spacing.md,
})

const $dot: ThemedStyle<ViewStyle> = () => ({
  width: 8,
  height: 8,
  borderRadius: 4,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ colors, spacing, radius }) => ({
  flexDirection: "row",
  alignSelf: "stretch",
  paddingVertical: spacing.sm,
  borderRadius: radius.pill,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
  gap: spacing.xs,
  minHeight: 50,
})

const $primaryButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.background,
  fontSize: typography.sizes.md,
  fontWeight: "600",
})
