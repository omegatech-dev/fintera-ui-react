const modules = import.meta.glob("./**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const getMarkdown = (locale, section, slug) => {
  const localized = modules[`./${locale}/${section}/${slug}.md`];
  if (localized) {
    return localized;
  }
  return modules[`./en/${section}/${slug}.md`] ?? "";
};

export const hasMarkdown = (locale, section, slug) =>
  Boolean(modules[`./${locale}/${section}/${slug}.md`]);
