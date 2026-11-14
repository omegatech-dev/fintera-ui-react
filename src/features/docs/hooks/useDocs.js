import { useMemo } from "react";
import { ARTICLES, SECTIONS } from "../data/manifest";
import { getMarkdown } from "../content";

export const normalizeRole = (role) => (role === "admin" || role === "seller" ? role : "user");

export const canReadArticle = (article, role) =>
  article.audience.includes(normalizeRole(role));

export function useDocs(locale, role) {
  return useMemo(() => {
    const normalizedRole = normalizeRole(role);
    const articles = ARTICLES.filter((article) => canReadArticle(article, role))
      .map((article) => ({
        ...article,
        title: article.title[locale] ?? article.title.en,
        body: getMarkdown(locale, article.section, article.slug, normalizedRole),
      }))
      .sort((a, b) => a.order - b.order);

    const sections = SECTIONS.map((section) => ({
      ...section,
      title: section.title[locale] ?? section.title.en,
      articles: articles.filter((article) => article.section === section.id),
    }))
      .filter((section) => section.articles.length > 0)
      .sort((a, b) => a.order - b.order);

    return { articles, sections };
  }, [locale, role]);
}
