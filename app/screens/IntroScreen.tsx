import React, { useRef, useState } from "react"
import { View, FlatList, Dimensions, TouchableOpacity, Animated } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList } from "@/navigators/AppNavigator"
import { Screen, Text } from "@/components"
import { useAppTheme } from "@/utils/useAppTheme"
import { ChevronRight } from "lucide-react-native"
import type { ThemedStyle } from "@/theme"

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
  const { themed, theme } = useAppTheme()
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
      <View style={themed($slide)}>
        <View style={themed($topSection)}>
          <View style={themed($imagePlaceholder)} />
        </View>

        <View style={themed($bottomSection)}>
          <Text preset="heading" style={themed($heading)}>
            {item.heading}
          </Text>
          <Text preset="default" style={themed($description)}>
            {item.description}
          </Text>

          <View style={themed($indicatorContainer)}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  themed($dot),
                  i === currentIndex ? themed($activeDot) : themed($inactiveDot),
                ]}
              />
            ))}
          </View>

          {isLastSlide && (
            <TouchableOpacity
              style={themed($getStartedButton)}
              onPress={goToMainTabs}
            >
              <Text style={themed($getStartedText)}>Get Started</Text>
              <ChevronRight color="white" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={themed($container)}>
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
        <TouchableOpacity style={themed($skipButton)} onPress={goToMainTabs}>
          <Text style={themed($skipText)}>Skip</Text>
        </TouchableOpacity>
      )}

      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={themed($nextButton)}
          onPress={goToNextSlide}
        >
          <ChevronRight color="white" size={20} />
        </TouchableOpacity>
      )}
    </View>
  )
}

// -----------------------
// Themed style definitions
// -----------------------

const $container: ThemedStyle<Animated.AnimatedProps<any>> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $slide: ThemedStyle<any> = () => ({
  width: width,
  height: height,
  flex: 1,
})

const $topSection: ThemedStyle<any> = () => ({
  height: height * 0.6,
  justifyContent: "center",
  alignItems: "center",
})

const $bottomSection: ThemedStyle<any> = () => ({
  height: height * 0.4,
  paddingHorizontal: 30,
  justifyContent: "flex-start",
  alignItems: "center",
})

const $imagePlaceholder: ThemedStyle<any> = () => ({
  width: 200,
  height: 200,
  backgroundColor: "gray",
  borderRadius: 12,
})

const $heading: ThemedStyle<any> = () => ({
  fontSize: 28,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 20,
})

const $description: ThemedStyle<any> = () => ({
  fontSize: 16,
  textAlign: "center",
  marginBottom: 40,
  lineHeight: 24,
})

const $indicatorContainer: ThemedStyle<any> = () => ({
  flexDirection: "row",
  justifyContent: "center",
  marginBottom: 30,
})

const $dot: ThemedStyle<any> = () => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  marginHorizontal: 5,
})

const $activeDot: ThemedStyle<any> = ({ colors }) => ({
  backgroundColor: colors.tint,
})

const $inactiveDot: ThemedStyle<any> = () => ({
  backgroundColor: "#ccc",
})

const $skipButton: ThemedStyle<any> = () => ({
  position: "absolute",
  left: 20,
  bottom: 40,
  padding: 10,
  zIndex: 999,
})

const $skipText: ThemedStyle<any> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "bold",
  color: colors.tint,
})

const $nextButton: ThemedStyle<any> = ({ colors }) => ({
  position: "absolute",
  right: 20,
  bottom: 40,
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
})

const $getStartedButton: ThemedStyle<any> = ({ colors }) => ({
  flexDirection: "row",
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 30,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 20,
})

const $getStartedText: ThemedStyle<any> = () => ({
  color: "white",
  fontSize: 16,
  fontWeight: "bold",
  marginRight: 8,
})
