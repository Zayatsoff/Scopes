import React from "react"
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { Text } from "./Text"
import { ChevronRight } from "lucide-react-native"

const { width, height } = Dimensions.get("window")

export interface IntroSlideProps {
  index: number
  currentIndex: number
  totalSlides: number
  heading: string
  description: string
  onSkip: () => void
  onNext?: () => void
  fadeAnim?: Animated.Value
}

export function IntroSlide(props: IntroSlideProps) {
  const {
    index,
    currentIndex,
    totalSlides,
    heading,
    description,
    onSkip,
    onNext,
    fadeAnim = new Animated.Value(1),
  } = props
  const { theme } = useAppTheme()
  const isActive = index === currentIndex
  const isLastSlide = index === totalSlides - 1

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}
    >
      {/* Top: Image placeholder */}
      <View style={styles.top}>
        <View style={[styles.imagePlaceholder, { borderColor: theme.colors.border }]} />
      </View>

      {/* Bottom: Text, dots and navigation buttons */}
      <View style={styles.bottom}>
        <Text preset="heading" style={styles.heading}>
          {heading}
        </Text>
        <Text preset="default" style={styles.description}>
          {description}
        </Text>

        <View style={styles.indicatorContainer}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex
                  ? [styles.activeDot, { backgroundColor: theme.colors.tint }]
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {isLastSlide ? (
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: theme.colors.tint }]}
            onPress={onSkip}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <ChevronRight color="white" size={20} />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={[styles.skipText, { color: theme.colors.tint }]}>Skip</Text>
            </TouchableOpacity>
            {onNext && (
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: theme.colors.tint }]}
                onPress={onNext}
              >
                <ChevronRight color="white" size={20} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    flex: 1,
  },
  top: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "gray",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  bottom: {
    flex: 0.4,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginHorizontal: 5,
  },
  activeDot: { backgroundColor: "#3498db" },
  inactiveDot: { backgroundColor: "#ccc" },
  skipButton: {
    position: "absolute",
    left: 20,
    bottom: 40,
    padding: 10,
  },
  skipText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    width: 50,
    height: 50,
    borderRadius: 3,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedButton: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 3,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  getStartedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
})
