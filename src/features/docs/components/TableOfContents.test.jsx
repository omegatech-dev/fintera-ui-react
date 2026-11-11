import { afterEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, render, screen } from "@testing-library/react";
import { useRef } from "react";
import TableOfContents from "./TableOfContents";

expect.extend(matchers);
afterEach(cleanup);

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t: (key) => key, locale: "en" }),
}));

function Harness() {
  const ref = useRef(null);
  return (
    <div>
      <div ref={ref}>
        <h2 id="the-formula">The formula</h2>
        <h3 id="example">Example</h3>
      </div>
      <TableOfContents containerRef={ref} contentKey="test" />
    </div>
  );
}

describe("TableOfContents", () => {
  it("lists rendered headings and links to their anchors", async () => {
    render(<Harness />);

    expect(await screen.findByRole("link", { name: "The formula" })).toHaveAttribute(
      "href",
      "#the-formula",
    );
    expect(screen.getByRole("link", { name: "Example" })).toHaveAttribute(
      "href",
      "#example",
    );
  });
});
