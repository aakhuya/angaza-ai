import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InsightFeed } from "@/components/match/InsightFeed";

const SAMPLE = [
  {
    insight_id: "i1",
    match_id: "m1",
    minute: 32,
    second: 14,
    category: "pressure",
    title: "High press forces turnover",
    body: "Angaza FC increased final-third entries while forcing three turnovers.",
    viewer_mode: "analyst" as const,
    supporting_event_ids: ["e1"],
    confidence: 0.87,
  },
];

describe("InsightFeed", () => {
  it("renders the empty state when there are no insights", () => {
    render(<InsightFeed insights={[]} />);
    expect(screen.getByText(/waiting for the first moment/i)).toBeInTheDocument();
  });

  it("renders each insight's title and body", () => {
    render(<InsightFeed insights={SAMPLE} />);
    expect(screen.getByText("High press forces turnover")).toBeInTheDocument();
    expect(
      screen.getByText(/increased final-third entries/i)
    ).toBeInTheDocument();
  });

  it("renders the confidence score", () => {
    render(<InsightFeed insights={SAMPLE} />);
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("renders the timestamp in MM:SS format", () => {
    render(<InsightFeed insights={SAMPLE} />);
    expect(screen.getByText("32:14")).toBeInTheDocument();
  });
});
