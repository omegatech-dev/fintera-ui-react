import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../../../contexts/LocaleContext";
import { getStatusLabel } from "../../../../shared/utils/statusUtils";
import { calculateLotAreas } from "../../../../shared/utils/areaUtils";
import { areaUnitLabel, linearUnitLabel } from "../../../../shared/utils/units";
import { getDefaultCurrency } from "../../../../shared/utils/formatSettings";
import { mediaUrl } from "../media/mediaFiles";
import { Button, Chip, Dialog } from "@/shared/ui";

const STATUS_TONES = {
  available: "success",
  reserved: "warning",
  pending: "warning",
  financed: "info",
  fully_paid: "info",
  sold: "neutral",
};

function LotDetailsModal({ lot, onClose, onReserve, onEdit, isAdmin = false }) {
  const { t } = useLocale();

  if (!lot) return null;

  const {
    project_name,
    name,
    length,
    width,
    measurement_unit,
    area,
    override_area,
    price,
    override_price,
    effective_price,
    status,
    registration_number,
    code,
    reserved_by,
    cover_photo_url,
    photo_url,
    photos,
  } = lot;

  const statusKey = String(status || "").toLowerCase();
  const statusKeyLabel = statusKey ? `status.${statusKey}` : "";
  const translatedStatus = statusKeyLabel ? t(statusKeyLabel) : "";
  const statusLabel =
    translatedStatus && translatedStatus !== statusKeyLabel
      ? translatedStatus
      : getStatusLabel(status);
  const tone = STATUS_TONES[statusKey] || "neutral";

  const finalPrice =
    effective_price !== undefined && effective_price !== null
      ? effective_price
      : override_price && override_price > 0
        ? override_price
        : price;

  const displayArea =
    override_area && override_area > 0 ? override_area : area;
  const detailedAreas = calculateLotAreas(displayArea, measurement_unit);
  const currency = getDefaultCurrency();

  const formatPrice = (value) => {
    if (!value && value !== 0) return "—";
    return `${Number(value).toLocaleString()} ${currency}`;
  };

  const pricePerArea =
    finalPrice && displayArea
      ? `${Number(finalPrice / displayArea).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} ${currency} / ${areaUnitLabel(measurement_unit)}`
      : null;

  const cover = cover_photo_url || photo_url || photos?.[0]?.url || "";
  const codeLabel = code || registration_number || "—";
  const dimensions = `${width || "—"} × ${length || "—"} ${linearUnitLabel(
    measurement_unit
  )}`;

  const facts = [
    {
      label: t("lots.front"),
      value: width ? `${width} ${linearUnitLabel(measurement_unit)}` : "—",
    },
    {
      label: t("lots.back"),
      value: length ? `${length} ${linearUnitLabel(measurement_unit)}` : "—",
    },
    { label: t("lots.code"), value: codeLabel },
    {
      label: t("lots.status"),
      value: statusLabel,
      className:
        statusKey === "available"
          ? "text-brand-strong"
          : statusKey === "reserved"
            ? "text-warning"
            : "text-ink",
    },
  ];

  return (
    <Dialog
      open={!!lot}
      onClose={onClose}
      size="md"
      side="right"
      flush
    >
      <div className="flex h-12 items-center justify-between rounded-t-sheet border-b border-line px-4">
        <h2 className="text-label font-bold text-ink">
          {t("projects.lotDetails")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="flex h-8 w-8 items-center justify-center rounded-control text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
        </button>
      </div>

      <div className="relative h-[190px] bg-gradient-to-br from-brand-soft via-surface-2 to-line">
        {cover ? (
          <img
            src={mediaUrl(cover)}
            alt={name || ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FontAwesomeIcon
              icon={faHome}
              className="text-5xl text-ink-3/40"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3.5 p-5">
        <p className="text-micro font-medium text-ink-3">
          {[project_name, name].filter(Boolean).join("  /  ")}
        </p>

        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-2xl font-bold tracking-tight text-ink">
            {name}
          </h3>
          <Chip tone={tone}>{statusLabel}</Chip>
        </div>

        <p className="text-label font-medium text-ink-3">
          {[
            dimensions,
            displayArea
              ? `${Number(displayArea).toLocaleString()} ${areaUnitLabel(measurement_unit)}`
              : null,
            detailedAreas.vara2
              ? `${Number(detailedAreas.vara2).toLocaleString()} varas²`
              : null,
          ]
            .filter(Boolean)
            .join("  ·  ")}
        </p>

        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold tracking-tight text-ink">
            {formatPrice(finalPrice)}
          </p>
          {pricePerArea && (
            <p className="pb-0.5 text-label font-medium text-ink-3">
              {pricePerArea}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-2.5 border-y border-line py-3">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-[0.6px] text-ink-3">
                {fact.label}
              </dt>
              <dd
                className={`mt-0.5 truncate text-body-lg font-semibold ${
                  fact.className || "text-ink"
                }`}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-ink-3">
            {t("lots.reservedBy") || t("lotsTable.reservedBy")}
          </p>
          <p
            className={`mt-0.5 text-body font-medium ${
              reserved_by ? "text-ink" : "text-ink-3/70"
            }`}
          >
            {reserved_by || t("lots.noOwner")}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-0.5">
          {statusKey === "available" && onReserve && (
            <Button onClick={onReserve} className="h-[46px] w-full">
              {t("projects.reserveLot")}
            </Button>
          )}
          {isAdmin && onEdit && (
            <Button variant="secondary" onClick={onEdit} className="h-[42px] w-full">
              {t("lots.editLot")}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

LotDetailsModal.propTypes = {
  lot: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onReserve: PropTypes.func,
  onEdit: PropTypes.func,
  isAdmin: PropTypes.bool,
};

export default LotDetailsModal;
