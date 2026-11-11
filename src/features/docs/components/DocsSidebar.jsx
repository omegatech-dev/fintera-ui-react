import { NavLink } from "react-router-dom";
import { useLocale } from "../../../contexts/LocaleContext";
import DocsSearch from "./DocsSearch";

function DocsSidebar({ sections, query, onQueryChange, matchCount }) {
  const { t } = useLocale();

  return (
    <aside className="flex h-full flex-col gap-5 p-4 sm:p-6">
      <DocsSearch value={query} onChange={onQueryChange} />

      {sections.length === 0 ? (
        <p className="rounded-lg bg-bgray-100 px-3 py-4 text-sm text-bgray-600 dark:bg-darkblack-500 dark:text-bgray-300">
          {t("docs.noResults")}
        </p>
      ) : (
        <nav aria-label={t("docs.sections")} className="flex-1 space-y-5">
          {sections.map((section) => (
            <div key={section.id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bgray-500 dark:text-bgray-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.articles.map((article) => (
                  <li key={article.slug}>
                    <NavLink
                      to={`/docs/${article.slug}`}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
                            : "text-bgray-700 hover:bg-bgray-100 dark:text-bgray-200 dark:hover:bg-darkblack-500"
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

      <p className="text-xs text-bgray-500 dark:text-bgray-400">
        {t("docs.articleCount", { count: matchCount })}
      </p>
    </aside>
  );
}

export default DocsSidebar;
