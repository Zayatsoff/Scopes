import { useEffect, useState, useCallback } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import {
  CloudSun,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
} from "lucide-react-native"
import { XMLParser } from "fast-xml-parser"

interface WeatherData {
  temperature: string
  condition: string
}

interface WeatherDisplayProps {
  onRefresh?: (refreshFn: () => void) => void
}

export function WeatherDisplay({ onRefresh }: WeatherDisplayProps) {
  const { themed, theme } = useAppTheme()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("https://weather.gc.ca/rss/weather/45.403_-75.687_e.xml")
      if (!response.ok) {
        throw new Error(`Failed to fetch weather: ${response.status}`)
      }

      const xmlText = await response.text()
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      })

      const result = parser.parse(xmlText)

      // Find the current conditions entry
      const currentEntry = result.feed.entry.find(
        (entry: any) => entry.category?.["@_term"] === "Current Conditions",
      )

      if (!currentEntry) {
        throw new Error("Current conditions not found")
      }

      // Parse the summary HTML to extract temperature and condition
      const summary = currentEntry.summary["#text"] || currentEntry.summary

      // Extract temperature from the summary
      const tempMatch = summary.match(/<b>Temperature:<\/b>\s*([\-\+]?\d+\.?\d*)&deg;C/)
      const conditionMatch = summary.match(/<b>Condition:<\/b>\s*([^<]+)/)

      if (tempMatch && conditionMatch) {
        setWeather({
          temperature: tempMatch[1],
          condition: conditionMatch[1].trim(),
        })
      } else {
        throw new Error("Could not parse weather data")
      }
    } catch (err) {
      console.error("Error fetching weather:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  // Expose the refresh method to parent components if needed
  useEffect(() => {
    if (onRefresh) {
      onRefresh(fetchWeather)
    }
  }, [onRefresh, fetchWeather])

  // Return appropriate icon based on condition
  const getWeatherIcon = () => {
    if (!weather) return null

    const condition = weather.condition.toLowerCase()

    if (condition.includes("snow")) {
      return <CloudSnow size={22} color={theme.colors.weather} />
    } else if (condition.includes("rain") || condition.includes("shower")) {
      return <CloudRain size={22} color={theme.colors.weather} />
    } else if (condition.includes("thunder") || condition.includes("lightning")) {
      return <CloudLightning size={22} color={theme.colors.weather} />
    } else if (condition.includes("fog") || condition.includes("mist")) {
      return <CloudFog size={22} color={theme.colors.weather} />
    } else if (
      (condition.includes("cloud") && condition.includes("sun")) ||
      condition.includes("partly")
    ) {
      return <CloudSun size={22} color={theme.colors.weather} />
    } else if (condition.includes("cloud") || condition.includes("overcast")) {
      return <Cloud size={22} color={theme.colors.weather} />
    } else if (condition.includes("clear") || condition.includes("sunny")) {
      return <Sun size={22} color={theme.colors.weather} />
    } else {
      // Default icon
      return <CloudSun size={22} color={theme.colors.weather} />
    }
  }

  return (
    <View style={themed($container)}>
      {loading ? (
        <Text text="Loading..." style={themed($loadingText)} />
      ) : error ? (
        <View />
      ) : weather ? (
        <View style={themed($weatherContainer)}>
          {getWeatherIcon()}
          <Text text={`${weather.temperature}°C`} style={themed($temperatureText)} />
        </View>
      ) : (
        <View />
      )}
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
  justifyContent: "center",
})

const $weatherContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $temperatureText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: typography.sizes.sm,
  fontWeight: "600",
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontSize: typography.sizes.xs,
})
