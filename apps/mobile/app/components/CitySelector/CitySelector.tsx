import { FC } from "react"
import { Image, ImageStyle, View, ViewStyle, TextStyle, TouchableOpacity, TouchableWithoutFeedback } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { ChevronDown, Plus } from "lucide-react-native"
import { useEffect } from "react"

interface CitySelectorProps {
  visible: boolean
  dropdownPosition: {
    top: number
    left: number
    width: number
  }
  selectedCity: string
  onCitySelect: (city: string) => void
  onClose: () => void
}

export const CitySelector: FC<CitySelectorProps> = ({
  visible,
  dropdownPosition,
  selectedCity,
  onCitySelect,
  onClose,
}) => {
  const { themed, theme } = useAppTheme()
  
  // Custom animation values for dropdown
  const dropdownAnimProgress = useSharedValue(0)
  
  // Update dropdown animation when visibility changes
  useEffect(() => {
    if (visible) {
      // Open with a faster spring animation
      dropdownAnimProgress.value = withSpring(1, {
        damping: 22,        // Slightly more damping to prevent bounce
        stiffness: 250,     // Higher stiffness for faster animation
        mass: 0.6,          // Lower mass for quicker response
        restDisplacementThreshold: 0.005, // More precision
        restSpeedThreshold: 5, // Allow faster completion
      })
    } else {
      // Close with timing for a smooth controlled return
      dropdownAnimProgress.value = withTiming(0, {
        duration: 180,
      })
    }
  }, [visible])
  
  // Custom animation style for dropdown
  const dropdownAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      dropdownAnimProgress.value,
      [0, 1],
      [-10, 0]  // Smaller distance for more subtle effect
    )
    
    const opacity = dropdownAnimProgress.value
    
    return {
      opacity,
      transform: [{ translateY }],
    }
  })

  if (!visible) return null

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <Animated.View 
        style={[
          themed($modalOverlay),
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            opacity: dropdownAnimProgress,
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
          <Animated.View 
            style={[
              themed($dropdown),
              {
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: Math.max(200, dropdownPosition.width),
                marginTop: 4,
                maxHeight: 300,
              },
              dropdownAnimatedStyle
            ]}
          >
            <TouchableOpacity
              style={[
                themed($cityItem),
                selectedCity === "Ottawa" && themed($selectedCityItem),
              ]}
              onPress={() => onCitySelect("Ottawa")}
            >
              <Image
                source={require("../../../assets/images/ottawa_cover.jpg")}
                style={themed($cityImage)}
                resizeMode="cover"
              />
              <Text style={themed($cityItemText)}>Ottawa</Text>
              {selectedCity === "Ottawa" && (
                <View style={themed($checkIconWrapper)}>
                  <ChevronDown size={20} color={theme.colors.text} />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                themed($cityItem),
                selectedCity === "Vancouver" && themed($selectedCityItem),
              ]}
              onPress={() => onCitySelect("Vancouver")}
            >
              <Image
                source={require("../../../assets/images/vancouver-cover.jpg")}
                style={themed($cityImage)}
                resizeMode="cover"
              />
              <Text style={themed($cityItemText)}>Vancouver</Text>
              {selectedCity === "Vancouver" && (
                <View style={themed($checkIconWrapper)}>
                  <ChevronDown size={20} color={theme.colors.text} />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={themed($addCityButton)}>
              <Plus size={22} color={theme.colors.text} />
              <Text style={themed($addCityText)}>Add City</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

// -----------------------
// Themed style definitions
// -----------------------

const $cityItem: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginVertical: 4,
})

const $selectedCityItem: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.containerBackground,
})

const $cityImage: ThemedStyle<ImageStyle> = () => ({
  width: 48,
  height: 48,
  borderRadius: 8,
  marginRight: 12,
})

const $cityItemText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16,
  fontFamily: typography.primary.medium,
})

const $checkIconWrapper: ThemedStyle<ViewStyle> = () => ({
  marginLeft: "auto",
})

const $addCityButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: 16,
  marginTop: 8,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  gap: 8,
})

const $addCityText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16, 
  fontFamily: typography.primary.medium,
})

const $modalOverlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
})

const $dropdown: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  minWidth: 200,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
  overflow: 'hidden',
}) 