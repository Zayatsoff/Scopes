import { ApisauceInstance, ApiResponse } from "apisauce"
import { TrafficAlertsApi } from "./traffic-alerts-api"
import type { TrafficAlertItem } from "../../models/TrafficAlert"

function makeApisauce(response: Partial<ApiResponse<any>>): ApisauceInstance {
  return {
    getBaseURL: jest.fn(() => "http://test.local"),
    get: jest.fn().mockResolvedValue(response),
  } as unknown as ApisauceInstance
}

const sampleEvents = [
  { id: "1", headline: "Lane closure on the 417" },
] as unknown as TrafficAlertItem[]

test("maps a populated response", async () => {
  const apisauce = makeApisauce({
    ok: true,
    data: {
      trafficAlerts: {
        events: sampleEvents,
        scrapedAt: "2026-07-16T00:00:00Z",
        date: "2026-07-16",
      },
    },
  })
  const api = new TrafficAlertsApi(apisauce)

  const response = await api.getTrafficAlerts()

  expect(response.ok).toBe(true)
  expect(response.data?.trafficAlerts.events).toEqual(sampleEvents)
})

test("handles an empty response", async () => {
  const apisauce = makeApisauce({
    ok: true,
    data: { trafficAlerts: { events: [], scrapedAt: "", date: "2026-07-16" } },
  })
  const api = new TrafficAlertsApi(apisauce)

  const response = await api.getTrafficAlerts()

  expect(response.ok).toBe(true)
  expect(response.data?.trafficAlerts.events).toEqual([])
})

test("handles a non-200 error response", async () => {
  const apisauce = makeApisauce({ ok: false, problem: "SERVER_ERROR", status: 500 })
  const api = new TrafficAlertsApi(apisauce)

  const response = await api.getTrafficAlerts()

  expect(response.ok).toBe(false)
  expect(response.problem).toBe("SERVER_ERROR")
})
