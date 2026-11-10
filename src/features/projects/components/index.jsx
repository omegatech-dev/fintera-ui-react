import { memo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { projectsApi } from "../api";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faMapMarkerAlt,
  faEdit,
  faTrashAlt,
  faArrowRight,
  faCopy
} from "@fortawesome/free-solid-svg-icons";

const Project = memo(function Project({ project, user, onDeleted }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const {
    id,
    name,
    project_type,
    lot_count,
    available_lots,
    reserved_lots,
    sold_lots,
    price_per_square_unit,
    measurement_unit,
    address,
    city,
    code,
    delivery_date,
    created_at,
    guid
  } = project;

  const unitLabel = (u) => {
    switch ((u || "").toLowerCase()) {
      case "m2": return "m²";
      case "ft2": return "ft²";
      case "vara2": return "v²";
      default: return "m²";
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm(t('projects.confirmDelete', { name }))) return;
    try {
      await projectsApi.delete(id);
      showToast(t('projects.deleteSuccess'), "success");
      if (typeof onDeleted === "function") {
        onDeleted();
      }
    } catch (err) {
      console.error(err);
      showToast(`${t('common.error')}: ${err.message}`, "error");
    }
  };

  const availablePercent = (available_lots / lot_count) * 100;
  const reservedPercent = (reserved_lots / lot_count) * 100;
  const soldPercent = (sold_lots / lot_count) * 100;

  return (
    <div className="group bg-white dark:bg-darkblack-600 rounded-2xl shadow-xs hover:shadow-xl border border-bgray-200 dark:border-darkblack-400 p-0 overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
      {/* Header Image/Pattern Placeholder */}
      <div className="h-24 bg-gradient-to-r from-success-300 to-success-400 relative">
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-darkblack-500/90 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs">
          <span className="text-xs font-bold text-success-400 uppercase tracking-wider">
            {t(`projects.${project_type}`) || project_type || t('projects.residential')}
          </span>
        </div>
        <div className="absolute -bottom-6 left-6 bg-white dark:bg-darkblack-500 p-3 rounded-xl shadow-md border border-bgray-100 dark:border-darkblack-400">
          <FontAwesomeIcon icon={faHome} className="text-success-300 text-xl" />
        </div>
      </div>

      <div className="pt-10 px-6 pb-6 grow flex flex-col">
        {/* Title & Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-bgray-900 dark:text-white group-hover:text-success-300 transition-colors duration-300">
            {name}
          </h3>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center text-sm text-bgray-600 dark:text-bgray-400">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-xs" />
              <span className="truncate" title={address || undefined}>
                {city || address || "Location not set"}
              </span>
            </div>
            {delivery_date && (
              <div className="flex items-center text-xs text-bgray-500 dark:text-bgray-500">
                <span className="font-semibold mr-1">{t('projects.delivery')}:</span>
                <span>{new Date(delivery_date).toLocaleDateString()}</span>
              </div>
            )}
            {created_at && (
              <div className="flex items-center text-xs text-bgray-500 dark:text-bgray-500">
                <span className="font-semibold mr-1">{t('projects.created')}:</span>
                <span>{new Date(created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            )}
            {guid && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(guid);
                  showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
                }}
                className="flex items-center text-[10px] font-mono text-bgray-400 dark:text-bgray-500 mt-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group/guid bg-gray-50 dark:bg-darkblack-500/50 px-2 py-0.5 rounded-md self-start border border-gray-100 dark:border-darkblack-400 hover:border-success-300/30"
              >
                <span className="font-black mr-1 tracking-tighter uppercase">GUID:</span>
                <span className="truncate max-w-[250px]">{guid}</span>
                <FontAwesomeIcon icon={faCopy} className="ml-1.5 text-[8px] opacity-0 group-hover/guid:opacity-100 transition-opacity" />
              </div>
            )}
            {code && (
              <div className="flex items-center text-[10px] font-mono text-bgray-500 dark:text-bgray-400 mt-1 bg-gray-50 dark:bg-darkblack-500/50 px-2 py-0.5 rounded-md self-start border border-gray-100 dark:border-darkblack-400">
                <span className="font-black mr-1 tracking-tighter uppercase">{t('projects.code')}:</span>
                <span className="truncate max-w-[250px]">{code}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-medium text-bgray-600 dark:text-bgray-400">{t('projects.available')}</span>
            <span className="text-xs font-bold text-bgray-900 dark:text-white">{available_lots} / {lot_count}</span>
          </div>
          <div className="h-2 w-full bg-bgray-200 dark:bg-darkblack-500 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${soldPercent}%` }}
              className="h-full bg-error-300"
              title={`Sold: ${sold_lots}`}
            />
            <div
              style={{ width: `${reservedPercent}%` }}
              className="h-full bg-warning-200"
              title={`Reserved: ${reserved_lots}`}
            />
            <div
              style={{ width: `${availablePercent}%` }}
              className="h-full bg-success-300"
              title={`Available: ${available_lots}`}
            />
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success-300" />
              <span className="text-[10px] text-bgray-500">{available_lots} {t('projects.available')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-warning-200" />
              <span className="text-[10px] text-bgray-500">{reserved_lots} {t('projects.reserved')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-error-300" />
              <span className="text-[10px] text-bgray-500">{sold_lots} {t('projects.sold')}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-bgray-50 dark:bg-darkblack-700 rounded-xl">
            <p className="text-[10px] text-bgray-500 uppercase font-semibold mb-1">Precio x {unitLabel(measurement_unit)}</p>
            <p className="text-sm font-bold text-bgray-900 dark:text-white">L {price_per_square_unit}</p>
          </div>
          <div className="p-3 bg-bgray-50 dark:bg-darkblack-700 rounded-xl">
            <p className="text-[10px] text-bgray-500 uppercase font-semibold mb-1">Lotes Totales</p>
            <p className="text-sm font-bold text-bgray-900 dark:text-white">{lot_count}</p>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="mt-auto pt-4 border-t border-bgray-100 dark:border-darkblack-400 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user && user.role === "admin" && (
              <>
                <Link
                  to={`/projects/${id}/edit`}
                  id="project-edit-btn"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-bgray-100 dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 hover:bg-success-300 hover:text-white transition-all duration-200"
                  title={t('projects.editLink')}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Link>
                <button
                  type="button"
                  id="project-delete-btn"
                  onClick={handleDelete}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-bgray-100 dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 hover:bg-error-300 hover:text-white transition-all duration-200"
                  title={t('projects.delete')}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </>
            )}
          </div>

          <Link
            to={`/projects/${id}/lots`}
            id="project-view-lots-btn"
            className="flex items-center space-x-2 bg-success-300 hover:bg-success-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-success-300/20"
          >
            <span>{t('projects.lots')}</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>

      </div>
    </div>
  );
});

Project.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    available_lots: PropTypes.number,
    reserved_lots: PropTypes.number,
    sold_lots: PropTypes.number,
    name: PropTypes.string.isRequired,
    project_type: PropTypes.string,
    lot_count: PropTypes.number.isRequired,
    address: PropTypes.string,
    city: PropTypes.string,
    code: PropTypes.string,
    description: PropTypes.string,
    measurement_unit: PropTypes.string,
    price_per_square_unit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    delivery_date: PropTypes.string,
    created_at: PropTypes.string,
    guid: PropTypes.string,
  }).isRequired,
  user: PropTypes.object,
  onDeleted: PropTypes.func,
};

export default Project;
