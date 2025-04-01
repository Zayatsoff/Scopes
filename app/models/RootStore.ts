import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { NewsStoreModel } from "./News"
import { PoliceNewsStoreModel } from "./PoliceNews"
import { Api, api } from "@/services/api/api"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  newsStore: types.optional(NewsStoreModel, {}),
  policeNewsStore: types.optional(PoliceNewsStoreModel, {}),
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
