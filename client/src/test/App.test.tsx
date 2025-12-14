import { render } from "@testing-library/react";
import App from "@/App";
import { describe, it } from "vitest";

describe("App component", () => {
  it("smoke test", () => {
    render(<App />);
  });
});
