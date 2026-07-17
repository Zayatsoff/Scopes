// warm-tinted dark ramp (hue ~42, the brand terracotta). depth comes from
// surface lightness, not shadow: bg (darkest) -> surface -> elevated -> border
const palette = {
  neutral900: "#F4F1F0", // primary text
  neutral800: "#B2A8A5", // secondary / dim text
  neutral700: "#93867F",
  neutral600: "#6E635E", // muted / inactive
  neutral500: "#48403D", // hairline border
  neutral400: "#322C2A", // elevated surface / subtle divider
  neutral300: "#221D1B", // card surface
  neutral200: "#13100E", // app background
  neutral100: "#0C0A09", // deepest

  primary600: "#F4E0D9",
  primary500: "#E8C1B4",
  primary400: "#DDA28E",
  primary300: "#D28468",
  primary200: "#C76542",
  primary100: "#A54F31",

  secondary500: "#DCDDE9",
  secondary400: "#BCC0D6",
  secondary300: "#9196B9",
  secondary200: "#626894",
  secondary100: "#41476E",
  // hero photo scrim: transparent at the top so the photo reads, opaque black
  // toward the bottom so the city label/greeting stay legible over any image
  homeHeaderScrimStart: "rgba(0, 0, 0, 0)",
  homeHeaderScrimEnd: "rgba(0, 0, 0, 0.6)",

  // brand terracotta reserved for interaction (buttons, active nav, links)
  tint: "#C66843",

  accent500: "#862729",
  accent400: "#A83133",
  accent300: "#CA3B3D",
  accent200: "#EC4547",
  accent100: "#F6484B",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  // category colors: one consistent muted, accessible set on the dark surface
  // (each always paired w/ an icon + label, never color alone)
  police: "#7EB1F3",
  hydro: "#C6AD4C",
  traffic: "#E19D63",
  alert: "#DF695C",
  weather: "#54BCE2",

  overlay20: "rgba(12, 10, 9, 0.2)",
  overlay50: "rgba(12, 10, 9, 0.5)",
} as const

export const colors = {
  palette,
  police: palette.police,
  hydro: palette.hydro,
  traffic: palette.traffic,
  alert: palette.alert,
  weather: palette.weather,
  transparent: "rgba(0, 0, 0, 0)",
  cityName: palette.neutral900,
  text: palette.neutral900,
  textDim: palette.neutral800,
  background: palette.neutral200,
  containerBackground: palette.neutral300,
  navForeground: palette.neutral900,
  border: palette.neutral500,
  tint: palette.tint,
  tintInactive: palette.neutral600,
  accent: palette.accent100,
  accentDim: palette.accent300,
  separator: palette.neutral400,
  error: palette.angry500,
  errorBackground: palette.angry100,
  navActive: palette.neutral900,
  navInactive: palette.neutral700, // dim but still >=3:1 on the tab-bar surface
  homeHeaderScrimStart: palette.homeHeaderScrimStart,
  homeHeaderScrimEnd: palette.homeHeaderScrimEnd,
} as const
