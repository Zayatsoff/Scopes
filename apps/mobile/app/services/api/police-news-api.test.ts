import { ApisauceInstance, ApiResponse } from "apisauce"
import { PoliceNewsApi } from "./police-news-api"
import type { PoliceNewsItem } from "../../models/PoliceNews"

function makeApisauce(response: Partial<ApiResponse<any>>): ApisauceInstance {
  return {
    getBaseURL: jest.fn(() => "http://test.local"),
    get: jest.fn().mockResolvedValue(response),
  } as unknown as ApisauceInstance
}

const samplePoliceNews = [
  { id: "1", title: "Incident on Bank St", link: "https://example.com/1", date: "2026-07-16" },
] as unknown as PoliceNewsItem[]

test("maps a populated response", async () => {
  const apisauce = makeApisauce({ ok: true, data: { policeNews: samplePoliceNews } })
  const api = new PoliceNewsApi(apisauce)

  const response = await api.getPoliceNews()

  expect(response.ok).toBe(true)
  expect(response.data?.policeNews).toEqual(samplePoliceNews)
})

test("handles an empty response", async () => {
  const apisauce = makeApisauce({ ok: true, data: { policeNews: [] } })
  const api = new PoliceNewsApi(apisauce)

  const response = await api.getPoliceNews()

  expect(response.ok).toBe(true)
  expect(response.data?.policeNews).toEqual([])
})

test("handles a non-200 error response", async () => {
  const apisauce = makeApisauce({ ok: false, problem: "SERVER_ERROR", status: 500 })
  const api = new PoliceNewsApi(apisauce)

  const response = await api.getPoliceNews()

  expect(response.ok).toBe(false)
  expect(response.problem).toBe("SERVER_ERROR")
})
