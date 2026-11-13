import { describe, it, expect } from "vitest";
import {
  containsHtml,
  countVisibleCharacters,
  htmlToPlainText,
  isRichTextEmpty,
  sanitizeHtml,
} from "./sanitizeHtml";

describe("sanitizeHtml", () => {
  it("keeps formatting used by the terms editor", () => {
    const html =
      '<h2>Title</h2><p><strong>Bold</strong> <em>italic</em> <u>underline</u></p><ul><li>One</li></ul><a href="https://fintera.test">Link</a>';
    const clean = sanitizeHtml(html);

    expect(clean).toContain("<h2>Title</h2>");
    expect(clean).toContain("<strong>Bold</strong>");
    expect(clean).toContain("<ul><li>One</li></ul>");
    expect(clean).toContain('href="https://fintera.test"');
  });

  it("removes scripts and event handlers", () => {
    const clean = sanitizeHtml(
      '<p onclick="steal()">Text</p><script>alert(1)</script><img src="x" onerror="alert(1)">'
    );

    expect(clean).toContain("Text");
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("onerror");
  });
});

describe("containsHtml", () => {
  it("detects rich text but not legacy plain text", () => {
    expect(containsHtml("<p>Hello</p>")).toBe(true);
    expect(containsHtml("Hello\n\nWorld")).toBe(false);
    expect(containsHtml("3 < 5 > 2")).toBe(false);
    expect(containsHtml("")).toBe(false);
  });
});

describe("htmlToPlainText", () => {
  it("counts visible text without markup", () => {
    expect(htmlToPlainText("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world"
    );
    expect(htmlToPlainText("<h2>Title</h2><ul><li>One</li><li>Two</li></ul>")).toBe(
      "Title\nOne\nTwo"
    );
  });

  it("detects empty rich text", () => {
    expect(isRichTextEmpty("<p><br></p>")).toBe(true);
    expect(isRichTextEmpty("<p>Content</p>")).toBe(false);
  });

  it("counts code points like the API rune limit", () => {
    expect(countVisibleCharacters("<p>Hola 😀</p>")).toBe(6);
  });
});
