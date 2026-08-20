import { ApiResponse } from "apisauce"
import { OttawaAlertApi } from "./ottawaAlert-api"
import type { Api } from "./api"
import type { StatusStoryDTO } from "@scopes/shared-types"

function makeApi(response: Partial<ApiResponse<any>>): Api {
  return {
    apisauce: {
      get: jest.fn().mockResolvedValue(response),
    },
  } as unknown as Api
}

const sampleAlerts = [{ id: "1", title: "Boil water advisory" }] as unknown as StatusStoryDTO[]

test("maps a populated response", async () => {
  const api = makeApi({ ok: true, data: { alerts: sampleAlerts } })
  const ottawaAlertApi = new OttawaAlertApi(api)

  const result = await ottawaAlertApi.getOttawaAlerts()

  expect(result.kind).toBe("ok")
  expect(result.alerts).toEqual(sampleAlerts)
})

test("handles an empty response", async () => {
  const api = makeApi({ ok: true, data: { alerts: [] } })
  const ottawaAlertApi = new OttawaAlertApi(api)

  const result = await ottawaAlertApi.getOttawaAlerts()

  expect(result.kind).toBe("ok")
  expect(result.alerts).toEqual([])
})

test("handles a non-200 error response", async () => {
  const api = makeApi({ ok: false, problem: "SERVER_ERROR", status: 500 })
  const ottawaAlertApi = new OttawaAlertApi(api)

  const result = await ottawaAlertApi.getOttawaAlerts()

  expect(result.kind).toBe("server")
  expect(result.alerts).toBeUndefined()
})
