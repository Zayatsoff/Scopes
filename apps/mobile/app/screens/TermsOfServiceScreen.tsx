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

interface TermsOfServiceScreenProps extends NativeStackScreenProps<
  SettingsStackParamList,
  "TermsOfService"
> {}

const sections: { heading: string; body: string }[] = [
  {
    heading: "What Scopes is",
    body: "Scopes brings together Ottawa's weather, traffic, police activity, city services, and local news into one dashboard. By using the app, you agree to these terms.",
  },
  {
    heading: "Not an emergency service",
    body: "Scopes is for everyday awareness, not for emergencies. In an emergency, call 911. For official, authoritative alerts, always check the source directly — the City of Ottawa, Ottawa Police, or Environment Canada.",
  },
  {
    heading: "Accuracy of information",
    body: "Every signal in Scopes is drawn from a real public source; we never fabricate or simulate data to fill a gap. That said, we're aggregating third-party feeds we don't control, and those sources can lag, go down, or be wrong. Don't treat anything in the app as a substitute for the official source when a decision actually matters.",
  },
  {
    heading: "Acceptable use",
    body: "Scopes is for personal, non-commercial use. Please don't reverse-engineer the app, scrape or redistribute its content at scale, or use it in a way that disrupts the service for other residents.",
  },
  {
    heading: "Third-party links",
    body: "Some screens link out to official sources we don't operate, like the Hydro Ottawa outage map. Once you leave Scopes, that site's own terms apply.",
  },
  {
    heading: "No warranty",
    body: "Scopes is provided as-is, without warranties of any kind. We work to keep it reliable, but we can't guarantee it will always be available, accurate, or error-free.",
  },
  {
    heading: "Limitation of liability",
    body: "To the extent permitted by law, Scopes isn't liable for decisions made based on information in the app, including missed or delayed alerts.",
  },
  {
    heading: "Changes",
    body: "We may update the app or these terms as Scopes evolves. Material changes will be reflected here with an updated date.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by the laws of the Province of Ontario, Canada.",
  },
  {
    heading: "Contact",
    body: "Questions about these terms can be sent through Feedback and Requests in Settings.",
  },
]

export const TermsOfServiceScreen: FC<TermsOfServiceScreenProps> = observer(
  function TermsOfServiceScreen({ navigation }) {
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
          <Text text="Terms of Service" style={themed($headerText)} />
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
