import React, { useRef, useState } from "react"
import { View, FlatList, Dimensions, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "@/navigators/AppNavigator"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { ChevronRight } from "lucide-react-native"

const { width, height } = Dimensions.get("window")

const slides = [
  {
    key: "1",
    heading: "Let's get started!",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. (Slide 1)",
  },
  {
    key: "2",
    heading: "Discover Features",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. (Slide 2)",
  },
  {
    key: "3",
    heading: "Enjoy the Experience",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. (Slide 3)",
  },
]

export function IntroScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { theme } = useAppTheme()
  const scrollX = useRef(new Animated.Value(0)).current

  const goToMainTabs = () => {
    navigation.replace("MainTabs")
  }

  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      goToMainTabs()
    }
  }

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  })

  const handleMomentumScrollEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  const renderSlide = ({ item, index }: { item: (typeof slides)[0]; index: number }) => {
    const isLastSlide = index === slides.length - 1

    return (
      <View style={styles.slide}>
        <View style={styles.topSection}>
          <View style={styles.imagePlaceholder} />
        </View>

        <View style={styles.bottomSection}>
          <Text preset="heading" style={styles.heading}>
            {item.heading}
          </Text>
          <Text preset="default" style={styles.description}>
            {item.description}
          </Text>

          <View style={styles.indicatorContainer}>
            {slides.map((_, i) => (
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

          {isLastSlide && (
            <TouchableOpacity
              style={[styles.getStartedButton, { backgroundColor: theme.colors.tint }]}
              onPress={goToMainTabs}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={(item) => item.key}
        bounces={false}
      />

      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={goToMainTabs}>
          <Text style={[styles.skipText, { color: theme.colors.tint }]}>Skip</Text>
        </TouchableOpacity>
      )}

      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.tint }]}
          onPress={goToNextSlide}
        >
          <ChevronRight color="white" size={20} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width: width,
    height: height,
    flex: 1,
  },
  topSection: {
    height: height * 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSection: {
    height: height * 0.4,
    paddingHorizontal: 30,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "gray",
    borderRadius: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#3498db",
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
  skipButton: {
    position: "absolute",
    left: 20,
    bottom: 40,
    padding: 10,
    zIndex: 999,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  nextButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  getStartedButton: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
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
