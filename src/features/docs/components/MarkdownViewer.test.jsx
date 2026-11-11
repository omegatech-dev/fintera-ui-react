import { afterEach, describe, expect, it } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MarkdownViewer from "./MarkdownViewer";

expect.extend(matchers);
afterEach(cleanup);

describe("MarkdownViewer", () => {
  it("renders headings, bold text, and GFM tables", () => {
    render(
      <MarkdownViewer
        content={"## Title\n\nSome **bold** text.\n\n| A | B |\n| --- | --- |\n| 1 | 2 |"}
      />,
    );

    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("does not render raw HTML", () => {
    render(<MarkdownViewer content={'<script>window.__pwned = true;</script>'} />);

    expect(document.querySelector("script")).toBeNull();
    expect(window.__pwned).toBeUndefined();
  });

  it("turns internal links into router links", () => {
    render(
      <MemoryRouter>
        <MarkdownViewer content={"[Glossary](/docs/glossary)"} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Glossary" })).toHaveAttribute(
      "href",
      "/docs/glossary",
    );
  });
});
