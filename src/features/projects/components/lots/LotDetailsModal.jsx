import PropTypes from "prop-types";
import { useLocale } from "../../../../contexts/LocaleContext";
import { getStatusLabel, getStatusBadgeClass } from "../../../../shared/utils/statusUtils";
import { calculateLotAreas } from "../../../../shared/utils/areaUtils";
import { areaUnitLabel, linearUnitLabel } from "../../../../shared/utils/units";
import { getDefaultCurrency } from "../../../../shared/utils/formatSettings";
import { Button, Dialog } from "@/shared/ui";

function LotDetailsModal({ lot, onClose }) {
    const { t } = useLocale();

    if (!lot) return null;

    const {
        id,
        project_name,
        name,
        address,
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
        north,
        south,
        east,
        west,
        note,
    } = lot;

    const statusLabel = getStatusLabel(status);
    const badgeClass = getStatusBadgeClass(status);

    // Calculate final price
    const finalPrice = effective_price !== undefined ? effective_price : (override_price && override_price > 0 ? override_price : price);
    const hasPriceOverride = price > 0 && Math.abs(finalPrice - price) > 0.01;

    // Calculate areas
    const displayArea = (override_area && override_area > 0) ? override_area : area;
    const detailedAreas = calculateLotAreas(displayArea, measurement_unit);

    const formatPrice = (value) => {
        if (!value && value !== 0) return "N/A";
        return `${Number(value).toLocaleString()} ${getDefaultCurrency()}`;
    };

    return (
        <Dialog
            open={!!lot}
            onClose={onClose}
            size="xl"
            flush
            footer={
                <Button variant="secondary" onClick={onClose}>
                    {t("common.close")}
                </Button>
            }
            className="max-h-[90vh]"
        >
            <div className="max-h-[90vh] overflow-y-auto">
                {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-success-300/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

                        {/* Header */}
                        <div className="flex items-start justify-between p-8 border-b border-bgray-100 dark:border-darkblack-500 bg-bgray-50/50 dark:bg-darkblack-500/30 sticky top-0 z-10 backdrop-blur-md">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-bgray-500 dark:text-bgray-400">
                                        {project_name}
                                    </span>
                                    <span className="text-[10px] font-mono text-bgray-400 bg-white dark:bg-darkblack-500 px-2 py-0.5 rounded border border-bgray-200 dark:border-darkblack-400">
                                        #{id}
                                    </span>
                                    <span className={`${badgeClass} px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-full border border-current/20`}>
                                        {statusLabel}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black text-bgray-900 dark:text-white tracking-tight">
                                    {name}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-white dark:bg-darkblack-500 text-bgray-500 hover:text-red-500 dark:hover:text-red-400 border-2 border-bgray-100 dark:border-darkblack-400 hover:border-red-100 dark:hover:border-red-900/30 transition-all shadow-xs group"
                            >
                                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8">
                            {/* Financial & Dimensions Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Financial Info */}
                                <div className="p-6 rounded-3xl bg-green-50/50 dark:bg-green-900/10 border-2 border-green-100 dark:border-green-900/30">
                                    <h3 className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {t("lotsTable.price")}
                                    </h3>
                                    <div className="space-y-2">
                                        {hasPriceOverride && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm line-through text-bgray-500">{formatPrice(price)}</span>
                                                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Override</span>
                                            </div>
                                        )}
                                        <p className="text-4xl font-black text-bgray-900 dark:text-white tracking-tight">
                                            {formatPrice(finalPrice)}
                                        </p>
                                    </div>
                                </div>

                                {/* Dimensions Info */}
                                <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30">
                                    <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                        {t("lotsTable.dimensions")}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-bgray-400">Dimensions</p>
                                            <p className="text-xl font-black text-bgray-900 dark:text-white">
                                                {width} x {length} <span className="text-sm text-bgray-500 font-medium">{linearUnitLabel(measurement_unit)}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-bgray-400">Base Area</p>
                                            <p className="text-xl font-black text-bgray-900 dark:text-white">
                                                {displayArea} <span className="text-sm text-bgray-500 font-medium">{areaUnitLabel(measurement_unit)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detailed Areas */}
                                    <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-blue-800/30 grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 rounded-xl bg-white/50 dark:bg-black/20">
                                            <p className="text-[10px] font-bold text-bgray-400">{t("projects.squareMeters")}</p>
                                            <p className="text-sm font-black text-bgray-800 dark:text-gray-200">{detailedAreas.m2}</p>
                                        </div>
                                        <div className="text-center p-2 rounded-xl bg-white/50 dark:bg-black/20">
                                            <p className="text-[10px] font-bold text-bgray-400">{t("projects.squareFeet")}</p>
                                            <p className="text-sm font-black text-bgray-800 dark:text-gray-200">{detailedAreas.ft2}</p>
                                        </div>
                                        <div className="text-center p-2 rounded-xl bg-white/50 dark:bg-black/20">
                                            <p className="text-[10px] font-bold text-bgray-400">{t("projects.squareVaras")}</p>
                                            <p className="text-sm font-black text-bgray-800 dark:text-gray-200">{detailedAreas.vara2}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* General Details */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-bgray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-bgray-100 dark:bg-darkblack-500 flex items-center justify-center text-bgray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </span>
                                    {t("lots.basicInfo")}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-bgray-50 dark:bg-darkblack-500">
                                        <p className="text-xs font-bold text-bgray-400 uppercase mb-1">{t("lots.address")}</p>
                                        <p className="font-semibold text-bgray-900 dark:text-white">{address || "—"}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-bgray-50 dark:bg-darkblack-500">
                                        <p className="text-xs font-bold text-bgray-400 uppercase mb-1">{t("lots.registrationNumber")}</p>
                                        <p className="font-semibold text-bgray-900 dark:text-white">{registration_number || "—"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Boundaries */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-bgray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </span>
                                    {t("lots.boundaryDescriptions")}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: t("lots.north"), value: north, icon: "N" },
                                        { label: t("lots.south"), value: south, icon: "S" },
                                        { label: t("lots.east"), value: east, icon: "E" },
                                        { label: t("lots.west"), value: west, icon: "W" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-bgray-100 dark:border-darkblack-500 bg-white dark:bg-darkblack-600">
                                            <span className="w-8 h-8 rounded-full bg-bgray-100 dark:bg-darkblack-500 flex items-center justify-center text-xs font-black text-bgray-500 shrink-0">
                                                {item.icon}
                                            </span>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-bgray-400">{item.label}</p>
                                                <p className="text-sm font-medium text-bgray-900 dark:text-white">{item.value || "—"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {note && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-bgray-900 dark:text-white">{t("lots.notes")}</h3>
                                    <div className="p-6 rounded-3xl bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-100 dark:border-yellow-900/30 text-bgray-700 dark:text-bgray-300 italic">
                                        "{note}"
                                    </div>
                                </div>
                            )}
                        </div>
            </div>
        </Dialog>
    );
}

LotDetailsModal.propTypes = {
    lot: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

export default LotDetailsModal;
