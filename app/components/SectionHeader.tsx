import React from "react"
import { TextStyle } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

interface SectionHeaderProps {
  title: string
  color?: string
}

export function SectionHeader({ title, color }: SectionHeaderProps) {
  const { themed, theme } = useAppTheme()
  
  return (
    <Text 
      preset="heading" 
      text={title} 
      style={[
        themed($sectionTitle),
        color ? { color } : null
      ]} 
    />
  )
}

// Styles
const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing, colors, typography }) => ({
  // paddingHorizontal: spacing.md,
  color: colors.text,
  fontSize: typography.sizes.md,
  fontWeight: "600",
}) 