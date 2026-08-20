import { useRef, useState, useCallback } from "react"
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native"

// Default threshold for the pull distance that would trigger a refresh
const DEFAULT_PULL_THRESHOLD = 100

/**
 * Hook that tracks pull-to-refresh gesture progress
 *
 * @param threshold The threshold at which the refresh would trigger
 * @returns An object with progress value, scroll handler, and reset function
 */
export function usePullToRefreshProgress(threshold = DEFAULT_PULL_THRESHOLD) {
  const [progress, setProgress] = useState(0)
  const lastOffsetY = useRef(0)

  // Handle scroll events to track pull progress
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y

    // Only track progress when pulling down (negative offset)
    if (offsetY < 0) {
      // Calculate progress as a ratio of current pull distance to threshold
      // Clamp between 0 and 1
      const pullProgress = Math.min(Math.abs(offsetY) / threshold, 1)
      setProgress(pullProgress)
    } else {
      // Reset progress when not pulling
      setProgress(0)
    }

    lastOffsetY.current = offsetY
  }

  // Function to manually reset progress
  const resetProgress = useCallback(() => {
    setProgress(0)
  }, [])

  return {
    progress,
    onScroll,
    resetProgress,
  }
}
