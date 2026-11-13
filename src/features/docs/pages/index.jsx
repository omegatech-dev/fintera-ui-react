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
      <main className="w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px]">
        <p className="rounded-card border border-line bg-surface p-8 text-body text-ink-3">
          {t("docs.empty")}
        </p>
        </div>
    </main>
    );
  }

  if (!slug || !article) {
    return <Navigate to={`/docs/${defaultSlug}`} replace />;
  }

  return (
    <main className="w-full px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto w-full max-w-[1600px]">
      <header className="motion-fade-up mb-5">
        <span className="inline-flex items-center gap-1.5 rounded-chip bg-brand-soft px-2.5 py-1 text-micro font-semibold text-brand-strong">
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
        <h1 className="mt-2 text-page font-bold tracking-tight text-ink">
          {t("docs.title")}
        </h1>
        <p className="mt-1 text-body text-ink-3">{t("docs.subtitle")}</p>
      </header>

      <div className="motion-fade-in grid grid-cols-1 overflow-hidden rounded-card border border-line bg-surface [animation-delay:80ms] xl:grid-cols-12">
        <div className="border-b border-line xl:col-span-3 xl:border-b-0 xl:border-r">
          <DocsSidebar
            sections={filteredSections}
            query={query}
            onQueryChange={setQuery}
            matchCount={matchCount}
          />
        </div>

        <div className="min-w-0 px-5 py-7 sm:px-8 xl:col-span-9 xl:py-8">
          <header className="motion-fade-up mb-6 [animation-delay:140ms]">
            {section && (
              <p className="text-micro font-semibold uppercase tracking-wide text-brand-strong">
                {section.title}
              </p>
            )}
            <h2 className="mt-2 text-page font-bold tracking-tight text-ink">
              {article.title}
            </h2>
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
      </div>
    </main>
  );
}

export default Documentation;
