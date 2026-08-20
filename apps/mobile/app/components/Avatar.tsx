import { View, Text, ViewStyle, TextStyle } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"

interface AvatarProps {
  source: string
  size?: number
}

export function Avatar({ source, size = 40 }: AvatarProps) {
  const { themed } = useAppTheme()

  // For police service, use a specific style
  const isPoliceService = source.toLowerCase().includes("police")

  // Get initials from source
  const initials = source
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <View
      style={[
        themed(isPoliceService ? $policeContainer : $container),
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {isPoliceService ? (
        <Text style={[themed($policeText), { fontSize: size / 3 }]}>OPS</Text>
      ) : (
        <Text style={[themed($text), { fontSize: size / 2.5 }]}>{initials}</Text>
      )}
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
  justifyContent: "center",
  alignItems: "center",
})

const $policeContainer: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#2D3748",
  justifyContent: "center",
  alignItems: "center",
})

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "bold",
})

const $policeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "bold",
})
