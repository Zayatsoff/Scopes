import { ApisauceInstance, ApiResponse } from "apisauce"
import { WeatherAlertsApi } from "./weather-alerts-api"
import type { WeatherAlertItem } from "../../models/WeatherAlert"

function makeApisauce(response: Partial<ApiResponse<any>>): ApisauceInstance {
  return {
    getBaseURL: jest.fn(() => "http://test.local"),
    get: jest.fn().mockResolvedValue(response),
  } as unknown as ApisauceInstance
}

const sampleWeatherAlerts = [
  { id: "1", title: "Severe Thunderstorm Warning", link: "https://example.com/1", pubDate: "2026-07-16" },
] as unknown as WeatherAlertItem[]

test("maps a populated response", async () => {
  const apisauce = makeApisauce({ ok: true, data: { weatherAlerts: sampleWeatherAlerts } })
  const api = new WeatherAlertsApi(apisauce)

  const response = await api.getWeatherAlerts()

  expect(response.ok).toBe(true)
  expect(response.data?.weatherAlerts).toEqual(sampleWeatherAlerts)
})

test("handles an empty response", async () => {
  const apisauce = makeApisauce({ ok: true, data: { weatherAlerts: [] } })
  const api = new WeatherAlertsApi(apisauce)

  const response = await api.getWeatherAlerts()

  expect(response.ok).toBe(true)
  expect(response.data?.weatherAlerts).toEqual([])
})

test("handles a non-200 error response", async () => {
  const apisauce = makeApisauce({ ok: false, problem: "SERVER_ERROR", status: 500 })
  const api = new WeatherAlertsApi(apisauce)

  const response = await api.getWeatherAlerts()

  expect(response.ok).toBe(false)
  expect(response.problem).toBe("SERVER_ERROR")
})
