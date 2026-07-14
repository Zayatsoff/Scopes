import React, { ReactNode } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

interface SectionHeaderProps {
  title: string
  color?: string
  RightComponent?: ReactNode
}

export function SectionHeader({ title, color, RightComponent }: SectionHeaderProps) {
  const { themed, theme } = useAppTheme()
  
  return (
    <View style={themed($container)}>
      <Text 
        preset="heading" 
        text={title} 
        style={[
          themed($sectionTitle),
          color ? { color } : null
        ]} 
      />
      {RightComponent}
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: typography.sizes.md,
  fontWeight: "600",
}) 