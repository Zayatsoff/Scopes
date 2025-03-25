import React, { useRef, useState } from "react"
import { View, FlatList, Dimensions, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "@/navigators/AppNavigator"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"

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

  const goToMainTabs = () => {
    navigation.replace("MainTabs")
  }

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  const renderSlide = ({ item }: { item: (typeof slides)[0] }) => {
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
                style={[styles.dot, i === currentIndex ? styles.activeDot : styles.inactiveDot]}
              />
            ))}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.key}
        onEndReached={goToMainTabs}
        onEndReachedThreshold={0.1}
      />

      <TouchableOpacity style={styles.skipButton} onPress={goToMainTabs}>
        <Text style={[styles.skipText, { color: theme.colors.tint }]}>Skip</Text>
      </TouchableOpacity>
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
    borderRadius: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
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
})
