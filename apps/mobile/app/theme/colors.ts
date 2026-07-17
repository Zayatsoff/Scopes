// warm-tinted light ramp (hue ~42, the brand terracotta). warmth lives in the
// neutrals + accent, not a heavy tint on the body bg
const palette = {
  neutral100: "#FFFFFF", // card surface
  neutral200: "#F9F6F5", // app background
  neutral300: "#EFE9E6",
  neutral400: "#E3DCDA", // hairline border
  neutral500: "#C9BFBA",
  neutral600: "#9B8E88", // muted / inactive
  neutral700: "#685A55", // secondary / dim text
  neutral800: "#3A2F2A",
  neutral900: "#1E130F", // primary text
  // hero photo scrim: transparent at the top so the photo reads, opaque white
  // toward the bottom so the city label/greeting stay legible over any image
  homeHeaderScrimStart: "rgba(255, 255, 255, 0)",
  homeHeaderScrimEnd: "rgba(255, 255, 255, 0.88)",

  primary100: "#F6E9E2",
  primary200: "#EACDBF",
  primary300: "#E0AD96",
  primary400: "#D68F72",
  primary500: "#C76542",
  primary600: "#A54F31",

  secondary100: "#E2E3ED",
  secondary200: "#C6C9DC",
  secondary300: "#9CA1BE",
  secondary400: "#7176A0",
  secondary500: "#41476E",

  // brand terracotta reserved for interaction (buttons, active nav, links)
  tint: "#B64C1B",

  accent100: "#862729",
  accent200: "#A83133",
  accent300: "#CA3B3D",
  accent400: "#EC4547",
  accent500: "#FF8688",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  // category colors: consistent, accessible set on white (each always paired
  // w/ an icon + label, never color alone)
  police: "#1F68BC",
  hydro: "#846500",
  traffic: "#A44D00",
  alert: "#AF3D34",
  weather: "#0077A9",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

export const colors = {
  palette,
  police: palette.police,
  hydro: palette.hydro,
  traffic: palette.traffic,
  alert: palette.alert,
  weather: palette.weather,
  transparent: "rgba(0, 0, 0, 0)",
  cityName: palette.neutral800,
  text: palette.neutral900,
  textDim: palette.neutral700,
  background: palette.neutral200,
  containerBackground: palette.neutral100,
  navForeground: palette.neutral900,
  border: palette.neutral400,
  tint: palette.tint,
  tintInactive: palette.neutral400,

  accent: palette.accent500,
  accentDim: palette.accent300,
  separator: palette.neutral400,
  error: palette.angry500,
  errorBackground: palette.angry100,
  // active tab icon sits on a terracotta pill -> light on-tint, muted when inactive
  navActive: palette.neutral100,
  navInactive: palette.neutral600,

  homeHeaderScrimStart: palette.homeHeaderScrimStart,
  homeHeaderScrimEnd: palette.homeHeaderScrimEnd,
} as const
