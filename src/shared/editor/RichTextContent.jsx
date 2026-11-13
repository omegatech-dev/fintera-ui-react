import { useMemo } from "react";
import { sanitizeHtml } from "../utils/sanitizeHtml";

/**
 * Renders admin-authored rich text with the shared document styles.
 * Always sanitizes again at render time, even though the API also sanitizes.
 */
function RichTextContent({ html, className = "" }) {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  return (
    <div
      className={`rich-text-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export default RichTextContent;
