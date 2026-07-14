import React, { useState, useEffect, ReactNode, useMemo } from "react"
import { View, ViewStyle, Dimensions } from "react-native"
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  useSharedValue, 
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
  cancelAnimation,
  useDerivedValue
} from "react-native-reanimated"
import { GestureDetector, Gesture } from "react-native-gesture-handler"
import { useAppTheme } from "@/utils/useAppTheme"
import type { ThemedStyle } from "@/theme"

export interface TabViewProps<T extends string> {
  children: ReactNode
  activeTab: T
  setActiveTab: (tab: T) => void
  tabs: readonly T[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
  containerLayout: { width: number, height: number }
  onBeforeTabChange?: (prevIndex: number, nextIndex: number) => void
  disableSwipe?: boolean
}

export function SwipeableTabView<T extends string>({
  children,
  activeTab,
  setActiveTab,
  tabs,
  currentIndex,
  setCurrentIndex,
  containerLayout,
  onBeforeTabChange,
  disableSwipe = false
}: TabViewProps<T>) {
  const { themed } = useAppTheme()
  const { width: screenWidth } = Dimensions.get("window")
  const [isReady, setIsReady] = useState(false)

  // Animation values for swipe
  const translateX = useSharedValue(0)
  const prevTranslateX = useSharedValue(0)
  const isAnimating = useSharedValue(false)
  const activeIndex = useSharedValue(currentIndex)
  const scrollEnabled = useSharedValue(true)
  
  // Animation constants
  const offscreenRight = containerLayout.width || screenWidth
  const offscreenLeft = -(containerLayout.width || screenWidth)

  // Derive values for parallax and fade effects
  const tabOpacity = useDerivedValue(() => {
    return interpolate(
      Math.abs(translateX.value),
      [0, (containerLayout.width || screenWidth) * 0.8],
      [1, 0.5],
      Extrapolation.CLAMP
    )
  })

  const tabScale = useDerivedValue(() => {
    return interpolate(
      Math.abs(translateX.value),
      [0, containerLayout.width || screenWidth],
      [1, 0.96],
      Extrapolation.CLAMP
    )
  })

  // Update activeIndex when currentIndex changes
  useEffect(() => {
    activeIndex.value = currentIndex
    setIsReady(true)
  }, [currentIndex, activeIndex])

  // Handle tab change with optimized animation
  const handleTabChange = (tabId: T, animate = true) => {
    const prevIndex = currentIndex
    const newIndex = tabs.indexOf(tabId)
    
    // Don't do anything if it's the same tab
    if (prevIndex === newIndex) return
    
    // Callback before tab change
    if (onBeforeTabChange) {
      onBeforeTabChange(prevIndex, newIndex)
    }
    
    // Update state immediately
    setActiveTab(tabId)
    setCurrentIndex(newIndex)
    
    // Direction of transition (-1 = right to left, 1 = left to right)
    const direction = prevIndex < newIndex ? -1 : 1
    const startPosition = direction * (containerLayout.width || screenWidth)
    
    if (animate) {
      // Start animation sequence
      isAnimating.value = true
      scrollEnabled.value = false
      
      // Setup animation to start from offscreen position
      translateX.value = startPosition
      
      // Animate to centered position with optimized animation
      translateX.value = withTiming(
        0, 
        {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          // Mark animation as complete
          isAnimating.value = false
          scrollEnabled.value = true
        }
      )
    } else {
      // Jump to position without animation
      translateX.value = 0
      isAnimating.value = false
      scrollEnabled.value = true
    }
  }

  // Enhanced gesture handlers for more responsive swipe
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Don't start a new gesture if we're already animating
      if (isAnimating.value) return
      
      prevTranslateX.value = translateX.value
      cancelAnimation(translateX)
    })
    .onUpdate((event) => {
      // Don't track gesture if scrolling content
      if (!scrollEnabled.value) return

      // Check if the gesture is more vertical than horizontal
      // If the absolute vertical movement is greater than the horizontal movement,
      // consider it a vertical scroll gesture and ignore it
      const isVerticalSwipe = Math.abs(event.translationY) > Math.abs(event.translationX * 1.2)
      
      if (isVerticalSwipe) {
        // Set the scrollEnabled to false so the tab view doesn't respond to this gesture
        scrollEnabled.value = false
        // Reset translation to avoid unwanted horizontal movement
        translateX.value = 0
        return
      }
      
      // Apply the translation with a bit of resistance for better control
      translateX.value = prevTranslateX.value + event.translationX * 0.8
    })
    .onEnd((event) => {
      // Re-enable scrolling for next gesture
      scrollEnabled.value = true
      
      // Check if the gesture had significant vertical movement
      const isVerticalSwipe = Math.abs(event.translationY) > Math.abs(event.translationX * 1.2)
      
      if (isVerticalSwipe) {
        // If it was primarily a vertical swipe, don't change tabs
        translateX.value = withTiming(0, { duration: 150 })
        return
      }

      const currentIdx = activeIndex.value
      const maxIndex = tabs.length - 1
      
      // More sensitive thresholds for switching, but with direction check
      const threshold = (containerLayout.width || screenWidth) * 0.2 // 20% of width to trigger
      const velocityThreshold = 400 // Velocity threshold for intentional swipes
      
      const shouldGoToNextTab = 
        (translateX.value < -threshold || event.velocityX < -velocityThreshold) && 
        currentIdx < maxIndex &&
        Math.abs(event.velocityX) > Math.abs(event.velocityY) // Ensure horizontal velocity dominates
        
      const shouldGoToPrevTab = 
        (translateX.value > threshold || event.velocityX > velocityThreshold) && 
        currentIdx > 0 &&
        Math.abs(event.velocityX) > Math.abs(event.velocityY) // Ensure horizontal velocity dominates
      
      if (shouldGoToNextTab) {
        // Go to next tab with optimized animation
        isAnimating.value = true
        const nextIndex = currentIdx + 1
        
        // Use timing animation which can be faster than spring
        translateX.value = withTiming(
          offscreenLeft, 
          { duration: 150 }, // Super quick transition
          () => {
            runOnJS(handleTabChange)(tabs[nextIndex], false)
          }
        )
      } else if (shouldGoToPrevTab) {
        // Go to previous tab with optimized animation
        isAnimating.value = true
        const prevIndex = currentIdx - 1
        
        // Use timing animation which can be faster than spring
        translateX.value = withTiming(
          offscreenRight, 
          { duration: 150 }, // Super quick transition
          () => {
            runOnJS(handleTabChange)(tabs[prevIndex], false)
          }
        )
      } else {
        // Return to center with timing for predictable animation
        translateX.value = withTiming(0, { 
          duration: 150,
          easing: Easing.out(Easing.cubic),
        })
      }
    })
    .minDistance(10) // Increased minimum distance to detect intentional swipes
    .activeOffsetX([-15, 15]) // Only activate after moving 15px horizontally
    .failOffsetY([-10, 10]) // Fail the gesture if there's 10px of vertical movement first
    .enabled(!disableSwipe && isReady)

  // Enhanced animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: tabScale.value }
      ],
      opacity: tabOpacity.value,
    }
  })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[themed($contentContainer), contentAnimatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  )
}

// Styles
const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  width: "100%",
  flexGrow: 1,
  height: "100%"
}) 