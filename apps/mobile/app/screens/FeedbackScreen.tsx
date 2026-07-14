import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { 
  View, 
  ViewStyle, 
  TextStyle, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Keyboard,
  TouchableWithoutFeedback 
} from "react-native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { SettingsStackParamList } from "@/navigators/SettingsStack"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"
import { MessageSquare, SendHorizontal, ChevronLeft } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface FeedbackScreenProps extends NativeStackScreenProps<SettingsStackParamList, "Feedback"> {}

export const FeedbackScreen: FC<FeedbackScreenProps> = observer(function FeedbackScreen({ 
  navigation 
}) {
  const { themed, theme } = useAppTheme()
  const [feedback, setFeedback] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const insets = useSafeAreaInsets()

  // Setup the header - we'll use the navigation header pattern consistent with other screens
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // We'll add our own header
    })
  }, [navigation])

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert("Error", "Please enter your feedback or request.")
      return
    }

    setSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      Alert.alert(
        "Thank You!",
        "Your feedback has been submitted successfully.",
        [
          { 
            text: "OK", 
            onPress: () => {
              setFeedback("")
              setName("")
              setEmail("")
              navigation.goBack()
            }
          }
        ]
      )
    }, 1000)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Screen 
        style={themed($root)} 
        preset="scroll" 
        safeAreaEdges={[]}
        keyboardOffset={80}
      >
        {/* Header with back button */}
        <View style={[themed($header), { paddingTop: insets.top }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={themed($backButton)}
          >
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text text="Feedback and Requests" style={themed($headerText)} />
        </View>
        
        <View style={themed($section)}>
          <View style={themed($descriptionHeader)}>
            <MessageSquare size={22} color={theme.colors.palette.primary500} strokeWidth={2} />
            <Text text="Share Your Feedback" style={themed($descriptionText)} />
          </View>
          
          <Text style={themed($description)}>
            We appreciate your feedback and feature requests. Please let us know how we can improve your experience.
          </Text>
          
          <View style={themed($formContainer)}>
            <Text style={themed($label)}>Your Name (Optional)</Text>
            <TextInput
              style={themed($input)}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textDim}
              value={name}
              onChangeText={setName}
            />
            
            <Text style={themed($label)}>Your Email (Optional)</Text>
            <TextInput
              style={themed($input)}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textDim}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            
            <Text style={themed($label)}>Feedback or Request <Text style={themed($required)}>*</Text></Text>
            <TextInput
              style={themed($textArea)}
              placeholder="What would you like to tell us?"
              placeholderTextColor={theme.colors.textDim}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={feedback}
              onChangeText={setFeedback}
            />
            
            <TouchableOpacity 
              style={[
                themed($submitButton),
                submitting && themed($submitButtonDisabled)
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={themed($submitButtonText)}>Submit</Text>
              <SendHorizontal size={20} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    </TouchableWithoutFeedback>
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

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
  lineHeight: 20,
  paddingHorizontal: spacing.xs,
})

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.xs,
})

const $label: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
  fontWeight: "500",
})

const $required: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})

const $input: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.containerBackground,
  borderRadius: 8,
  padding: spacing.sm,
  marginBottom: spacing.md,
  color: colors.text,
})

const $textArea: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.containerBackground,
  borderRadius: 8,
  padding: spacing.sm,
  marginBottom: spacing.lg,
  height: 120,
  color: colors.text,
})

const $submitButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  borderRadius: 8,
  padding: spacing.sm,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  marginTop: spacing.sm,
})

const $submitButtonDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral500,
})

const $submitButtonText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.background,
  fontWeight: "600",
  marginRight: spacing.sm,
})

export default FeedbackScreen 