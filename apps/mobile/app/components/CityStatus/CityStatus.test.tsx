import { render, screen, fireEvent } from "@testing-library/react-native"
import { CityStatus } from "./CityStatus"
import type { StatusItem } from "./types"

const makeItem = (overrides: Partial<StatusItem>): StatusItem => ({
  id: "fire-ban",
  title: "Fire Ban",
  link: "https://example.com/fire-ban",
  icon: "flame",
  description: "No open fires permitted.",
  date: "2026-07-16",
  bool: true,
  scrapedAt: { _seconds: 0, _nanoseconds: 0 },
  ...overrides,
})

const sampleItems: StatusItem[] = [makeItem({})]

// mirrors the seasonal set ottawa.ca can return: as few as 2 (open fire +
// our own school bus item), up to 5+ once winter parking/sledding/rinks kick in
const seasonalItems: StatusItem[] = [
  makeItem({ id: "fire-ban", title: "Open air fires" }),
  makeItem({ id: "parking", title: "Winter weather parking" }),
  makeItem({ id: "sledding", title: "Sledding" }),
  makeItem({ id: "rink", title: "Rink of Dreams" }),
  makeItem({ id: "school-bus-status", title: "School Bus Service Status" }),
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

  it.each([2, 3, 4, 5])("renders %i indicators without dropping any", (count) => {
    render(<CityStatus statusItems={seasonalItems.slice(0, count)} />)
    seasonalItems.slice(0, count).forEach((item) => {
      expect(screen.getByLabelText(`${item.title}: active`)).toBeDefined()
    })
  })

  it("falls back to the raw title instead of a misleading icon for an unrecognized status", () => {
    const unknownItem = makeItem({
      id: "block-party",
      title: "Neighbourhood Block Party",
    })
    render(<CityStatus statusItems={[unknownItem]} />)
    expect(screen.getByLabelText("Neighbourhood Block Party: active")).toBeDefined()
    expect(screen.getByText("Neighbourhood Block Party")).toBeDefined()
  })

  it("collapses multiple rinks behind one Skating icon instead of one per venue", () => {
    const rinks: StatusItem[] = [
      makeItem({ id: "rink-of-dreams", title: "Rink of Dreams", bool: false }),
      makeItem({ id: "jim-tubman-rink", title: "Jim Tubman Chevrolet Rink", bool: true }),
      makeItem({ id: "lansdowne-rink", title: "Lansdowne Park skating court", bool: false }),
    ]
    render(<CityStatus statusItems={rinks} />)

    // one collapsed entry, summarized as "N of M active", not 3 separate venue icons
    expect(screen.getByLabelText("Skating: 1 of 3 active")).toBeDefined()
    expect(screen.getByText("Skating")).toBeDefined()
    expect(screen.queryByLabelText("Rink of Dreams: inactive")).toBeNull()
  })

  it("expands the collapsed Skating icon to list every rink on tap", () => {
    const rinks: StatusItem[] = [
      makeItem({ id: "rink-of-dreams", title: "Rink of Dreams", bool: false }),
      makeItem({ id: "jim-tubman-rink", title: "Jim Tubman Chevrolet Rink", bool: true }),
    ]
    render(<CityStatus statusItems={rinks} />)

    fireEvent.press(screen.getByLabelText("Skating: 1 of 2 active"))

    expect(screen.getByText("Rink of Dreams")).toBeDefined()
    expect(screen.getByText("Jim Tubman Chevrolet Rink")).toBeDefined()
  })

  it("does not collapse a single rink into a group", () => {
    const singleRink = makeItem({ id: "rink-of-dreams", title: "Rink of Dreams" })
    render(<CityStatus statusItems={[singleRink]} />)
    expect(screen.getByLabelText("Rink of Dreams: active")).toBeDefined()
    expect(screen.queryByText("Skating")).toBeNull()
  })
})
