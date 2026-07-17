import { ReactNode, useState } from "react"
import { View, ViewStyle, TextStyle, Pressable, Modal, ModalProps } from "react-native"
import { Text } from "../Text"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { ChevronDown } from "lucide-react-native"
import { groupStatusItems, StatusRenderEntry } from "./statusTypes"
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import Tooltip from "react-native-walkthrough-tooltip"
import type { StatusItem } from "./types"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// walkthrough-tooltip renders through a bare RN Modal (no animationType), so
// the backdrop snaps in. Swapping in a fade Modal eases the dim overlay + bubble
// in/out. Module-scoped so the component identity stays stable across renders.
const FadeTooltipModal = (props: ModalProps) => <Modal {...props} animationType="fade" />

// list rhythm: cap the stagger so many status items don't drag the reveal out
const ICON_STAGGER_MS = 50
const ICON_STAGGER_CAP_MS = 250

// iOS-native touch-down feedback: a subtle dip, not a squish. A deep 0.9 scale
// on a small icon+label reads as a cheap pop and shimmers the text mid-scale;
// 0.96 + an opacity dim is the real tab-bar/Control-Center feel. One 0->1
// progress value drives both, ease-out both ways so the release settles.
const PRESS_SCALE = 0.96
const PRESS_OPACITY = 0.6
const PRESS_IN_MS = 140
const PRESS_OUT_MS = 320
const PRESS_EASING = Easing.out(Easing.cubic)

const StatusIcon = ({
  children,
  label,
  onPress,
  accessibilityLabel,
  accessibilityHint = "Shows details",
}: {
  children: ReactNode
  label: string
  onPress: () => void
  accessibilityLabel: string
  accessibilityHint?: string
}) => {
  const { themed } = useAppTheme()
  const reduceMotion = useReducedMotion()
  const pressed = useSharedValue(0)

  const pressStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value * (1 - PRESS_OPACITY),
    // Reduce Motion: keep the opacity dim as feedback, drop the scale movement
    transform: reduceMotion ? [] : [{ scale: 1 - pressed.value * (1 - PRESS_SCALE) }],
  }))

  const setPressed = (down: boolean) => {
    pressed.value = withTiming(down ? 1 : 0, {
      duration: down ? PRESS_IN_MS : PRESS_OUT_MS,
      easing: PRESS_EASING,
    })
  }

  return (
    <AnimatedPressable
      style={[themed($iconContainer), pressStyle]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={8}
    >
      {children}
      <Text style={themed($iconLabel)} numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  )
}

// icon + optional disclosure badge for a row entry that collapses several
// statuses (e.g. multiple skating rinks) behind one tappable icon
const StatusGlyph = ({
  icon: Icon,
  color,
  showExpandBadge,
}: {
  icon: StatusRenderEntry["icon"]
  color: string
  showExpandBadge: boolean
}) => {
  const { themed, theme } = useAppTheme()
  return (
    <View style={themed($iconGlyph)}>
      <Icon size={24} color={color} />
      {showExpandBadge && (
        <View style={themed($expandBadge)}>
          <ChevronDown size={10} color={theme.colors.textDim} />
        </View>
      )}
    </View>
  )
}

export interface CityStatusProps {
  /**
   * Status items to display
   */
  statusItems?: StatusItem[]
  /**
   * Whether the component is in a loading state
   */
  loading?: boolean
}

/**
 * Component that displays the current city status using icons
 */
