import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"

export interface IntroSlideProps {
  index: number
  heading: string
  description: string
  onSkip: () => void
}

export function IntroSlide(props: IntroSlideProps) {
  const { index, heading, description, onSkip } = props
  const { theme } = useAppTheme()
  const totalSlides = 3

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top: Image placeholder */}
      <View style={styles.top}>
        <View style={styles.imagePlaceholder} />
      </View>

      {/* Bottom: Text, dots and skip button */}
      <View style={styles.bottom}>
        <Text style={[styles.heading]}>{heading}</Text>
        <Text style={[styles.description]}>{description}</Text>
        <View style={styles.indicatorContainer}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { flex: 0.6, justifyContent: "center", alignItems: "center" },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "gray",
  },
  bottom: {
    flex: 0.4,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: { textAlign: "center", marginBottom: 20 },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: { backgroundColor: "black" },
  inactiveDot: { backgroundColor: "lightgray" },
  skipButton: { position: "absolute", left: 20, bottom: 20 },
  skipText: { color: "blue", fontSize: 16 },
})
