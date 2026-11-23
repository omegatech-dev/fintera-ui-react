import { useMemo } from "react";
import Fuse from "fuse.js";

const FUSE_OPTIONS = {
  keys: ["title", "body"],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function useDocsSearch(sections, query) {
  // Build the flat article list and the Fuse index only when the source
  // sections change. Rebuilding it on every keystroke (the previous behavior,
  // because `query` was a dependency) re-indexes every article body per key.
  const { articles, fuse } = useMemo(() => {
    const flat = sections.flatMap((section) => section.articles);
    return { articles: flat, fuse: new Fuse(flat, FUSE_OPTIONS) };
  }, [sections]);

  return useMemo(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      return { filteredSections: sections, matchCount: articles.length };
    }

    const matches = fuse.search(trimmed).map((result) => result.item);
    const matchedSlugs = new Set(matches.map((article) => article.slug));

    const filteredSections = sections
      .map((section) => ({
        ...section,
        articles: section.articles.filter((article) => matchedSlugs.has(article.slug)),
      }))
      .filter((section) => section.articles.length > 0);

    return { filteredSections, matchCount: matches.length };
  }, [sections, articles, fuse, query]);
}
