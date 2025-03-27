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
const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.xs,
  color: colors.palette.primary600,
  fontSize: 18,
  fontWeight: "600",
}) 