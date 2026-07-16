import { FC } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle } from "react-native"
import { Screen, ListItem, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { ChevronLeft, Heart, Code, Palette, Package } from "lucide-react-native"
import type { ThemedStyle } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { TouchableOpacity } from "react-native"
import type { SettingsStackParamList } from "@/navigators/SettingsStack"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const AboutScreen: FC = observer(function AboutScreen() {
  const { themed, theme } = useAppTheme()
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>()
  const insets = useSafeAreaInsets()

  // Helper function to render Lucide icon with consistent styling
  const renderIcon = (Icon: any, color?: string) => {
    return (
      <View style={themed($iconContainer(theme))}>
        <Icon size={22} color={color} strokeWidth={2} />
      </View>
    )
  }

  return (
    <Screen style={themed($root(theme))} preset="scroll" safeAreaEdges={[]}>
      {/* Header with back button */}
      <View style={[themed($header(theme)), { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={themed($backButton(theme))}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text text="About" style={themed($headerText(theme))} />
      </View>

      {/* App Info Section */}
      <View style={themed($section(theme))}>
        <ListItem
          text="Version"
          textStyle={themed($listItemText(theme))}
          LeftComponent={renderIcon(Package, theme.colors.palette.primary500)}
          containerStyle={themed($listItemContainer(theme))}
          RightComponent={<Text text="1.0.0" style={themed($listItemText(theme))} />}
        />
      </View>

      {/* Team Section */}
      <View style={themed($section(theme))}>
        <ListItem
          text="Software Developer"
          textStyle={themed($listItemText(theme))}
          LeftComponent={renderIcon(Code, theme.colors.palette.secondary500)}
          bottomSeparator
          containerStyle={themed($listItemContainer(theme))}
          RightComponent={<Text text="Lior Rozin" style={themed($listItemText(theme))} />}
        />
        <ListItem
          text="UX/UI Designer"
          textStyle={themed($listItemText(theme))}
          LeftComponent={renderIcon(Palette, theme.colors.palette.secondary500)}
          containerStyle={themed($listItemContainer(theme))}
          RightComponent={<Text text="Tim Rozin" style={themed($listItemText(theme))} />}
        />
      </View>

      {/* Footer Message */}
      <View style={themed($footer(theme))}>
        <View style={themed($footerContent(theme))}>
          <Text text="Made in Ottawa with" style={themed($footerText(theme))} />
          <View style={themed($footerIconContainer(theme))}>
            <Heart size={16} color={theme.colors.palette.primary500} strokeWidth={2} />
          </View>
        </View>
      </View>
    </Screen>
  )
})

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
  paddingHorizontal: theme.spacing.md,
})

const $header: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: theme.spacing.sm,
  marginBottom: theme.spacing.md,
})

const $headerText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: theme.typography.sizes.lg,
  fontWeight: "600",
  marginLeft: theme.spacing.md,
})

const $backButton: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.xs,
})

const $section: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  marginBottom: theme.spacing.lg,
})

const $listItemContainer: ThemedStyle<ViewStyle> = (theme) => ({
  paddingVertical: theme.spacing.sm,
})

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  marginRight: theme.spacing.sm,
  justifyContent: "center",
})

const $listItemText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
})

const $footer: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  justifyContent: "flex-end",
  paddingBottom: theme.spacing.xl,
})

const $footerContent: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
})

const $footerText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: theme.typography.sizes.sm,
  opacity: 0.7,
})

const $footerIconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  marginLeft: theme.spacing.xxs,
  justifyContent: "center",
})
