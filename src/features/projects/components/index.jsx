import { confirmDialog } from "@/shared/ui/ConfirmProvider";
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
  faEdit,
  faTrashAlt,
  faArrowRight,
  faUniversity,
  faEye,
  faEyeSlash,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { Chip } from "@/shared/ui";

const formatNumber = (value, locale) => {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  return new Intl.NumberFormat(locale || undefined, {
    maximumFractionDigits: 2,
  }).format(number);
};

const unitLabel = (unit) => {
  switch ((unit || "").toLowerCase()) {
    case "m2":
      return "m²";
    case "ft2":
      return "ft²";
    case "vara2":
      return "v²";
    default:
      return "m²";
  }
};

const Project = memo(function Project({ project, user, onDeleted, onVisibilityChanged }) {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const [changingVisibility, setChangingVisibility] = useState(false);
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
    guid,
    is_published,
    cover_photo_url,
    photos,
  } = project;

  const portalURL =
    PUBLIC_PORTAL_URL && guid
      ? `${PUBLIC_PORTAL_URL.replace(/\/+$/, "")}/projects/${guid}`
      : "";

  const gallery = useMemo(() => {
    if (Array.isArray(photos) && photos.length > 0) return photos;
    if (cover_photo_url) {
      return [{ id: "cover", url: cover_photo_url, alt: t("projects.coverPhoto") }];
    }
    return [];
  }, [photos, cover_photo_url, t]);

  const handleDelete = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    const confirmed = await confirmDialog({
      title: t("projects.confirmDelete", { name }),
      confirmLabel: t("common.delete"),
    });
    if (!confirmed) return;
    try {
      await projectsApi.delete(id);
      showToast(t("projects.deleteSuccess"), "success");
      if (typeof onDeleted === "function") onDeleted();
    } catch (err) {
      console.error(err);
      showToast(`${t("common.error")}: ${err.message}`, "error");
    }
  };

  const handleVisibilityToggle = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    setChangingVisibility(true);
    try {
      if (is_published) {
        await projectsApi.unpublish(id);
        showToast(t("projects.unpublishSuccess"), "success");
      } else {
        await projectsApi.publish(id);
        showToast(t("projects.publishSuccess"), "success");
      }
      if (typeof onVisibilityChanged === "function") onVisibilityChanged();
    } catch (err) {
      showToast(err?.message || t("projects.visibilityError"), "error");
    } finally {
      setChangingVisibility(false);
    }
  };

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
    ? translatedProjectType === projectTypeKey
      ? project_type
      : translatedProjectType
    : t("projects.residential");

  const priceLabel =
    price_per_square_unit !== null &&
    price_per_square_unit !== undefined &&
    price_per_square_unit !== ""
      ? t("projects.pricePerUnitShort", {
          price: `L ${formatNumber(price_per_square_unit, locale)}`,
          unit: unitLabel(measurement_unit),
        })
      : null;

  const actionButtonClass =
    "flex h-7 w-7 items-center justify-center rounded-chip text-ink-3 transition-colors focus-visible:ring-2 focus-visible:ring-brand";

  return (
    <article className="group flex h-[290px] flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-line-strong">
      <ProjectPhotoCarousel
        photos={gallery}
        projectName={name}
        coverClassName="h-28"
      >
        <div className="flex h-full items-start justify-between p-3">
          <span className="rounded-chip bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-2 shadow-xs backdrop-blur-xs">
            {projectTypeLabel}
          </span>
          {portalURL && (
            <a
              href={portalURL}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              title={t("projects.publicPortal")}
              aria-label={t("projects.publicPortal")}
              className="flex h-7 w-7 items-center justify-center rounded-chip bg-white/90 text-ink-2 shadow-xs backdrop-blur-xs transition-colors hover:text-brand-strong"
            >
              <FontAwesomeIcon icon={faGlobe} aria-hidden="true" />
            </a>
          )}
        </div>
      </ProjectPhotoCarousel>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-body-lg font-bold leading-5 text-ink">
            <Link to={`/projects/${id}`} className="hover:text-brand-strong">
              {name}
            </Link>
          </h3>
          <Chip
            tone={is_published ? "success" : "neutral"}
            className="h-[22px] shrink-0 px-2 text-[10px]"
          >
            {is_published
              ? t("projects.published")
              : t("projects.unpublished")}
          </Chip>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-micro font-medium text-ink-3">
          <span className="truncate">{locationLabel}</span>
          {code && (
            <>
              <span aria-hidden="true">·</span>
              <span className="shrink-0 font-mono">{code}</span>
            </>
          )}
          {totalLots > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">
                {t("projects.freeOfTotal", {
                  available: availableLots,
                  total: totalLots,
                })}
              </span>
            </>
          )}
          {priceLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">{priceLabel}</span>
            </>
          )}
        </div>

        <div
          className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
          title={`${availableLots} ${t("projects.available")} · ${reservedLots} ${t("projects.reserved")} · ${soldLots} ${t("projects.sold")}`}
        >
          <div
            style={{ width: `${availablePercent}%` }}
            className="h-full bg-brand"
          />
          <div
            style={{ width: `${reservedPercent}%` }}
            className="h-full bg-warning"
          />
          <div
            style={{ width: `${soldPercent}%` }}
            className="h-full bg-ink-3"
          />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            {user?.role === "admin" && (
              <>
                <button
                  type="button"
                  onClick={handleVisibilityToggle}
                  disabled={changingVisibility}
                  id="project-visibility-btn"
                  className={`${actionButtonClass} hover:bg-surface-2 hover:text-ink disabled:opacity-50`}
                  title={is_published ? t("projects.unpublish") : t("projects.publish")}
                  aria-label={is_published ? t("projects.unpublish") : t("projects.publish")}
                >
                  <FontAwesomeIcon
                    icon={is_published ? faEyeSlash : faEye}
                    aria-hidden="true"
                  />
                </button>
                <Link
                  to={`/projects/${id}/payment-instructions`}
                  id="project-payment-instructions-btn"
                  className={`${actionButtonClass} hover:bg-surface-2 hover:text-ink`}
                  title={t("paymentInstructions.title")}
                  aria-label={t("paymentInstructions.title")}
                >
                  <FontAwesomeIcon icon={faUniversity} aria-hidden="true" />
                </Link>
                <Link
                  to={`/projects/${id}/edit`}
                  id="project-edit-btn"
                  className={`${actionButtonClass} hover:bg-surface-2 hover:text-ink`}
                  title={t("projects.editLink")}
                  aria-label={t("projects.editLink")}
                >
                  <FontAwesomeIcon icon={faEdit} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  id="project-delete-btn"
                  onClick={handleDelete}
                  className={`${actionButtonClass} hover:bg-danger-soft hover:text-danger`}
                  title={t("projects.delete")}
                  aria-label={t("projects.delete")}
                >
                  <FontAwesomeIcon icon={faTrashAlt} aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <Link
            to={`/projects/${id}/lots`}
            id="project-view-lots-btn"
            className="inline-flex shrink-0 items-center gap-1 text-label font-bold text-brand-strong transition-colors hover:text-brand"
          >
            {t("projects.viewLotsShort")}
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" aria-hidden="true" />
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
