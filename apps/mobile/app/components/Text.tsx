import React from "react"
import { TOptions } from "i18next"
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from "react-native"
import { isRTL, translate, TxKeyPath } from "@/i18n"
import type { ThemedStyle, ThemedStyleArray } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { typography } from "@/theme/typography"
import { ReactNode, forwardRef, ForwardedRef } from "react"

type Sizes = keyof typeof $sizeStyles
type Weights = keyof typeof typography.primary
type Presets = "default" | "bold" | "heading" | "subheading" | "formLabel" | "formHelper"

export interface TextProps extends RNTextProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TOptions
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<TextStyle>
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * Text weight modifier.
   */
  weight?: Weights
  /**
   * Text size modifier.
   */
  size?: Sizes
  /**
   * Children components.
   */
  children?: ReactNode
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Text/}
 * @param {TextProps} props - The props for the `Text` component.
 * @returns {JSX.Element} The rendered `Text` component.
 */
export const Text = forwardRef(function Text(props: TextProps, ref: ForwardedRef<RNText>) {
  const { weight, size, tx, txOptions, text, children, style: $styleOverride, ...rest } = props
  const { themed } = useAppTheme()

  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || text || children

  const preset: Presets = props.preset ?? "default"
  const $styles: StyleProp<TextStyle> = [
    $rtlStyle,
    themed($presets[preset]),
    weight && $fontWeightStyles[weight],
    size && $sizeStyles[size],
    $styleOverride,
  ]

  return (
    <RNText
      // honor the OS text-size setting (Dynamic Type) but bound it so dense
      // layouts degrade gracefully instead of shattering. callers can override
      allowFontScaling
      maxFontSizeMultiplier={2}
      {...rest}
      style={$styles}
      ref={ref}
    >
      {content}
    </RNText>
  )
})

const $sizeStyles = {
  xxl: { fontSize: typography.sizes.xxl, lineHeight: typography.sizes.xxl * 1.25 } satisfies TextStyle,
  xl: { fontSize: typography.sizes.xl, lineHeight: typography.sizes.xl * 1.4 } satisfies TextStyle,
  lg: { fontSize: typography.sizes.lg, lineHeight: typography.sizes.lg * 1.6 } satisfies TextStyle,
  md: { fontSize: typography.sizes.md, lineHeight: typography.sizes.md * 1.65 } satisfies TextStyle,
  sm: { fontSize: typography.sizes.sm, lineHeight: typography.sizes.sm * 1.5 } satisfies TextStyle,
  xs: { fontSize: typography.sizes.xs, lineHeight: typography.sizes.xs * 1.5 } satisfies TextStyle,
  xxs: { fontSize: typography.sizes.xs * 0.9, lineHeight: typography.sizes.xs * 1.5 } satisfies TextStyle,
}

// system-font weights: real fontWeight values, keyed by semantic name
const $fontWeightStyles = Object.entries(typography.primary).reduce((acc, [weight, value]) => {
  return { ...acc, [weight]: { fontWeight: value } }
}, {}) as Record<Weights, TextStyle>

const $baseStyle: ThemedStyle<TextStyle> = (theme) => ({
  ...$sizeStyles.sm,
  ...$fontWeightStyles.normal,
  color: theme.colors.text,
})

const $presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseStyle],
  bold: [$baseStyle, { ...$fontWeightStyles.bold }],
  // headings use the brand display face (Space Grotesk); weight comes from the
  // family, so no fontWeight needed
  heading: [$baseStyle, { ...$sizeStyles.xxl, fontFamily: typography.display.semiBold }],
  subheading: [$baseStyle, { ...$sizeStyles.lg, fontFamily: typography.display.medium }],
  formLabel: [$baseStyle, { ...$fontWeightStyles.medium }],
  formHelper: [$baseStyle, { ...$sizeStyles.sm, ...$fontWeightStyles.normal }],
}
const $rtlStyle: TextStyle = isRTL ? { writingDirection: "rtl" } : {}
