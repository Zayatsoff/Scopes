import { FC } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { SettingsStackParamList } from "@/navigators/SettingsStack"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { ChevronLeft } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface PrivacyPolicyScreenProps extends NativeStackScreenProps<
  SettingsStackParamList,
  "PrivacyPolicy"
> {}

const sections: { heading: string; body: string }[] = [
  {
    heading: "What Scopes collects",
    body: "Scopes doesn't require an account or sign-in. The information it can access depends entirely on the toggles in Settings: your device location if Auto-detect Location is on (used only to confirm you're viewing Ottawa, never stored on a server), anonymous usage analytics if Send Anonymous Analytics is on, a device push token if notifications are enabled, and browsing history on this device if Save Browsing History is on. If you turn a toggle off, that category of information isn't collected going forward.",
  },
  {
    heading: "What it's used for",
    body: "Location confirms you're seeing Ottawa-relevant weather, traffic, police, and news. Anonymous analytics, when enabled, help us understand which parts of the app are reliable and which aren't — this data can't be traced back to you. Push tokens deliver the alert notifications you've opted into. If you write in through Feedback and Requests, we use your message (and your name or email only if you choose to include them) solely to respond to you.",
  },
  {
    heading: "What we don't do",
    body: "We don't sell personal data, and we don't build advertising profiles. Every civic signal shown in Scopes — weather, traffic, police activity, city services, news — traces back to a real public source; we never fabricate or simulate data to fill a gap. Where we can't verify something ourselves, like Hydro Ottawa outages, the app links out to the official source instead of guessing.",
  },
  {
    heading: "Third-party sources",
    body: "Weather, traffic, police, and news content is drawn from public feeds and news publishers who have their own data practices. When Scopes links out to an official site (for example, the Hydro Ottawa outage map), that site's own privacy policy applies once you leave the app.",
  },
  {
    heading: "Your control",
    body: "Every data category above can be turned off individually in Settings at any time. Uninstalling Scopes removes everything stored on your device, including any locally saved history or preferences.",
  },
  {
    heading: "Children",
    body: "Scopes is a general-audience civic information app and isn't directed at children under 13. We don't knowingly collect information from children.",
  },
  {
    heading: "Changes to this policy",
    body: "If this policy changes in a way that affects what we collect or how we use it, we'll update this screen and adjust the date below.",
  },
  {
    heading: "Contact",
    body: "Questions about this policy can be sent through Feedback and Requests in Settings.",
  },
]

export const PrivacyPolicyScreen: FC<PrivacyPolicyScreenProps> = observer(
  function PrivacyPolicyScreen({ navigation }) {
    const { themed, theme } = useAppTheme()
    const insets = useSafeAreaInsets()

    return (
      <Screen
        style={themed($root)}
        contentContainerStyle={themed($content)}
        preset="scroll"
        safeAreaEdges={[]}
      >
        <View style={[themed($header), { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={themed($backButton)}>
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text text="Privacy Policy" style={themed($headerText)} />
        </View>

        <Text text="Effective July 15, 2026" style={themed($effectiveDate)} />

        {sections.map((section) => (
          <View key={section.heading} style={themed($section)}>
            <Text text={section.heading} style={themed($sectionHeading)} />
            <Text text={section.body} style={themed($sectionBody)} />
          </View>
        ))}
      </Screen>
    )
  },
)

const $root: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.background,
  paddingHorizontal: spacing.md,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
})

const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingBottom: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $headerText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: typography.sizes.lg,
  fontWeight: "600",
  color: colors.text,
  marginLeft: spacing.sm,
})

const $effectiveDate: ThemedStyle<TextStyle> = ({ colors, spacing, typography }) => ({
  color: colors.textDim,
  fontSize: typography.sizes.sm,
  marginTop: spacing.md,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $sectionHeading: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.text,
  fontSize: typography.sizes.md,
  fontWeight: "600",
  marginBottom: spacing.xs,
})

const $sectionBody: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: typography.sizes.sm,
  lineHeight: typography.sizes.sm * 1.5,
})
