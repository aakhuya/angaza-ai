import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function Hello() {
  return <h1>Angaza AI</h1>;
}

describe("smoke", () => {
  it("renders", () => {
    render(<Hello />);
    expect(screen.getByText("Angaza AI")).toBeInTheDocument();
  });
});
