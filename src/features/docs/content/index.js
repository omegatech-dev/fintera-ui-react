const modules = import.meta.glob("./**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const getMarkdown = (locale, section, slug, role) => {
  const candidates = [
    role && `./${locale}/${section}/${slug}.${role}.md`,
    `./${locale}/${section}/${slug}.md`,
    role && `./en/${section}/${slug}.${role}.md`,
    `./en/${section}/${slug}.md`,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const markdown = modules[candidate];
    if (markdown) return markdown;
  }

  return "";
};

export const hasMarkdown = (locale, section, slug) =>
  Boolean(modules[`./${locale}/${section}/${slug}.md`]);
