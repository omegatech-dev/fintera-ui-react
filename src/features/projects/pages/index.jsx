import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "../api";
import AuthContext from "../../../contexts/AuthContext";

import Project from "../components";
import CsvImportModal from "../components/CsvImportModal";
import GenericFilter from "../../../shared/forms/GenericFilter";
import { useLocale } from "../../../contexts/LocaleContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Button, EmptyState, ErrorState, Pagination, Skeleton } from "@/shared/ui";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortParam, setSortParam] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [importOpen, setImportOpen] = useState(false);

  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

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
      params.set("page", page);
      params.set("per_page", perPage);

      const data = await projectsApi.list(params);
      setProjects(data.projects || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortParam, page, perPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((selected) => {
    setSortParam(selected);
    setPage(1);
  }, []);

  const handleAddProject = () => navigate("/projects/create");

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell bg-bgray-50 dark:bg-darkblack-700 min-h-screen">
      {/* Unified Action & Search Bar - z-20 so order filter dropdown appears above project cards */}
      <div className="relative z-20 mb-10 flex flex-col gap-6" data-aos="zoom-in" data-aos-duration="400" data-aos-delay="100">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Search and Filters - Takes up remaining space */}
          <div className="flex-1">
            <GenericFilter
              id="projects-filter-section"
              searchTerm={searchTerm}
              filterValue={sortParam}
              filterOptions={[
                { value: "No Sort", label: t('projectsPage.sorting.noSort') },
                { value: "name-asc", label: t('projectsPage.sorting.nameAsc') },
                { value: "name-desc", label: t('projectsPage.sorting.nameDesc') },
                { value: "created_at-desc", label: t('projectsPage.sorting.dateDesc') },
                { value: "created_at-asc", label: t('projectsPage.sorting.dateAsc') }
              ]}
              onSearchChange={handleSearchChange}
              onFilterChange={handleSortChange}
              searchPlaceholder={t('projectsPage.searchPlaceholder')}
              filterPlaceholder={t('projectsPage.sortPlaceholder')}
              minSearchLength={3}
            />
          </div>

          {/* Operations Group - Right Aligned on Desktop */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              <Button
                id="add-project-btn"
                onClick={handleAddProject}
                className="flex-1 lg:flex-none"
              >
                <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                <span>{t('projectsPage.addProject')}</span>
              </Button>

              <Button
                id="import-projects-btn"
                variant="secondary"
                onClick={() => setImportOpen(true)}
                className="flex-1 lg:flex-none"
              >
                {t('projectsPage.importCSV')}
              </Button>
            </div>
          )}
        </div>

      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton rows={6} />
          <p className="text-center text-body text-ink-3">
            {t('projectsPage.loadingProjects')}
          </p>
        </div>
      ) : error ? (
        <ErrorState
          title={t('common.error')}
          description={`${t('projectsPage.errorPrefix')} ${error}`}
          onRetry={fetchProjects}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          variant="no-results"
          title={t('common.noItemsFound')}
          description={t('common.tryAdjustingFilters')}
        />
      ) : (
        <>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                id={index === 0 ? "first-project-card" : undefined}
                data-aos="zoom-in"
                data-aos-duration="400"
                data-aos-delay={index * 50}
                className="h-full"
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


          {pagination.pages && pagination.pages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                page={page}
                pageCount={pagination.pages}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </>
      )}

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
