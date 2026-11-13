import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "../api";
import AuthContext from "../../../contexts/AuthContext";

import Project from "../components";
import CsvImportModal from "../components/CsvImportModal";
import useDebounce from "../../../hooks/useDebounce";
import { useLocale } from "../../../contexts/LocaleContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  Skeleton,
} from "@/shared/ui";

const PER_PAGE = 20;
const GRID_CLASS = "grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortParam, setSortParam] = useState("");
  const [page, setPage] = useState(1);
  const [visibility, setVisibility] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 400);

  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const next = debouncedSearch.trim();
    setSearchTerm(next.length >= 3 ? next : "");
    setPage(1);
  }, [debouncedSearch]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const trimmedTerm = searchTerm.trim();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (trimmedTerm) {
        if (uuidRegex.test(trimmedTerm)) {
          params.set("guid", trimmedTerm);
        } else {
          params.set("search_term", trimmedTerm);
        }
      }
      if (sortParam) params.set("sort", sortParam);
      if (visibility) params.set("is_published", visibility);
      params.set("page", page);
      params.set("per_page", PER_PAGE);

      const data = await projectsApi.list(params);
      setProjects(data.projects || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortParam, visibility, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = () => navigate("/projects/create");

  const visibilityOptions = useMemo(
    () => [
      { value: "", label: t("common.all") },
      { value: "1", label: t("projects.publishedPlural") },
      { value: "0", label: t("projects.draftPlural") },
    ],
    [t]
  );

  const sortOptions = useMemo(
    () => [
      { value: "", label: t("projectsPage.sorting.noSort") },
      { value: "name-asc", label: t("projectsPage.sorting.nameAsc") },
      { value: "name-desc", label: t("projectsPage.sorting.nameDesc") },
      { value: "created_at-desc", label: t("projectsPage.sorting.dateDesc") },
      { value: "created_at-asc", label: t("projectsPage.sorting.dateAsc") },
    ],
    [t]
  );

  const totalProjectCount =
    Number(pagination.total ?? pagination.count) || projects.length;
  const totalLots = projects.reduce(
    (sum, project) => sum + (Number(project.lot_count) || 0),
    0
  );
  const subtitle = [
    t("projects.projectCount", { count: totalProjectCount }),
    totalLots > 0 ? t("projects.lotsInTotal", { count: totalLots }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const pageStart = totalProjectCount > 0 ? (page - 1) * PER_PAGE + 1 : 0;
  const pageEnd = Math.min(page * PER_PAGE, totalProjectCount);
  const pages = Number(pagination.pages) || 1;

  return (
    <main className="page-shell min-h-screen w-full bg-canvas px-6 pb-6 xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-page font-bold tracking-tight text-ink">
              {t("projectsPage.title")}
            </h1>
            <p className="mt-2 text-body font-medium text-ink-3">{subtitle}</p>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                id="import-projects-btn"
                variant="secondary"
                onClick={() => setImportOpen(true)}
              >
                {t("projectsPage.importCSV")}
              </Button>
              <Button id="add-project-btn" onClick={handleAddProject}>
                <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                <span>{t("projectsPage.addProject")}</span>
              </Button>
            </div>
          )}
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[320px]">
            <FontAwesomeIcon
              icon={faSearch}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("projectsPage.searchPlaceholder")}
              aria-label={t("projectsPage.searchPlaceholder")}
              className="h-10 max-h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {visibilityOptions.map((option) => {
              const active = visibility === option.value;
              return (
                <button
                  key={option.value || "all"}
                  type="button"
                  onClick={() => {
                    setVisibility(option.value);
                    setPage(1);
                  }}
                  aria-pressed={active}
                  className={`inline-flex h-[30px] items-center rounded-chip px-3 text-label font-semibold transition-colors ${
                    active
                      ? "bg-brand-soft text-brand-strong"
                      : "border border-line bg-surface text-ink-2 hover:bg-surface-2"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="ml-auto w-52 max-w-full">
            <Select
              value={sortParam}
              onChange={(event) => {
                setSortParam(event.target.value);
                setPage(1);
              }}
              aria-label={t("projectsPage.sortPlaceholder")}
              className="h-10 max-h-10"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className={GRID_CLASS}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[290px] rounded-card border border-line bg-surface p-4"
              >
                <Skeleton rows={4} />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title={t("common.error")}
            description={`${t("projectsPage.errorPrefix")} ${error}`}
            onRetry={fetchProjects}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            variant="no-results"
            title={t("common.noItemsFound")}
            description={t("common.tryAdjustingFilters")}
          />
        ) : (
          <>
            <div className={GRID_CLASS}>
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  id={index === 0 ? "first-project-card" : undefined}
                >
                  <Project
                    project={project}
                    user={user}
                    onDeleted={fetchProjects}
                    onVisibilityChanged={fetchProjects}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <p className="text-label font-medium text-ink-3">
                {t("projects.showingProjects", {
                  start: pageStart,
                  end: pageEnd,
                  total: totalProjectCount,
                })}
              </p>
              {pages > 1 && (
                <Pagination
                  page={page}
                  pageCount={pages}
                  total={totalProjectCount}
                  perPage={PER_PAGE}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="py-0 [&>span:first-child]:hidden"
                />
              )}
            </div>
          </>
        )}
      </div>

      {isAdmin && (
        <CsvImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onImported={fetchProjects}
        />
      )}
    </main>
  );
}

export default Projects;
