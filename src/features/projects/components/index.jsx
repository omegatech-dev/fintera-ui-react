import { memo, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { PUBLIC_PORTAL_URL } from "@config";
import { projectsApi } from "../api";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import ProjectPhotoCarousel from "./ProjectPhotoCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faEdit,
  faTrashAlt,
  faArrowRight,
  faCopy,
  faUniversity,
  faEye,
  faEyeSlash,
  faGlobe,
  faCalendarAlt,
  faTag,
  faInfoCircle,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const formatDate = (value, locale) => {
  if (!value) return "";
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = isDateOnly ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale || undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatNumber = (value, locale) => {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  return new Intl.NumberFormat(locale || undefined, {
    maximumFractionDigits: 2,
  }).format(number);
};

const Project = memo(function Project({ project, user, onDeleted, onVisibilityChanged }) {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const [changingVisibility, setChangingVisibility] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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
    guid,
    is_published,
    cover_photo_url,
    photos,
  } = project;

  const portalURL = PUBLIC_PORTAL_URL && guid
    ? `${PUBLIC_PORTAL_URL.replace(/\/+$/, "")}/projects/${guid}`
    : "";

  const gallery = useMemo(() => {
    if (Array.isArray(photos) && photos.length > 0) return photos;
    if (cover_photo_url) {
      return [{ id: "cover", url: cover_photo_url, alt: t("projects.coverPhoto") }];
    }
    return [];
  }, [photos, cover_photo_url, t]);

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

  const handleVisibilityToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setChangingVisibility(true);
    try {
      if (is_published) {
        await projectsApi.unpublish(id);
        showToast(t("projects.unpublishSuccess"), "success");
      } else {
        await projectsApi.publish(id);
        showToast(t("projects.publishSuccess"), "success");
      }
      if (typeof onVisibilityChanged === "function") {
        onVisibilityChanged();
      }
    } catch (err) {
      showToast(err?.message || t("projects.visibilityError"), "error");
    } finally {
      setChangingVisibility(false);
    }
  };

  const handleCopyGUID = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(guid);
    showToast(t("common.copiedToClipboard") || "Copiado al portapapeles", "success");
  };

  const deliveryLabel = formatDate(delivery_date, locale);
  const createdLabel = formatDate(created_at, locale);
  const totalLots = Number(lot_count) || 0;
  const availableLots = Number(available_lots) || 0;
  const reservedLots = Number(reserved_lots) || 0;
  const soldLots = Number(sold_lots) || 0;
  const availablePercent = totalLots > 0 ? (availableLots / totalLots) * 100 : 0;
  const reservedPercent = totalLots > 0 ? (reservedLots / totalLots) * 100 : 0;
  const soldPercent = totalLots > 0 ? (soldLots / totalLots) * 100 : 0;
  const locationLabel = city || address || t("projects.locationNotSet");
  const projectTypeKey = project_type ? `projects.${project_type}` : "";
  const translatedProjectType = projectTypeKey ? t(projectTypeKey) : "";
  const projectTypeLabel = project_type
    ? (translatedProjectType === projectTypeKey ? project_type : translatedProjectType)
    : t("projects.residential");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-bgray-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-darkblack-400 dark:bg-darkblack-600">
      <ProjectPhotoCarousel photos={gallery} projectName={name}>
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs ${
                is_published ? "bg-success-300" : "bg-bgray-700/90"
              }`}
            >
              <FontAwesomeIcon icon={is_published ? faEye : faEyeSlash} />
              {is_published ? t("projects.published") : t("projects.unpublished")}
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-success-400 shadow-xs backdrop-blur-xs dark:bg-darkblack-500/90">
              {projectTypeLabel}
            </span>
          </div>

          <div className="pr-16">
            <h3 className="text-2xl font-black leading-tight text-white drop-shadow-sm">
              {name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-white/85">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]" />
              <span className="truncate" title={address || undefined}>
                {locationLabel}
              </span>
            </p>
          </div>
        </div>
      </ProjectPhotoCarousel>

      <div className="flex grow flex-col p-5">
        {(deliveryLabel || createdLabel) && (
          <div className="grid grid-cols-2 gap-2.5">
            {deliveryLabel && (
              <div className="rounded-xl border border-bgray-100 bg-bgray-50 p-3 dark:border-darkblack-400 dark:bg-darkblack-700">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-bgray-500">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-success-300" />
                  {t("projects.delivery")}
                </p>
                <p className="mt-1 text-sm font-bold text-bgray-900 dark:text-white">
                  {deliveryLabel}
                </p>
              </div>
            )}
            {createdLabel && (
              <div className="rounded-xl border border-bgray-100 bg-bgray-50 p-3 dark:border-darkblack-400 dark:bg-darkblack-700">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-bgray-500">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-bgray-400" />
                  {t("projects.created")}
                </p>
                <p className="mt-1 text-sm font-bold text-bgray-900 dark:text-white">
                  {createdLabel}
                </p>
              </div>
            )}
          </div>
        )}

        {(code || guid || portalURL) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {code && (
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-success-100 bg-success-50 px-2.5 py-1.5 text-[10px] font-bold text-success-400 dark:border-success-300/30 dark:bg-success-300/20 dark:text-success-200">
                <FontAwesomeIcon icon={faTag} className="text-[9px]" />
                <span className="font-black uppercase tracking-wider">{t("projects.code")}</span>
                <span className="truncate font-mono">{code}</span>
              </span>
            )}
            {guid && (
              <button
                type="button"
                onClick={() => setShowDetails((visible) => !visible)}
                aria-expanded={showDetails}
                aria-controls={`project-card-details-${id}`}
                title={showDetails ? t("projects.hideProjectInfo") : t("projects.projectInfo")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-bgray-100 bg-bgray-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-bgray-500 transition hover:border-success-300/40 hover:text-bgray-700 dark:border-darkblack-400 dark:bg-darkblack-500/50 dark:text-bgray-400 dark:hover:text-white"
              >
                <FontAwesomeIcon icon={faInfoCircle} className="text-[9px]" />
                {t("projects.projectInfo")}
                <FontAwesomeIcon
                  icon={showDetails ? faChevronUp : faChevronDown}
                  className="text-[8px]"
                />
              </button>
            )}
            {portalURL && (
              <a
                href={portalURL}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-[10px] font-black uppercase tracking-wider text-success-400 hover:text-success-300"
              >
                <FontAwesomeIcon icon={faGlobe} />
                {t("projects.publicPortalLink")}
              </a>
            )}
          </div>
        )}

        {showDetails && guid && (
          <div
            id={`project-card-details-${id}`}
            className="mt-2 rounded-xl border border-bgray-100 bg-bgray-50 p-3 dark:border-darkblack-400 dark:bg-darkblack-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-bgray-500">
                  {t("projects.guid")}
                </p>
                <p className="mt-1 break-all font-mono text-[10px] font-semibold text-bgray-700 dark:text-bgray-300">
                  {guid}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyGUID}
                title={`${t("common.copy")}: ${guid}`}
                aria-label={`${t("common.copy")}: ${guid}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-bgray-500 shadow-xs transition hover:bg-success-300 hover:text-white dark:bg-darkblack-500 dark:text-bgray-300"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
          </div>
        )}

        <div className="my-5 h-px bg-bgray-100 dark:bg-darkblack-400" />

        <div className="mb-5">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-bgray-500">
              {t("projects.availableLots")}
            </span>
            <span className="text-sm font-black text-bgray-900 dark:text-white">
              {availableLots}
              <span className="font-bold text-bgray-400"> / {totalLots}</span>
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-bgray-200 dark:bg-darkblack-500">
            <div
              style={{ width: `${soldPercent}%` }}
              className="h-full bg-error-300"
              title={`${t("projects.sold")}: ${soldLots}`}
            />
            <div
              style={{ width: `${reservedPercent}%` }}
              className="h-full bg-warning-200"
              title={`${t("projects.reserved")}: ${reservedLots}`}
            />
            <div
              style={{ width: `${availablePercent}%` }}
              className="h-full bg-success-300"
              title={`${t("projects.available")}: ${availableLots}`}
            />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success-300" />
              <span className="text-[10px] font-semibold text-bgray-500">
                {availableLots} {t("projects.available")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-warning-200" />
              <span className="text-[10px] font-semibold text-bgray-500">
                {reservedLots} {t("projects.reserved")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-error-300" />
              <span className="text-[10px] font-semibold text-bgray-500">
                {soldLots} {t("projects.sold")}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-bgray-50 p-3 dark:bg-darkblack-700">
            <p className="text-[10px] font-black uppercase tracking-wider text-bgray-500">
              {t("projects.pricePerUnit")}
            </p>
            <p className="mt-1 text-sm font-black text-bgray-900 dark:text-white">
              L {formatNumber(price_per_square_unit, locale)}
              <span className="ml-1 text-[10px] font-bold text-bgray-500">
                / {unitLabel(measurement_unit)}
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-bgray-50 p-3 dark:bg-darkblack-700">
            <p className="text-[10px] font-black uppercase tracking-wider text-bgray-500">
              {t("projects.totalLots")}
            </p>
            <p className="mt-1 text-sm font-black text-bgray-900 dark:text-white">
              {formatNumber(totalLots, locale)}
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-bgray-100 pt-4 dark:border-darkblack-400">
          <div className="flex items-center space-x-2">
            {user && user.role === "admin" && (
              <>
                <button
                  type="button"
                  onClick={handleVisibilityToggle}
                  disabled={changingVisibility}
                  id="project-visibility-btn"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-50 ${
                    is_published
                      ? "bg-success-50 text-success-400 hover:bg-bgray-700 hover:text-white dark:bg-success-300/20"
                      : "bg-bgray-100 text-bgray-600 hover:bg-success-300 hover:text-white dark:bg-darkblack-500 dark:text-bgray-300"
                  }`}
                  title={is_published ? t("projects.unpublish") : t("projects.publish")}
                >
                  <FontAwesomeIcon icon={is_published ? faEyeSlash : faEye} />
                </button>
                <Link
                  to={`/projects/${id}/payment-instructions`}
                  id="project-payment-instructions-btn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-bgray-100 text-bgray-600 transition-all duration-200 hover:bg-indigo-600 hover:text-white dark:bg-darkblack-500 dark:text-bgray-300"
                  title={t("paymentInstructions.title")}
                >
                  <FontAwesomeIcon icon={faUniversity} />
                </Link>
                <Link
                  to={`/projects/${id}/edit`}
                  id="project-edit-btn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-bgray-100 text-bgray-600 transition-all duration-200 hover:bg-success-300 hover:text-white dark:bg-darkblack-500 dark:text-bgray-300"
                  title={t('projects.editLink')}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </Link>
                <button
                  type="button"
                  id="project-delete-btn"
                  onClick={handleDelete}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-bgray-100 text-bgray-600 transition-all duration-200 hover:bg-error-300 hover:text-white dark:bg-darkblack-500 dark:text-bgray-300"
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
            className="flex items-center space-x-2 rounded-xl bg-success-300 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-success-300/20 transition-all duration-200 hover:bg-success-400"
          >
            <span>{t('projects.lots')}</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>
      </div>
    </article>
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
    is_published: PropTypes.bool,
    cover_photo_url: PropTypes.string,
    photos: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        position: PropTypes.number,
        url: PropTypes.string,
        thumb_url: PropTypes.string,
        alt: PropTypes.string,
      })
    ),
  }).isRequired,
  user: PropTypes.object,
  onDeleted: PropTypes.func,
  onVisibilityChanged: PropTypes.func,
};

export default Project;
