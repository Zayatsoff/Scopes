import React, { useEffect } from "react"
import { View, ActivityIndicator, Animated, Image } from "react-native"
import * as ExpoSplashScreen from "expo-splash-screen"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/utils/useAppTheme"
import * as storage from "@/utils/storage"
import type { ThemedStyle } from "@/theme"

// Prevent the native splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync()

// The key used for navigation persistence
const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { themed, theme } = useAppTheme()
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  useEffect(() => {
    async function init() {
      try {
        // Clear any saved navigation state to ensure intro always appears
        await storage.remove(NAVIGATION_PERSISTENCE_KEY)
      } catch (error) {
        console.log("Error clearing navigation state:", error)
      }

      // Animate logo fading in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start()

      // Simulate loading or initialization
      setTimeout(async () => {
        // Hide the native splash screen
        await ExpoSplashScreen.hideAsync()
        // Always navigate to the Intro screen
        navigation.reset({
          index: 0,
          routes: [{ name: "Intro" }],
        })
      }, 2500)
    }
    init()
  }, [navigation, fadeAnim])

  return (
    <View style={themed($container)}>
      <Animated.View style={[{ opacity: fadeAnim }, themed($logoContainer)]}>
        <Image
          source={require("../../assets/images/app-icon-android-adaptive-foreground.png")}
          style={themed($logo)}
          resizeMode="contain"
        />
      </Animated.View>
      <ActivityIndicator size="large" color={theme.colors.tint} style={themed($spinner)} />
    </View>
  )
}

// -----------------------
// Themed style definitions
// -----------------------

const $container: ThemedStyle<any> = ({ colors }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
})

const $logoContainer: ThemedStyle<any> = () => ({
  alignItems: "center",
})

const $logo: ThemedStyle<any> = ({ spacing }) => ({
  width: 160,
  height: 160,
  marginBottom: spacing.xl,
})

const $spinner: ThemedStyle<any> = ({ spacing }) => ({
  marginTop: spacing.lg,
})
