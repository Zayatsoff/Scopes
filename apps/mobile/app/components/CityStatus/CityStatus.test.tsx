import { render, screen } from "@testing-library/react-native"
import { CityStatus } from "./CityStatus"
import type { StatusItem } from "./types"

const sampleItems: StatusItem[] = [
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

describe("CityStatus", () => {
  it("shows a loading state instead of an infinite spinner", () => {
    render(<CityStatus loading />)
    expect(screen.getByText("Loading status...")).toBeDefined()
  })

  it("shows an empty state when there are no status items", () => {
    render(<CityStatus statusItems={[]} />)
    expect(screen.getByText("No status available")).toBeDefined()
  })

  it("renders an icon per status item once data is available", () => {
    render(<CityStatus statusItems={sampleItems} />)
    expect(screen.getByLabelText("Fire Ban: active")).toBeDefined()
  })
})
