import { useEffect, useMemo, useState } from "react";
import { ARTICLES, SECTIONS } from "../data/manifest";
import { loadDocsLocale, pickMarkdown } from "../content";

export const normalizeRole = (role) => (role === "admin" || role === "seller" ? role : "user");

export const canReadArticle = (article, role) =>
  article.audience.includes(normalizeRole(role));

export function useDocs(locale, role) {
  const normalizedRole = normalizeRole(role);
  const [map, setMap] = useState(null);

  // Bodies load asynchronously from the active locale's markdown chunk; titles
  // come from the manifest and are available immediately.
  useEffect(() => {
    let active = true;
    loadDocsLocale(locale).then((loaded) => {
      if (active) setMap(loaded);
    });
    return () => {
      active = false;
    };
  }, [locale]);

  return useMemo(() => {
    const articles = ARTICLES.filter((article) => canReadArticle(article, role))
      .map((article) => ({
        ...article,
        title: article.title[locale] ?? article.title.en,
        body: pickMarkdown(map, locale, article.section, article.slug, normalizedRole),
      }))
      .sort((a, b) => a.order - b.order);

    const sections = SECTIONS.map((section) => ({
      ...section,
      title: section.title[locale] ?? section.title.en,
      articles: articles.filter((article) => article.section === section.id),
    }))
      .filter((section) => section.articles.length > 0)
      .sort((a, b) => a.order > b.order);

    return { articles, sections, ready: Boolean(map) };
  }, [map, locale, role, normalizedRole]);
}
