import { memo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocale } from "../../../../contexts/LocaleContext";
import { getStatusLabel, getStatusBadgeClass } from "../../../../shared/utils/statusUtils";
import { calculateLotAreas } from "../../../../shared/utils/areaUtils";
import { areaUnitLabel, linearUnitLabel } from "../../../../shared/utils/units";
import { getDefaultCurrency } from "../../../../shared/utils/formatSettings";
import LotDetailsModal from "./LotDetailsModal";
import { motion, AnimatePresence } from "framer-motion";

/**
 * LotItem Component
 * 
 * Renders a single lot in either mobile card or desktop table row format.
 * Supports dual rendering via isMobileCard prop.
 * Memoized to avoid re-renders when sibling items or unrelated parent state change.
 *
 * @param {Object} lot - The lot object with all lot data
 * @param {string} userRole - Current user's role (admin, seller, etc.)
 * @param {boolean} isHighlighted - If true, applies highlighting styles (from contract navigation)
 */
const LotItem = memo(function LotItem({ lot, userRole, index = 0, isHighlighted = false }) {
  const { t } = useLocale();
  const {
    id,
    project_id,
    project_name,
    name,
    address,
    // dimensions, // dimensions string might be missing or unreliable in new data
    length,
    width,
    measurement_unit,
    area,
    override_area,
    price,
    override_price,
    effective_price, // Now available directly from API
    reserved_by,
    contract_created_by,
    status,
  } = lot;

  const statusLabel = getStatusLabel(status);
  const badgeClass = getStatusBadgeClass(status);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Price calculations
  // Use effective_price from API if present, otherwise fall back to overrides or price
  const finalPrice = effective_price !== undefined ? effective_price : (override_price && override_price > 0 ? override_price : price);

  // Check if price has been overridden (support both lower and higher prices)
  const hasPriceOverride = price > 0 && Math.abs(finalPrice - price) > 0.01;

  // Check if area has been overridden or doesn't match dimensions
  const calculatedArea = (length && width) ? Number((length * width).toFixed(2)) : 0;
  const hasAreaOverride = (override_area && override_area > 0) || (calculatedArea > 0 && Math.abs(calculatedArea - area) > 0.1);

  // Detailed area calculations for Admin/Seller
  const showDetailedArea = userRole === 'admin' || userRole === 'seller';
  const displayArea = hasAreaOverride ? (override_area || area) : area;
  const detailedAreas = showDetailedArea ? calculateLotAreas(displayArea, measurement_unit) : null;

  // Construct dimensions string
  const dimensionsDisplay = (length && width) ? `${width} x ${length}` : (lot.dimensions || "—");

  const formatPrice = (value) => {
    if (!value && value !== 0) return "N/A";
    return `${Number(value).toLocaleString()} ${getDefaultCurrency()}`;
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            delay: index * 0.05,
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1]
          }
        }}
        whileHover={{
          y: -10,
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        className={`relative group bg-white dark:bg-darkblack-600 rounded-[2.5rem] border-2 ${isHighlighted
          ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          : "border-bgray-100 dark:border-darkblack-400"
          } p-6 transition-all duration-300 hover:border-success-300 dark:hover:border-success-500/50 shadow-xs hover:shadow-2xl overflow-hidden h-full flex flex-col`}
      >
        {/* Decorative background glass effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-success-300/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-success-300/10 transition-colors duration-500" />

        {/* Header Area */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-bgray-400 dark:text-bgray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {project_name}
              </span>
            </div>
            <h3 className="text-2xl font-black text-bgray-900 dark:text-white tracking-tight">
              {name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <p className="text-[10px] font-mono text-bgray-400 bg-bgray-50 dark:bg-darkblack-500 px-2 py-0.5 rounded-md">
                #{id}
              </p>
              {address && (
                <div className="flex items-center text-xs font-bold text-bgray-500 dark:text-bgray-400">
                  <svg className="w-3.5 h-3.5 mr-1 text-bgray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {address}
                </div>
              )}
            </div>
          </div>
          <span className={`${badgeClass} shadow-xs px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-full border border-bgray-100 dark:border-darkblack-400`}>
            {statusLabel}
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Dimensions */}
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-bgray-400">
              {t("lotsTable.dimensions")}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-bgray-900 dark:text-white">
                {dimensionsDisplay}
              </span>
              <span className="text-[10px] font-medium text-bgray-500 italic">
                {linearUnitLabel(measurement_unit)}
              </span>
            </div>
          </div>

          {/* Area */}
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-black uppercase tracking-wider text-bgray-400">
              {t("lots.area")}
            </p>
            <div className="flex items-center justify-end gap-1.5">
              {hasAreaOverride && (
                <span
                  className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border border-yellow-200 dark:border-yellow-800"
                  title={t("lots.overridden")}
                >
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  {t("lots.overridden")}
                </span>
              )}
              <span className={`text-sm font-bold ${hasAreaOverride ? 'text-yellow-600 dark:text-yellow-400' : 'text-bgray-900 dark:text-white'}`}>
                {area || "—"}
              </span>
              <span className="text-[10px] font-medium text-bgray-500 italic">
                {areaUnitLabel(measurement_unit)}
              </span>
            </div>
            {showDetailedArea && detailedAreas && (
              <div className="flex flex-col items-end gap-0.5 mt-1">
                <span className="text-[10px] font-bold text-bgray-500 dark:text-bgray-400">
                  {detailedAreas.ft2.toLocaleString()} ft²
                </span>
                <span className="text-[10px] font-bold text-bgray-500 dark:text-bgray-400">
                  {detailedAreas.vara2.toLocaleString()} varas²
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="col-span-2 pt-4 border-t border-bgray-50 dark:border-darkblack-500">
            <p className="text-[10px] font-black uppercase tracking-wider text-bgray-400 mb-1">
              {t("lotsTable.price")}
            </p>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                {hasPriceOverride && (
                  <span className="text-[10px] text-bgray-400 line-through mb-0.5">
                    {formatPrice(price)}
                  </span>
                )}
                <span className={`text-xl font-black ${hasPriceOverride ? 'text-success-300' : 'text-bgray-900 dark:text-white'}`}>
                  {formatPrice(finalPrice)}
                </span>
              </div>
              {hasPriceOverride && (
                <span className="text-[10px] font-bold bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400 px-2 py-1 rounded-full border border-success-100 dark:border-success-800">
                  ⭐ {t("lots.specialPrice")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reserved Info (if any) */}
        <div className="mb-6 grow">
          <p className="text-[10px] font-black uppercase tracking-wider text-bgray-400 mb-1">
            {t("lotsTable.reservedBy")}
          </p>
          {reserved_by ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-bgray-900 dark:text-white truncate">
                  {reserved_by}
                </span>
                {contract_created_by && (
                  <span className="text-[10px] text-bgray-400 truncate">
                    {contract_created_by}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-bgray-300 dark:text-bgray-600 italic text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-medium">{t("lots.notReserved")}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          {status?.toLowerCase() === "available" && (
            <Link
              to={`/projects/${project_id}/lots/${id}/contracts/create`}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-black rounded-2xl bg-success-300 text-white hover:bg-success-400 transition-all shadow-lg shadow-success-300/20 active:scale-95"
            >
              {t("lots.reserve")}
            </Link>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center p-3 rounded-2xl border-2 border-bgray-100 dark:border-darkblack-400 text-bgray-500 dark:text-bgray-400 hover:text-success-300 dark:hover:text-success-400 hover:border-success-100 dark:hover:border-success-900/30 transition-all active:scale-95"
            title={t("common.view")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {userRole === "admin" && status?.toLowerCase() !== "sold" && (
            <Link
              to={`/projects/${project_id}/lots/${id}/edit`}
              className={`inline-flex items-center justify-center px-4 py-3 text-sm font-black rounded-2xl border-2 border-bgray-100 dark:border-darkblack-400 text-bgray-900 dark:text-white hover:bg-bgray-50 dark:hover:bg-darkblack-500 transition-all active:scale-95 ${status?.toLowerCase() === "available" ? 'w-auto' : 'flex-1'}`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {status?.toLowerCase() === "available" ? "" : t("common.edit")}
            </Link>
          )}
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-bgray-50 dark:bg-darkblack-500 overflow-hidden">
          <div className={`h-full transition-all duration-1000 w-full ${status?.toLowerCase() === 'available' ? 'bg-success-300' :
            (status?.toLowerCase() === 'reserved' || status?.toLowerCase() === 'pending') ? 'bg-orange-400' :
              (status?.toLowerCase() === 'fully_paid' || status?.toLowerCase() === 'closed') ? 'bg-blue-500' :
                (status?.toLowerCase() === 'financed' || status?.toLowerCase() === 'sold') ? 'bg-indigo-500' : 'bg-red-400'
            }`} />
        </div>
      </motion.div>
      <AnimatePresence>
        {isModalOpen && (
          <LotDetailsModal
            lot={lot}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

LotItem.propTypes = {
  lot: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    project_name: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    registration_number: PropTypes.string,
    dimensions: PropTypes.string,
    length: PropTypes.number,
    width: PropTypes.number,
    measurement_unit: PropTypes.string,
    area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    override_area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    override_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    effective_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    reserved_by: PropTypes.string,
    reserved_by_user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    contract_created_by: PropTypes.string,
    contract_created_user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string.isRequired,
    contract_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  userRole: PropTypes.string,
  index: PropTypes.number,
  isMobileCard: PropTypes.bool,
  isHighlighted: PropTypes.bool,
};

export default LotItem;
