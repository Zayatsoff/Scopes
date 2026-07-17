import { ApiResponse } from "apisauce"
import { CityStatusApi } from "./cityStatus-api"
import type { Api } from "./api"
import type { StatusItem } from "@/components/CityStatus"

function makeApi(response: Partial<ApiResponse<any>>): Api {
  return {
    apisauce: {
      get: jest.fn().mockResolvedValue(response),
    },
  } as unknown as Api
}

const sampleStatus: StatusItem[] = [
  {
    id: "fire-ban",
    title: "Fire Ban",
    link: "https://example.com/fire-ban",
    icon: "flame",
    description: "No open fires permitted.",
    date: "2026-07-16",
    bool: true,
    scrapedAt: { _seconds: 0, _nanoseconds: 0 },
  },
]

test("maps a populated response and appends the school bus item once", async () => {
  const api = makeApi({ ok: true, data: { status: sampleStatus } })
  const cityStatusApi = new CityStatusApi(api)

  const result = await cityStatusApi.getOttawaStatus()

  expect(result.kind).toBe("ok")
  expect(result.status).toHaveLength(2)
  expect(result.status?.[0]).toEqual(sampleStatus[0])
  expect(result.status?.filter((item) => item.id === "school-bus-status")).toHaveLength(1)
})

test("handles an empty response by returning just the school bus item", async () => {
  const api = makeApi({ ok: true, data: { status: [] } })
  const cityStatusApi = new CityStatusApi(api)

  const result = await cityStatusApi.getOttawaStatus()

  expect(result.kind).toBe("ok")
  expect(result.status).toHaveLength(1)
  expect(result.status?.[0].id).toBe("school-bus-status")
})

test("handles a non-200 error response", async () => {
  const api = makeApi({ ok: false, problem: "SERVER_ERROR", status: 500 })
  const cityStatusApi = new CityStatusApi(api)

  const result = await cityStatusApi.getOttawaStatus()

  expect(result.kind).toBe("server")
  expect(result.status).toBeUndefined()
})
