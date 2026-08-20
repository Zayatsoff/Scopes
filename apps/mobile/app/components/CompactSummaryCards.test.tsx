import { render, screen } from "@testing-library/react-native"
import { CompactSummaryCards } from "./CompactSummaryCards"

describe("CompactSummaryCards", () => {
  it("shows loading text instead of an infinite spinner while data is loading", () => {
    render(<CompactSummaryCards policeLoading weatherLoading trafficLoading />)
    expect(screen.getAllByText("Loading...")).toHaveLength(3)
  })

  it("shows an empty state when summaries are missing", () => {
    render(<CompactSummaryCards />)
    expect(screen.getAllByText("No updates available")).toHaveLength(3)
  })

  it("renders bullet points once a summary is available", () => {
    render(
      <CompactSummaryCards
        policeSummary={
          {
            id: "1",
            title: "Police Update",
            date: "2026-07-16",
            summary: "- Incident on Bank St\n- Road closure downtown",
          } as any
        }
      />,
    )
    expect(screen.getByText("Incident on Bank St")).toBeDefined()
    expect(screen.getByText("Road closure downtown")).toBeDefined()
  })
})
