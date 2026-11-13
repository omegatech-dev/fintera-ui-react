import PropTypes from "prop-types";
import { useLocale } from "../../../../contexts/LocaleContext";
import { getStatusLabel } from "../../../../shared/utils/statusUtils";
import { areaUnitLabel, linearUnitLabel } from "../../../../shared/utils/units";
import { getDefaultCurrency } from "../../../../shared/utils/formatSettings";
import { Chip } from "@/shared/ui";

const STATUS_LABEL_KEYS = {
  available: "status.available",
  reserved: "status.reserved",
  financed: "status.financed",
  fully_paid: "status.fully_paid",
  sold: "status.sold",
  closed: "status.closed",
};

function LotCard({
  lot,
  tone = "neutral",
  isHighlighted = false,
  isAdmin = false,
  onReserve,
  onView,
  onEdit,
}) {
  const { t } = useLocale();
  const statusKey = String(lot.status || "").toLowerCase();

  const statusLabel = STATUS_LABEL_KEYS[statusKey]
    ? t(STATUS_LABEL_KEYS[statusKey])
    : getStatusLabel(lot.status);

  const finalPrice =
    lot.effective_price !== undefined && lot.effective_price !== null
      ? lot.effective_price
      : lot.override_price && lot.override_price > 0
        ? lot.override_price
        : lot.price;
  const priceText =
    finalPrice !== undefined && finalPrice !== null
      ? `${Number(finalPrice).toLocaleString()} ${getDefaultCurrency()}`
      : "—";

  const dimensions =
    lot.length && lot.width
      ? `${lot.width} × ${lot.length} ${linearUnitLabel(lot.measurement_unit)}`
      : lot.dimensions || "—";
  const area = lot.override_area && lot.override_area > 0 ? lot.override_area : lot.area;
  const areaText = area ? `${area} ${areaUnitLabel(lot.measurement_unit)}` : "—";
  const meta = `${dimensions} · ${areaText} · #${lot.id}`;

  const owner = lot.reserved_by?.trim();
  const ownerLabel = owner || t("lots.noOwner");

  const action =
    statusKey === "available"
      ? {
          label: t("lots.reserve"),
          onClick: onReserve,
          className: "text-brand-strong hover:text-brand",
        }
      : statusKey === "reserved"
        ? {
            label: t("lots.viewReservation"),
            onClick: onView,
            className: "text-warning hover:opacity-80",
          }
        : {
            label: t("common.view"),
            onClick: onView,
            className: "text-brand-strong hover:text-brand",
          };

  return (
    <article
      className={`flex min-h-[176px] flex-col gap-1.5 rounded-card border bg-surface p-4 transition-colors ${
        isHighlighted
          ? "border-brand ring-2 ring-brand/20"
          : "border-line hover:border-line-strong"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="truncate text-[15px] font-bold text-ink">{lot.name}</h3>
          {isHighlighted && (
            <span className="rounded-chip bg-brand-soft px-2 py-0.5 text-micro font-bold text-brand-strong">
              {t("lots.selected")}
            </span>
          )}
        </div>
        <Chip tone={tone} className="h-6 shrink-0 px-2">
          {statusLabel}
        </Chip>
      </div>

      <p className="truncate text-label font-medium text-ink-3">{meta}</p>
      <p className="text-[19px] font-bold leading-6 tracking-tight text-ink">
        {priceText}
      </p>
      <p
        className={`truncate text-micro font-medium ${
          owner ? "text-ink-3" : "text-ink-3/70"
        }`}
      >
        {ownerLabel}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
        <button
          type="button"
          onClick={action.onClick}
          className={`inline-flex items-center gap-1 text-label font-bold transition-colors ${action.className}`}
        >
          {action.label}
          <span aria-hidden="true">→</span>
        </button>
        {isAdmin && statusKey !== "sold" && (
          <button
            type="button"
            onClick={onEdit}
            className="text-micro font-semibold text-ink-3 transition-colors hover:text-ink"
          >
            {t("common.edit")}
          </button>
        )}
      </div>
    </article>
  );
}

LotCard.propTypes = {
  lot: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string,
    length: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    dimensions: PropTypes.string,
    area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    override_area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    measurement_unit: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    override_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    effective_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    reserved_by: PropTypes.string,
  }).isRequired,
  tone: PropTypes.oneOf([
    "success",
    "warning",
    "danger",
    "info",
    "violet",
    "neutral",
  ]),
  isHighlighted: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onReserve: PropTypes.func,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
};

export default LotCard;
