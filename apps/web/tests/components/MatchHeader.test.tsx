import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchHeader } from "@/components/match/MatchHeader";

describe("MatchHeader", () => {
  const base = {
    homeName: "Angaza FC",
    awayName: "Mwangaza United",
    homeMonogram: "ANG",
    awayMonogram: "MWU",
    homeScore: 2,
    awayScore: 1,
    minute: 72,
    second: 14,
    status: "live",
  };

  it("renders both team names", () => {
    render(<MatchHeader {...base} />);
    expect(screen.getAllByText("Angaza FC").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mwangaza United").length).toBeGreaterThan(0);
  });

  it("renders both scores", () => {
    render(<MatchHeader {...base} />);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("renders the clock formatted as MM:SS", () => {
    render(<MatchHeader {...base} />);
    expect(screen.getByText("72:14")).toBeInTheDocument();
  });

  it("renders the LIVE badge when status is live", () => {
    render(<MatchHeader {...base} />);
    // Two badges render the word "Live": the sim-badge on the left and the
    // status badge on the right. Both must be present.
    const liveBadges = screen.getAllByText(/live/i);
    expect(liveBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the SIMULATION label so the data source is clear", () => {
    render(<MatchHeader {...base} />);
    expect(screen.getByText(/Simulation/i)).toBeInTheDocument();
  });
});
