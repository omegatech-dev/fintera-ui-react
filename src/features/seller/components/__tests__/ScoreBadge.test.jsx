import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import ScoreBadge from "../ScoreBadge";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("@/contexts/LocaleContext", () => {
  const t = (key) => key;
  return { useLocale: () => ({ t }) };
});

const renderBadge = (value, showNew = false) =>
  render(<ScoreBadge value={value} showNew={showNew} />);

describe("ScoreBadge", () => {
  it("uses green at 85 and above", () => {
    renderBadge(85);
    expect(screen.getByText("85%")).toHaveClass("bg-brand-soft");
  });

  it("uses yellow between 84 and 60", () => {
    renderBadge(84);
    expect(screen.getByText("84%")).toHaveClass("bg-warning-soft");

    cleanup();
    renderBadge(60);
    expect(screen.getByText("60%")).toHaveClass("bg-warning-soft");
  });

  it("uses red below 60", () => {
    renderBadge(59);
    expect(screen.getByText("59%")).toHaveClass("bg-danger-soft");
  });

  it("shows a new seller as green", () => {
    renderBadge(null, true);
    expect(screen.getByText("score.new")).toHaveClass("bg-brand-soft");
  });

  it("renders nothing without a value unless asked for the new state", () => {
    const { container } = renderBadge(undefined);
    expect(container).toBeEmptyDOMElement();
  });
});
