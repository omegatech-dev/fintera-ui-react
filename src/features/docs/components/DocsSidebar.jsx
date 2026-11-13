import { NavLink } from "react-router-dom";
import { useLocale } from "../../../contexts/LocaleContext";
import DocsSearch from "./DocsSearch";

function DocsSidebar({ sections, query, onQueryChange, matchCount }) {
  const { t } = useLocale();

  return (
    <aside className="flex h-full flex-col gap-5 p-4 sm:p-5">
      <DocsSearch value={query} onChange={onQueryChange} />

      {sections.length === 0 ? (
        <p className="rounded-control bg-surface-2 px-3 py-4 text-body text-ink-3">
          {t("docs.noResults")}
        </p>
      ) : (
        <nav aria-label={t("docs.sections")} className="flex-1 space-y-5">
          {sections.map((section) => (
            <div key={section.id}>
              <p className="mb-2 text-micro font-semibold uppercase tracking-wide text-ink-3">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.articles.map((article) => (
                  <li key={article.slug}>
                    <NavLink
                      to={`/docs/${article.slug}`}
                      className={({ isActive }) =>
                        `block rounded-control px-3 py-2 text-body font-medium transition-colors ${
                          isActive
                            ? "bg-brand-soft text-brand-strong"
                            : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                        }`
                      }
                    >
                      {article.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      )}

      <p className="text-micro font-medium text-ink-3">
        {t("docs.articleCount", { count: matchCount })}
      </p>
    </aside>
  );
}

export default DocsSidebar;
