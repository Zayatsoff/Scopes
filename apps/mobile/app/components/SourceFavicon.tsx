import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Text } from "./Text"

// Define the sources we have icons for
const FAVICON_SOURCES = {
  "cbc news": require("../../assets/favicons/cbc.png"),
  "cbc.ca": require("../../assets/favicons/cbc.png"),
  "global news": require("../../assets/favicons/globalnews.png"),
  "globalnews.ca": require("../../assets/favicons/globalnews.png"),
  "ctv news": require("../../assets/favicons/ctv.png"),
  "thestar.com": require("../../assets/favicons/torontostar.png"),
  "nationalpost": require("../../assets/favicons/nationalpost.png"),
  "ottawa.ca": require("../../assets/favicons/ottawa.png"),
  "ottawa business journal": require("../../assets/favicons/obj.png"),
  "obj.ca": require("../../assets/favicons/obj.png"),
  "ottawa citizen": require("../../assets/favicons/ottawacitizen.png"),
  "ottawacitizen.com": require("../../assets/favicons/ottawacitizen.png"),
}

export interface SourceFaviconProps {
  source: string
  size?: number
}

export function SourceFavicon({ source, size = 16 }: SourceFaviconProps) {
  const { themed } = useAppTheme()

  // Get domain from source (e.g., www.cbc.ca -> cbc.ca)
  const getDomain = (url: string) => {
    const domain = url.replace(/^www\./i, "").toLowerCase()
    return domain
  }

  // Find matching favicon or return null if not found
  const getFaviconSource = (domain: string) => {
    const cleanDomain = getDomain(domain)
    for (const [key, value] of Object.entries(FAVICON_SOURCES)) {
      if (cleanDomain.includes(key)) {
        return value
      }
    }
    return null
  }

  // Get the favicon source for the current domain
  const faviconSource = getFaviconSource(source)

  return (
    <View style={themed($container)}>
      {faviconSource ? (
        <Image
          source={faviconSource}
          style={[themed($favicon), { width: size, height: size }]}
          resizeMode="contain"
        />
      ) : (
        <Text style={themed($emojiText)} text="📰" />
      )}
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "center",
  alignItems: "center",
})

const $favicon: ThemedStyle<ImageStyle> = () => ({
  width: 16,
  height: 16,
})

const $emojiText: ThemedStyle<TextStyle> = () => ({
  fontSize: 14,
  lineHeight: 16,
  textAlign: "center",
})
