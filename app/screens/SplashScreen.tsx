import React, { useEffect } from "react"
import { View, ActivityIndicator, StyleSheet, Image } from "react-native"
import * as ExpoSplashScreen from "expo-splash-screen"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/utils/useAppTheme"
import * as storage from "@/utils/storage"

// Prevent the native splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync()

// The key used for navigation persistence
const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

export function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { theme } = useAppTheme()

  useEffect(() => {
    async function init() {
      try {
        // Clear any saved navigation state to ensure intro always appears
        await storage.remove(NAVIGATION_PERSISTENCE_KEY)
      } catch (error) {
        console.log("Error clearing navigation state:", error)
      }

      // Simulate loading or initialization
      setTimeout(async () => {
        // Hide the native splash screen
        await ExpoSplashScreen.hideAsync()
        // Always navigate to the Intro screen
        navigation.reset({
          index: 0,
          routes: [{ name: "Intro" }],
        })
      }, 2000)
    }
    init()
  }, [navigation])

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color={theme.colors.tint} style={styles.spinner} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  spinner: {
    marginTop: 20,
  },
})
