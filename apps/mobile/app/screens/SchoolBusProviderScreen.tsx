import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { SettingsStackParamList } from "@/navigators/SettingsStack"
import { Screen, Text, ListItem } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { Check, Bus, ChevronLeft } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface SchoolBusProviderScreenProps extends NativeStackScreenProps<SettingsStackParamList, "SchoolBusProvider"> {}

// Define the available providers
const PROVIDERS = [
  { id: "OSTA", name: "OSTA: Ottawa Student Transportation" },
  { id: "DriveYellow", name: "DriveYellow" },
  { id: "SwitzerCarty", name: "Switzer-Carty Transportation" },
  { id: "STEO", name: "STEO" }
]

export const SchoolBusProviderScreen: FC<SchoolBusProviderScreenProps> = observer(function SchoolBusProviderScreen({ 
  navigation, 
  route 
}) {
  const { themed, theme } = useAppTheme()
  const { currentProvider, onSelect } = route.params
  const insets = useSafeAreaInsets()

  // Setup the header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // We'll add our own header
    })
  }, [navigation])

  const handleProviderSelect = (providerId: string) => {
    onSelect(providerId)
    navigation.goBack()
  }

  // Helper function to render radio button
  const renderRadioButton = (isSelected: boolean) => {
    return (
      <View style={themed($iconContainer)}>
        <View style={[
          themed($radioOuter),
          isSelected && themed($radioOuterSelected)
        ]}>
          {isSelected && (
            <View style={themed($radioInner)}>
              <Check size={14} color={theme.colors.background} strokeWidth={3} />
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <Screen 
      style={themed($root)} 
      preset="scroll" 
      safeAreaEdges={[]}
    >
      {/* Header with back button */}
      <View style={[themed($header), { paddingTop: insets.top }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={themed($backButton)}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text text="School Bus Provider" style={themed($headerText)} />
      </View>

      {/* Provider description */}
      <View style={themed($section)}>
        <View style={themed($descriptionHeader)}>
          <Bus size={22} color={theme.colors.palette.primary500} strokeWidth={2} />
          <Text text="Select Your School Bus Provider" style={themed($descriptionText)} />
        </View>
        
        {/* Provider options */}
        {PROVIDERS.map((provider, index) => (
          <ListItem
            key={provider.id}
            text={provider.name}
            textStyle={themed($listItemText)}
            bottomSeparator={index < PROVIDERS.length - 1}
            containerStyle={themed($listItemContainer)}
            onPress={() => handleProviderSelect(provider.id)}
            RightComponent={renderRadioButton(currentProvider === provider.id)}
          />
        ))}
      </View>
    </Screen>
  )
})

// Styles
const $root: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.background,
  paddingHorizontal: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingBottom: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $headerText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: typography.sizes.lg,
  fontWeight: "600",
  color: colors.text,
  marginLeft: spacing.sm,
})

const $backButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  marginTop: spacing.md,
})

const $descriptionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.md,
  paddingHorizontal: spacing.xs,
})

const $descriptionText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontWeight: "500",
  marginLeft: spacing.sm,
})

const $listItemContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
})

const $listItemText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.sm,
  justifyContent: "center",
})

const $radioOuter: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
})

const $radioOuterSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.primary500,
  backgroundColor: colors.palette.primary500,
})

const $radioInner: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  justifyContent: "center",
})

export default SchoolBusProviderScreen 