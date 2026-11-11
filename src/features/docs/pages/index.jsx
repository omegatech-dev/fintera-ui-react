import { useContext, useMemo, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import AuthContext from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useDocs } from "../hooks/useDocs";
import { useDocsSearch } from "../hooks/useDocsSearch";
import DocsSidebar from "../components/DocsSidebar";
import MarkdownViewer from "../components/MarkdownViewer";
import TableOfContents from "../components/TableOfContents";

function Documentation() {
  const { user } = useContext(AuthContext);
  const { locale, t } = useLocale();
  const { slug } = useParams();
  const { articles, sections } = useDocs(locale, user?.role);
  const [query, setQuery] = useState("");
  const contentRef = useRef(null);
  const { filteredSections, matchCount } = useDocsSearch(sections, query);

  const defaultSlug = articles[0]?.slug;
  const article = useMemo(
    () => articles.find((entry) => entry.slug === slug),
    [articles, slug],
  );
  const section = article
    ? sections.find((entry) => entry.id === article.section)
    : null;

  if (articles.length === 0) {
    return (
      <main className="w-full px-6 pb-6 pt-[100px] sm:pt-[156px] xl:px-[48px] xl:pb-[48px]">
        <p className="rounded-xl bg-white p-8 text-sm text-bgray-600 dark:bg-darkblack-600 dark:text-bgray-300">
          {t("docs.empty")}
        </p>
      </main>
    );
  }

  if (!slug || !article) {
    return <Navigate to={`/docs/${defaultSlug}`} replace />;
  }

  return (
    <main className="w-full px-6 pb-6 pt-[100px] sm:pt-[156px] xl:px-[48px] xl:pb-[48px]">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5v-13zM13 4h5.5A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5H13V4z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {t("docs.badge")}
        </span>
        <p className="text-sm text-bgray-500 dark:text-bgray-400">{t("docs.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 rounded-xl bg-white dark:bg-darkblack-600 xl:grid-cols-12">
        <div className="border-b border-bgray-200 dark:border-darkblack-400 xl:col-span-3 xl:border-b-0 xl:border-r">
          <DocsSidebar
            sections={filteredSections}
            query={query}
            onQueryChange={setQuery}
            matchCount={matchCount}
          />
        </div>

        <div className="min-w-0 px-6 py-8 sm:px-10 xl:col-span-9">
          <header className="mb-6">
            {section && (
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                {section.title}
              </p>
            )}
            <h1 className="mt-2 text-2xl font-bold text-bgray-900 dark:text-white">
              {article.title}
            </h1>
          </header>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_220px]">
            <MarkdownViewer content={article.body} containerRef={contentRef} />
            <div className="hidden xl:block">
              <div className="sticky top-28">
                <TableOfContents
                  containerRef={contentRef}
                  contentKey={`${locale}:${article.slug}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Documentation;
