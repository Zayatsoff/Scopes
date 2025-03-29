import React, { ReactElement } from "react"
import { useAppTheme } from "@/utils/useAppTheme"
import { useHeader } from "@/utils/useHeader"

interface UseTabHeaderProps {
  title: string;
  titleMode?: "center" | "flex";
  RightActionComponent?: ReactElement;
}

/**
 * A hook that sets up a consistent orange tab header
 * Can be used across different tabs in the app.
 */
export function useTabHeader({ 
  title, 
  titleMode = "center", 
  RightActionComponent 
}: UseTabHeaderProps) {
  const { theme } = useAppTheme()
  
  useHeader({
    title,
    titleMode,
    backgroundColor: theme.colors.palette.primary500,
    titleStyle: { color: theme.colors.palette.neutral100 },
    RightActionComponent
  })
} 