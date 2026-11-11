import { useMemo } from "react";
import Fuse from "fuse.js";

const FUSE_OPTIONS = {
  keys: ["title", "body"],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function useDocsSearch(sections, query) {
  return useMemo(() => {
    const articles = sections.flatMap((section) => section.articles);
    const trimmed = query.trim();

    if (!trimmed) {
      return { filteredSections: sections, matchCount: articles.length };
    }

    const fuse = new Fuse(articles, FUSE_OPTIONS);
    const matches = fuse.search(trimmed).map((result) => result.item);
    const matchedSlugs = new Set(matches.map((article) => article.slug));

    const filteredSections = sections
      .map((section) => ({
        ...section,
        articles: section.articles.filter((article) => matchedSlugs.has(article.slug)),
      }))
      .filter((section) => section.articles.length > 0);

    return { filteredSections, matchCount: matches.length };
  }, [sections, query]);
}
