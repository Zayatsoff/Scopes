import React, { ReactElement } from "react"
import { useAppTheme } from "@/utils/useAppTheme"
import { useHeader } from "@/utils/useHeader"

interface UseTabHeaderProps {
  title: string;
  titleMode?: "center" | "flex";
  RightActionComponent?: ReactElement;
  backgroundColor?: string;
  titleColor?: string;
}

/**
 * A hook that sets up a consistent header for main tabs
 * Can be used across different tabs in the app.
 */
export function useTabHeader({ 
  title, 
  titleMode = "center", 
  RightActionComponent,
  backgroundColor,
  titleColor
}: UseTabHeaderProps) {
  const { theme } = useAppTheme()
  
  useHeader({
    title,
    titleMode,
    backgroundColor: backgroundColor || theme.colors.background,
    titleStyle: { 
      color: titleColor || theme.colors.text,
      fontSize: theme.typography.sizes.xl,
      fontWeight: "600"
    },
    RightActionComponent
  })
} 