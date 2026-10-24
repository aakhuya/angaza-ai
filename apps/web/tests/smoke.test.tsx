import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function Hello() {
  return <h1>AngazaBol</h1>;
}

describe("smoke", () => {
  it("renders", () => {
    render(<Hello />);
    expect(screen.getByText("AngazaBol")).toBeInTheDocument();
  });
});
