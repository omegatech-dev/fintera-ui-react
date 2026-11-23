// Raw markdown is loaded per-locale on demand instead of being eagerly bundled
// into the docs route chunk. Previously `eager: true` pulled every article in
// BOTH locales (~190 KB) into a single chunk that stayed resident after visiting
// /docs. With lazy per-locale loading only the locale the user is reading is
// downloaded and held in memory, and the docs route's initial chunk shrinks.
const loadersByLocale = {
  en: import.meta.glob("./en/**/*.md", { query: "?raw", import: "default" }),
  es: import.meta.glob("./es/**/*.md", { query: "?raw", import: "default" }),
};

const cacheByLocale = {};

/**
 * Load (once, then cache) the raw markdown map for a locale.
 * @param {string} locale
 * @returns {Promise<Record<string,string>>} path-key -> raw markdown
 */
export function loadDocsLocale(locale) {
  const key = loadersByLocale[locale] ? locale : "en";
  if (!cacheByLocale[key]) {
    const loaders = loadersByLocale[key];
    cacheByLocale[key] = Promise.all(
      Object.entries(loaders).map(async ([path, load]) => [path, await load()])
    ).then(Object.fromEntries);
  }
  return cacheByLocale[key];
}

/**
 * Resolve a markdown body from an already-loaded locale map. Prefers the
 * role-specific variant (e.g. overview.seller.md), then the base file.
 */
export function pickMarkdown(map, locale, section, slug, role) {
  if (!map) return "";
  const candidates = [
    role && `./${locale}/${section}/${slug}.${role}.md`,
    `./${locale}/${section}/${slug}.md`,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const markdown = map[candidate];
    if (markdown) return markdown;
  }
  return "";
}
