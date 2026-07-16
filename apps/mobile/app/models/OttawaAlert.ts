import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import type { AssertExtends, StatusStoryDTO } from "@scopes/shared-types"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Api } from "@/services/api"

// Define the model for a single Ottawa city banner alert (e.g. an active emergency notice)
export const OttawaAlertModel = types.model("OttawaAlert").props({
  id: types.identifier,
  title: types.maybe(types.string),
  status: types.maybe(types.string),
  lastUpdated: types.maybe(types.string),
  description: types.maybe(types.string),
  affectedAreas: types.optional(types.array(types.string), []),
  recommendations: types.optional(types.array(types.string), []),
  sourceUrl: types.string,
  scrapedAt: types.frozen({
    _seconds: 0,
    _nanoseconds: 0,
  }),
})

export interface OttawaAlert extends Instance<typeof OttawaAlertModel> {}
export interface OttawaAlertSnapshotOut extends SnapshotOut<typeof OttawaAlertModel> {}
export interface OttawaAlertSnapshotIn extends SnapshotIn<typeof OttawaAlertModel> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _OttawaAlertDriftCheck = AssertExtends<OttawaAlertSnapshotOut, StatusStoryDTO>

// Define the store model
export const OttawaAlertStoreModel = types
  .model("OttawaAlertStore")
  .props({
    items: types.array(OttawaAlertModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybe(types.string),
  })
  .actions(withSetPropAction)
  .actions((store) => {
    const setLoading = (value: boolean) => {
      store.setProp("isLoading", value)
    }

    const setError = (value: string | undefined) => {
      store.setProp("error", value)
    }

    // Fetch alert data from the API
    const fetchOttawaAlerts = async (api: Api) => {
      try {
        setLoading(true)
        setError(undefined)

        const result = await api.ottawaAlert.getOttawaAlerts()

        if (result.kind === "ok" && result.alerts) {
          store.setProp("items", result.alerts)
        } else {
          setError("Failed to load alert data")
        }
      } catch (error) {
        setError("An error occurred")
        console.error("Error fetching Ottawa alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    return {
      setLoading,
      setError,
      fetchOttawaAlerts,
    }
  })
  .views((store) => ({
    // Most recently scraped alert, if any
    get latestAlert() {
      return store.items.length > 0 ? store.items[0] : undefined
    },
  }))

export interface OttawaAlertStore extends Instance<typeof OttawaAlertStoreModel> {}
export interface OttawaAlertStoreSnapshot extends SnapshotOut<typeof OttawaAlertStoreModel> {}
