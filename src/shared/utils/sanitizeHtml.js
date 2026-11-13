import DOMPurify from "dompurify";

/**
 * Sanitize HTML from Quill or other rich text editors to prevent XSS.
 * Use before rendering with dangerouslySetInnerHTML.
 * See CVE-2025-15056 / GHSA-v3m3-f69x-jf25 (Quill XSS in HTML export).
 */
const ALLOWED_TAGS = [
  "p", "br", "span", "div", "strong", "b", "em", "i", "u", "s", "a",
  "ul", "ol", "li", "img", "blockquote", "pre", "code", "h1", "h2", "h3",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "class", "target", "rel"];

export function sanitizeHtml(html) {
  if (typeof html !== "string") return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}

const HAS_TAG = /<[a-z][\s\S]*>/i;

/**
 * Detect rich text without false positives on plain text such as "3 < 5 > 2".
 */
export function containsHtml(value) {
  if (typeof value !== "string" || !value.trim() || !HAS_TAG.test(value)) {
    return false;
  }
  if (typeof DOMParser === "undefined") return HAS_TAG.test(value);
  const document = new DOMParser().parseFromString(value, "text/html");
  return Array.from(document.body.childNodes).some(
    (node) => node.nodeType === 1
  );
}

/**
 * Visible text of an HTML fragment. Used by the editor character counter so the
 * UI limit matches the server-side count over rendered text.
 */
export function htmlToPlainText(html) {
  if (typeof html !== "string" || !html) return "";
  if (typeof DOMParser === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("br").forEach((node) => {
    node.replaceWith(document.createTextNode("\n"));
  });
  document
    .querySelectorAll("p, li, h1, h2, h3, blockquote, div")
    .forEach((node) => node.append(document.createTextNode("\n")));
  return (document.body.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * True when the fragment has no readable text (for example Quill's <p><br></p>).
 */
export function isRichTextEmpty(html) {
  return htmlToPlainText(html).length === 0;
}

/**
 * Counts Unicode code points so the limit matches Go's rune count on the API.
 */
export function countVisibleCharacters(html) {
  return [...htmlToPlainText(html)].length;
}
