import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { StatusItem } from "@/components/CityStatus"
import { Api } from "@/services/api"

// Define the model for a single status item
export const CityStatusItemModel = types.model("CityStatusItem").props({
  id: types.identifier,
  title: types.string,
  link: types.string,
  icon: types.string,
  description: types.string,
  date: types.string,
  bool: types.boolean,
  status: types.maybe(types.string),
  scrapedAt: types.frozen({
    _seconds: 0,
    _nanoseconds: 0
  }),
})

// Define the store model
export const CityStatusStoreModel = types
  .model("CityStatusStore")
  .props({
    items: types.array(CityStatusItemModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybe(types.string),
  })
  .actions(withSetPropAction)
  .actions((store) => {
    // Define the action types first to prevent TypeScript errors
    const setLoading = (value: boolean) => {
      store.setProp("isLoading", value)
    }

    const setError = (value: string | undefined) => {
      store.setProp("error", value)
    }

    const addItems = (items: StatusItem[]) => {
      // Log incoming items
      console.log("CityStatus: Incoming items:", items.map(item => item.title));
      
      // Filter to include only items with titles matching our criteria
      const filteredItems = items.filter(
        (item) => {
          // Keep all items that match any of our criteria
          return item.title.toLowerCase().includes("fire") ||
                 item.title.toLowerCase().includes("parking") ||
                 item.title.toLowerCase().includes("sledding") ||
                 item.title.toLowerCase().includes("school bus");
        }
      )
      
      // Log filtered items
      console.log("CityStatus: Filtered items:", filteredItems.map(item => item.title));
      
      // Convert to proper model instances and add to store
      const models = filteredItems.map((item) => CityStatusItemModel.create({
        id: item.id,
        title: item.title,
        link: item.link,
        icon: item.icon,
        description: item.description,
        date: item.date,
        bool: item.bool,
        status: item.status,
        scrapedAt: item.scrapedAt || { _seconds: 0, _nanoseconds: 0 },
      }))
      
      store.setProp("items", models)
    }

    const clearItems = () => {
      store.setProp("items", [])
    }

    // Fetch status data from API
    const fetchCityStatus = async (api: Api) => {
      try {
        setLoading(true)
        setError(undefined)
        
        const cityStatusApi = api.cityStatus
        const result = await cityStatusApi.getOttawaStatus()
        
        if (result.kind === "ok" && result.status) {
          addItems(result.status)
        } else {
          setError("Failed to load status data")
        }
      } catch (error) {
        setError("An error occurred")
        console.error("Error fetching city status:", error)
      } finally {
        setLoading(false)
      }
    }

    // Refresh status data from API
    const refreshCityStatus = async (api: Api) => {
      clearItems()
      await fetchCityStatus(api)
    }

    // Debug function to manually add a school bus item
    const addSchoolBusItem = () => {
      console.log("Adding school bus item directly to store")
      const schoolBusItem = CityStatusItemModel.create({
        id: "school-bus-status-direct",
        title: "School Bus Service",
        link: "https://ottawaschoolbus.ca/",
        icon: "bus",
        description: "School buses are currently operating normally across the city.",
        date: new Date().toISOString(),
        bool: true,
        scrapedAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 }
      })

      // Add item to existing items
      const newItems = [...store.items, schoolBusItem]
      store.setProp("items", newItems)
    }

    return {
      setLoading,
      setError,
      addItems,
      clearItems,
      fetchCityStatus,
      refreshCityStatus,
      addSchoolBusItem,
    }
  })
  .views((store) => ({
    // Get specific status by title
    getStatusByTitle(title: string) {
      return store.items.find((item) => item.title.toLowerCase().includes(title.toLowerCase()))
    },
  }))

export interface CityStatusStore extends Instance<typeof CityStatusStoreModel> {}
export interface CityStatusStoreSnapshot extends SnapshotOut<typeof CityStatusStoreModel> {} 