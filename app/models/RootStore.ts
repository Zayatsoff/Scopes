import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { NewsStoreModel } from "./News"
import { Api } from "@/services/api/api"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  newsStore: types.optional(NewsStoreModel, {}),
})
.views((self) => ({
  get api() {
    return new Api() // Create a new API instance when needed
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