export const CityStatus = observer(function CityStatus({
  statusItems = [],
  loading = false,
}: CityStatusProps) {
  const { themed, theme } = useAppTheme()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  // collapse same-category items (e.g. 4 separate rinks) behind one icon
  const entries = groupStatusItems(statusItems)

  if (loading) {
    return (
      <Animated.View
        style={themed($container)}
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(120)}
      >
        <Text style={themed($loadingText)}>Loading status...</Text>
      </Animated.View>
    )
  }

  if (statusItems.length === 0) {
    return (
      <Animated.View
        style={themed($container)}
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(120)}
      >
        <Text style={themed($emptyText)}>No status available</Text>
      </Animated.View>
    )
  }

  return (
    <Animated.View style={themed($container)} entering={FadeIn.duration(150)}>
      <View style={themed($iconsContainer)}>
        {entries.map((entry, index) => {
          const isGroup = entry.expandItems.length > 1
          const color = entry.active ? theme.colors.accent : theme.colors.textDim

          return (
            <Tooltip
              key={entry.id}
              isVisible={activeTooltip === entry.id}
              content={
                isGroup ? (
                  <View style={themed($tooltipList)}>
                    {entry.expandItems.map((rink) => (
                      <View key={rink.id} style={themed($tooltipListRow)}>
                        <View
                          style={[
                            themed($tooltipDot),
                            {
                              backgroundColor: rink.bool
                                ? theme.colors.accent
                                : theme.colors.textDim,
                            },
                          ]}
                        />
                        <Text style={themed($tooltipListLabel)} numberOfLines={1}>
                          {rink.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={themed($tooltipText)}>{entry.expandItems[0].description}</Text>
                )
              }
              placement="top"
              onClose={() => setActiveTooltip(null)}
              contentStyle={themed($tooltipContent)}
              modalComponent={FadeTooltipModal}
              backgroundColor="rgba(0,0,0,0.5)"
              tooltipStyle={themed($tooltipStyle)}
              disableShadow={false}
              showChildInTooltip={false}
              arrowSize={{ width: 16, height: 8 }}
              allowChildInteraction={false}
              childContentSpacing={4}
            >
              <Animated.View
                entering={FadeIn.duration(200).delay(
                  Math.min(index * ICON_STAGGER_MS, ICON_STAGGER_CAP_MS),
                )}
              >
                <StatusIcon
                  label={entry.label}
                  onPress={() => setActiveTooltip(activeTooltip === entry.id ? null : entry.id)}
                  accessibilityLabel={entry.accessibilityLabel}
                  accessibilityHint={isGroup ? "Expands to show each rink" : "Shows details"}
                >
                  <StatusGlyph icon={entry.icon} color={color} showExpandBadge={isGroup} />
                </StatusIcon>
              </Animated.View>
            </Tooltip>
          )
        })}
      </View>
    </Animated.View>
  )
})

// Styles
const $container: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xxs,
  backgroundColor: colors.containerBackground,
  width: "100%",
})

const $iconsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  columnGap: spacing.lg,
  rowGap: spacing.xxs,
  paddingVertical: spacing.xs,
  width: "100%",
  paddingHorizontal: spacing.sm,
})

const $iconContainer: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  padding: 8,
  alignItems: "center",
  gap: 4,
})

const $iconLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xxs,
  color: colors.textDim,
  textAlign: "center",
})

const $iconGlyph: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
})

// disclosure badge marking a collapsed group (e.g. 4 rinks behind 1 icon)
const $expandBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  bottom: -4,
  right: -6,
  width: 14,
  height: 14,
  borderRadius: 7,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.containerBackground,
  borderWidth: 1,
  borderColor: colors.border,
})

const $tooltipStyle: ThemedStyle<ViewStyle> = () => ({
  maxWidth: 250,
  minWidth: 150,
  alignItems: "center",
  justifyContent: "center",
})

const $tooltipContent: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.sm,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  marginHorizontal: spacing.xs,
  alignSelf: "center",
})

const $tooltipText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  textAlign: "center",
})

const $tooltipList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
  alignSelf: "stretch",
})

const $tooltipListRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $tooltipDot: ThemedStyle<ViewStyle> = () => ({
  width: 8,
  height: 8,
  borderRadius: 4,
})

const $tooltipListLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  flexShrink: 1,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.7,
  textAlign: "center",
  paddingVertical: typography.sizes.sm,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.7,
  textAlign: "center",
  paddingVertical: typography.sizes.sm,
})
