import { useState, useEffect } from "react"
import { useStores } from "@/models"

export const useHomeData = () => {
  const { 
    newsStore, 
    policeSummaryStore, 
    weatherAlertStore, 
    weatherSummaryStore, 
    trafficSummaryStore,
    cityStatusStore,
    ottawaAlertStore,
    api
  } = useStores()
  
  const [refreshing, setRefreshing] = useState(false)

  // Data fetching functions
  const fetchInitialData = () => {
    // Fetch news if we don't have any yet
    if (newsStore.items.length === 0) {
      newsStore.fetchNews(api)
    }
    
    // Fetch police summaries
    policeSummaryFetch()
    
    // Fetch weather alerts (for Alerts screen)
    weatherAlertFetch()
    
    // Fetch weather summaries (for Home screen)
    weatherSummaryFetch()
    
    // Fetch traffic summaries
    trafficSummaryFetch()
    
    // Fetch city status information
    cityStatusFetch()

    // Fetch the city banner alert
    ottawaAlertFetch()
  }

  // Fetch police summaries
  const policeSummaryFetch = () => {
    if (policeSummaryStore.items.length === 0) {
      policeSummaryStore.fetchPoliceSummaries(api)
    }
  }
  
  // Fetch weather alerts
  const weatherAlertFetch = () => {
    if (weatherAlertStore.items.length === 0) {
      weatherAlertStore.fetchWeatherAlerts(api)
    }
  }
  
  // Fetch weather summaries
  const weatherSummaryFetch = () => {
    if (weatherSummaryStore.items.length === 0) {
      weatherSummaryStore.fetchWeatherSummaries(api)
    }
  }
  
  // Fetch traffic summaries
  const trafficSummaryFetch = () => {
    if (trafficSummaryStore.items.length === 0) {
      trafficSummaryStore.fetchTrafficSummaries(api)
    }
  }

  // Fetch city status
  const cityStatusFetch = () => {
    if (cityStatusStore.items.length === 0) {
      cityStatusStore.fetchCityStatus(api)
      
      // Add school bus item directly for testing (you may want to remove this in production)
      setTimeout(() => {
        cityStatusStore.addSchoolBusItem()
      }, 2000)
    }
  }
  
  // Fetch the city banner alert
  const ottawaAlertFetch = () => {
    if (ottawaAlertStore.items.length === 0) {
      ottawaAlertStore.fetchOttawaAlerts(api)
    }
  }

  // Execute data refreshing
  const refreshData = async (weatherDisplayRefresh?: () => void) => {
    try {
      setRefreshing(true)
      // Only refresh summaries and news, not alerts when pulling down on Home screen
      await Promise.all([
        newsStore.refreshNews(api),
        policeSummaryStore.refreshPoliceSummaries(api),
        weatherSummaryStore.refreshWeatherSummaries(api),
        trafficSummaryStore.refreshTrafficSummaries(api),
        cityStatusStore.refreshCityStatus(api),
        ottawaAlertStore.fetchOttawaAlerts(api)
      ])
      
      // Also refresh weather display if provided
      if (weatherDisplayRefresh) {
        weatherDisplayRefresh()
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  return {
    stores: {
      newsStore,
      policeSummaryStore,
      weatherAlertStore,
      weatherSummaryStore,
      trafficSummaryStore,
      cityStatusStore,
      ottawaAlertStore
    },
    refreshing,
    fetchInitialData,
    refreshData
  }
} 