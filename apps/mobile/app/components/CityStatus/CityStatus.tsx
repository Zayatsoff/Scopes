import React, { useState, useRef, useEffect } from "react"
import { View, ViewStyle, TextStyle, Pressable, TouchableWithoutFeedback, Dimensions, LayoutRectangle } from "react-native"
import { Text } from "../Text"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { Flame, Car, Snowflake, Bus } from "lucide-react-native"
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import Tooltip from "react-native-walkthrough-tooltip"
import type { StatusItem } from "./types"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// list rhythm: cap the stagger so many status items don't drag the reveal out
const ICON_STAGGER_MS = 50
const ICON_STAGGER_CAP_MS = 250

const StatusIcon = ({
  children,
  label,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode
  label: string
  onPress: () => void
  accessibilityLabel: string
}) => {
  const { themed } = useAppTheme()
  const scale = useSharedValue(1)
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      style={[themed($iconContainer), pressStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.9, { duration: 100 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 150 })
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Shows details"
      hitSlop={8}
    >
      {children}
      <Text style={themed($iconLabel)} numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
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
  const iconsContainerRef = useRef<View>(null)
  const iconRefs = useRef<{ [key: string]: { layout: LayoutRectangle | null } }>({})
  const [containerLayout, setContainerLayout] = useState<LayoutRectangle | null>(null)
  const screenWidth = Dimensions.get('window').width
  
  // Initialize refs for each status item
  useEffect(() => {
    statusItems.forEach(item => {
      if (!iconRefs.current[item.id]) {
        iconRefs.current[item.id] = { layout: null }
      }
    })
  }, [statusItems])

  // Close tooltip when tapping anywhere else
  const handlePressOutside = () => {
    if (activeTooltip) {
      setActiveTooltip(null)
    }
  }

  // Render appropriate icon based on status title
  const renderStatusIcon = (item: StatusItem) => {
    // Map status titles to appropriate icons
    const { title, bool } = item
    const color = bool ? theme.colors.accent : theme.colors.textDim
    
    if (title.toLowerCase().includes("fire")) {
      return <Flame size={24} color={color} />
    } else if (title.toLowerCase().includes("parking")) {
      return <Car size={24} color={color} />
    } else if (title.toLowerCase().includes("sledding")) {
      return <Snowflake size={24} color={color} />
    } else if (title.toLowerCase().includes("school bus")) {
      return <Bus size={24} color={color} />
    } else {
      // Default fallback
      return <Flame size={24} color={color} />
    }
  }

  // short caption under each icon, same category matching as renderStatusIcon
  const getStatusLabel = (item: StatusItem) => {
    const title = item.title.toLowerCase()
    if (title.includes("fire")) return "Fire Ban"
    if (title.includes("parking")) return "Parking"
    if (title.includes("sledding")) return "Sledding"
    if (title.includes("school bus")) return "School Bus"
    return item.title
  }

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
    <Animated.View
      style={themed($container)}
      entering={FadeIn.duration(150)}
      onLayout={(event) => {
        setContainerLayout(event.nativeEvent.layout)
      }}
    >
      <View
        ref={iconsContainerRef}
        style={themed($iconsContainer)}
      >
        {statusItems.map((item, index) => (
          <Tooltip
            key={item.id}
            isVisible={activeTooltip === item.id}
            content={
              <Text style={themed($tooltipText)}>{item.description}</Text>
            }
            placement="top"
            onClose={() => setActiveTooltip(null)}
            contentStyle={themed($tooltipContent)}
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
                label={getStatusLabel(item)}
                onPress={() => setActiveTooltip(activeTooltip === item.id ? null : item.id)}
                accessibilityLabel={`${item.title}: ${item.bool ? "active" : "inactive"}`}
              >
                {renderStatusIcon(item)}
              </StatusIcon>
            </Animated.View>
          </Tooltip>
        ))}
      </View>
    </Animated.View>
  )
})

// Styles
const $container: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.xxs,
  backgroundColor: colors.containerBackground,
  width: '100%',
})

const $iconsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.xs,
  width: '100%',
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

const $tooltipStyle: ThemedStyle<ViewStyle> = () => ({
  maxWidth: 250,
  minWidth: 150,
  alignItems: 'center',
  justifyContent: 'center',
})

const $tooltipContent: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.sm,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  marginHorizontal: spacing.xs,
  alignSelf: 'center',
})

const $tooltipText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  textAlign: "center",
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