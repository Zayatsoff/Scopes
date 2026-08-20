import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import type { AssertExtends, GetSummariesResponseDTO, SummaryDTO } from "@scopes/shared-types"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatRelativeTime } from "@/utils/formatRelativeTime"
import { Api } from "@/services/api"

/**
 * Weather summary item model
 */
export const WeatherSummaryItemModel = types
  .model("WeatherSummaryItem")
  .props({
    id: types.identifier,
    section: types.enumeration(["Police", "Weather", "Traffic"] as const),
    date: types.string,
    summary: types.string,
    generatedAt: types.frozen(), // Complex object with _seconds and _nanoseconds
    formattedDate: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)

export interface WeatherSummaryItem extends Instance<typeof WeatherSummaryItemModel> {}
export interface WeatherSummaryItemSnapshotOut extends SnapshotOut<
  typeof WeatherSummaryItemModel
> {}
export interface WeatherSummaryItemSnapshotIn extends SnapshotIn<typeof WeatherSummaryItemModel> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _WeatherSummaryItemDriftCheck = AssertExtends<WeatherSummaryItemSnapshotOut, SummaryDTO>

/**
 * Weather summaries store model
 */
export const WeatherSummaryStoreModel = types
  .model("WeatherSummaryStore")
  .props({
    items: types.array(WeatherSummaryItemModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get latestSummary() {
      if (self.items.length === 0) return null
      // Find item with section = "Weather"
      const weatherItems = self.items.filter((item) => item.section === "Weather")
      return weatherItems.length > 0 ? weatherItems[0] : null
    },
  }))
  .actions((self) => ({
    fetchWeatherSummaries: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)

      try {
        // Call the getSummaries endpoint
        const response = await api.apisauce.get<GetSummariesResponseDTO>(
          "https://local-government-app-backend.vercel.app/api/getSummaries",
        )

        if (response.ok && response.data) {
          const summaries = response.data.summaries || []
          // Process the summaries data to add formatted dates
          const processedItems = summaries
            .filter((item) => item.section === "Weather") // Filter weather summaries only
            .map((item) => ({
              ...item,
              formattedDate: formatRelativeTime(item.date),
            }))

          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to fetch weather summaries")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    },

    refreshWeatherSummaries: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)

      try {
        const response = await api.apisauce.get<GetSummariesResponseDTO>(
          "https://local-government-app-backend.vercel.app/api/getSummaries",
        )

        if (response.ok && response.data) {
          const summaries = response.data.summaries || []
          // Process the summaries data to add formatted dates
          const processedItems = summaries
            .filter((item) => item.section === "Weather") // Filter weather summaries only
            .map((item) => ({
              ...item,
              formattedDate: formatRelativeTime(item.date),
            }))

          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to refresh weather summaries")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }

      return true // Return success indicator for the refresh control
    },
  }))

export interface WeatherSummaryStore extends Instance<typeof WeatherSummaryStoreModel> {}
export interface WeatherSummaryStoreSnapshotOut extends SnapshotOut<
  typeof WeatherSummaryStoreModel
> {}
export interface WeatherSummaryStoreSnapshotIn extends SnapshotIn<
  typeof WeatherSummaryStoreModel
> {}
