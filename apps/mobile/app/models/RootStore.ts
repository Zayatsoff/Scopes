import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { NewsStoreModel } from "./News"
import { PoliceNewsStoreModel } from "./PoliceNews"
import { PoliceSummaryStoreModel } from "./PoliceSummary"
import { WeatherAlertStoreModel } from "./WeatherAlert"
import { WeatherSummaryStoreModel } from "./WeatherSummary"
import { TrafficAlertsStoreModel } from "./TrafficAlert"
import { TrafficSummaryStoreModel } from "./TrafficSummary"
import { CityStatusStoreModel } from "./CityStatus"
import { OttawaAlertStoreModel } from "./OttawaAlert"
import { Api, api } from "@/services/api/api"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  newsStore: types.optional(NewsStoreModel, {}),
  policeNewsStore: types.optional(PoliceNewsStoreModel, {}),
  policeSummaryStore: types.optional(PoliceSummaryStoreModel, {}),
  weatherAlertStore: types.optional(WeatherAlertStoreModel, {}),
  weatherSummaryStore: types.optional(WeatherSummaryStoreModel, {}),
  trafficAlertsStore: types.optional(TrafficAlertsStoreModel, {}),
  trafficSummaryStore: types.optional(TrafficSummaryStoreModel, {}),
  cityStatusStore: types.optional(CityStatusStoreModel, {}),
  ottawaAlertStore: types.optional(OttawaAlertStoreModel, {}),
})
.views((self) => ({
  get api() {
    return api
  }
}))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
