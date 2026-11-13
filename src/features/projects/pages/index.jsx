import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "../api";
import AuthContext from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";


import Project from "../components";
import GenericFilter from "../../../shared/forms/GenericFilter";
import { useLocale } from "../../../contexts/LocaleContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faFileUpload,
  faFilter
} from "@fortawesome/free-solid-svg-icons";
import { EmptyState, ErrorState, Pagination, Skeleton } from "@/shared/ui";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortParam, setSortParam] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const fileInputRef = useRef(null);
  // const [importing, setImporting] = useState(false);

  const [updateExisting, setUpdateExisting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

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
  const handleImportClick = () => fileInputRef.current?.click();  const handleImportChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("options[update_existing]", updateExisting ? "1" : "0");
      formData.append("options[skip_duplicates]", skipDuplicates ? "1" : "0");

      await projectsApi.import(formData);

      await fetchProjects();
      showToast(t('projectsPage.importCompleted'), "success");
    } catch (err) {
      console.error(err);
      showToast(`${t('projectsPage.importErrorPrefix')} ${err.message}`, "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
              <button
                id="add-project-btn"
                onClick={handleAddProject}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-success-300 hover:bg-success-400 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-200 shadow-lg shadow-success-300/20 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>{t('projectsPage.addProject')}</span>
              </button>

              <div className="flex-1 lg:flex-none group relative">
                <button
                  id="import-projects-btn"
                  onClick={handleImportClick}
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-darkblack-600 text-bgray-700 dark:text-white px-6 py-3 rounded-2xl font-bold transition-all duration-200 border border-bgray-200 dark:border-darkblack-400 shadow-xs hover:bg-bgray-50 dark:hover:bg-darkblack-500 active:scale-95"
                >
                  <FontAwesomeIcon icon={faFileUpload} />
                  <span>{t('projectsPage.importCSV')}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportChange}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Import Settings - Clearly associated with CSV Import */}
        {isAdmin && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4" data-aos="fade-left" data-aos-duration="400" data-aos-delay="200">
            <div className="flex items-center gap-2 text-xs font-bold text-bgray-400 uppercase tracking-wider">
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
              {t('projectsPage.importOptions')}
            </div>

            <div className="flex items-center gap-6 bg-white dark:bg-darkblack-600 px-6 py-3 rounded-2xl border border-bgray-200 dark:border-darkblack-400 shadow-xs">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${updateExisting ? 'bg-success-300' : 'bg-bgray-300 dark:bg-darkblack-400'}`}></div>
                  <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-xs ${updateExisting ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-3 text-sm font-semibold text-bgray-700 dark:text-bgray-300 group-hover:text-success-300 transition-colors">
                  {t('projectsPage.updateExisting')}
                </span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${skipDuplicates ? 'bg-success-300' : 'bg-bgray-300 dark:bg-darkblack-400'}`}></div>
                  <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-xs ${skipDuplicates ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-3 text-sm font-semibold text-bgray-700 dark:text-bgray-300 group-hover:text-success-300 transition-colors">
                  {t('projectsPage.skipDuplicates')}
                </span>
              </label>
            </div>
          </div>
        )}
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
    </main>
  );
}

export default Projects;
