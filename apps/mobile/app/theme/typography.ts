import { Platform } from "react-native"
import {
  SpaceGrotesk_300Light as spaceGroteskLight,
  SpaceGrotesk_400Regular as spaceGroteskRegular,
  SpaceGrotesk_500Medium as spaceGroteskMedium,
  SpaceGrotesk_600SemiBold as spaceGroteskSemiBold,
  SpaceGrotesk_700Bold as spaceGroteskBold,
} from "@expo-google-fonts/space-grotesk"

export const customFontsToLoad = {
  spaceGroteskLight,
  spaceGroteskRegular,
  spaceGroteskMedium,
  spaceGroteskSemiBold,
  spaceGroteskBold,
}

const fonts = {
  spaceGrotesk: {
    // brand display face. each weight is its own loaded family (RN wont
    // synthesize weight from a named family), so drive weight by picking the
    // family, not fontWeight
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

// body / UI runs on the platform system font (SF on iOS): reliable weight
// synthesis + a native feel. these are real fontWeight values, not families
const weights = {
  light: "300",
  normal: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
} as const

export const typography = {
  /**
   * The raw font families. Prefer the semantic names below.
   */
  fonts,
  /**
   * System-font weight values, keyed by semantic weight name.
   */
  weights,
  /**
   * The primary UI type: system font, weight-driven. Used across body, labels,
   * and controls.
   */
  primary: weights,
  /**
   * The brand display face (Space Grotesk). Reserved for expressive moments:
   * the home hero, screen titles, section headers.
   */
  display: fonts.spaceGrotesk,
  /**
   * An alternate system font used in a few places.
   */
  secondary: Platform.select({ ios: fonts.helveticaNeue, android: fonts.sansSerif }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
  /**
   * Font sizes
   */
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
}
