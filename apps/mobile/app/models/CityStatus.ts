import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import type { AssertExtends, CityStatusDTO } from "@scopes/shared-types"
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
    _nanoseconds: 0,
  }),
})

export interface CityStatusItem extends Instance<typeof CityStatusItemModel> {}
export interface CityStatusItemSnapshotOut extends SnapshotOut<typeof CityStatusItemModel> {}
export interface CityStatusItemSnapshotIn extends SnapshotIn<typeof CityStatusItemModel> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CityStatusItemDriftCheck = AssertExtends<CityStatusItemSnapshotOut, CityStatusDTO>

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
      // ottawa.ca's indicator set is seasonal (2 items in summer, 5+ in
      // winter) -> render everything the API returns rather than dropping
      // anything outside a fixed allow-list. Unrecognized titles still get
      // an icon/label via statusTypes' default entry
      const models = items.map((item) =>
        CityStatusItemModel.create({
          id: item.id,
          title: item.title,
          link: item.link,
          icon: item.icon,
          description: item.description,
          date: item.date,
          bool: item.bool,
          status: item.status,
          scrapedAt: item.scrapedAt || { _seconds: 0, _nanoseconds: 0 },
        }),
      )

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

    return {
      setLoading,
      setError,
      addItems,
      clearItems,
      fetchCityStatus,
      refreshCityStatus,
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
